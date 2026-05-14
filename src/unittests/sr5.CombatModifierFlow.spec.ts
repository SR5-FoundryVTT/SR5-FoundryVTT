import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { CombatModifierFlow } from '@/module/actor/flows/CombatModifierFlow';
import { SR5Actor } from '@/module/actor/SR5Actor';

const createActorWithStatuses = (...statusIds: string[]) => {
    return {
        getStatusEffectsId: () => new Set(statusIds),
    } as unknown as SR5Actor;
};

export const shadowrunCombatModifierFlow = (context: QuenchBatchContext) => {
    const { describe, it } = context;
    const assert: Chai.AssertStatic = context.assert;

    describe('CombatModifierFlow', () => {
        describe('getChargerModifier', () => {
            it('returns charging modifier when actor is running', () => {
                const actor = createActorWithStatuses('sr5run');

                const modifier = CombatModifierFlow.getChargerModifier(actor);

                assert.deepEqual(modifier && { name: modifier.name, value: modifier.value }, { name: 'Charging', value: 4 });
                assert.equal(modifier?.mode, CONST.ACTIVE_EFFECT_MODES.ADD);
                assert.equal(modifier?.priority, 20);
            });

            it('returns charging modifier when actor is sprinting', () => {
                const actor = createActorWithStatuses('sr5sprint');

                const modifier = CombatModifierFlow.getChargerModifier(actor);

                assert.deepEqual(modifier && { name: modifier.name, value: modifier.value }, { name: 'Charging', value: 4 });
            });

            it('returns null when actor is neither running nor sprinting', () => {
                const actor = createActorWithStatuses();

                const modifier = CombatModifierFlow.getChargerModifier(actor);

                assert.isNull(modifier);
            });
        });
    });
};
