import { SR5Actor } from '@/module/actor/SR5Actor';
import { TokenLockHooks } from '@/module/token/TokenLockHooks';
import { Helpers } from '@/module/helpers';
import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import type { InitiativeModeOptions } from '@/module/combat/SR5Combatant';
import { ActorOwnershipFlow } from '@/module/actor/flows/ActorOwnershipFlow';
import { RiggingRules } from '@/module/rules/RiggingRules';

export function isRiggerInterfaceItem(item: any): boolean {
    if (!item || item.type !== 'modification') return false;

    const isVehicleOrDrone = item.system?.type === 'vehicle' || item.system?.type === 'drone';
    if (!isVehicleOrDrone) return false;

    return item.system?.isRiggerInterface === true
        || item.getFlag?.('shadowrun5e', 'isRiggerInterface') === true
        || item.flags?.shadowrun5e?.isRiggerInterface === true;
}

export function hasRiggerInterface(vehicle: SR5Actor): boolean {
    if (!vehicle || !vehicle.isType('vehicle')) return false;
    if (vehicle.system.isDrone) return true;
    if (vehicle.getFlag?.('shadowrun5e', 'hasRiggerInterface') === true) return true;
    return vehicle.items.some(isRiggerInterfaceItem);
}

export const RiggerFlow = {
    isRiggerInterfaceItem,
    hasRiggerInterface,

    /**
     * Jump a driver actor into a vehicle/drone actor.
     */
    async jumpIn(driver: SR5Actor, vehicle: SR5Actor) {
        if (!driver || !vehicle || !vehicle.isType('vehicle')) return;

        // Check for installed Rigger Interface on non-drone vehicles
        if (!hasRiggerInterface(vehicle)) {
            const requireSetting = game.settings.get(SYSTEM_NAME, FLAGS.RequireRiggerInterface) as boolean;
            if (requireSetting) {
                ui.notifications?.error(game.i18n.format('SR5.Rigger.MissingRiggerInterface', { vehicle: vehicle.name }));
                return;
            } else {
                const warningHtml = game.i18n.format('SR5.Rigger.GODRiggerInterfaceWarning', { vehicle: vehicle.name });
                await ChatMessage.create({
                    speaker: { alias: 'G.O.D.' },
                    content: warningHtml,
                    style: CONST.CHAT_MESSAGE_STYLES.OTHER
                });
            }
        }

        // 1. If driver is currently jumped into another vehicle, jump out of that vehicle first
        const currentJumpedVehicleUuid = driver.getFlag(SYSTEM_NAME, 'jumpedInVehicleUuid') as string | undefined;
        if (currentJumpedVehicleUuid && currentJumpedVehicleUuid !== vehicle.uuid) {
            const prevVehicle = (await fromUuid(currentJumpedVehicleUuid)) as SR5Actor | null;
            if (prevVehicle && prevVehicle instanceof SR5Actor && prevVehicle.isType('vehicle')) {
                await this.jumpOut(driver, prevVehicle);
            }
        }

        // 2. Check if player does not own the vehicle and is not GM
        if (!vehicle.isOwner && !game.user?.isGM) {
            ui.notifications?.error(game.i18n.localize('SR5.Errors.NoVehicleOwnership'));
            return;
        }

        // 3. Attach driver to vehicle
        if (driver.uuid) {
            await vehicle.addVehicleDriver(driver.uuid);
        }

        // 4. Update vehicle controlMode to 'rigger'
        await vehicle.update({ system: { controlMode: 'rigger' } });

        // 5. Ensure all other vehicles owned/driven by the driver are set to 'autopilot'
        await this.resetOtherDriverVehiclesToAutopilot(driver, vehicle);

        // 6. Update driver matrix state to VR & Hot Sim via setInitiativeMode
        if (driver.isType('character')) {
            const currentPerception = driver.system.initiative?.perception;
            const prevMode: InitiativeModeOptions = currentPerception === 'astral' ? 'astral'
                : (currentPerception === 'matrix' ? (driver.isUsingHotSim ? 'hot_sim' : 'cold_sim') : 'meatspace');
            await driver.setFlag(SYSTEM_NAME, 'previousInitiativeMode', prevMode);
            await driver.setInitiativeMode('hot_sim');
        }

        // 7. Lock driver token movement and set driver flags
        await TokenLockHooks.setJumpedInState(driver, vehicle, true);
        await driver.setFlag(SYSTEM_NAME, 'jumpedInVehicleUuid', vehicle.uuid ?? '');

        ui.notifications?.info(game.i18n.format('SR5.Rigger.JumpedInSuccess', {
            rigger: driver.name,
            vehicle: vehicle.name
        }));
    },

    /**
     * Jump out of a vehicle/drone actor.
     */
    async jumpOut(driver: SR5Actor | null, vehicle: SR5Actor) {
        if (!vehicle || !vehicle.isType('vehicle')) return;

        const currentDriver = driver || vehicle.getVehicleDriver() || null;

        // 1. Update vehicle controlMode to 'autopilot'
        await vehicle.update({ system: { controlMode: 'autopilot' } });

        // 2. Defensively clean up any legacy jumped-in Active Effect if present
        const jumpedInEffects = vehicle.effects.filter(e => e.getFlag('shadowrun5e', 'isJumpedInEffect') === true).map(e => e.id);
        if (jumpedInEffects.length > 0) {
            await vehicle.deleteEmbeddedDocuments('ActiveEffect', jumpedInEffects);
        }
        await vehicle.unsetFlag(SYSTEM_NAME, 'jumpedInEffectId');

        // 3. Unlock driver token movement & unset flags & restore initiative mode
        if (currentDriver) {
            await TokenLockHooks.setJumpedInState(currentDriver, vehicle, false);
            await currentDriver.unsetFlag(SYSTEM_NAME, 'jumpedInVehicleUuid');

            if (currentDriver.isType('character')) {
                const prevMode = currentDriver.getFlag(SYSTEM_NAME, 'previousInitiativeMode') as InitiativeModeOptions | undefined;
                if (prevMode) {
                    await currentDriver.setInitiativeMode(prevMode);
                    await currentDriver.unsetFlag(SYSTEM_NAME, 'previousInitiativeMode');
                } else {
                    await currentDriver.setInitiativeMode('meatspace');
                }
            }
        } else {
            await TokenLockHooks.setJumpedInState(null, vehicle, false);
        }

        // Note: Driver is retained on vehicle/drone so rigger retains PAN ownership

        ui.notifications?.info(game.i18n.format('SR5.Rigger.JumpedOutSuccess', { vehicle: vehicle.name }));
    },

    /**
     * Perform forced ejection of driver from vehicle/drone with Dump Shock.
     */
    async ejectDriver(vehicle: SR5Actor, isDeviceDestroyed = false) {
        if (!vehicle || !vehicle.isType('vehicle')) return;
        const driver = vehicle.getVehicleDriver();
        if (!driver) return;

        const isHotSim = driver.system.matrix?.hot_sim === true;
        const damageType = isHotSim ? 'physical' : 'stun';
        const damageValue = 6;

        const escapedDriverName = Handlebars.escapeExpression(driver.name ?? '');
        const escapedVehicleName = Handlebars.escapeExpression(vehicle.name ?? '');
        const reasonText = isDeviceDestroyed
            ? game.i18n.localize('SR5.Rigger.DumpShockDeviceDestroyed')
            : game.i18n.localize('SR5.Rigger.DumpShockConnectionSevered');

        const content = `
            <div class="sr5-chat-card dump-shock-card">
                <div class="card-header">
                    <h3>⚡ ${game.i18n.localize('SR5.Rigger.ResistDumpShock')}</h3>
                </div>
                <div class="card-content">
                    <p><strong>${escapedDriverName}</strong> ${game.i18n.format('SR5.Rigger.DumpShockSuffered', { vehicle: escapedVehicleName, reason: reasonText })}</p>
                    <div class="test-value">
                        <span class="value">${game.i18n.localize('SR5.Rigger.ResistDumpShock')}: </span>
                        <span class="value-result">
                            <span class="button apply-damage"
                                  data-tooltip="${game.i18n.localize('SR5.Rigger.ResistDumpShock')}"
                                  data-damage-value="${damageValue}"
                                  data-damage-type="${damageType}"
                                  data-damage-biofeedback="${damageType}"
                                  data-damage-ap="0"
                                  data-damage-element=""
                                  data-target-uuid="${driver.uuid}">
                                ${damageValue}${damageType.charAt(0).toUpperCase()} (${game.i18n.localize('SR5.BiofeedbackDamage')})
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        `;

        await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: driver as Actor.Stored }),
            content,
            style: CONST.CHAT_MESSAGE_STYLES.OTHER
        });

        const effect = await driver.toggleStatusEffect('sr5disoriented', { active: true });
        if (effect instanceof ActiveEffect) {
            const willpower = driver.findAttribute('willpower')?.value ?? driver.system.attributes?.willpower?.value ?? 0;
            const durationSeconds = Math.max(1, 10 - willpower) * 60;
            await effect.update({ duration: { value: durationSeconds, units: 'seconds' } });
        }
        await this.jumpOut(driver, vehicle);
    },

    /**
     * Toggle jump-in / jump-out state for a vehicle/drone.
     */
    async toggleJumpIn(driver: SR5Actor | null, vehicle: SR5Actor) {
        if (!vehicle || !vehicle.isType('vehicle')) return;

        const isJumpedIn = vehicle.system.controlMode === 'rigger';

        let effectiveDriver: SR5Actor | null = driver || vehicle.getVehicleDriver() || null;
        if (!effectiveDriver && game.user.character && (game.user.character as SR5Actor).isType('character')) {
            effectiveDriver = game.user.character as SR5Actor;
        }
        if (!effectiveDriver) {
            const controlled = Helpers.getControlledTokenActors();
            const charActor = controlled.find(a => a.isType('character') && a.id !== vehicle.id);
            if (charActor) effectiveDriver = charActor;
        }

        if (isJumpedIn) {
            await this.jumpOut(effectiveDriver, vehicle);
        } else {
            if (!effectiveDriver) {
                ui.notifications?.error(game.i18n.localize('SR5.Errors.NoDriverSelectedForJumpIn'));
                return;
            }
            await this.jumpIn(effectiveDriver, vehicle);
        }
    },

    /**
     * Get all actor instances corresponding to the given actor.
     */
    getActorInstances(actor: SR5Actor | null): SR5Actor[] {
        return actor ? [actor] : [];
    },

    /**
     * Set all other vehicles/drones owned or controlled by the driver to 'autopilot'.
     * For player actors, this includes all vehicles owned by the player user(s).
     * For GM/NPC actors, only vehicles explicitly driven by or slaved to this driver are reset.
     */
    async resetOtherDriverVehiclesToAutopilot(driver: SR5Actor, currentVehicle: SR5Actor) {
        if (!driver || !currentVehicle) return;

        const playerOwners = (game.users?.contents || []).filter(u => !u.isGM && driver.testUserPermission(u, 'OWNER'));

        const isOwnedByDriver = (candidate: SR5Actor): boolean => {
            if (!candidate || !candidate.isType('vehicle') || candidate.uuid === currentVehicle.uuid) return false;
            // 1. Explicitly driven by this driver
            if (candidate.system.driver === driver.uuid || candidate.getVehicleDriver()?.uuid === driver.uuid) return true;
            // 2. Slaved to driver's RCC
            if (candidate.master?.actorOwner?.uuid === driver.uuid) return true;
            // 3. ActorOwnershipFlow ownership check
            if (ActorOwnershipFlow._isOwnerOfActor(driver, candidate)) return true;
            // 4. Owned by the same player user(s) as the driver
            if (playerOwners.length > 0 && playerOwners.some(u => candidate.testUserPermission(u, 'OWNER'))) return true;
            return false;
        };

        const processedUuids = new Set<string>();
        const toReset: SR5Actor[] = [];

        for (const actor of (game.actors?.contents || [])) {
            if (actor.isType('vehicle') && isOwnedByDriver(actor as SR5Actor)) {
                toReset.push(actor as SR5Actor);
                processedUuids.add(actor.uuid);
            }
        }

        if (canvas?.scene?.tokens) {
            for (const tokenDoc of canvas.scene.tokens) {
                const tokenActor = tokenDoc.actor as SR5Actor | null;
                if (tokenActor && tokenActor.isType('vehicle') && tokenActor.uuid && !processedUuids.has(tokenActor.uuid) && isOwnedByDriver(tokenActor)) {
                    toReset.push(tokenActor);
                    processedUuids.add(tokenActor.uuid);
                }
            }
        }

        for (const v of toReset) {
            if (v.system.controlMode !== 'autopilot') {
                await v.update({ system: { controlMode: 'autopilot' } });
            }
        }
    }
};
