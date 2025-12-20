import { SR5TestFactory } from './utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const shadowrunSR5SpiritDataPrep = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { await factory.destroy(); });

    describe('SpiritDataPrep', () => {
        it('Spirits are always magical', async () => {
            const spirit = await factory.createActor({ type: 'spirit' });

            assert.strictEqual(spirit.system.special, 'magic');
        });

        it('visibility checks', async () => {
            const spirit = await factory.createActor({ type: 'spirit' });
            assert.strictEqual(spirit.system.visibilityChecks.astral.astralActive, true);
            assert.strictEqual(spirit.system.visibilityChecks.astral.hasAura, true);
            assert.strictEqual(spirit.system.visibilityChecks.astral.affectedBySpell, false);
            assert.strictEqual(spirit.system.visibilityChecks.meat.hasHeat, false);
            assert.strictEqual(spirit.system.visibilityChecks.matrix.hasIcon, false);
            assert.strictEqual(spirit.system.visibilityChecks.matrix.runningSilent, false);
        });


        it('Spirit default/overrides by example type', async () => {
            const spirit = await factory.createActor({ type: 'spirit', system: { spiritType: 'air' } });

            // Without adequate force there will be negative base values with minimum attribute values.
            assert.strictEqual(spirit.system.attributes.body.base, -2);
            assert.strictEqual(spirit.system.attributes.agility.base, 3);
            assert.strictEqual(spirit.system.attributes.reaction.base, 4);
            assert.strictEqual(spirit.system.attributes.strength.base, -3);
            assert.strictEqual(spirit.system.attributes.intuition.base, 0);

            assert.strictEqual(spirit.system.initiative.meatspace.base.base, 4); // force * 2 + override;

            // FVTT types currently do not support the `TypedObjectField` type, so we need to cast it.
            assert.strictEqual(spirit.system.skills.active.assensing.base, 0);

            await spirit.update({ system: { attributes: { force: { value: 6 } } } });

            assert.strictEqual(spirit.system.attributes.body.base, 4);
            assert.strictEqual(spirit.system.attributes.agility.base, 9);
            assert.strictEqual(spirit.system.attributes.reaction.base, 10);
            assert.strictEqual(spirit.system.attributes.strength.base, 3);
            assert.strictEqual(spirit.system.attributes.intuition.base, 6); // set by force without spirit type mods.

            assert.strictEqual(spirit.system.initiative.meatspace.base.base, 16);

            assert.strictEqual(spirit.system.skills.active.assensing.base, 6);
            assert.strictEqual(spirit.system.skills.active.arcana.base, 0); // not for this spirit type.
        });

        it('Spirit recoil compensation', async () => {
            // air => 7 -5 => strength 5
            const spirit = await factory.createActor({ type: 'spirit', system: { spiritType: 'air', attributes: { force: { value: 7 } } } });
            if (!spirit) return assert.fail();

            assert.strictEqual(spirit.system.values.recoil_compensation.value, 3); // SR5#175: (strength) 5 / 3 = 1,6 (rounded up) = 2 => 2 + 1
        });
    });
};
