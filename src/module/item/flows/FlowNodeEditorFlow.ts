import type { SR5Item } from "../SR5Item";
import { FLOW_ACTORS, FLOW_DAMAGE_MODES, FLOW_EFFECT_SELECT, FLOW_ROLLERS, FlowNodeField, FlowNodeRules, FlowRelations } from "@/module/types/flows/FlowNodeField";
import { FLOW_STEP_MODE } from "@/module/types/flows/FlowStep";
import { FlowConditions } from "@/module/flows/FlowPlan";
import type { Translation } from "@/module/utils/strings";

/**
 * A relation key that can be added below a node.
 */
export interface FlowNodeAddable {
    path: string;
    relation: string;
    label: Translation;
    icon: string;
    // The test a new node starts with, taken from the test of its parent. See SuccessTest.flowDefaults.
    test: string;
    // Map relations, like choice options, add entries by name.
    map: boolean;
}

/**
 * A short fact about a node, shown on its header. Preset values are shown dimmed.
 */
export interface FlowNodeChip {
    label: string;
    tooltip: Translation;
    preset: boolean;
}

/**
 * The values a node runs with: its own where set, the preset of its relation otherwise.
 */
export interface FlowNodeEffective {
    actor: string;
    when: string[];
    mode: string;
    damage: string;
}

/**
 * Everything the node editor partial needs to render one node and its children.
 */
export interface FlowNodeView {
    key: string;
    relation: string;
    path: string;
    label: Translation;
    icon: string;
    field: FlowNodeField;
    source: Record<string, unknown>;
    tests: Record<string, unknown>;
    testLabel: string;
    // The always present nodes can't be removed.
    removable: boolean;
    // Item types decide their own opposed and resist tests.
    lockTest: boolean;
    depth: number;
    expanded: boolean;
    active: boolean;
    effective: FlowNodeEffective;
    chips: FlowNodeChip[];
    // Labels of the preset values, for empty selects.
    presetLabels: { actor: string, mode: string, damage: string, when: string };
    // Only before nodes can be a choice. Choice options are its child nodes.
    canBeChoice: boolean;
    isChoice: boolean;
    // Nodes within a before subtree can release the node it gates.
    insideBefore: boolean;
    isOpposed: boolean;
    hasDamage: boolean;
    hasResults: boolean;
    children: FlowNodeView[];
    addable: FlowNodeAddable[];
    // Problems with the node as authored. See FlowNodeEditorFlow.warnings.
    warnings: Translation[];
    // The same warnings, by the editor section they concern.
    sectionWarnings: Record<FlowNodeSection, Translation[]>;
    // All warnings as one localized tooltip, for the header badge.
    warningText: string;
}

/**
 * The sections of the node editor body.
 */
export type FlowNodeSection = 'roll' | 'when' | 'damage' | 'releases';

/**
 * Child keys of the root action, in display order.
 */
const ROOT_CHILDREN = ['before', 'assist', 'opposed', 'resist', 'followed'];

/**
 * Item types deciding their own opposed and resist tests, locked in the editor.
 */
const LOCKED_TEST_TYPES = ['call_in_action', 'complex_form', 'ritual', 'weapon'];

/**
 * Item types whose tests work out their damage when rolled, like a combat spell from its Force.
 */
const COMPUTED_DAMAGE_TYPES = ['spell', 'complex_form', 'ritual', 'sprite_power'];

/**
 * Outcomes of a parent node a child can wait for, or that release a gated node.
 */
const FLOW_OUTCOMES = ['always', 'success', 'failure', 'hit', 'miss', 'tie'];

/**
 * Option keys offered when adding an option to a choice. Any other name works as well.
 */
const KNOWN_OPTIONS = ['accept', 'resist'];

/**
 * The editor section each warning concerns.
 */
const WARNING_SECTIONS: Record<string, FlowNodeSection> = {
    'SR5.Flow.Node.Warnings.NoTest': 'roll',
    'SR5.Flow.Node.Warnings.NoRelease': 'releases',
    'SR5.Flow.Node.Warnings.NoIncomingDamage': 'damage',
    'SR5.Flow.Node.Warnings.NoAllies': 'when',
    'SR5.Flow.Node.Warnings.RunsOnClick': 'when',
};

/**
 * Build the view of an actions node tree for the item sheet node editor.
 */
export const FlowNodeEditorFlow = {
    /**
     * The nodes below the action root of an item, with what can be added where.
     *
     * @param expanded Paths of the nodes shown with their body open.
     */
    tree(item: SR5Item, expanded: Set<string> = new Set()): { nodes: FlowNodeView[], addable: FlowNodeAddable[] } {
        const actionField = (item.system.schema.fields as Record<string, unknown>).action as { fields: Record<string, unknown> } | undefined;
        const action = foundry.utils.getProperty(item._source, 'system.action') as Record<string, unknown> | undefined;
        if (!actionField || !action) return { nodes: [], addable: [] };

        return FlowNodeEditorFlow.children(item, actionField.fields, action, 'system.action', 'root', ROOT_CHILDREN, 0, expanded);
    },

    children(item: SR5Item, fields: Record<string, unknown>, source: Record<string, unknown>, path: string, parentRelation: string, keys: string[], depth: number, expanded: Set<string>) {
        const nodes: FlowNodeView[] = [];
        const addable: FlowNodeAddable[] = [];
        const parentTest = String(source.test ?? '');

        for (const key of keys) {
            const childField = fields[key];
            const childPath = `${path}.${key}`;
            const childSource = source[key];
            const icon = FlowRelations[key]?.icon ?? 'fa-circle';

            if (FlowRelations[key]?.map) {
                const entries = (childSource ?? {}) as Record<string, Record<string, unknown>>;
                const element = (childField as { element?: FlowNodeField } | undefined)?.element;
                if (!element) continue;
                for (const [name, entry] of Object.entries(entries)) {
                    nodes.push(FlowNodeEditorView.node(item, element, entry, `${childPath}.${name}`, key, name, depth, true, expanded));
                }
                addable.push({ path: childPath, relation: key, label: FlowNodeEditorFlow.addLabel(key), icon, test: '', map: true });
                continue;
            }

            if (!(childField instanceof FlowNodeField)) continue;
            if (!childSource) {
                addable.push({ path: childPath, relation: key, label: FlowNodeEditorFlow.addLabel(key), icon, test: FlowNodeEditorFlow.defaultTest(parentTest, key), map: false });
                continue;
            }

            nodes.push(FlowNodeEditorView.node(item, childField, childSource as Record<string, unknown>, childPath, key, key, depth, childField.nullable, expanded));
        }

        return { nodes, addable };
    },

    /**
     * Problems with a node as authored, that keep it or the nodes below it from ever running as meant.
     *
     * - An optional node without a test does nothing. Choice options don't need one, choosing them is enough.
     * - Nothing within a before subtree releases the node it gates, so that node never runs.
     * - A resist node below nodes without damage has nothing to resist.
     * - Allies are the assistants of the root test, and there are none without an assist node.
     * - Below a root test without a threshold or opposition, nodes waiting for a success or failure
     *   run when clicked, as any hit is a success. See FlowRunner.hasNoVerdict.
     */
    warnings(item: SR5Item, source: Record<string, unknown>, path: string, relation: string, removable: boolean): Translation[] {
        const action = (foundry.utils.getProperty(item._source, 'system.action') ?? {}) as Record<string, unknown>;
        const active = !!source.test || !!source.kind;
        const warnings: Translation[] = [];

        if (removable && !active && relation !== 'option') warnings.push('SR5.Flow.Node.Warnings.NoTest' as Translation);
        if (relation === 'before' && !FlowNodeEditorFlow.releases(source)) warnings.push('SR5.Flow.Node.Warnings.NoRelease' as Translation);
        if (!active) return warnings;

        const damageMode = String(source.damageMode || 'incoming');
        if (relation === 'resist' && damageMode !== 'own' && !FlowNodeEditorFlow.receivesDamage(item, action, path)) {
            warnings.push('SR5.Flow.Node.Warnings.NoIncomingDamage' as Translation);
        }
        if (source.actor === 'allies' && !action.assist) warnings.push('SR5.Flow.Node.Warnings.NoAllies' as Translation);

        const parentIsRoot = FlowNodeEditorFlow.parentIsRoot(path);
        const when = FlowNodeEditorFlow.effective(source, relation, parentIsRoot).when;
        const waitsForVerdict = when.some(value => value === 'success' || value === 'failure');
        if (parentIsRoot && waitsForVerdict && !FlowNodeEditorFlow.hasVerdict(action)) {
            warnings.push('SR5.Flow.Node.Warnings.RunsOnClick' as Translation);
        }
        return warnings;
    },

    /**
     * The values a node runs with, falling back to the preset of its relation like FlowTree does.
     */
    effective(source: Record<string, unknown>, relation: string, parentIsRoot: boolean): FlowNodeEffective {
        const preset = FlowRelations[relation]?.preset;
        const when = source.when as string[] | undefined;
        return {
            actor: String(source.actor || (parentIsRoot && preset?.rootActor) || preset?.actor || ''),
            when: when?.length ? [...when] : [...((parentIsRoot && preset?.rootWhen) || preset?.when || [])],
            mode: String(source.mode || preset?.mode || ''),
            damage: String(source.damageMode || preset?.damage || ''),
        };
    },

    /**
     * Is the node at this path directly below the action root, like system.action.opposed?
     */
    parentIsRoot(path: string): boolean {
        return path.split('.').length === 3;
    },

    /**
     * Does a node, or any node below it, release the node it gates?
     */
    releases(source: Record<string, unknown>): boolean {
        const nodes = [source, ...FlowNodeRules.nodes(source).map(found => found.node)];
        return nodes.some(node => (node.releases as string[] | undefined)?.length);
    },

    /**
     * Does any node above the one at the given path deal damage, for it to resist?
     */
    receivesDamage(item: SR5Item, action: Record<string, unknown>, path: string): boolean {
        if (item.isType(...COMPUTED_DAMAGE_TYPES as Parameters<SR5Item['isType']>)) return true;
        const categories = (action.categories ?? []) as string[];
        if (categories.includes('matrix')) return true;

        const deals = (node: Record<string, unknown> | undefined) => {
            const damage = node?.damage as { base?: number, value?: number, formula?: string } | null | undefined;
            return !!damage && (!!damage.base || !!damage.value || !!damage.formula);
        };
        const parts = path.split('.');
        for (let end = parts.length - 1; end >= 2; end--) {
            const ancestor = foundry.utils.getProperty(item._source, parts.slice(0, end).join('.')) as Record<string, unknown> | undefined;
            if (deals(ancestor)) return true;
        }
        return false;
    },

    /**
     * Can the root test of an action succeed or fail by its own rules, with a threshold or an opposition?
     */
    hasVerdict(action: Record<string, unknown>): boolean {
        const threshold = action.threshold as { base?: number, formula?: string } | undefined;
        const opposed = action.opposed as { test?: string } | null | undefined;
        return !!threshold?.base || !!threshold?.formula || !!opposed?.test;
    },

    /**
     * Select options for node fields, labeled.
     */
    options(item: SR5Item) {
        const labeled = (values: readonly string[], prefix: string) => values.map(value => ({ value, label: `${prefix}.${value}` }));
        return {
            actor: labeled(FLOW_ACTORS, 'SR5.Flow.Node.Actors'),
            mode: labeled(FLOW_STEP_MODE, 'SR5.Flow.Node.Modes'),
            roller: labeled(FLOW_ROLLERS, 'SR5.Flow.Node.Rollers'),
            damageMode: labeled(FLOW_DAMAGE_MODES, 'SR5.Flow.Node.DamageModes'),
            effectSelect: labeled(FLOW_EFFECT_SELECT, 'SR5.Flow.Node.EffectSelect'),
            outcomes: labeled(FLOW_OUTCOMES, 'SR5.Flow.Node.Outcomes'),
            kind: [{ value: 'choice', label: 'SR5.Flow.Node.Kinds.choice' }],
            resultAction: labeled(['modifyCombatantInit', 'forceReboot', 'placeMarks'], 'SR5.Flow.Node.ResultActions'),
            round: labeled(['up', 'down'], 'SR5.Flow.Node.Round'),
            knownOptions: KNOWN_OPTIONS.map(value => ({ value, label: FlowNodeEditorFlow.optionLabel(value) })),
            conditions: Object.keys(FlowConditions).map(value => ({ value, label: FlowNodeEditorFlow.conditionLabel(value) })),
            // Effects to apply on target, copied to the recipients of an action. See SuccessTestEffectsFlow.
            effects: item.effects.contents
                .filter(effect => effect.system.applyOnTarget)
                .map(effect => ({ value: effect.id ?? '', label: effect.name })),
        };
    },

    label(relation: string): Translation {
        return `SR5.Flow.Node.Relation.${relation}` as Translation;
    },

    addLabel(relation: string): Translation {
        return `SR5.Flow.Node.Add.${relation}` as Translation;
    },

    /**
     * The label of a choice option. Known options are localized, others shown by their key.
     */
    optionLabel(option: string): string {
        const key = `SR5.Flow.Options.${option}`;
        return game.i18n.has(key) ? game.i18n.localize(key) : option;
    },

    /**
     * The label of a named flow condition. Conditions added by modules are shown by their name.
     */
    conditionLabel(condition: string): string {
        const key = `SR5.Flow.Node.Conditions.${condition}`;
        return game.i18n.has(key) ? game.i18n.localize(key) : condition;
    },

    /**
     * A choice option key from a name typed in the editor, like 'Hold Breath' to 'holdBreath'.
     */
    optionKey(name: string): string {
        const words = name.trim().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
        return words.map((word, index) => index === 0
            ? word.charAt(0).toLowerCase() + word.slice(1)
            : word.charAt(0).toUpperCase() + word.slice(1)).join('');
    },

    /**
     * The test a new node below the given parent test starts with.
     */
    defaultTest(parentTest: string, relation: string): string {
        const cls = parentTest && Object.hasOwn(game.shadowrun5e.tests, parentTest)
            ? game.shadowrun5e.tests[parentTest] as { flowDefaults?: Record<string, string> }
            : undefined;
        return cls?.flowDefaults?.[relation] ?? '';
    },

    /**
     * Tests offered for a relation key: defenses for opposed, resist tests for resist,
     * any test for the others. Test classes naming the relation in their flowRoles are offered as well.
     */
    tests(relation: string): Record<string, unknown> {
        const tests = game.shadowrun5e;
        let offered: Record<string, unknown>;
        switch (relation) {
            case 'opposed': offered = { ...tests.opposedTests }; break;
            case 'resist': offered = { ...tests.resistTests }; break;
            case 'followed': offered = { ...tests.followedTests, ...tests.resistTests, ...tests.activeTests }; break;
            default: return tests.tests;
        }
        for (const [name, cls] of Object.entries(tests.tests)) {
            if ((cls as { flowRoles?: string[] }).flowRoles?.includes(relation)) offered[name] = cls;
        }
        return offered;
    },

    /**
     * The label of a test class, by its name.
     */
    testLabel(test: string): string {
        if (!test) return '';
        const cls = Object.hasOwn(game.shadowrun5e.tests, test) ? game.shadowrun5e.tests[test] as { label?: string } : undefined;
        return game.i18n.localize(cls?.label ?? test);
    },

    /**
     * Header chips of a node: who rolls, when and how it starts, and its damage.
     * Values taken from the preset are marked, so authored ones stand out.
     */
    chips(source: Record<string, unknown>, effective: FlowNodeEffective): FlowNodeChip[] {
        const chips: FlowNodeChip[] = [];
        const localize = (key: string) => game.i18n.localize(key);

        if (effective.actor) chips.push({
            label: localize(`SR5.Flow.Node.Actors.${effective.actor}`),
            tooltip: 'SR5.Flow.Node.Actor' as Translation,
            preset: !source.actor,
        });
        const when = effective.when.filter(value => value !== 'always');
        if (when.length) chips.push({
            label: when.map(value => FLOW_OUTCOMES.includes(value)
                ? localize(`SR5.Flow.Node.Outcomes.${value}`)
                : FlowNodeEditorFlow.optionLabel(value)).join(' / '),
            tooltip: 'SR5.Flow.Node.When' as Translation,
            preset: !(source.when as string[] | undefined)?.length,
        });
        if (effective.mode) chips.push({
            label: localize(`SR5.Flow.Node.Modes.${effective.mode}`),
            tooltip: 'SR5.Flow.Node.Mode' as Translation,
            preset: !source.mode,
        });
        if (source.damage) chips.push({
            label: localize('SR5.Flow.Node.DealsDamage'),
            tooltip: 'SR5.Flow.Node.Damage' as Translation,
            preset: false,
        });
        if (source.condition) chips.push({
            label: FlowNodeEditorFlow.conditionLabel(String(source.condition)),
            tooltip: 'SR5.Flow.Node.Condition' as Translation,
            preset: false,
        });
        return chips;
    },
};

const FlowNodeEditorView = {
    node(item: SR5Item, field: FlowNodeField, source: Record<string, unknown>, path: string, relation: string, key: string, depth: number, removable: boolean, expanded: Set<string>): FlowNodeView {
        const children = FlowRelations[relation]?.children ?? [];
        const { nodes, addable } = FlowNodeEditorFlow.children(item, field.fields as Record<string, unknown>, source, path, relation, children, depth + 1, expanded);
        const legacyNode = path === 'system.action.opposed' || path === 'system.action.opposed.resist';
        const effective = FlowNodeEditorFlow.effective(source, relation, FlowNodeEditorFlow.parentIsRoot(path));
        const warnings = FlowNodeEditorFlow.warnings(item, source, path, relation, removable);
        const sectionWarnings: Record<FlowNodeSection, Translation[]> = { roll: [], when: [], damage: [], releases: [] };
        for (const warning of warnings) sectionWarnings[WARNING_SECTIONS[warning] ?? 'roll'].push(warning);
        const preset = (value: string, prefix: string) => value
            ? `${game.i18n.localize('SR5.Flow.Node.Preset')}: ${game.i18n.localize(`${prefix}.${value}`)}`
            : game.i18n.localize('SR5.Flow.Node.Preset');
        const presetValues = FlowNodeEditorFlow.effective({}, relation, FlowNodeEditorFlow.parentIsRoot(path));
        const label = relation === 'option' ? FlowNodeEditorFlow.optionLabel(key) as Translation : FlowNodeEditorFlow.label(relation);
        const testLabel = source.kind === 'choice'
            ? game.i18n.localize('SR5.Flow.Node.Kinds.choice')
            : FlowNodeEditorFlow.testLabel(String(source.test ?? ''));

        return {
            key,
            relation,
            path,
            label,
            icon: FlowRelations[relation]?.icon ?? 'fa-circle',
            field,
            source,
            tests: FlowNodeEditorFlow.tests(relation),
            // A test named like its relation, like the plain Opposed Test, says nothing more.
            testLabel: testLabel === game.i18n.localize(label) ? '' : testLabel,
            removable,
            lockTest: legacyNode && item.isType(...LOCKED_TEST_TYPES as Parameters<SR5Item['isType']>),
            depth,
            expanded: expanded.has(path),
            active: !!source.test || !!source.kind,
            effective,
            chips: FlowNodeEditorFlow.chips(source, effective),
            presetLabels: {
                actor: preset(presetValues.actor, 'SR5.Flow.Node.Actors'),
                mode: preset(presetValues.mode, 'SR5.Flow.Node.Modes'),
                damage: preset(presetValues.damage, 'SR5.Flow.Node.DamageModes'),
                when: `${game.i18n.localize('SR5.Flow.Node.Preset')}: ${presetValues.when.map(value => FLOW_OUTCOMES.includes(value)
                    ? game.i18n.localize(`SR5.Flow.Node.Outcomes.${value}`)
                    : FlowNodeEditorFlow.optionLabel(value)).join(' / ')}`,
            },
            canBeChoice: relation === 'before',
            isChoice: source.kind === 'choice',
            insideBefore: relation === 'before' || path.includes('.before.'),
            isOpposed: relation === 'opposed',
            hasDamage: !!source.damage,
            hasResults: !!(source.results as unknown[] | undefined)?.length,
            children: nodes,
            addable,
            warnings,
            sectionWarnings,
            warningText: warnings.map(warning => game.i18n.localize(warning)).join('<br>'),
        };
    },
};
