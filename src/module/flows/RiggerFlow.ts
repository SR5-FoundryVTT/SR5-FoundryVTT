import { SR5Actor } from '@/module/actor/SR5Actor';
import { TokenLockHooks } from '@/module/token/TokenLockHooks';
import { TestCreator } from '@/module/tests/TestCreator';
import { SR5 } from '@/module/config';
import { Helpers } from '@/module/helpers';
import { FLAGS, SYSTEM_NAME } from '@/module/constants';

export const RiggerFlow = {
    /**
     * Jump a driver actor into a vehicle/drone actor.
     */
    async jumpIn(driver: SR5Actor, vehicle: SR5Actor) {
        if (!driver || !vehicle || !vehicle.isType('vehicle')) return;

        // Check for installed Rigger Interface on non-drone vehicles
        const hasRiggerInterface = vehicle.system.isDrone || vehicle.items.some((item: any) => {
            const cat = item.system?.category;
            const name = item.name?.toLowerCase() || '';
            return cat === 'rigger_interface' || name.includes('rigger interface');
        });

        if (!hasRiggerInterface) {
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
     * Perform forced ejection of driver from vehicle/drone with Dump Shock.
     */
    async ejectDriver(vehicle: SR5Actor, isDeviceDestroyed = false) {
        if (!vehicle || !vehicle.isType('vehicle')) return;
        const driver = vehicle.getVehicleDriver();
        if (!driver) return;

        const isHotSim = driver.system.matrix?.hot_sim === true;
        const damageType = isHotSim ? 'physical' : 'stun';
        const damageValue = 6;

        const content = `
            <div class="sr5-chat-card dump-shock-card">
                <div class="card-header">
                    <h3>⚡ ${game.i18n.localize('SR5.Rigger.ResistDumpShock')}</h3>
                </div>
                <div class="card-content">
                    <p><strong>${driver.name}</strong> suffered forced ejection from <strong>${vehicle.name}</strong> (${isDeviceDestroyed ? 'Device Destroyed' : 'Connection Severed'}).</p>
                    <div class="test-value">
                        <span class="value">${game.i18n.localize('SR5.Rigger.ResistDumpShock')}: </span>
                        <span class="value-result">
                            <span class="button apply-damage"
                                  data-tooltip="${game.i18n.localize('SR5.Rigger.ResistDumpShock')}"
                                  data-damage-value="${damageValue}"
                                  data-damage-type="${damageType}"
                                  data-damage-biofeedback="true"
                                  data-target-uuid="${driver.uuid}">
                                ${damageValue}${damageType.charAt(0).toUpperCase()} (${game.i18n.localize('SR5.BiofeedbackDamage')})
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        `;

        await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: driver as any }),
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
     * Create/apply or update persistent ActiveEffect on vehicle actor with driver's attributes, skills, and Control Rig modifiers.
     */
    async _applyJumpedInActiveEffect(driver: SR5Actor, vehicle: SR5Actor) {
        const changes: any[] = [];

        // Transfer Driver attributes
        const attributeKeysToTransfer = ['logic', 'intuition', 'reaction', 'agility'];
        for (const attKey of attributeKeysToTransfer) {
            const att = driver.findAttribute(attKey as any);
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

        const hasExistingHandlingEffect = (actor: SR5Actor) => {
            return actor.effects.some(e => {
                if (e.disabled || (e as any).isSuppressed) return false;
                const changes = (e as any).changes || (e.system as any)?.changes || [];
                return changes.some((c: any) =>
                    c.key?.includes('vehicle_stats.handling') ||
                    c.key?.includes('vehicle_stats.speed') ||
                    c.key?.includes('modifiers.handling') ||
                    c.key?.includes('modifiers.speed')
                );
            });
        };

        const controlRigItemHasEffects = () => {
            const items = Array.from(driver.items.values());
            return items.some((item: any) => {
                const isControlRig = item.name?.toLowerCase().includes('control rig') || (item.system as any)?.category === 'control_rig';
                if (!isControlRig) return false;
                return item.effects.some((e: any) => {
                    if (e.disabled || (e as any).isSuppressed) return false;
                    const changes = (e as any).changes || (e.system as any)?.changes || [];
                    return changes.some((c: any) =>
                        c.key?.includes('vehicle_stats.handling') ||
                        c.key?.includes('vehicle_stats.speed') ||
                        c.key?.includes('modifiers.handling') ||
                        c.key?.includes('modifiers.speed')
                    );
                });
            });
        };

        const hasHandlingEffectAlready = hasExistingHandlingEffect(vehicle) || hasExistingHandlingEffect(driver) || controlRigItemHasEffects();

        if (controlRigRating > 0 && !hasHandlingEffectAlready) {
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
            const riggerInterfaceItem = v.items.find((item: any): boolean => {
                const cat = (item.system as any)?.category;
                const name = (item.name as string | undefined)?.toLowerCase() || '';
                return cat === 'rigger_interface' || name.includes('rigger interface');
            });

            const savedEffectId = (v as any).getFlag(SYSTEM_NAME, 'jumpedInEffectId') as string | undefined;
            const riggerInterfaceEffectId = riggerInterfaceItem ? (riggerInterfaceItem as any).getFlag(SYSTEM_NAME, 'jumpedInEffectId') as string | undefined : undefined;

            const existingEffect = v.effects.find((e: any): boolean => {
                if ((e.flags as any)?.shadowrun5e?.isJumpedInEffect === true) return true;
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
                            driverUuid: driver.uuid,
                            riggerInterfaceItemId: riggerInterfaceItem?.id || null
                        }
                    },
                    system: {
                        targets: [{ id: 'actor', applyTo: 'actor' }],
                        changes
                    }
                } as any);
                await (v as any).setFlag(SYSTEM_NAME, 'jumpedInEffectId', existingEffect.id);
                if (riggerInterfaceItem) {
                    await (riggerInterfaceItem as any).setFlag(SYSTEM_NAME, 'jumpedInEffectId', existingEffect.id);
                }
            } else {
                const createdEffects = await v.createEmbeddedDocuments('ActiveEffect', [{
                    name: effectName,
                    img: 'systems/shadowrun5e/dist/icons/status-effects/steering-wheel.svg',
                    disabled: false,
                    flags: {
                        shadowrun5e: {
                            isJumpedInEffect: true,
                            driverUuid: driver.uuid,
                            riggerInterfaceItemId: riggerInterfaceItem?.id || null
                        }
                    },
                    system: {
                        targets: [{ id: 'actor', applyTo: 'actor' }],
                        changes
                    }
                } as any]);

                if (createdEffects && createdEffects.length > 0 && createdEffects[0].id) {
                    const newId = createdEffects[0].id;
                    await (v as any).setFlag(SYSTEM_NAME, 'jumpedInEffectId', newId);
                    if (riggerInterfaceItem) {
                        await (riggerInterfaceItem as any).setFlag(SYSTEM_NAME, 'jumpedInEffectId', newId);
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
            const riggerInterfaceItem = v.items.find((item: any) => {
                const cat = item.system?.category;
                const name = item.name?.toLowerCase() || '';
                return cat === 'rigger_interface' || name.includes('rigger interface');
            });

            const savedEffectId = (v as any).getFlag(SYSTEM_NAME, 'jumpedInEffectId') as string | undefined;
            const riggerInterfaceEffectId = riggerInterfaceItem ? (riggerInterfaceItem as any).getFlag(SYSTEM_NAME, 'jumpedInEffectId') as string | undefined : undefined;

            for (const effect of v.effects) {
                const isJumpedInFlag = (effect.flags as any)?.shadowrun5e?.isJumpedInEffect === true;
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
