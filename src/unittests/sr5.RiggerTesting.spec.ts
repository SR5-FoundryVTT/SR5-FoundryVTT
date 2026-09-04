import { TestCreator } from "@/module/tests/TestCreator";
import { SR5TestFactory } from "./utils";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { SR5 } from '@/module/config';
import { RiggingRules } from '@/module/rules/RiggingRules';
import { RiggerFlow } from '@/module/flows/RiggerFlow';
import { ActorOwnershipFlow } from '@/module/actor/flows/ActorOwnershipFlow';
import { MatrixTargetingFlow } from '@/module/flows/MatrixTargetingFlow';

export const shadowrunRiggerTesting = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { await factory.destroy(); });

    const testOptions = { showDialog: false, showMessage: false };

    const createDriver = async () => {
        const actor = await factory.createActor({ type: 'character',
            system: {
                attributes: {
                    intuition: { base: 5, },
                    reaction: { base: 3, },
                    agility: { base: 3, },
                    logic: { base: 5, }
                },
                skills: {
                    active: {
                        gunnery: { base: 5, attribute: 'agility' },
                        pilot_ground_craft: { base: 5, attribute: 'reaction' },
                        perception: { base: 4, attribute: 'intuition' }
                    }
                },
                matrix: {
                    hot_sim: true,
                    vr: true,
                    running_silent: false,
                },
                values: {
                    control_rig_rating: { base: 3 },
                }
            }
        });

        const gunnery = actor.items.get(actor.system.skills.active.gunnery?.id);
        await gunnery?.update({ system: { skill: { rating: 5 }}});
        const pilot_ground_craft = actor.items.get(actor.system.skills.active.pilot_ground_craft?.id);
        await pilot_ground_craft?.update({ system: { skill: { rating: 5 }} });
        const perception = actor.items.get(actor.system.skills.active.perception?.id);
        await perception?.update({ system: { skill: { rating: 4 }} });
        
        return actor;
    }

    const createVehicle = async () => {
        return await factory.createActor({ type: 'vehicle',
            system: {
                controlMode: 'rigger',
                vehicleType: 'ground',
                vehicle_stats: {
                    handling: { base: 3 },
                    speed: { base: 3 },
                    sensor: {base: 4}
                }
            }
        });
    }

    describe('Rigger Testing', () => {
        it('Builds handling click-roll action as Reaction + related Pilot with handling limit', async () => {
            const vehicle = await createVehicle();
            const driver = await createDriver();
            await vehicle.addVehicleDriver(driver.uuid);

            const action = vehicle.vehiclePilotActionData('handling');
            assert.notEqual(action, undefined);
            assert.equal(action!.attribute, 'reaction');
            assert.equal(action!.skill, vehicle.getVehicleTypeSkillName());
            assert.equal(action!.limit.attribute, 'handling');

            const test = await TestCreator.fromAction(action!, vehicle, testOptions);
            assert.notEqual(test, undefined);
            await test!.execute();

            // Pool should include mental substitution + pilot + hot sim + control rig.
            assert.equal(test!.pool.value, 15);
            // handling limit + control rig
            assert.equal(test!.limit.value, 6);
        });

        it('Builds speed click-roll action as Reaction + related Pilot with speed limit', async () => {
            const vehicle = await createVehicle();
            const driver = await createDriver();
            await vehicle.addVehicleDriver(driver.uuid);

            const action = vehicle.vehiclePilotActionData('speed');
            assert.notEqual(action, undefined);
            assert.equal(action!.attribute, 'reaction');
            assert.equal(action!.skill, vehicle.getVehicleTypeSkillName());
            assert.equal(action!.limit.attribute, 'speed');

            const test = await TestCreator.fromAction(action!, vehicle, testOptions);
            assert.notEqual(test, undefined);
            await test!.execute();

            // speed limit + control rig
            assert.equal(test!.limit.value, 6);
        });

        it('Jump into a Vehicle and Perform Driving Test', async () => {
            const vehicle = await createVehicle();
            const driver = await createDriver();
            await vehicle.addVehicleDriver(driver.uuid);

            const test = await TestCreator.fromPackAction(SR5.packNames.GeneralActionsPack, 'drone_pilot_vehicle', vehicle, testOptions);
            assert.notEqual(test, undefined);
            await test!.execute();
            // dicepool should be Intuition + Pilot + Hot Sim + Control Rig
            assert.equal(test!.pool.value, 15);
            // limit should be Control Rig + Handling/Speed
            assert.equal(test!.limit.value, 6);
        });

        it('Jump into a Vehicle and Perform Drone Perception', async () => {
            const vehicle = await createVehicle();
            const driver = await createDriver();
            await vehicle.addVehicleDriver(driver.uuid);

            const test = await TestCreator.fromPackAction(SR5.packNames.GeneralActionsPack, 'drone_perception', vehicle, testOptions);
            assert.notEqual(test, undefined);
            await test!.execute();
            // dicepool should be Intuition + Pilot + Hot Sim + Control Rig
            // SR5 266 VR and Rigging -- I'm interpreting that to mean Sensor tests are Vehicle Tests
            assert.equal(test!.pool.value, 14);
            // limit should be Sensor + Control Rig
            assert.equal(test!.limit.value, 7);
        });

        it('Applies vehicle hurt penalty to handling limits during rolls only', async () => {
            const vehicle = await createVehicle();
            const driver = await createDriver();
            await vehicle.addVehicleDriver(driver.uuid);

            await vehicle.update({
                system: {
                    environment: 'handling',
                    track: { physical: { value: 3 } }
                }
            });

            // Sheet values remain unchanged.
            assert.equal(vehicle.system.vehicle_stats.handling.value, 3);

            const test = await TestCreator.fromPackAction(SR5.packNames.GeneralActionsPack, 'drone_pilot_vehicle', vehicle, testOptions);
            assert.notEqual(test, undefined);
            await test!.execute();

            // pool should not receive vehicle hurt directly
            assert.equal(test!.pool.value, 15);
            // handling limit (3) + control rig (3) + hurt (-1)
            assert.equal(test!.limit.value, 5);
        });

        it('Does not apply vehicle hurt penalty to non-handling limits', async () => {
            const vehicle = await createVehicle();
            const driver = await createDriver();
            await vehicle.addVehicleDriver(driver.uuid);

            await vehicle.update({ system: { track: { physical: { value: 6 } } } });

            const test = await TestCreator.fromPackAction(SR5.packNames.GeneralActionsPack, 'drone_perception', vehicle, testOptions);
            assert.notEqual(test, undefined);
            await test!.execute();

            // sensor limit + control rig, unaffected by hurt
            assert.equal(test!.limit.value, 7);
        });

        it('Does not apply damaged-vehicle penalty to speed-based pilot click rolls', async () => {
            const vehicle = await createVehicle();
            const driver = await createDriver();
            await vehicle.addVehicleDriver(driver.uuid);

            await vehicle.update({ system: { track: { physical: { value: 6 } } } });

            const action = vehicle.vehiclePilotActionData('speed');
            assert.notEqual(action, undefined);

            const test = await TestCreator.fromAction(action!, vehicle, testOptions);
            assert.notEqual(test, undefined);
            await test!.execute();

            // speed limit + control rig, unaffected by vehicle damaged handling penalty
            assert.equal(test!.limit.value, 6);
        });

        it('Calculates max autosoft slots and resolves local autosoft rating for autonomous drones', async () => {
            const drone = await factory.createActor({
                type: 'vehicle',
                system: {
                    isDrone: true,
                    controlMode: 'autopilot',
                    vehicle_stats: {
                        pilot: { base: 4 },
                        sensor: { base: 3 }
                    }
                }
            });

            assert.equal(RiggingRules.getMaxAutosoftSlots(drone), 2);

            // Add local Clearsight autosoft
            const autosoft = await factory.createItem({
                type: 'program',
                system: {
                    type: 'autosoft',
                    autosoftType: 'clearsight',
                    technology: { rating: 3, equipped: true }
                }
            }, { parent: drone } as any);

            const effective = RiggingRules.getEffectiveAutosoft(drone, 'clearsight');
            assert.equal(effective.rating, 3);
            assert.equal(effective.source, 'local');

            const test = await TestCreator.fromPackAction(SR5.packNames.GeneralActionsPack, 'drone_perception', drone, testOptions);
            assert.notEqual(test, undefined);
            await test!.execute();

            // Dice pool should be Pilot (4) + Clearsight Autosoft (3) = 7
            assert.equal(test!.pool.value, 7);
        });

        it('Inherits RCC loaded autosofts for slaved drones when no local autosofts are active', async () => {
            const driver = await createDriver();

            // Create RCC device item on driver
            const rcc = await factory.createItem({
                type: 'device',
                system: {
                    category: 'rcc',
                    sharing: 3,
                    noise_reduction: 2,
                    technology: { rating: 5, equipped: true }
                }
            }, { parent: driver } as any);

            // Add shared autosoft to RCC owner
            await factory.createItem({
                type: 'program',
                system: {
                    type: 'autosoft',
                    autosoftType: 'maneuvering',
                    technology: { rating: 4, equipped: true }
                }
            }, { parent: driver } as any);

            const rccInfo = RiggingRules.getRCCSharingInfo(rcc);
            assert.equal(rccInfo.sharing, 3);
            assert.equal(rccInfo.isOverAllocated, false);
            assert.equal(rccInfo.loadedAutosoftsCount, 1);

            // Create drone slaved to RCC
            const drone = await factory.createActor({
                type: 'vehicle',
                system: {
                    isDrone: true,
                    controlMode: 'autopilot',
                    master: rcc.uuid,
                    vehicle_stats: {
                        pilot: { base: 3 },
                        handling: { base: 4 },
                        speed: { base: 4 }
                    }
                }
            });

            const effective = RiggingRules.getEffectiveAutosoft(drone, 'maneuvering');
            assert.equal(effective.rating, 4);
            assert.equal(effective.source, 'rcc');
        });

        it('Calculates Drone Swarm Pilot rating and applies Swarm bonus to autonomous rolls', async () => {
            const droneLeader = await factory.createActor({
                type: 'vehicle',
                system: {
                    isDrone: true,
                    isSwarm: true,
                    isSwarmLeader: true,
                    controlMode: 'autopilot',
                    vehicle_stats: {
                        pilot: { base: 3 },
                        sensor: { base: 3 }
                    }
                }
            });

            const droneMember = await factory.createActor({
                type: 'vehicle',
                system: {
                    isDrone: true,
                    isSwarm: true,
                    swarmLeaderUuid: droneLeader.uuid,
                    controlMode: 'autopilot',
                    vehicle_stats: {
                        pilot: { base: 4 },
                        sensor: { base: 3 }
                    }
                }
            });

            await droneLeader.update({
                system: { swarmMemberUuids: [droneMember.uuid] }
            } as any);

            const swarmInfo = RiggingRules.getSwarmPilotInfo(droneLeader);
            // Highest pilot in swarm (4) + (2 drones - 1) = 5.
            assert.equal(swarmInfo.highestPilot, 4);
            assert.equal(swarmInfo.memberCount, 2);
            assert.equal(swarmInfo.swarmPilot, 5);
            // Leader pilot is 3, so bonus = 5 - 3 = 2.
            assert.equal(swarmInfo.bonus, 2);

            const test = await TestCreator.fromPackAction(SR5.packNames.GeneralActionsPack, 'drone_perception', droneLeader, testOptions);
            assert.notEqual(test, undefined);
            await test!.execute();

            // Dice pool should include Pilot (3) + Swarm Bonus (2) = 5
            assert.equal(test!.pool.value, 5);
        });

        it('RiggerFlow handles jumpIn, Active Effect skill transfer, and jumpOut correctly', async () => {
            const driver = await createDriver();
            const vehicle = await createVehicle();
            await vehicle.update({ system: { vehicleType: 'air' } });

            await RiggerFlow.jumpIn(driver, vehicle);

            assert.equal(vehicle.system.controlMode, 'rigger');
            assert.equal(vehicle.getVehicleDriver()?.uuid, driver.uuid);

            const jumpedEffect = vehicle.effects.find(e => (e.flags as any)?.shadowrun5e?.isJumpedInEffect === true);
            assert.notEqual(jumpedEffect, undefined);

            const pilotAircraftChange = (jumpedEffect?.system as any)?.changes?.find((c: any) => c.key === 'system.skills.active.pilot_aircraft.value');
            assert.notEqual(pilotAircraftChange, undefined);
            assert.equal(pilotAircraftChange?.value, '5');

            const gunneryChange = (jumpedEffect?.system as any)?.changes?.find((c: any) => c.key === 'system.skills.active.gunnery.value');
            assert.notEqual(gunneryChange, undefined);
            assert.equal(gunneryChange?.value, '5');

            // Test jump out for non-drone vehicle (driver stays in seat)
            await RiggerFlow.jumpOut(driver, vehicle);
            assert.equal(vehicle.system.controlMode, 'autopilot');
            assert.equal(vehicle.getVehicleDriver()?.uuid, driver.uuid);
            const jumpedEffectAfter = vehicle.effects.find(e => (e.flags as any)?.shadowrun5e?.isJumpedInEffect === true);
            assert.equal(jumpedEffectAfter, undefined);

            // Test jump out for drone across different vehicle types (driver is unassigned for all drone types)
            for (const vType of ['air', 'ground', 'water', 'walker'] as const) {
                const testDrone = await createVehicle();
                await testDrone.update({ system: { isDrone: true, vehicleType: vType } });
                await RiggerFlow.jumpIn(driver, testDrone);
                assert.equal(testDrone.getVehicleDriver()?.uuid, driver.uuid);
                await RiggerFlow.jumpOut(driver, testDrone);
                assert.equal(testDrone.hasDriver(), false);
            }
        });

        it('ActorOwnershipFlow and MatrixTargetingFlow include owned vehicles in prepareOwnIcons', async () => {
            const driver = await createDriver();
            const vehicle = await createVehicle();
            assert.isTrue(ActorOwnershipFlow._isOwnerOfActor(driver, vehicle));
            const ownIcons = MatrixTargetingFlow.prepareOwnIcons(driver);
            assert.isTrue(ownIcons.some(t => t.document.uuid === vehicle.uuid));
        });
    });
};
