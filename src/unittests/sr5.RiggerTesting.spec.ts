import { TestCreator } from "@/module/tests/TestCreator";
import { SR5TestFactory } from "./utils";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { SR5 } from '@/module/config';

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
    });
};
