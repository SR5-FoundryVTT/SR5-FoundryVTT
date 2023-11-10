import { SR5Item } from '../module/item/SR5Item';
import { SR5Actor } from './../module/actor/SR5Actor';
import { SR5TestingDocuments } from './utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const shadowrunSR5SpriteDataPrep = (context: QuenchBatchContext) => {
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

    describe('SpriteDataPrep', () => {
        it('Sprites are always resonat', async () => {
            const sprite = await testActor.create({ type: 'sprite' });
            assert.strictEqual(sprite.system.special, 'resonance');
        });

        it('visibility checks', async () => {
            const actor = await testActor.create({ type: 'sprite' });
            assert.strictEqual(actor.system.visibilityChecks.astral.hasAura, false);
            assert.strictEqual(actor.system.visibilityChecks.astral.astralActive, false);
            assert.strictEqual(actor.system.visibilityChecks.astral.affectedBySpell, false);
            assert.strictEqual(actor.system.visibilityChecks.meat.hasHeat, false);
            assert.strictEqual(actor.system.visibilityChecks.meat.hidden, false);
            assert.strictEqual(actor.system.visibilityChecks.matrix.hasIcon, true);
            assert.strictEqual(actor.system.visibilityChecks.matrix.runningSilent, false);
        });

        it('Sprites default/override values by example type', async () => {
            const actor = await testActor.create({ type: 'sprite', 'system.spriteType': 'courier' }) as SR5Actor;
            let sprite = actor.asSprite() as Shadowrun.SpriteActorData;

            assert.strictEqual(sprite.system.matrix.sleaze.base, 3);
            assert.strictEqual(sprite.system.matrix.data_processing.base, 1);
            assert.strictEqual(sprite.system.matrix.firewall.base, 2);
            assert.strictEqual(sprite.system.matrix.sleaze.base, 3);

            assert.strictEqual(sprite.system.initiative.matrix.base.base, 1);

            assert.strictEqual(sprite.system.skills.active.hacking.base, 0);

            await actor.update({
                'system.level': 6
            });

            sprite = actor.asSprite() as Shadowrun.SpriteActorData;

            assert.strictEqual(sprite.system.level, 6);

            assert.strictEqual(sprite.system.matrix.sleaze.base, 9);
            assert.strictEqual(sprite.system.matrix.data_processing.base, 7);
            assert.strictEqual(sprite.system.matrix.firewall.base, 8);
            assert.strictEqual(sprite.system.matrix.sleaze.base, 9);

            assert.strictEqual(sprite.system.initiative.matrix.base.base, 13);
            assert.strictEqual(sprite.system.initiative.matrix.dice.base, 4);

            assert.strictEqual(sprite.system.skills.active.hacking.base, 6);
            assert.strictEqual(sprite.system.skills.active.computer.base, 6); // all sprites
            assert.strictEqual(sprite.system.skills.active.electronic_warfare.base, 0); // not set by sprite type.
        })

        it('Matrix condition monitor track calculation with modifiers', async () => {
            const actor = await testActor.create({ type: 'sprite' }) as SR5Actor;

            let sprite = actor.asSprite() as Shadowrun.SpriteActorData;
            assert.equal(sprite.system.matrix.condition_monitor.max, 8);

            await actor.update({ 'system.modifiers.matrix_track': 1 });
            sprite = actor.asSprite() as Shadowrun.SpriteActorData;
            assert.equal(sprite.system.matrix.condition_monitor.max, 9);
        });
    });
};