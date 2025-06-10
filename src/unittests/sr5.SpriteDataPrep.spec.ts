import { SkillFieldType } from 'src/module/types/template/Skills';
import { SR5Actor } from './../module/actor/SR5Actor';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const shadowrunSR5SpriteDataPrep = (context: QuenchBatchContext) => {
    const { describe, it, before, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    before(async () => {})
    after(async () => {})

    describe('SpriteDataPrep', () => {
        it('Sprites are always resonat', async () => {
            const sprite = new SR5Actor<'sprite'>({ type: 'sprite' });
            assert.strictEqual(sprite.system.special, 'resonance');
            await sprite.delete();
        });

        it('visibility checks', async () => {
            const sprite = new SR5Actor<'sprite'>({ type: 'sprite' });
            assert.strictEqual(sprite.system.visibilityChecks.astral.hasAura, false);
            assert.strictEqual(sprite.system.visibilityChecks.astral.astralActive, false);
            assert.strictEqual(sprite.system.visibilityChecks.astral.affectedBySpell, false);
            assert.strictEqual(sprite.system.visibilityChecks.meat.hasHeat, false);
            assert.strictEqual(sprite.system.visibilityChecks.matrix.hasIcon, true);
            assert.strictEqual(sprite.system.visibilityChecks.matrix.runningSilent, false);

            await sprite.delete();
        });

        it('Sprites default/override values by example type', async () => {
            const sprite = new SR5Actor<'sprite'>({ type: 'sprite', system: { spriteType: 'courier' } });

            assert.strictEqual(sprite.system.matrix.sleaze.base, 3);
            assert.strictEqual(sprite.system.matrix.data_processing.base, 1);
            assert.strictEqual(sprite.system.matrix.firewall.base, 2);
            assert.strictEqual(sprite.system.matrix.sleaze.base, 3);

            assert.strictEqual(sprite.system.initiative.matrix.base.base, 1);

            // FVTT types currently do not support the `TypedObjectField` type, so we need to cast it.
            const active = sprite.system.skills.active as {[x: string]: SkillFieldType};

            assert.strictEqual(active.hacking.base, 0);

            await sprite.update({ system: { level: 6 } });

            assert.strictEqual(sprite.system.level, 6);

            assert.strictEqual(sprite.system.matrix.sleaze.base, 9);
            assert.strictEqual(sprite.system.matrix.data_processing.base, 7);
            assert.strictEqual(sprite.system.matrix.firewall.base, 8);
            assert.strictEqual(sprite.system.matrix.sleaze.base, 9);

            assert.strictEqual(sprite.system.initiative.matrix.base.base, 13);
            assert.strictEqual(sprite.system.initiative.matrix.dice.base, 4);

            assert.strictEqual(active.hacking.base, 6);
            assert.strictEqual(active.computer.base, 6); // all sprites
            assert.strictEqual(active.electronic_warfare.base, 0); // not set by sprite type.

            await sprite.delete();
        })

        it('Matrix condition monitor track calculation with modifiers', async () => {
            const sprite = new SR5Actor<'sprite'>({ type: 'sprite' });
            assert.equal(sprite.system.matrix.condition_monitor.max, 8);

            await sprite.update({ system: { modifiers: { matrix_track: 1 } } });
            assert.equal(sprite.system.matrix.condition_monitor.max, 9);

            await sprite.delete();
        });
    });
};