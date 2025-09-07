import { TestCreator } from "@/module/tests/TestCreator";
import { SR5TestFactory } from "./utils";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { SR5 } from '@/module/config';

export const shadowrunRiggerTesting = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { factory.destroy(); });

    const testOptions = { showDialog: false, showMessage: false };

    const createDriver = async () => {
        return await factory.createActor({ type: 'character',
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

    describe('Rigger Testing around Being jumped in and Control Rig', () => {
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
    });
};
