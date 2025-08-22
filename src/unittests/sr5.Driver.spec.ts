import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SR5TestFactory } from './utils';
import { TestCreator } from '@/module/tests/TestCreator';

export const shadowrunDriver = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { factory.destroy(); });

    const testOptions = { showDialog: false, showMessage: false };

    describe('Driver Stats', () => {
        it('Can join and leave of a Vehicle', async () => {
            const driver = await factory.createActor({ type: 'character' });
            const vehicle = await factory.createActor({ type: 'vehicle', system: {controlMode: 'remote', vehicleType: 'ground'} });
            await vehicle.addVehicleDriver(driver.uuid);

            assert.isTrue(vehicle.isControlledByDriver());
            assert.isTrue(vehicle.isControlledByDriver('remote'));
            assert.isFalse(vehicle.isControlledByDriver('manual'));
            assert.isFalse(vehicle.isControlledByDriver('rigger'));

            await vehicle.removeVehicleDriver();
            assert.isFalse(vehicle.isControlledByDriver());
            assert.isFalse(vehicle.isControlledByDriver('remote'));
        });

        it('Drive a Vehicle Remotely', async () => {
            const driver = await factory.createActor({ type: 'character',
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
                            pilot_ground_craft: { base: 5, attribute: 'reaction' }
                        }
                    }
                }
            });
            const vehicle = await factory.createActor({ type: 'vehicle', system: {controlMode: 'remote', vehicleType: 'ground'} });
            await vehicle.addVehicleDriver(driver.uuid);
            await vehicle.update({system: {controlMode: 'remote'}});

            const test = await TestCreator.fromPackAction('general-actions', 'drone_pilot_vehicle', vehicle, testOptions);
            assert.notEqual(test, undefined);
            assert.equal(test!.pool.value, 10);
        });

        it('Drive a Vehicle Manually', async () => {
            const driver = await factory.createActor({ type: 'character',
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
                            pilot_ground_craft: { base: 5, attribute: 'reaction' }
                        }
                    }
                }
            });
            const vehicle = await factory.createActor({ type: 'vehicle', system: {controlMode: 'manual', vehicleType: 'ground'} });
            await vehicle.addVehicleDriver(driver.uuid);

            const test = await TestCreator.fromPackAction('general-actions', 'drone_pilot_vehicle', vehicle, testOptions);
            assert.notEqual(test, undefined);
            assert.equal(test!.pool.value, 8);
        });
    });
};
