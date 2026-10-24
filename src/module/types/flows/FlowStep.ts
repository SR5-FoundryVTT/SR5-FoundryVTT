import { SR5 } from "@/module/config";
import type { DamageType } from "@/module/types/item/Action";
const { NumberField, BooleanField, StringField, ObjectField } = foundry.data.fields;

/**
 * The id of the implicit step every chain starts with: the test cast from the item action itself.
 */
export const FLOW_ROOT_STEP = 'root';

/**
 * When a step should run, relative to the result of its parent step.
 * - hit / miss are meant for steps following an opposing test and read from the attackers point of view:
 *   hit means the opposing test failed, miss means it succeeded.
 */
export const FLOW_STEP_WHEN = ['always', 'success', 'failure', 'hit', 'miss'] as const;

/**
 * Whose document a step runs for.
 * - self: the actor that cast the root test.
 * - target: each target of the root test, one branch per target.
 */
export const FLOW_STEP_ACTOR = ['self', 'target'] as const;

/**
 * How a step starts.
 * - auto: run right away, on the client owning the step actor.
 * - prompt: show a button on the chat card.
 */
export const FLOW_STEP_MODE = ['auto', 'prompt'] as const;

/**
 * A single step of a test flow, as stored on an item action.
 *
 * Steps form a tree via `after`. The root test is the step with id FLOW_ROOT_STEP and isn't stored.
 * `kind` is a key into the flow step kinds registry; `test` and the override fields only apply to kind 'test'.
 */
export const FlowStepData = () => ({
    id: new StringField({ required: true, blank: false, initial: 'step' }),
    kind: new StringField({ required: true, blank: false, initial: 'test' }),
    after: new StringField({ required: true, blank: false, initial: FLOW_ROOT_STEP }),
    when: new StringField({ required: true, initial: 'always', choices: FLOW_STEP_WHEN }),
    condition: new StringField({ required: true, blank: true }),
    actor: new StringField({ required: true, initial: 'target', choices: FLOW_STEP_ACTOR }),
    mode: new StringField({ required: true, initial: 'prompt', choices: FLOW_STEP_MODE }),
    test: new StringField({ required: true, blank: true }),
    description: new StringField({ required: true, blank: true }),
    skill: new StringField({ required: true, blank: true }),
    attribute: new StringField({ blank: true, required: true, choices: SR5.attributes }),
    attribute2: new StringField({ blank: true, required: true, choices: SR5.attributes }),
    armor: new BooleanField(),
    mod: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    config: new ObjectField(),
});

export type FlowStepWhen = typeof FLOW_STEP_WHEN[number];
export type FlowStepActor = typeof FLOW_STEP_ACTOR[number];
export type FlowStepMode = typeof FLOW_STEP_MODE[number];

/**
 * Plain object shape of a flow step.
 *
 * Kept as a hand written interface instead of the schema inferred type, as steps are also
 * created at runtime from legacy action data and those don't pass through the data model.
 */
export interface FlowStep {
    id: string;
    kind: string;
    after: string;
    when: FlowStepWhen;
    condition: string;
    actor: FlowStepActor;
    mode: FlowStepMode;
    test: string;
    description: string;
    skill: string;
    attribute: string;
    attribute2: string;
    armor: boolean;
    mod: number;
    config: Record<string, unknown>;
}

export type FlowStepStatus = 'pending' | 'done' | 'skipped';

/**
 * A step following the message it's stored on, for one subject.
 *
 * Stored as a list, as uuids can't be used as keys within document flags.
 */
export interface FlowNextEntry {
    stepId: string;
    // The actor or token uuid the step runs for. Empty when the subject isn't known yet.
    subjectUuid: string;
    status: FlowStepStatus;
    // The message the step resulted in, once done.
    messageUuid?: string;
}

/**
 * Chain state stored on every chat message that is part of a flow.
 *
 * Messages reference each other by uuid instead of nesting the previous tests data.
 */
export interface FlowState {
    v: 1;
    // Shared by all messages of one chain.
    chainId: string;
    rootMessageUuid: string;
    // The actor that cast the root test, used for steps run for 'self'.
    rootActorUuid: string;
    // The message this step followed. Empty on the root message.
    parentMessageUuid: string;
    // The step this message is the result of.
    stepId: string;
    // The resolved plan of the whole chain.
    plan: FlowStep[];
    // The actor or token uuid this message concerns.
    subjectUuid: string;
    // Token or actor uuids targeted by the root test.
    targets: string[];
    // Steps directly following this message.
    next: FlowNextEntry[];
}

/**
 * Create a step with defaults for all fields not given.
 */
export const createFlowStep = (step: Partial<FlowStep> & Pick<FlowStep, 'id'>): FlowStep => ({
    kind: 'test',
    after: FLOW_ROOT_STEP,
    when: 'always',
    condition: '',
    actor: 'target',
    mode: 'prompt',
    test: '',
    description: '',
    skill: '',
    attribute: '',
    attribute2: '',
    armor: false,
    mod: 0,
    config: {},
    ...step,
});
