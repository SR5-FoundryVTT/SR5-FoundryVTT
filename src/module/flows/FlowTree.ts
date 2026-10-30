import { allApplicableDocumentEffects, allApplicableItemsEffects } from "@/module/effects";
import type { SuccessTest } from "@/module/tests/SuccessTest";
import type { FlowBranchContribution } from "./FlowContributors";
import { FlowNodeRules, FlowRelations, type FlowActor } from "@/module/types/flows/FlowNodeField";
import { createFlowStep, FLOW_ROOT_STEP, FlowStep, FlowStepActor, FlowStepMode } from "@/module/types/flows/FlowStep";

/**
 * A node of the action node tree, as stored. Child nodes are stored under their relation key.
 */
export type FlowNodeData = Record<string, unknown> & {
    test?: string;
    kind?: string;
    actor?: string;
    when?: string[];
    mode?: string;
    condition?: string;
};

/**
 * Step ids of flows derived before action nodes existed, and the node paths they're now found under.
 */
export const FLOW_LEGACY_STEPS: Record<string, string[]> = {
    defense: ['opposed'],
    resist: ['opposed.resist'],
    damage: ['opposed.resist.damage', 'opposed.damage'],
    effects: ['opposed.effects', 'effects'],
    followup: ['followed'],
    drain: ['followed.damage'],
};

/**
 * Where a node is visited from while flattening.
 */
interface NodeVisit {
    root: SuccessTest;
    steps: FlowStep[];
    // The step a node attaches to.
    after: string;
    // The resolved actor of the parent node.
    parentActor: FlowStepActor;
    parentIsRoot: boolean;
    // Does the parent node deal damage, for an opposed node below it to apply on a hit?
    parentHasDamage: boolean;
    // The gated step a node within a before subtree can release.
    gateFor?: string;
    // The relation key of the parent node. Empty for the root.
    parentRelation?: string;
}

/**
 * Overrides for a visited node taken from the root test instead of stored node data.
 */
interface NodeOverrides {
    test?: string;
    mode?: FlowStepMode;
    when?: string[];
}

/**
 * Turn the node tree of an action into the flat list of steps the flow runs.
 *
 * - Every active node becomes a step. Its id is its path within the action, like `opposed.resist`.
 *   A node is active when it names a test or another step kind.
 * - Node fields left empty are taken from the preset of the relation key the node is stored under.
 * - Actors relative to the parent node (same, other) are resolved to the caster (self) or its targets.
 * - Outputs of a node are lowered into steps of their own, following it:
 *   - `${path}.damage` applies the damage a resist test reduced, a drain test caused or a hit dealt.
 *   - `${path}.effects` applies item effects on a hit (opposed nodes) or a success.
 * - Child nodes attach after the damage their parent applies, so they see the applied damage.
 *
 * Biofeedback isn't flattened into a step. It's raised for any damage applied to an actor in VR
 * or jumped into a vehicle, also outside of flows, by MatrixDamageFlow.
 */
export const FlowTree = {
    /**
     * @param root The root test.
     * @param action The node tree to flatten. Defaults to the root tests action, contributors pass a changed copy.
     */
    flatten(root: SuccessTest, action = root.data.action as FlowNodeData | undefined): FlowStep[] {
        if (!action) return [];

        const steps: FlowStep[] = [];
        const visit: NodeVisit = {
            root, steps, after: FLOW_ROOT_STEP, parentActor: 'self', parentIsRoot: true, parentHasDamage: FlowTree.hasDamage(root),
        };

        // Test implementations can replace the opposed test, like suppressive fire does.
        const opposedCls = root._opposedTestClass;
        const opposed = action.opposed as FlowNodeData | undefined;
        if (opposedCls && opposed) FlowTree.visit(visit, opposed, 'opposed', 'opposed', { test: opposedCls.name });

        const resist = action.resist as FlowNodeData | undefined;
        if (resist) FlowTree.visit(visit, resist, 'resist', 'resist');

        FlowTree.lowerDefaultEffects(visit, action, !!steps.find(step => step.id === 'opposed'));
        FlowTree.lowerResults(visit, action, '', FLOW_ROOT_STEP, 'self');

        const followed = action.followed as FlowNodeData | undefined;
        if (followed) FlowTree.visit(visit, followed, 'followed', 'followed', { mode: root.autoExecuteFollowupTest ? 'auto' : 'prompt' });

        FlowTree.excludeSelectedEffects(steps);
        return steps;
    },

    /**
     * Effects a node selects by id are for its recipient only, not also for the targets the default
     * effects step applies all effects to.
     */
    excludeSelectedEffects(steps: FlowStep[]) {
        const fallback = steps.find(step => step.kind === 'applyEffects' && step.config.default);
        if (!fallback || fallback.config.select === 'ids') return;

        const selected = steps
            .filter(step => step !== fallback && step.kind === 'applyEffects' && step.config.select === 'ids')
            .flatMap(step => step.config.ids as string[] ?? []);
        if (selected.length) fallback.config.exclude = [...new Set(selected)];
    },

    /**
     * Flatten the nodes a defender adds to its branch, below the step it defended with.
     *
     * @param test The test of that step.
     * @param step That step.
     * @param contributions The nodes to add, see FlowBranchContributors.
     */
    flattenContributions(test: SuccessTest, step: FlowStep, contributions: FlowBranchContribution[]): FlowStep[] {
        const steps: FlowStep[] = [];
        for (const contribution of contributions) {
            const visit: NodeVisit = { root: test, steps: [], after: step.id, parentActor: step.actor, parentIsRoot: false, parentHasDamage: false };
            FlowTree.visit(visit, contribution.node, contribution.key, `${step.id}.${contribution.key}@${contribution.name}`);
            steps.push(...visit.steps.map(added => ({ ...added, source: contribution.source })));
        }
        return steps;
    },

    /**
     * Flatten a single node and its children.
     */
    visit(visit: NodeVisit, node: FlowNodeData, relationKey: string, path: string, overrides: NodeOverrides = {}) {
        const relation = FlowRelations[relationKey];
        const preset = relation?.preset;
        if (!relation || !preset) return;

        const kind = node.kind || 'test';
        let test = overrides.test ?? node.test ?? '';
        if (relationKey === 'resist' && path.startsWith('opposed')) test = FlowTree.resistTestName(test);
        if (kind === 'test' && !test) return;

        const actor = FlowTree.resolveActor(
            (node.actor || (visit.parentIsRoot && preset.rootActor) || preset.actor) as FlowActor,
            visit.parentActor);
        const when = overrides.when ?? (node.when?.length ? node.when : ((visit.parentIsRoot && preset.rootWhen) || preset.when));
        const mode = overrides.mode ?? (actor === 'none' && node.roller === 'auto' ? 'auto' : (node.mode || preset.mode) as FlowStepMode);
        const scale = (node.damageScale ?? {}) as { factor?: number, round?: 'up' | 'down' };

        const step = createFlowStep({
            id: path,
            kind,
            after: visit.after,
            when: [...when],
            condition: node.condition ?? '',
            actor,
            mode,
            test,
            description: String(node.description ?? ''),
            skill: String(node.skill ?? ''),
            attribute: String(node.attribute ?? ''),
            attribute2: String(node.attribute2 ?? ''),
            armor: !!node.armor,
            mod: Number(node.mod ?? 0),
            path,
            relation: relationKey,
            settings: FlowNodeRules.actionData(node),
            roller: (node.roller as FlowStep['roller'] | undefined) ?? '',
            damage: {
                mode: String(node.damageMode || preset.damage),
                factor: scale.factor ?? 1,
                round: scale.round ?? 'up',
                unresisted: !!node.unresisted,
            },
            features: [...(node.features as string[] ?? [])],
            primary: !!node.primary,
            releases: [...(node.releases as string[] ?? [])],
            config: {
                ...(node.config as Record<string, unknown> ?? {}),
                // Defenses the defender can skip, or never gets, SR5#190.
                ...(relationKey === 'opposed' ? { noDefense: { allowed: true, condition: '', ...(node.noDefense as object ?? {}) } } : {}),
                // The options a choice offers, its option nodes run when chosen.
                ...(kind === 'choice' ? { options: Object.keys((node.option ?? {}) as object) } : {}),
                // The step this node can release, when inside a before subtree.
                ...(visit.gateFor ? { gateFor: visit.gateFor } : {}),
                // A defense below a defense defends against the primary test, like the attack that missed. SR5#190.
                ...(relationKey === 'opposed' && visit.parentRelation === 'opposed' ? { against: 'primary' } : {}),
            },
        });
        visit.steps.push(step);

        // Children attach after the damage this node applies, when it applies any.
        const damage = FlowTree.lowerDamage(visit, node, relationKey, step);
        FlowTree.lowerEffects(visit, node, relationKey, step);
        FlowTree.lowerResults(visit, node, path, step.id, actor);

        const childVisit: NodeVisit = {
            ...visit, after: damage?.id ?? step.id, parentActor: actor, parentIsRoot: false, parentHasDamage: !!node.damage, parentRelation: relationKey,
        };
        for (const childKey of relation.children) {
            const child = node[childKey];
            if (!child || typeof child !== 'object') continue;

            // A before subtree runs where this node would, and this node waits until a step within releases it.
            if (FlowRelations[childKey]?.preset?.timing === 'before') {
                step.config.gate = { by: `${path}.${childKey}` };
                FlowTree.visit({ ...childVisit, after: step.after, gateFor: step.id }, child as FlowNodeData, childKey, `${path}.${childKey}`);
                continue;
            }

            if (FlowRelations[childKey]?.map) {
                // A choice option runs when its option is chosen.
                for (const [name, entry] of Object.entries(child as Record<string, FlowNodeData>)) {
                    FlowTree.visit({ ...childVisit, after: step.id }, entry, childKey, `${path}.${childKey}.${name}`, { when: entry.when?.length ? entry.when : [name] });
                }
                continue;
            }

            FlowTree.visit(childVisit, child as FlowNodeData, childKey, `${path}.${childKey}`);
        }
    },

    /**
     * Add the step applying the damage a node results in.
     *
     * - resist: the damage it reduced.
     * - followed: the damage it caused, like drain.
     * - opposed without an active resist node: the damage of a hit, when the root deals any.
     */
    lowerDamage(visit: NodeVisit, node: FlowNodeData, relationKey: string, step: FlowStep): FlowStep | undefined {
        if (step.kind !== 'test') return undefined;

        let when: string[] | undefined;
        if (relationKey === 'resist' || relationKey === 'followed') when = [];
        if (relationKey === 'opposed') {
            const resist = node.resist as FlowNodeData | undefined;
            const resisted = !!resist && (!!resist.test || !!resist.kind);
            if (!resisted && visit.parentHasDamage) when = ['hit'];
        }
        if (!when) return undefined;

        const damage = createFlowStep({
            id: `${step.id}.damage`,
            kind: 'applyDamage',
            after: step.id,
            when,
            actor: step.actor,
            path: step.path,
            damage: { ...step.damage },
        });
        visit.steps.push(damage);

        // Elements of the applied damage have their secondary effects. SR5#170.
        visit.steps.push(createFlowStep({
            id: `${damage.id}.elemental`,
            kind: 'elemental',
            after: damage.id,
            condition: 'hasElementalEffect',
            actor: step.actor,
            path: step.path,
        }));
        return damage;
    },

    /**
     * Add the step applying item effects a node selects explicitly.
     */
    lowerEffects(visit: NodeVisit, node: FlowNodeData, relationKey: string, step: FlowStep) {
        const effects = node.effects as { select?: string, ids?: string[] } | undefined;
        if (!effects?.select || effects.select === 'none') return;

        visit.steps.push(createFlowStep({
            id: `${step.id}.effects`,
            kind: 'applyEffects',
            after: step.id,
            when: relationKey === 'opposed' ? ['hit'] : ['success'],
            actor: step.actor,
            path: step.path,
            config: {
                select: effects.select,
                ids: [...(effects.ids ?? [])],
                // Effects of another item than the tests, and conditions of single effects.
                ...((node.config as Record<string, unknown> | undefined)?.itemUuid ? { itemUuid: (node.config as Record<string, unknown>).itemUuid } : {}),
                ...((node.config as Record<string, unknown> | undefined)?.conditions ? { conditions: (node.config as Record<string, unknown>).conditions } : {}),
            },
        }));
    },

    /**
     * Add one step per result of a node, applied on its success: changing initiative, forcing a reboot.
     */
    lowerResults(visit: NodeVisit, node: FlowNodeData, path: string, after: string, actor: FlowStepActor) {
        const results = (node.results ?? []) as { action: string, label?: string, value?: string }[];
        results.forEach((result, index) => {
            if (!result.action) return;
            visit.steps.push(createFlowStep({
                id: [path, 'results', index].filter(part => part !== '').join('.'),
                kind: result.action,
                after,
                when: ['success'],
                actor,
                path,
                config: { label: result.label ?? '', value: result.value ?? '' },
            }));
        });
    },

    /**
     * Apply the items targeted actor effects to who the action affects: a hit defender, or the
     * targets of a successful test without defense. Unless the action selects its effects otherwise.
     */
    lowerDefaultEffects(visit: NodeVisit, action: FlowNodeData, hasOpposed: boolean) {
        const effects = action.effects as { select?: string, ids?: string[] } | undefined;
        if (effects?.select === 'none') return;
        if (!effects?.select && !FlowTree.hasActionEffects(visit.root)) return;

        visit.steps.push(createFlowStep({
            id: hasOpposed ? 'opposed.effects' : 'effects',
            kind: 'applyEffects',
            after: hasOpposed ? 'opposed' : FLOW_ROOT_STEP,
            when: hasOpposed ? ['hit'] : ['success'],
            actor: 'target',
            path: hasOpposed ? 'opposed' : '',
            config: { default: true, ...(effects?.select ? { select: effects.select, ids: [...(effects.ids ?? [])] } : {}) },
        }));
    },

    /**
     * Resolve an actor relative to the parent node to the actor a step runs for.
     */
    resolveActor(actor: FlowActor, parent: FlowStepActor): FlowStepActor {
        switch (actor) {
            case 'same': return parent;
            case 'other': return parent === 'self' ? 'target' : 'self';
            default: return actor;
        }
    },

    /**
     * Weapons used to default their resist test to the defense test. A defense test can't be the
     * resist step of itself, so those are read as the physical resist test.
     */
    resistTestName(test: string | undefined): string {
        if (!test) return '';
        if (test === 'PhysicalDefenseTest') return 'PhysicalResistTest';
        // Imported matrix actions stored their defense as resist test.
        if (test === 'MatrixDefenseTest') return 'MatrixResistTest';
        return test;
    },

    hasDamage(test: SuccessTest): boolean {
        return (test.data.damage?.value ?? 0) > 0;
    },

    /**
     * Mirrors which effects SuccessTestEffectsFlow copies onto target actors.
     */
    hasActionEffects(test: SuccessTest): boolean {
        const item = test.item;
        if (!item) return false;

        for (const _ of allApplicableDocumentEffects(item, { applyTo: ['targeted_actor'] })) return true;
        for (const _ of allApplicableItemsEffects(item, { applyTo: ['targeted_actor'], nestedItems: false })) return true;
        for (const _ of allApplicableDocumentEffects(item, { onTarget: true })) return true;
        for (const _ of allApplicableItemsEffects(item, { nestedItems: false, onTarget: true })) return true;
        return false;
    },
};
