/**
 * The id of the implicit step every chain starts with: the test cast from the item action itself.
 */
export const FLOW_ROOT_STEP = 'root';

/**
 * Outcomes of a parent step a step can wait for. A step lists any of them in `when`, or option keys of a choice.
 * - always: whatever the outcome, also for parents that aren't tests.
 * - success / failure: of the parent test itself.
 * - hit / miss / tie: following an opposing test, read from the attackers point of view.
 *   hit means the opposing test failed, miss means it succeeded. A tie is also a miss, SR5#173.
 */
export const FLOW_STEP_WHEN = ['always', 'success', 'failure', 'hit', 'miss', 'tie'] as const;

/**
 * Whose document a step runs for, after resolving the node actors relative to their parents.
 * - self: the actor that cast the root test.
 * - target: each target of the root test, one branch per target. Deeper in the chain the subject of its parent.
 * - none: no actor. Its pool is a formula, rolled by the GM or automatically.
 * - participants / allies / pick / occupants / owner: resolved when the step runs. See FlowRunner.groupSubjects.
 */
export const FLOW_STEP_ACTOR = ['self', 'target', 'none', 'participants', 'allies', 'pick', 'occupants', 'owner'] as const;

/**
 * How a step starts.
 * - auto: run right away, on the client owning the step actor.
 * - prompt: show a button on the chat card.
 */
export const FLOW_STEP_MODE = ['auto', 'prompt'] as const;

export type FlowStepWhen = typeof FLOW_STEP_WHEN[number];
export type FlowStepActor = typeof FLOW_STEP_ACTOR[number];
export type FlowStepMode = typeof FLOW_STEP_MODE[number];

/**
 * A single step of a test flow, flattened from the action node tree (see FlowTree).
 *
 * Steps form a tree via `after`. The root test is the step with id FLOW_ROOT_STEP.
 * `kind` is a key into the flow step kinds registry.
 */
export interface FlowStep {
    // The node path within the action (opposed.resist), or that path plus the output it lowers to (opposed.damage).
    id: string;
    kind: string;
    after: string;
    // Any of these outcomes of the parent allows the step. Empty or 'always' allows any.
    when: string[];
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
    // The path of the action node holding the steps settings. Empty for steps not taken from a node.
    path: string;
    // The relation key the node is stored under, like resist. Empty for the root and for lowered steps.
    relation: string;
    // The test settings of that node, as a partial action. See FlowNodeRules.actionData.
    settings: Record<string, unknown>;
    // Who rolls a step without an actor: the GM, or automatically.
    roller: '' | 'gm' | 'auto';
    // How the step handles damage. See FlowDamageMode.
    damage: { mode: string, factor: number, round: 'up' | 'down', unresisted: boolean };
    // Feature changes for the test of the step.
    features: string[];
    // The test the value context calls primary.
    primary: boolean;
    // Outcomes of this step releasing a gated step. See FlowState.gates.
    releases: string[];
    // Where a contributed step came from, like an ammo or a defenders power.
    source?: { kind: string, uuid: string, name?: string };
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
    // The step was resolved without a test of its own, like a defender choosing not to defend.
    skipped?: string;
    // The outcome of a step without a message of its own.
    outcome?: string[];
    // Run only when clicked, even for automatic steps. Set for steps waiting on a verdict the test can't give.
    prompt?: boolean;
    // A defense the defender can't make, like when unaware of the attack. Resolved without defending.
    noDefense?: 'forced';
    // The target of the branch this entry is part of. Steps for 'target' deeper in the chain run for it.
    branchUuid?: string;
    // Waiting for a step within its before subtree to release it. See FlowGates.
    gated?: boolean;
    // The subject is picked by the user starting the step, like whoever a missed shot hits instead. SR5#190.
    pick?: boolean;
}

/**
 * Chain state stored on every chat message that is part of a flow.
 *
 * Messages reference each other by uuid instead of nesting the previous tests data.
 */
export interface FlowState {
    v: 2;
    // Shared by all messages of one chain.
    chainId: string;
    // The first message of the chain. That's the root test, or the chain card of a chain starting with a gate.
    rootMessageUuid: string;
    // The message of the test the value context calls primary. Defaults to the root test.
    primaryMessageUuid: string;
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
    // The target of the branch this message is part of. Empty on the root message.
    branchUuid: string;
    // Token or actor uuids targeted by the root test.
    targets: string[];
    // Actor uuids assisting the root test, like ritual participants. See FlowRunner.groupSubjects.
    participants?: string[];
    // Steps directly following this message.
    next: FlowNextEntry[];
    // Frozen values of this branch, readable by formulas and effects. See FlowContext.
    ctx: Record<string, unknown>;
}

/**
 * Does a step resist or apply the damage its parent test passes on? Like soaking an attack.
 *
 * Steps dealing damage of their own, like a defenders retaliation, don't.
 */
export const handlesIncomingDamage = (step: FlowStep): boolean =>
    (step.kind === 'test' || step.kind === 'applyDamage') && step.damage.mode === 'incoming';

/**
 * Create a step with defaults for all fields not given.
 */
export const createFlowStep = (step: Partial<FlowStep> & Pick<FlowStep, 'id'>): FlowStep => ({
    kind: 'test',
    after: FLOW_ROOT_STEP,
    when: [],
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
    path: '',
    relation: '',
    settings: {},
    roller: '',
    damage: { mode: '', factor: 1, round: 'up', unresisted: false },
    features: [],
    primary: false,
    releases: [],
    config: {},
    ...step,
});
