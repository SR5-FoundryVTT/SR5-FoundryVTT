import type { SR5Item } from "../SR5Item";
import { FLOW_ACTORS, FlowNodeField, FlowNodeRules, FlowRelations } from "@/module/types/flows/FlowNodeField";
import { FLOW_STEP_MODE } from "@/module/types/flows/FlowStep";
import type { Translation } from "@/module/utils/strings";

/**
 * A relation key that can be added below a node.
 */
export interface FlowNodeAddable {
    path: string;
    relation: string;
    label: Translation;
    // The test a new node starts with, taken from the test of its parent. See SuccessTest.flowDefaults.
    test: string;
}

/**
 * Everything the node editor partial needs to render one node and its children.
 */
export interface FlowNodeView {
    key: string;
    relation: string;
    path: string;
    label: Translation;
    field: FlowNodeField;
    source: Record<string, unknown>;
    tests: Record<string, unknown>;
    // The always present nodes can't be removed.
    removable: boolean;
    // Item types decide their own opposed and resist tests.
    lockTest: boolean;
    depth: number;
    children: FlowNodeView[];
    addable: FlowNodeAddable[];
    // Problems with the node as authored. See FlowNodeEditorFlow.warnings.
    warnings: Translation[];
}

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
 * Build the view of an actions node tree for the item sheet node editor.
 */
export const FlowNodeEditorFlow = {
    /**
     * The nodes below the action root of an item, with what can be added where.
     */
    tree(item: SR5Item): { nodes: FlowNodeView[], addable: FlowNodeAddable[] } {
        const actionField = (item.system.schema.fields as Record<string, unknown>).action as { fields: Record<string, unknown> } | undefined;
        const action = foundry.utils.getProperty(item._source, 'system.action') as Record<string, unknown> | undefined;
        if (!actionField || !action) return { nodes: [], addable: [] };

        return FlowNodeEditorFlow.children(item, actionField.fields, action, 'system.action', 'root', ROOT_CHILDREN, 0);
    },

    children(item: SR5Item, fields: Record<string, unknown>, source: Record<string, unknown>, path: string, parentRelation: string, keys: string[], depth: number) {
        const nodes: FlowNodeView[] = [];
        const addable: FlowNodeAddable[] = [];
        const parentTest = String(source.test ?? '');

        for (const key of keys) {
            const childField = fields[key];
            const childPath = `${path}.${key}`;
            const childSource = source[key];

            if (FlowRelations[key]?.map) {
                const entries = (childSource ?? {}) as Record<string, Record<string, unknown>>;
                const element = (childField as { element?: FlowNodeField } | undefined)?.element;
                if (!element) continue;
                for (const [name, entry] of Object.entries(entries)) {
                    nodes.push(FlowNodeEditorView.node(item, element, entry, `${childPath}.${name}`, key, name, depth, true));
                }
                addable.push({ path: `${childPath}.${foundry.utils.randomID(4)}`, relation: key, label: FlowNodeEditorFlow.addLabel(key), test: '' });
                continue;
            }

            if (!(childField instanceof FlowNodeField)) continue;
            if (!childSource) {
                addable.push({ path: childPath, relation: key, label: FlowNodeEditorFlow.addLabel(key), test: FlowNodeEditorFlow.defaultTest(parentTest, key) });
                continue;
            }

            nodes.push(FlowNodeEditorView.node(item, childField, childSource as Record<string, unknown>, childPath, key, key, depth, childField.nullable));
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

        const parentIsRoot = path.split('.').length === 3;
        const preset = FlowRelations[relation]?.preset;
        const when = (source.when as string[] | undefined)?.length
            ? source.when as string[]
            : (parentIsRoot && preset?.rootWhen) || preset?.when || [];
        const waitsForVerdict = when.some(value => value === 'success' || value === 'failure');
        if (parentIsRoot && waitsForVerdict && !FlowNodeEditorFlow.hasVerdict(action)) {
            warnings.push('SR5.Flow.Node.Warnings.RunsOnClick' as Translation);
        }
        return warnings;
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
    options() {
        return {
            actor: FLOW_ACTORS.map(value => ({ value, label: `SR5.Flow.Node.Actors.${value}` })),
            mode: FLOW_STEP_MODE.map(value => ({ value, label: `SR5.Flow.Node.Modes.${value}` })),
        };
    },

    label(relation: string): Translation {
        return `SR5.Flow.Node.Relation.${relation}` as Translation;
    },

    addLabel(relation: string): Translation {
        return `SR5.Flow.Node.Add.${relation}` as Translation;
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
};

const FlowNodeEditorView = {
    node(item: SR5Item, field: FlowNodeField, source: Record<string, unknown>, path: string, relation: string, key: string, depth: number, removable: boolean): FlowNodeView {
        const children = FlowRelations[relation]?.children ?? [];
        const { nodes, addable } = FlowNodeEditorFlow.children(item, field.fields as Record<string, unknown>, source, path, relation, children, depth + 1);
        const legacyNode = path === 'system.action.opposed' || path === 'system.action.opposed.resist';

        return {
            key,
            relation,
            path,
            label: FlowNodeEditorFlow.label(relation),
            field,
            source,
            tests: FlowNodeEditorFlow.tests(relation),
            removable,
            lockTest: legacyNode && item.isType(...LOCKED_TEST_TYPES as Parameters<SR5Item['isType']>),
            depth,
            children: nodes,
            addable,
            warnings: FlowNodeEditorFlow.warnings(item, source, path, relation, removable),
        };
    },
};
