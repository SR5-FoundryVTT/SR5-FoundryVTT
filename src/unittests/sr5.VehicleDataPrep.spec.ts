import { SR5Item } from '../module/item/SR5Item';
import { SR5Actor } from './../module/actor/SR5Actor';
import { SR5TestingDocuments } from './utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const shadowrunSR5VehicleDataPrep = (context: QuenchBatchContext) => {
    const { describe, it, before, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    let testActor;
    let testItem;

    before(async () => {
        testActor = new SR5TestingDocuments(SR5Actor);
        testItem = new SR5TestingDocuments(SR5Item);
    })

    after(async () => {
        await testActor.teardown();
        await testItem.teardown();
    })
    
    describe('VehicleDataPrep', () => {
        it('Matrix condition monitor track calculation with modifiers', async () => {
            const vehicle = await testActor.create({ type: 'vehicle' }) as SR5Actor<'vehicle'>;
            assert.equal(vehicle.system.matrix.condition_monitor.max, 8);

            await vehicle.update({ 'system.modifiers.matrix_track': 1 });
            assert.equal(vehicle.system.matrix.condition_monitor.max, 9);

            console.log('visibility checks');

        });

        it('visibility checks', () => {
            let actor = new SR5Actor({ "system.attributes.body.base": 5, name: 'Testing', type: 'vehicle' });
            assert.strictEqual(actor.system.visibilityChecks.astral.hasAura, false);
            assert.strictEqual(actor.system.visibilityChecks.astral.astralActive, false);
            assert.strictEqual(actor.system.visibilityChecks.astral.affectedBySpell, false);
            assert.strictEqual(actor.system.visibilityChecks.meat.hasHeat, true);
            assert.strictEqual(actor.system.visibilityChecks.matrix.hasIcon, true);
            assert.strictEqual(actor.system.visibilityChecks.matrix.runningSilent, false);
        });

        it('Recoil compensation', () => {
            const vehicle = new SR5Actor<'vehicle'>({ "system.attributes.body.base": 5, name: 'Testing', type: 'vehicle' });
            if (!vehicle) return assert.fail();

            assert.strictEqual(vehicle.system.values.recoil_compensation.value, 5); // SR5#175: 5
        });

        it('Attributes based on pilot', async () => {
            // Create temporary actor
            const vehicle = await testActor.create({
                type: 'vehicle',
                system: {
                    vehicle_stats: { pilot: { base: 3 } },
                    attributes: { body: { base: 5 } }
                }
            }) as SR5Actor<'vehicle'>;

            // Mental Attributes should be pilot. SR5#199
            assert.strictEqual(vehicle.system.attributes.willpower.value, 3);
            assert.strictEqual(vehicle.system.attributes.logic.value, 3);
            assert.strictEqual(vehicle.system.attributes.intuition.value, 3);
            assert.strictEqual(vehicle.system.attributes.charisma.value, 3);

            // Agility SHOULD NOT be pilot, but we default to it for ease of use in some skill cases...
            assert.strictEqual(vehicle.system.attributes.agility.value, 3);

            // Reaction should be pilot. SR5#199
            assert.strictEqual(vehicle.system.attributes.charisma.value, 3);

            // Strength should be body (when using a drone arm, Rigger50#125), we default to that...
            assert.strictEqual(vehicle.system.attributes.strength.value, 5);

        });
    });
};
