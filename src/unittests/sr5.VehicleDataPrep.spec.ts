import { SR5Actor } from './../module/actor/SR5Actor';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const shadowrunSR5VehicleDataPrep = (context: QuenchBatchContext) => {
    const { describe, it, before, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    before(async () => {})
    after(async () => {})
    
    describe('VehicleDataPrep', () => {
        it('Matrix condition monitor track calculation with modifiers', async () => {
            const vehicle = new SR5Actor<'vehicle'>({ type: 'vehicle' });
            assert.equal(vehicle.system.matrix.condition_monitor.max, 8);

            await vehicle.update({ system: { modifiers: { matrix_track: 1 } } });
            assert.equal(vehicle.system.matrix.condition_monitor.max, 9);

            console.log('visibility checks');

            await vehicle.delete();
        });

        it('visibility checks', async () => {
            const vehicle = new SR5Actor<'vehicle'>({ system: { attributes: { body: { base : 5 } } }, name: 'Testing', type: 'vehicle' });
            assert.strictEqual(vehicle.system.visibilityChecks.astral.hasAura, false);
            assert.strictEqual(vehicle.system.visibilityChecks.astral.astralActive, false);
            assert.strictEqual(vehicle.system.visibilityChecks.astral.affectedBySpell, false);
            assert.strictEqual(vehicle.system.visibilityChecks.meat.hasHeat, true);
            assert.strictEqual(vehicle.system.visibilityChecks.matrix.hasIcon, true);
            assert.strictEqual(vehicle.system.visibilityChecks.matrix.runningSilent, false);

            await vehicle.delete();
        });

        it('Recoil compensation', async () => {
            const vehicle = new SR5Actor<'vehicle'>({ system: { attributes: { body: { base: 5 } } }, name: 'Testing', type: 'vehicle' });
            if (!vehicle) return assert.fail();

            assert.strictEqual(vehicle.system.values.recoil_compensation.value, 5); // SR5#175: 5

            await vehicle.delete();
        });

        it('Attributes based on pilot', async () => {
            // Create temporary actor
            const vehicle = new SR5Actor<'vehicle'>({
                type: 'vehicle',
                system: {
                    vehicle_stats: { pilot: { base: 3 } },
                    attributes: { body: { base: 5 } }
                }
            });

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

            await vehicle.delete();
        });
    });
};
