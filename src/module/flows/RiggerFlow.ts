import { SR5Actor } from '@/module/actor/SR5Actor';
import { TokenLockHooks } from '@/module/token/TokenLockHooks';
import { TestCreator } from '@/module/tests/TestCreator';
import { SR5 } from '@/module/config';
import { Helpers } from '@/module/helpers';
import { SYSTEM_NAME } from '@/module/constants';

export const RiggerFlow = {
    /**
     * Jump a driver actor into a vehicle/drone actor.
     */
    async jumpIn(driver: SR5Actor, vehicle: SR5Actor) {
        if (!driver || !vehicle || !vehicle.isType('vehicle')) return;

        // 1. If driver is currently jumped into another vehicle, jump out of that vehicle first
        const currentJumpedVehicleUuid = (driver as any).getFlag(SYSTEM_NAME, 'jumpedInVehicleUuid') as string | undefined;
        if (currentJumpedVehicleUuid && currentJumpedVehicleUuid !== vehicle.uuid) {
            const prevVehicle = (await fromUuid(currentJumpedVehicleUuid)) as SR5Actor | null;
            if (prevVehicle && prevVehicle instanceof SR5Actor && prevVehicle.isType('vehicle')) {
                await this.jumpOut(driver, prevVehicle);
            }
        }

        // 2. Check if player does not own the vehicle and is not GM -> test required
        if (!vehicle.isOwner && !game.user.isGM) {
            ui.notifications?.info(game.i18n.format('SR5.Rigger.JumpInTestRequired', { vehicle: vehicle.name }));
            const test = await TestCreator.fromPackAction(
                SR5.packNames.GeneralActionsPack,
                'drone_pilot_vehicle',
                vehicle,
                { showDialog: true }
            );
            if (test) {
                await test.execute();
            }
        }

        // 3. Attach driver to vehicle
        if (driver.uuid) {
            await vehicle.addVehicleDriver(driver.uuid);
        }

        // 4. Update vehicle controlMode to 'rigger'
        await vehicle.update({ system: { controlMode: 'rigger' } } as any);

        // 5. Update driver matrix state to VR & Hot Sim
        await driver.update({
            system: {
                matrix: {
                    vr: true,
                    hot_sim: true
                }
            }
        } as any);

        // 6. Lock driver token movement and set driver flags
        await TokenLockHooks.setJumpedInState(driver, vehicle, true);
        await (driver as any).setFlag(SYSTEM_NAME, 'jumpedInVehicleUuid', vehicle.uuid);

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
        await vehicle.update({ system: { controlMode: 'autopilot' } } as any);

        // 2. Unlock driver token movement & unset flags
        if (currentDriver) {
            await TokenLockHooks.setJumpedInState(currentDriver, null, false);
            await (currentDriver as any).unsetFlag(SYSTEM_NAME, 'jumpedInVehicleUuid');
        }

        // 3. Remove temporary jumped-in Active Effect on vehicle actor
        await this._removeJumpedInActiveEffect(vehicle);

        // 4. If vehicle is a drone, unassign the driver. For normal vehicles, keep driver in seat.
        if (vehicle.system.isDrone) {
            await vehicle.removeVehicleDriver();
        }

        ui.notifications?.info(game.i18n.format('SR5.Rigger.JumpedOutSuccess', { vehicle: vehicle.name }));
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
     * Create/apply temporary ActiveEffect on vehicle actor with driver's skills.
     */
    async _applyJumpedInActiveEffect(driver: SR5Actor, vehicle: SR5Actor) {
        await this._removeJumpedInActiveEffect(vehicle);

        const skillKeysToTransfer: string[] = ['gunnery', 'perception', 'sneaking'];

        const vehiclePilotSkill = vehicle.getVehicleTypeSkillName();
        if (vehiclePilotSkill) {
            skillKeysToTransfer.push(vehiclePilotSkill);
        }

        const changes: any[] = [];
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

        const effectName = game.i18n.format('SR5.Rigger.JumpedInEffectName', { rigger: driver.name }) || `Jumped-In: ${driver.name}`;

        await vehicle.createEmbeddedDocuments('ActiveEffect', [{
            name: effectName,
            img: 'icons/svg/steering-wheel.svg',
            flags: {
                shadowrun5e: {
                    isJumpedInEffect: true,
                    driverUuid: driver.uuid
                }
            },
            system: {
                changes
            }
        } as any]);
    },

    /**
     * Remove temporary ActiveEffect from vehicle actor.
     */
    async _removeJumpedInActiveEffect(vehicle: SR5Actor) {
        const jumpedInEffects = vehicle.effects.filter(e => (e.flags as any)?.shadowrun5e?.isJumpedInEffect === true);
        if (jumpedInEffects.length > 0) {
            const ids = jumpedInEffects.map(e => e.id).filter((id): id is string => !!id);
            await vehicle.deleteEmbeddedDocuments('ActiveEffect', ids);
        }
    }
};
