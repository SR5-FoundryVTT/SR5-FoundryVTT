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
            await TokenLockHooks.setJumpedInState(currentDriver, vehicle, false);
            await (currentDriver as any).unsetFlag(SYSTEM_NAME, 'jumpedInVehicleUuid');
        } else {
            await TokenLockHooks.setJumpedInState(null as any, vehicle, false);
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
     * Get all actor instances corresponding to the given actor (e.g. sidebar actor and canvas token actors).
     */
    getActorInstances(actor: SR5Actor | null): SR5Actor[] {
        if (!actor) return [];
        const instances = new Set<SR5Actor>([actor]);

        const token = actor.getToken();
        if (token?.actor) {
            instances.add(token.actor as SR5Actor);
        }

        const actorId = actor.id ? actor.id.split('.').pop()! : '';
        if (canvas.scene?.tokens) {
            for (const t of canvas.scene.tokens) {
                if (t.actor) {
                    const tActorId = t.actor.id ? t.actor.id.split('.').pop()! : '';
                    if (t.actor === actor || t.actor.uuid === actor.uuid || (actorId && tActorId === actorId)) {
                        instances.add(t.actor as SR5Actor);
                    }
                }
            }
        }
        return Array.from(instances);
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

        const instances = this.getActorInstances(vehicle);
        for (const v of instances) {
            const createdEffects = await v.createEmbeddedDocuments('ActiveEffect', [{
                name: effectName,
                img: 'systems/shadowrun5e/dist/icons/status-effects/steering-wheel.svg',
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

            if (createdEffects && createdEffects.length > 0 && createdEffects[0].id) {
                await (v as any).setFlag(SYSTEM_NAME, 'jumpedInEffectId', createdEffects[0].id);
            }
        }
    },

    /**
     * Remove temporary ActiveEffect from vehicle actor.
     */
    async _removeJumpedInActiveEffect(vehicle: SR5Actor) {
        if (!vehicle) return;

        const instances = this.getActorInstances(vehicle);
        for (const v of instances) {
            const idsToDelete = new Set<string>();

            const savedEffectId = (v as any).getFlag(SYSTEM_NAME, 'jumpedInEffectId') as string | undefined;
            if (savedEffectId) {
                idsToDelete.add(savedEffectId);
            }

            for (const effect of v.effects) {
                const isJumpedInFlag = (effect.flags as any)?.shadowrun5e?.isJumpedInEffect === true;
                const isRiggedStatus = effect.statuses?.has('sr5riggedVehicle') || (effect as any).statusId === 'sr5riggedVehicle';
                if (isJumpedInFlag || isRiggedStatus) {
                    if (effect.id) idsToDelete.add(effect.id);
                }
            }

            if (idsToDelete.size > 0) {
                await v.deleteEmbeddedDocuments('ActiveEffect', Array.from(idsToDelete));
            }

            await (v as any).unsetFlag(SYSTEM_NAME, 'jumpedInEffectId');
            await v.toggleStatusEffect('sr5riggedVehicle', { active: false });
        }
    }
};
