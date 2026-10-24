import type { SR5Actor } from "@/module/actor/SR5Actor";
import type { SuccessTest } from "@/module/tests/SuccessTest";
import { LegacyStepMapper } from "@/module/tests/flows/LegacyStepMapper";
import type { FlowStep } from "@/module/types/flows/FlowStep";
import type { DamageType } from "@/module/types/item/Action";

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
}

export type FlowCondition = (context: FlowConditionContext) => boolean;

/**
 * Named conditions a step can reference via its `condition` field.
 *
 * Exposed on game.shadowrun5e.flow.conditions for modules to add their own.
 */
export const FlowConditions: Record<string, FlowCondition> = {
    takesBiofeedback: ({ actor, damage }) => !!actor && !!damage && actor.takesBiofeedbackDamageFrom(damage),
};

/**
 * Resolve the steps of a flow and select which of them follow a finished step.
 */
export const FlowPlan = {
    /**
     * Resolve all steps following the given root test.
     *
     * Explicit action steps win over steps derived from legacy action data.
     */
    resolve(root: SuccessTest): FlowStep[] {
        const explicit = root.data.action?.steps ?? [];
        const steps: FlowStep[] = explicit.length
            ? foundry.utils.deepClone(explicit) as FlowStep[]
            : LegacyStepMapper.map(root);

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
     * Find a step by id.
     */
    step(plan: FlowStep[], stepId: string): FlowStep | undefined {
        return plan.find(step => step.id === stepId);
    },

    /**
     * Check a step's `when` against the result of its parent test.
     *
     * Without a parent test (the parent wasn't a test, e.g. applying damage), only 'always' matches.
     */
    matchesWhen(step: FlowStep, test?: SuccessTest): boolean {
        if (step.when === 'always') return true;
        if (!test) return false;

        switch (step.when) {
            case 'success':
            case 'miss':
                return test.success;
            case 'failure':
            case 'hit':
                return test.failure;
        }
        return false;
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
        const { step, test } = context;
        if (!FlowPlan.matchesWhen(step, test)) return false;
        if (!FlowPlan.matchesCondition(context)) return false;
        if (test && !test.flowAllowsStep(step)) return false;
        return true;
    },
};
