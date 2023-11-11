import { SR5Item } from '../module/item/SR5Item';
import { SR5Actor } from './../module/actor/SR5Actor';
import { SR5TestingDocuments } from './utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const shadowrunSR5ICDataPrep = (context: QuenchBatchContext) => {
    const { describe, it, assert, before, after } = context;

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
            const actor = await testActor.create({ type: 'ic' }) as SR5Actor;

            let ic = actor.asIC() as Shadowrun.ICActorData;
            assert.equal(ic.system.matrix.condition_monitor.max, 8);

            await actor.update({ 'system.modifiers.matrix_track': 1 });
            ic = actor.asIC() as Shadowrun.ICActorData;
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

    });
};