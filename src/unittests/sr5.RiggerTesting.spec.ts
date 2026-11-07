import { TestCreator } from "@/module/tests/TestCreator";
import { SR5TestFactory } from "./utils";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { SR5 } from '@/module/config';
import { RiggerFlow } from '@/module/flows/RiggerFlow';
import { calculateRammingMultiplier } from '@/module/flows/RiggerActionFlows';
import { VehiclePrep } from '@/module/actor/prep/VehiclePrep';
import { TokenLockHooks } from '@/module/token/TokenLockHooks';

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

        it('Resets previously jumped-in rigger vehicle to autopilot on jump-in while preserving remote and manual modes', async () => {
            const driver = await createDriver();
            const droneA = await factory.createActor({
                type: 'vehicle',
                system: {
                    isDrone: true,
                    controlMode: 'autopilot',
                    vehicleType: 'ground'
                }
            });
            const droneB = await factory.createActor({
                type: 'vehicle',
                system: {
                    isDrone: true,
                    controlMode: 'autopilot',
                    vehicleType: 'air'
                }
            });
            const carManual = await factory.createActor({
                type: 'vehicle',
                system: {
                    isDrone: false,
                    controlMode: 'manual',
                    vehicleType: 'ground'
                }
            });

            await droneA.addVehicleDriver(driver.uuid);
            await droneB.addVehicleDriver(driver.uuid);
            await carManual.addVehicleDriver(driver.uuid);

            // Toggle Drone B to remote (RCC mode)
            await droneB.update({ system: { controlMode: 'remote' } });
            assert.equal(droneB.system.controlMode, 'remote');
            assert.equal(carManual.system.controlMode, 'manual');

            // Jump driver into Drone A
            await RiggerFlow.jumpIn(driver, droneA);
            assert.equal(droneA.system.controlMode, 'rigger');
            // Remote and manual vehicles remain untouched
            assert.equal(droneB.system.controlMode, 'remote');
            assert.equal(carManual.system.controlMode, 'manual');

            // Jump driver into Drone B — Drone A (which was in rigger mode) resets to autopilot
            await RiggerFlow.jumpIn(driver, droneB);
            assert.equal(droneB.system.controlMode, 'rigger');
            assert.equal(droneA.system.controlMode, 'autopilot');
            assert.equal(carManual.system.controlMode, 'manual');

            // Jump out of Drone B
            await RiggerFlow.jumpOut(driver, droneB);
            assert.equal(droneB.system.controlMode, 'autopilot');
        });

        it('Renders character sheet and vehicle sheet inventory tabs without template missing errors', async () => {
            const character = await createDriver();
            const vehicle = await createVehicle();

            const charSheet = character.sheet;
            assert.ok(charSheet);
            await charSheet!.render(true);
            await new Promise(resolve => setTimeout(resolve, 100));
            await charSheet!.close();

            const vehicleSheet = vehicle.sheet;
            assert.ok(vehicleSheet);
            await vehicleSheet!.render(true);
            await new Promise(resolve => setTimeout(resolve, 100));
            await vehicleSheet!.close();
        });

        it('Injects driver rigging attributes and skills via getRollData/getSkill/getAttribute on jumpIn without mutating non-rigging skills', async () => {
            const driver = await createDriver();
            const spellcasting = driver.items.get(driver.system.skills.active.spellcasting?.id);
            await spellcasting?.update({ system: { skill: { rating: 6 } } });
            const sneaking = driver.items.get(driver.system.skills.active.sneaking?.id);
            await sneaking?.update({ system: { skill: { rating: 3 } } });
            const ewar = driver.items.get(driver.system.skills.active.electronic_warfare?.id);
            await ewar?.update({ system: { skill: { rating: 4 } } });

            const vehicle = await factory.createActor({
                type: 'vehicle',
                system: {
                    controlMode: 'autopilot',
                    vehicleType: 'ground',
                    isDrone: true,
                    vehicle_stats: {
                        pilot: { base: 2 },
                        handling: { base: 3 },
                        speed: { base: 3 },
                        sensor: { base: 4 }
                    }
                }
            });

            assert.isUndefined((VehiclePrep as unknown as Record<string, unknown>).prepareJumpedInDriverData);

            // Before jump in
            assert.equal(vehicle.system.controlMode, 'autopilot');
            assert.equal(vehicle.system.vehicle_stats.handling.value, 3);
            assert.equal(vehicle.system.vehicle_stats.speed.value, 3);

            // Jump in
            await RiggerFlow.jumpIn(driver, vehicle);

            assert.equal(vehicle.system.controlMode, 'rigger');
            // No ActiveEffects created on vehicle
            assert.isFalse(vehicle.effects.some(e => e.getFlag('shadowrun5e', 'isJumpedInEffect') === true));
            // Sheet stats remain base, roll limits get control rig bonus
            assert.equal(vehicle.system.vehicle_stats.handling.value, 3);
            assert.equal(vehicle.system.vehicle_stats.speed.value, 3);
            const rollTest = await TestCreator.fromPackAction(SR5.packNames.GeneralActionsPack, 'drone_pilot_vehicle', vehicle, testOptions);
            assert.notEqual(rollTest, undefined);
            await rollTest!.execute();
            assert.equal(rollTest!.limit.value, 6);

            // Driver rigging attributes and skills injected via getRollData / getAttribute / getSkill
            const rollData = vehicle.getRollData();
            assert.equal(rollData.attributes.logic.value, 5);
            assert.equal(rollData.attributes.intuition.value, 5);
            assert.equal(rollData.attributes.reaction.value, 3);
            assert.equal(rollData.attributes.agility.value, 3);
            assert.equal(vehicle.getAttribute('intuition')?.value, 5);
            assert.equal(vehicle.getAttribute('logic')?.value, 5);
            assert.equal(vehicle.getAttribute('reaction')?.value, 3);
            assert.equal(vehicle.getAttribute('agility')?.value, 3);

            assert.equal(vehicle.getSkill('pilot_ground_craft')?.value, 5);
            assert.equal(vehicle.getSkill('gunnery')?.value, 5);
            assert.equal(vehicle.getSkill('perception')?.value, 4);
            assert.equal(vehicle.getSkill('sneaking')?.value, 3);
            assert.equal(vehicle.getSkill('electronic_warfare')?.value, 4);

            // Non-rigging skills (e.g. spellcasting) are NOT copied onto the vehicle
            assert.isUndefined(vehicle.system.skills.active.spellcasting);
            assert.isTrue(!vehicle.getSkill('spellcasting') || vehicle.getSkill('spellcasting')?.value === 0);

            // Jump out
            await RiggerFlow.jumpOut(driver, vehicle);

            assert.equal(vehicle.system.controlMode, 'autopilot');
            assert.equal(vehicle.system.vehicle_stats.handling.value, 3);
            assert.equal(vehicle.system.vehicle_stats.speed.value, 3);
            assert.isTrue(!vehicle.getSkill('pilot_ground_craft') || vehicle.getSkill('pilot_ground_craft')?.value === 0);
        });

        it('Copies driver VR initiative only in rigger controlMode and preserves vehicle initiative in remote and manual modes', async () => {
            const driver = await createDriver();
            const vehicle = await factory.createActor({
                type: 'vehicle',
                system: {
                    controlMode: 'autopilot',
                    vehicleType: 'ground',
                    isDrone: true,
                    driver: driver.uuid,
                    vehicle_stats: {
                        pilot: { base: 3 },
                        handling: { base: 3 },
                        speed: { base: 3 },
                        sensor: { base: 4 }
                    }
                }
            });

            const autopilotConstant = vehicle.system.initiative.current.constant.value;
            const autopilotDice = vehicle.system.initiative.current.dice.value;
            assert.equal(autopilotConstant, 6); // Pilot 3 * 2
            assert.equal(autopilotDice, 4);

            // Remote mode keeps vehicle's own initiative
            await vehicle.update({ system: { controlMode: 'remote' } });
            assert.equal(vehicle.system.initiative.current.constant.value, autopilotConstant);
            assert.equal(vehicle.system.initiative.current.dice.value, autopilotDice);

            // Manual mode keeps vehicle's own initiative
            await vehicle.update({ system: { controlMode: 'manual' } });
            assert.equal(vehicle.system.initiative.current.constant.value, autopilotConstant);
            assert.equal(vehicle.system.initiative.current.dice.value, autopilotDice);

            // Rigger mode copies driver's Matrix VR initiative
            await vehicle.update({ system: { controlMode: 'rigger' } });
            const driverMatrixInit = driver.system.initiative.matrix;
            assert.equal(vehicle.system.initiative.current.constant.value, driverMatrixInit.constant.value);
            assert.equal(vehicle.system.initiative.current.dice.value, driverMatrixInit.dice.value);
        });

        it('Calculates ramming damage multiplier according to SR5 CRB p. 203 speed brackets', () => {
            assert.equal(calculateRammingMultiplier(10), 0.5);
            assert.equal(calculateRammingMultiplier(50), 1);
            assert.equal(calculateRammingMultiplier(200), 2);
            assert.equal(calculateRammingMultiplier(250), 3);
            assert.equal(calculateRammingMultiplier(400), 5);
            assert.equal(calculateRammingMultiplier(600), 10);
        });

        it('Blocks jumped-in rigger token movement via onPreMoveToken_LockJumpedInRigger without setting tokenDoc.locked', async () => {
            const driver = await createDriver();
            const vehicle = await createVehicle();

            await RiggerFlow.jumpIn(driver, vehicle);

            const mockTokenDoc = {
                actor: driver,
                locked: false
            } as unknown as TokenDocument;

            assert.isFalse(mockTokenDoc.locked);
            const moveAllowed = TokenLockHooks.onPreMoveToken_LockJumpedInRigger(
                mockTokenDoc,
                { constrainOptions: { ignoreWalls: false, ignoreCost: false } } as unknown as TokenDocument.MovementOperation
            );
            assert.strictEqual(moveAllowed, false);
            assert.isFalse(mockTokenDoc.locked);

            await RiggerFlow.jumpOut(driver, vehicle);
            const moveAfterJumpOut = TokenLockHooks.onPreMoveToken_LockJumpedInRigger(
                mockTokenDoc,
                { constrainOptions: { ignoreWalls: false, ignoreCost: false } } as unknown as TokenDocument.MovementOperation
            );
            assert.isUndefined(moveAfterJumpOut);
        });
    });
};
