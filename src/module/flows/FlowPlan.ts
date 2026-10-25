import type { SR5Actor } from "@/module/actor/SR5Actor";
import type { SuccessTest } from "@/module/tests/SuccessTest";
import type { FlowStep } from "@/module/types/flows/FlowStep";
import type { DamageType } from "@/module/types/item/Action";
import { FLOW_LEGACY_STEPS, FlowNodeData, FlowTree } from "./FlowTree";
import { FlowContributors } from "./FlowContributors";
import { ElementalRules } from "@/module/rules/ElementalRules";

/**
 * What a step condition is evaluated against.
 * - test: the test of the parent step, if the parent step was a test.
 * - actor: the actor the step would run for.
 * - damage: the damage of the branch, once known.
 */
export interface FlowConditionContext {
    step: FlowStep;
    test?: SuccessTest;
    actor?: SR5Actor;
    damage?: DamageType;
    // Outcomes of a parent step resolved without a test, like a skipped defense.
    outcome?: string[];
}

export type FlowCondition = (context: FlowConditionContext) => boolean;

/**
 * Named conditions a step can reference via its `condition` field.
 *
 * Exposed on game.shadowrun5e.flow.conditions for modules to add their own.
 */
export const FlowConditions: Record<string, FlowCondition> = {
    takesBiofeedback: ({ actor, damage }) => !!actor && !!damage && actor.takesBiofeedbackDamageFrom(damage),
    hasElementalEffect: ({ damage }) => ElementalRules.hasSecondaryEffects(damage),
    // Injection darts need a net hit against an unarmored target, three against an armored one. SR5#434.
    dartPenetrates: ({ test, actor }) => {
        const netHits = (test?.data as { values?: { againstNetHits?: { value: number } } } | undefined)?.values?.againstNetHits?.value ?? 0;
        const armored = (actor?.getArmor().rating.value ?? 0) > 0;
        return netHits >= (armored ? 3 : 1);
    },
};

/**
 * Resolve the steps of a flow and select which of them follow a finished step.
 */
export const FlowPlan = {
    /**
     * Resolve all steps following the given root test, from its action node tree.
     */
    resolve(root: SuccessTest): FlowStep[] {
        const action = root.data.action as FlowNodeData | undefined;
        if (!action) return [];

        // Contributors change a copy of the tree, never the item data.
        const tree = foundry.utils.deepClone(action);
        for (const contributor of Object.values(FlowContributors)) contributor(root, tree);

        const steps = FlowTree.flatten(root, tree);

        Hooks.callAll('sr5_resolveFlowPlan', root, steps);

        return steps;
    },

    /**
     * All steps directly following the given step, in plan order.
     */
    children(plan: FlowStep[], stepId: string): FlowStep[] {
        return plan.filter(step => step.after === stepId);
    },

    /**
     * Find a step by id. Step ids of flows before action nodes are resolved to their node path.
     */
    step(plan: FlowStep[], stepId: string): FlowStep | undefined {
        const step = plan.find(step => step.id === stepId);
        if (step) return step;

        for (const path of FLOW_LEGACY_STEPS[stepId] ?? []) {
            const legacy = plan.find(step => step.id === path);
            if (legacy) return legacy;
        }
        return undefined;
    },

    /**
     * The outcomes a test results in, as steps following it can wait for them.
     *
     * Opposing tests are read from the attackers point of view: a failed defense is a hit, a successful
     * one a miss. A tie is a successful defense, but still makes contact. SR5#173 'Grazing Hit'.
     */
    outcomes(test: SuccessTest): string[] {
        const outcomes: string[] = ['always'];
        if (test.success) outcomes.push('success', 'miss');
        if (test.failure) outcomes.push('failure', 'hit');
        if (test.opposing && FlowPlan.tied(test)) outcomes.push('tie');
        return outcomes;
    },

    /**
     * Did an opposing test score as many hits as the test it opposes?
     */
    tied(test: SuccessTest): boolean {
        const against = (test as unknown as { against?: SuccessTest }).against;
        if (!against) return false;
        return against.hits.value > 0 && against.hits.value === test.hits.value;
    },

    /**
     * Check a step's `when` against the outcomes of its parent.
     *
     * Without a parent test (the parent wasn't a test, e.g. applying damage), only 'always' matches,
     * unless the parent step recorded an outcome of its own.
     */
    matchesWhen(step: FlowStep, test?: SuccessTest, outcome?: string[]): boolean {
        if (!step.when.length || step.when.includes('always')) return true;

        const outcomes = outcome ?? (test ? FlowPlan.outcomes(test) : ['always']);
        return step.when.some(when => outcomes.includes(when));
    },

    /**
     * Check a step's named condition. Unknown conditions don't allow the step.
     */
    matchesCondition(context: FlowConditionContext): boolean {
        const name = context.step.condition;
        if (!name) return true;

        const condition = FlowConditions[name];
        if (!condition) {
            console.error(`Shadowrun 5e | Unknown flow step condition ${name}`, context.step);
            return false;
        }
        return condition(context);
    },

    /**
     * Check if a step should run, given the result of its parent.
     */
    allows(context: FlowConditionContext): boolean {
        const { step, test, outcome } = context;
        if (!FlowPlan.matchesWhen(step, outcome ? undefined : test, outcome)) return false;
        if (!FlowPlan.matchesCondition(context)) return false;
        if (test && !test.flowAllowsStep(step)) return false;
        return true;
    },
};
