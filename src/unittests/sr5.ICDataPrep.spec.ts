import { SR5Item } from '../module/item/SR5Item';
import { SR5Actor } from './../module/actor/SR5Actor';
import { SR5TestingDocuments } from './utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const shadowrunSR5ICDataPrep = (context: QuenchBatchContext) => {
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

    describe('ICDataPrep', () => {
        it('Matrix condition monitor track calculation with modifiers', async () => {
            const ic = await testActor.create({ type: 'ic' }) as SR5Actor<'ic'>;
            assert.equal(ic.system.matrix.condition_monitor.max, 8);

            await ic.update({ 'system.modifiers.matrix_track': 1 });
            assert.equal(ic.system.matrix.condition_monitor.max, 9);
        });


        it('visibility checks', async () => {
            const actor = await testActor.create({ type: 'ic' }) as SR5Actor;
            assert.strictEqual(actor.system.visibilityChecks.astral.hasAura, false);
            assert.strictEqual(actor.system.visibilityChecks.astral.astralActive, false);
            assert.strictEqual(actor.system.visibilityChecks.astral.affectedBySpell, false);
            assert.strictEqual(actor.system.visibilityChecks.meat.hasHeat, false);
            assert.strictEqual(actor.system.visibilityChecks.matrix.hasIcon, true);
            assert.strictEqual(actor.system.visibilityChecks.matrix.runningSilent, false);
        });

        it('has meat attributes based on the host rating', async () => {
            const ic = await testActor.create({ type: 'ic', 'system.host.rating': 5}) as SR5Actor;

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
            const ic = await testActor.create({ type: 'ic', 'system.host.rating': 5}) as SR5Actor;

            assert.strictEqual(ic.system.attributes.rating.value, 5);
        });
    });
};
