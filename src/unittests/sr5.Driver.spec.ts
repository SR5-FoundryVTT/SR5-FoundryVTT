import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SR5TestFactory } from './utils';
import { TestCreator } from '@/module/tests/TestCreator';
import { SR5 } from '@/module/config';

export const shadowrunDriver = (context: QuenchBatchContext) => {
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
                }
            }
        });

        const gunnery = actor.items.get(actor.system.skills.active.gunnery?.id);
        await gunnery?.update({ system: { skill: { rating: 5 }}});
        const pilot_ground_craft = actor.items.get(actor.system.skills.active.pilot_ground_craft?.id);
        await pilot_ground_craft?.update({ system: { skill: { rating: 5 }} });

        return actor;
    }

    const createVehicle = async () => {
        return await factory.createActor({ type: 'vehicle', system: {controlMode: 'remote', vehicleType: 'ground'} });
    }

    describe('Driver Stats', () => {
        it('Can join and leave of a Vehicle', async () => {
            const driver = await createDriver();
            const vehicle = await createVehicle();
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
            const driver = await createDriver();
            const vehicle = await createVehicle();
            await vehicle.addVehicleDriver(driver.uuid);

            const test = await TestCreator.fromPackAction(SR5.packNames.GeneralActionsPack, 'drone_pilot_vehicle', vehicle, testOptions);
            assert.notEqual(test, undefined);
            await test!.execute();
            assert.equal(test!.pool.value, 10);
        });

        it('Drive a Vehicle Manually', async () => {
            const driver = await createDriver();
            const vehicle = await createVehicle();
            await vehicle.update({system: {controlMode: 'manual'}});
            await vehicle.addVehicleDriver(driver.uuid);

            const test = await TestCreator.fromPackAction(SR5.packNames.GeneralActionsPack, 'drone_pilot_vehicle', vehicle, testOptions);
            assert.notEqual(test, undefined);
            await test!.execute();
            assert.equal(test!.pool.value, 8);
        });
    });
};
