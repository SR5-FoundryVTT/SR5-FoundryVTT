import { allApplicableDocumentEffects, allApplicableItemsEffects } from "@/module/effects";
import { createFlowStep, FLOW_ROOT_STEP, FlowStep } from "@/module/types/flows/FlowStep";
import type { SuccessTest } from "../SuccessTest";

/**
 * Step ids used for flows derived from legacy action data.
 */
export const LEGACY_STEP = {
    defense: 'defense',
    resist: 'resist',
    damage: 'damage',
    effects: 'effects',
    biofeedback: 'biofeedback',
    followup: 'followup',
    drain: 'drain',
} as const;

/**
 * Derive a test flow from the opposed / resist / followed test slots of an action.
 *
 * Items, importers and macros still define flows using these slots. Deriving the steps at runtime
 * keeps them working without migrating any document data.
 */
export const LegacyStepMapper = {
    /**
     * Build the steps following the given root test.
     *
     * The root test must be the test cast from the action itself, not a test opposing or following it.
     * Test class getters are used, so subclasses changing their opposed test (suppressive fire) are respected.
     */
    map(root: SuccessTest): FlowStep[] {
        const steps: FlowStep[] = [];
        const action = root.data.action;

        const opposedCls = root._opposedTestClass;
        if (opposedCls) {
            steps.push(createFlowStep({
                id: LEGACY_STEP.defense,
                test: opposedCls.name,
                actor: 'target',
                mode: 'prompt',
            }));

            const resistTest = LegacyStepMapper.resistTestName(action?.opposed?.resist?.test);
            if (resistTest) {
                steps.push(createFlowStep({
                    id: LEGACY_STEP.resist,
                    after: LEGACY_STEP.defense,
                    when: 'hit',
                    test: resistTest,
                    actor: 'target',
                    mode: 'auto',
                }));
                steps.push(createFlowStep({
                    id: LEGACY_STEP.damage,
                    kind: 'applyDamage',
                    after: LEGACY_STEP.resist,
                    actor: 'target',
                }));
            } else if (LegacyStepMapper.hasDamage(root)) {
                steps.push(createFlowStep({
                    id: LEGACY_STEP.damage,
                    kind: 'applyDamage',
                    after: LEGACY_STEP.defense,
                    when: 'hit',
                    actor: 'target',
                }));
            }

            const damage = root.data.damage;
            if (damage?.type?.value === 'matrix' && damage.biofeedback && steps.some(step => step.id === LEGACY_STEP.damage)) {
                steps.push(createFlowStep({
                    id: LEGACY_STEP.biofeedback,
                    after: LEGACY_STEP.damage,
                    condition: 'takesBiofeedback',
                    test: 'BiofeedbackResistTest',
                    actor: 'target',
                    mode: 'auto',
                }));
            }
        }

        if (LegacyStepMapper.hasTargetedActorEffects(root)) {
            steps.push(createFlowStep({
                id: LEGACY_STEP.effects,
                kind: 'applyEffects',
                after: opposedCls ? LEGACY_STEP.defense : FLOW_ROOT_STEP,
                when: opposedCls ? 'hit' : 'success',
                actor: 'target',
            }));
        }

        const followedTest = action?.followed?.test;
        if (followedTest) {
            steps.push(createFlowStep({
                id: LEGACY_STEP.followup,
                test: followedTest,
                actor: 'self',
                mode: root.autoExecuteFollowupTest ? 'auto' : 'prompt',
            }));
            steps.push(createFlowStep({
                id: LEGACY_STEP.drain,
                kind: 'applyDamage',
                after: LEGACY_STEP.followup,
                actor: 'self',
            }));
        }

        return steps;
    },

    /**
     * Weapons used to default their resist test to the defense test. A defense test can't be the
     * resist step of itself, so those are read as the physical resist test.
     */
    resistTestName(test: string | undefined): string {
        if (!test) return '';
        if (test === 'PhysicalDefenseTest') return 'PhysicalResistTest';
        return test;
    },

    hasDamage(test: SuccessTest): boolean {
        return (test.data.damage?.value ?? 0) > 0;
    },

    /**
     * Mirrors which effects SuccessTestEffectsFlow copies onto target actors.
     */
    hasTargetedActorEffects(test: SuccessTest): boolean {
        const item = test.item;
        if (!item) return false;

        for (const _ of allApplicableDocumentEffects(item, { applyTo: ['targeted_actor'] })) return true;
        for (const _ of allApplicableItemsEffects(item, { applyTo: ['targeted_actor'], nestedItems: false })) return true;
        return false;
    },
};
