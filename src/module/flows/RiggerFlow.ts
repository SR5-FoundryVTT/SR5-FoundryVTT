import { SR5Actor } from '@/module/actor/SR5Actor';
import { TokenLockHooks } from '@/module/token/TokenLockHooks';
import { Helpers } from '@/module/helpers';
import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import { SR5ActiveEffect } from '@/module/effect/SR5ActiveEffect';
import type { InitiativeModeOptions } from '@/module/combat/SR5Combatant';
import { ActorOwnershipFlow } from '@/module/actor/flows/ActorOwnershipFlow';

export function isRiggerInterfaceItem(item: any): boolean {
    if (!item) return false;

    // 1. Explicit item flag (rename and translation independent)
    if (item.getFlag?.('shadowrun5e', 'isRiggerInterface') === true) return true;
    if (item.flags?.shadowrun5e?.isRiggerInterface === true) return true;

    // 2. Structured schema modification subcategory
    const subCategory = item.system?.subCategory || item.system?.sub_category;
    if (subCategory === 'rigger_interface') return true;

    // 3. Compendium source ID / slug matching
    const sourceId = (item.flags?.core?.sourceId || item._stats?.compendiumSource || '') as string;
    if (sourceId.toLowerCase().includes('rigger-interface') || sourceId.toLowerCase().includes('rigger_interface')) return true;

    // 4. Dynamic localization match against active system language
    const localizedName = game.i18n?.localize('SR5.Rigger.RiggerInterface')?.toLowerCase();
    const itemName = (item.name || '').toLowerCase();
    if (localizedName && itemName.includes(localizedName)) return true;

    // 5. Powertrain modification name check across all supported system locales
    const isPowertrain = item.system?.modification_category === 'powertrain' || item.system?.category === 'powertrain';
    if (isPowertrain) {
        const canonicalNames = ['rigger interface', 'riggeranpassung', 'interface rigger', '리거 인터페이스', 'interface de rigger'];
        if (canonicalNames.some(cn => itemName.includes(cn))) return true;
    }

    return itemName.includes('rigger interface');
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

        // Ensure all other vehicles owned/driven by the driver are set to 'autopilot'
        const otherVehicles = (game.actors?.contents || []).filter(a => a.isType('vehicle') && a.uuid !== vehicle.uuid && ActorOwnershipFlow._isOwnerOfActor(driver, a)) as SR5Actor[];
        for (const other of otherVehicles) {
            if (other.system.controlMode !== 'autopilot') {
                await other.update({ system: { controlMode: 'autopilot' } });
            }
        }
        if (canvas.scene?.tokens) {
            for (const t of canvas.scene.tokens) {
                const tokenActor = t.actor as SR5Actor | null;
                if (tokenActor && tokenActor.isType('vehicle') && tokenActor.uuid !== vehicle.uuid && ActorOwnershipFlow._isOwnerOfActor(driver, tokenActor)) {
                    if (tokenActor.system.controlMode !== 'autopilot') {
                        await tokenActor.update({ system: { controlMode: 'autopilot' } });
                    }
                }
            }
        }

        // 5. Update driver matrix state to VR & Hot Sim via setInitiativeMode
        if (driver.isType('character')) {
            const currentPerception = driver.system.initiative?.perception;
            const prevMode: InitiativeModeOptions = currentPerception === 'astral' ? 'astral'
                : (currentPerception === 'matrix' ? (driver.isUsingHotSim ? 'hot_sim' : 'cold_sim') : 'meatspace');
            await driver.setFlag(SYSTEM_NAME, 'previousInitiativeMode', prevMode);
            await driver.setInitiativeMode('hot_sim');
        }

        // 6. Lock driver token movement and set driver flags
        await TokenLockHooks.setJumpedInState(driver, vehicle, true);
        await driver.setFlag(SYSTEM_NAME, 'jumpedInVehicleUuid', vehicle.uuid ?? '');

        // 7. Apply temporary Active Effect on the vehicle actor for jumped-in skills
        await this._applyJumpedInActiveEffect(driver, vehicle);

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

        // 2. Unlock driver token movement & unset flags & restore initiative mode
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

        // 3. Remove temporary jumped-in Active Effect on vehicle actor
        await this._removeJumpedInActiveEffect(vehicle);

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
                                  data-damage-biofeedback="true"
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

        await driver.toggleStatusEffect('sr5disoriented', { active: true });
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
     * Create/apply or update persistent ActiveEffect on vehicle actor with driver's attributes, skills, and Control Rig modifiers.
     */
    async _applyJumpedInActiveEffect(driver: SR5Actor, vehicle: SR5Actor) {
        const changes: Array<{ key: string; value: string; type: string }> = [];

        // Transfer Driver attributes
        const attributeKeysToTransfer = ['logic', 'intuition', 'reaction', 'agility'] as const;
        for (const attKey of attributeKeysToTransfer) {
            const att = driver.findAttribute(attKey);
            const rating = att?.value || 0;
            if (rating > 0) {
                changes.push({
                    key: `system.attributes.${attKey}.value`,
                    value: String(rating),
                    type: 'upgrade'
                });
            }
        }

        // Transfer Driver skills
        const skillKeysToTransfer: string[] = ['gunnery', 'perception', 'sneaking'];
        const vehiclePilotSkill = vehicle.getVehicleTypeSkillName();
        if (vehiclePilotSkill) {
            skillKeysToTransfer.push(vehiclePilotSkill);
        }

        for (const skillKey of skillKeysToTransfer) {
            const driverSkill = driver.findActiveSkill(skillKey);
            const rating = driverSkill?.value || 0;
            if (rating > 0) {
                changes.push({
                    key: `system.skills.active.${skillKey}.value`,
                    value: String(rating),
                    type: 'upgrade'
                });
            }
        }

        // Apply Control Rig Rating handling & speed bonuses if driver has a Control Rig and no duplicate ActiveEffect exists
        const controlRigRating = driver.getControlRigRating();

        const controlRigItemHasHandlingBonus = () => {
            const items = Array.from(driver.items.values());
            return items.some(item => {
                const isControlRig = item.name?.toLowerCase().includes('control rig') ||
                    (item.isType('cyberware', 'bioware') && item.system.category === 'control_rig');
                if (!isControlRig) return false;
                return item.effects.some(e => {
                    if (e.disabled || (e instanceof SR5ActiveEffect && e.isSuppressed)) return false;
                    const cList = (e instanceof SR5ActiveEffect ? e.system.changes : (e as ActiveEffect.Stored).changes) || [];
                    return cList.some(c =>
                        c.key === 'system.vehicle_stats.handling.mod' ||
                        c.key === 'system.vehicle_stats.speed.mod' ||
                        Boolean(e.getFlag?.('shadowrun5e', 'isControlRigHandlingBonus'))
                    );
                });
            });
        };

        if (controlRigRating > 0 && !controlRigItemHasHandlingBonus()) {
            changes.push({
                key: 'system.vehicle_stats.handling.mod',
                value: String(controlRigRating),
                type: 'add'
            });
            changes.push({
                key: 'system.vehicle_stats.speed.mod',
                value: String(controlRigRating),
                type: 'add'
            });
        }

        const effectName = game.i18n.format('SR5.Rigger.JumpedInEffectName', { rigger: driver.name }) || `Jumped-In: ${driver.name}`;

        const instances = this.getActorInstances(vehicle);
        for (const v of instances) {
            const riggerInterfaceItem = v.items.find(isRiggerInterfaceItem);

            const savedEffectId = v.getFlag(SYSTEM_NAME, 'jumpedInEffectId') as string | undefined;
            const riggerInterfaceEffectId = riggerInterfaceItem ? (riggerInterfaceItem.getFlag(SYSTEM_NAME, 'jumpedInEffectId') as string | undefined) : undefined;

            const existingEffect = v.effects.find((e): boolean => {
                if (e.getFlag('shadowrun5e', 'isJumpedInEffect') === true) return true;
                if (savedEffectId && e.id === savedEffectId) return true;
                if (riggerInterfaceEffectId && e.id === riggerInterfaceEffectId) return true;
                return false;
            });

            if (existingEffect) {
                await existingEffect.update({
                    name: effectName,
                    disabled: false,
                    flags: {
                        shadowrun5e: {
                            isJumpedInEffect: true,
                            driverUuid: driver.uuid ?? undefined,
                            riggerInterfaceItemId: riggerInterfaceItem?.id || null
                        }
                    },
                    system: {
                        targets: [{ id: 'actor', applyTo: 'actor' }],
                        changes
                    }
                });
                await v.setFlag(SYSTEM_NAME, 'jumpedInEffectId', existingEffect.id);
                if (riggerInterfaceItem) {
                    await riggerInterfaceItem.setFlag(SYSTEM_NAME, 'jumpedInEffectId', existingEffect.id);
                }
            } else {
                const createdEffects = await v.createEmbeddedDocuments('ActiveEffect', [{
                    name: effectName,
                    img: 'systems/shadowrun5e/dist/icons/status-effects/steering-wheel.svg',
                    disabled: false,
                    flags: {
                        shadowrun5e: {
                            isJumpedInEffect: true,
                            driverUuid: driver.uuid ?? undefined,
                            riggerInterfaceItemId: riggerInterfaceItem?.id || null
                        }
                    },
                    system: {
                        targets: [{ id: 'actor', applyTo: 'actor' }],
                        changes
                    }
                }]);

                if (createdEffects && createdEffects.length > 0 && createdEffects[0].id) {
                    const newId = createdEffects[0].id;
                    await v.setFlag(SYSTEM_NAME, 'jumpedInEffectId', newId);
                    if (riggerInterfaceItem) {
                        await riggerInterfaceItem.setFlag(SYSTEM_NAME, 'jumpedInEffectId', newId);
                    }
                }
            }
        }
    },

    /**
     * Deactivate temporary ActiveEffect on vehicle actor.
     */
    async _removeJumpedInActiveEffect(vehicle: SR5Actor) {
        if (!vehicle) return;

        const instances = this.getActorInstances(vehicle);
        for (const v of instances) {
            const riggerInterfaceItem = v.items.find(isRiggerInterfaceItem);

            const savedEffectId = v.getFlag(SYSTEM_NAME, 'jumpedInEffectId') as string | undefined;
            const riggerInterfaceEffectId = riggerInterfaceItem ? (riggerInterfaceItem.getFlag(SYSTEM_NAME, 'jumpedInEffectId') as string | undefined) : undefined;

            for (const effect of v.effects) {
                const isJumpedInFlag = effect.getFlag('shadowrun5e', 'isJumpedInEffect') === true;
                const isSavedEffect = Boolean(savedEffectId && effect.id === savedEffectId);
                const isRiggerInterfaceEffect = Boolean(riggerInterfaceEffectId && effect.id === riggerInterfaceEffectId);
                if (isJumpedInFlag || isSavedEffect || isRiggerInterfaceEffect) {
                    await effect.update({ disabled: true });
                }
            }

            await v.toggleStatusEffect('sr5riggedVehicle', { active: false });
        }
    }
};
