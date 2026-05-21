import { SR5TestFactory } from './utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const shadowrunSR5VehicleDataPrep = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { await factory.destroy(); });

    
    describe('VehicleDataPrep', () => {
        it('armor rating calculation with modifiers', async () => {
            const vehicle = await factory.createActor({
                type: 'vehicle',
                system: {
                    armor: {
                        rating: { base: 9 },
                    },
                    modifiers: {
                        armor: 2,
                    }
                }
            });

            assert.strictEqual(vehicle.system.armor.rating.base, 9);
            assert.strictEqual(vehicle.system.armor.rating.value, 11);
        });

        it('applies equipped armor item values to vehicle armor rating', async () => {
            const vehicle = await factory.createActor({
                type: 'vehicle',
                system: {
                    armor: {
                        rating: { base: 9 },
                    },
                }
            });

            await vehicle.createEmbeddedDocuments('Item', [{
                type: 'armor',
                name: 'Vehicle Armor Accessory',
                system: {
                    armor: {
                        base: 2,
                        accessory: true,
                    },
                    technology: {
                        equipped: true,
                    },
                },
            }]);

            assert.strictEqual(vehicle.system.armor.rating.base, 9);
            assert.strictEqual(vehicle.system.armor.rating.value, 11);
        });

        it('Matrix condition monitor track calculation with modifiers', async () => {
            const vehicle = await factory.createActor({ type: 'vehicle' });
            assert.equal(vehicle.system.matrix.condition_monitor.max, 8);

            await vehicle.update({ system: { modifiers: { matrix_track: 1 } } });
            assert.equal(vehicle.system.matrix.condition_monitor.max, 9);

            console.log('visibility checks');
        });

        it('visibility checks', async () => {
            const vehicle = await factory.createActor({ type: 'vehicle', system: { attributes: { body: { base : 5 } } } });
            assert.strictEqual(vehicle.system.visibilityChecks.astral.hasAura, false);
            assert.strictEqual(vehicle.system.visibilityChecks.astral.astralActive, false);
            assert.strictEqual(vehicle.system.visibilityChecks.astral.affectedBySpell, false);
            assert.strictEqual(vehicle.system.visibilityChecks.meat.hasHeat, true);
            assert.strictEqual(vehicle.system.visibilityChecks.matrix.hasIcon, true);
            assert.strictEqual(vehicle.system.visibilityChecks.matrix.runningSilent, false);
        });

        it('Recoil compensation', async () => {
            const vehicle = await factory.createActor({ type: 'vehicle', system: { attributes: { body: { base: 5 } } } });
            if (!vehicle) return assert.fail();

            assert.strictEqual(vehicle.system.values.recoil_compensation.value, 5); // SR5#175: 5
        });

        it('Attributes based on pilot', async () => {
            // Create temporary actor
            const vehicle = await factory.createActor({
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
        });

        it('custom initiative formulae apply for vehicle meatspace/matrix', async () => {
            const vehicle = await factory.createActor({
                type: 'vehicle',
                system: {
                    vehicle_stats: { pilot: { base: 3 } },
                    initiative: {
                        meatspace: { attribute_a: 'pilot', attribute_b: 'pilot', constant: { base: 1 }, dice: { base: 2 } },
                        matrix: { attribute_a: 'reaction', attribute_b: 'intuition', constant: { base: 1 }, dice: { base: 2 } },
                    },
                },
            });

            assert.strictEqual(vehicle.system.initiative.meatspace.constant.value, 7);
            assert.strictEqual(vehicle.system.initiative.meatspace.dice.value, 2);
            assert.strictEqual(vehicle.system.initiative.matrix.constant.value, 7);
            assert.strictEqual(vehicle.system.initiative.matrix.dice.value, 2);
        });
    });
};



