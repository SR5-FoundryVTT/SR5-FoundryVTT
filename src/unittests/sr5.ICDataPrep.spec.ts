import { SR5TestFactory } from './util';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const shadowrunSR5ICDataPrep = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { factory.destroy(); });

    describe('ICDataPrep', () => {
        it('Matrix condition monitor track calculation with modifiers', async () => {
            const ic = await factory.createActor({ type: 'ic' });
            assert.equal(ic.system.matrix.condition_monitor.max, 8);

            await ic.update({ system: { modifiers: { matrix_track: 1 } } });
            assert.equal(ic.system.matrix.condition_monitor.max, 9);
        });

        it('visibility checks', async () => {
            const ic = await factory.createActor({ type: 'ic' });
            assert.strictEqual(ic.system.visibilityChecks.astral.hasAura, false);
            assert.strictEqual(ic.system.visibilityChecks.astral.astralActive, false);
            assert.strictEqual(ic.system.visibilityChecks.astral.affectedBySpell, false);
            assert.strictEqual(ic.system.visibilityChecks.meat.hasHeat, false);
            assert.strictEqual(ic.system.visibilityChecks.matrix.hasIcon, true);
            assert.strictEqual(ic.system.visibilityChecks.matrix.runningSilent, false);
        });

        it('has meat attributes based on the host rating', async () => {
            const ic = await factory.createActor({ type: 'ic', system: { host: { rating: 5 } } });

            assert.strictEqual(ic.system.attributes.agility.value, 5);
            assert.strictEqual(ic.system.attributes.reaction.value, 5);
            assert.strictEqual(ic.system.attributes.body.value, 5);
            assert.strictEqual(ic.system.attributes.strength.value, 5);
            assert.strictEqual(ic.system.attributes.logic.value, 5);
            assert.strictEqual(ic.system.attributes.willpower.value, 5);
            assert.strictEqual(ic.system.attributes.charisma.value, 5);
            assert.strictEqual(ic.system.attributes.intuition.value, 5);
        });

        it('has rating attribute based on the host rating', async () => {
            const ic = await factory.createActor({ type: 'ic', system: { host: { rating: 5 } } });
            assert.strictEqual(ic.system.attributes.rating.value, 5);
        });
    });
};
