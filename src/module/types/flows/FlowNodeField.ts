import DataSchema = foundry.data.fields.DataSchema;
const { SchemaField, TypedObjectField } = foundry.data.fields;

/**
 * Whose document a node runs for, relative to its parent node.
 * - same: the actor of the parent, within the same branch.
 * - other: for a parent run by the caster, each target (one branch per target). Otherwise, the caster.
 * - allies: actors picked when the node runs, like teamwork assistants.
 * - self / target: the caster, or each target, wherever the node is.
 * - owner: the controller of the item owner, like a spirit's summoner or a drone's rigger.
 * - none: nobody. The pool is a formula, rolled by the GM or automatically. Like a spirit's Force.
 * - participants: the caster and everyone assisting it, like ritual participants taking drain.
 * - pick: actors picked when the node runs, from the parent's targets or anyone else.
 * - occupants: the parent's actor and everyone inside it, like vehicle passengers.
 */
export const FLOW_ACTORS = ['same', 'other', 'allies', 'self', 'target', 'owner', 'none', 'participants', 'pick', 'occupants'] as const;
export type FlowActor = typeof FLOW_ACTORS[number];

/**
 * Who rolls for a node without an actor.
 */
export const FLOW_ROLLERS = ['gm', 'auto'] as const;

/**
 * What damage a node works with.
 * - own: its own damage field.
 * - incoming: the damage its parent passes on, before resisting.
 * - taken: the boxes the parent branch actually applied.
 * - none: no damage.
 */
export const FLOW_DAMAGE_MODES = ['own', 'incoming', 'taken', 'none'] as const;
export type FlowDamageMode = typeof FLOW_DAMAGE_MODES[number];

/**
 * Which item effects a node applies. Empty: the targeted actor effects of the item.
 */
export const FLOW_EFFECT_SELECT = ['all', 'ids', 'none'] as const;

/**
 * Default values of the nodes stored under a relation key. Values stored on a node win.
 */
export interface FlowRelationPreset {
    actor: FlowActor;
    /** The actor when the parent is the root, if differing. */
    rootActor?: FlowActor;
    when: string[];
    /** The `when` when the parent is the root, if differing. */
    rootWhen?: string[];
    mode: 'auto' | 'prompt';
    damage: FlowDamageMode;
    /** before: runs first, and the parent waits until released. */
    timing?: 'after' | 'before';
}

/**
 * Initial values handed to a relation's field factory, e.g. the default test class of a node.
 */
export type FlowNodeDefaults = Record<string, string>;

/**
 * Describes one relation key of the action node tree, like `opposed`, `resist` or `followed`.
 */
export interface FlowRelation {
    /** The node's own fields, without its child nodes. */
    fields: (defaults: FlowNodeDefaults) => DataSchema;
    /** Relation keys allowed as child nodes below a node of this relation. */
    children: string[];
    /** Child nodes of this relation are stored as a map of nodes keyed by name, instead of a single node. */
    map?: boolean;
    preset?: FlowRelationPreset;
    /** A Font Awesome icon class for the node editor, like `fa-shield-halved`. */
    icon?: string;
}

/**
 * Construction options of a single node and, by relation key, of the nodes below it.
 */
export interface FlowNodeOptions {
    /**
     * A nullable node is only stored once it exists. It defaults to null and validation stops there.
     * A non-nullable node always exists and is filled with defaults, like the legacy opposed and followed tests.
     */
    nullable?: boolean;
    defaults?: FlowNodeDefaults;
    children?: Record<string, FlowNodeOptions>;
    /** The relations of this node tree, passed on to all child nodes. Defaults to FlowRelations. */
    relations?: Record<string, FlowRelation>;
}

/**
 * All relation keys a node tree can use, open to modules until the first node schema is built.
 */
export const FlowRelations: Record<string, FlowRelation> = {};

/**
 * Fields of an action node that steer the flow and aren't test settings.
 */
export const FLOW_NODE_FLOW_KEYS = ['kind', 'type', 'description', 'actor', 'roller', 'when', 'mode', 'condition', 'primary', 'releases', 'damageMode', 'damageScale', 'unresisted', 'noDefense', 'config'];

/**
 * Read action node trees as stored, without their schema.
 */
export const FlowNodeRules = {
    /**
     * The test settings of an action node as a partial action, to create a complete action from.
     *
     * Leaves out the node fields only steering the flow, and the child nodes.
     */
    actionData(node: object, relations: Record<string, FlowRelation> = FlowRelations): Record<string, unknown> {
        const action = foundry.utils.deepClone(node) as Record<string, unknown>;
        for (const key of FLOW_NODE_FLOW_KEYS) delete action[key];
        for (const key of Object.keys(relations)) delete action[key];
        // Nodes without damage of their own store none.
        if (!action.damage) delete action.damage;
        return action;
    },

    /**
     * All nodes below a root node, depth first, with their path and relation key.
     *
     * Child nodes are found by the relation keys registered in FlowRelations. Map relations yield one node per entry.
     */
    nodes(root: object, relations: Record<string, FlowRelation> = FlowRelations) {
        const found: { node: Record<string, unknown>, path: string, relation: string }[] = [];
        const visit = (node: Record<string, unknown>, path: string) => {
            for (const key of Object.keys(relations)) {
                const child = node[key];
                if (!child || typeof child !== 'object') continue;

                const entries = relations[key].map ? Object.entries(child) : [['', child] as const];
                for (const [name, entry] of entries) {
                    if (!entry || typeof entry !== 'object') continue;
                    const childPath = [path, key, name].filter(Boolean).join('.');
                    found.push({ node: entry as Record<string, unknown>, path: childPath, relation: key });
                    visit(entry as Record<string, unknown>, childPath);
                }
            }
        };
        visit(root as Record<string, unknown>, '');
        return found;
    },

    /**
     * Expand an effect key naming a relation, like `system.action[resist].mod`, into the keys of every
     * stored node of that relation, at any depth. Like an ammo adding to every resist test of its weapon.
     *
     * @param target The document holding the node tree.
     * @param key The effect change key.
     * @returns The keys of the matching nodes. The key itself when it names no relation.
     */
    expandRelationKey(target: object, key: string, relations: Record<string, FlowRelation> = FlowRelations): string[] {
        const match = /^(.+?)\[(\w+)\]\.(.+)$/.exec(key);
        if (!match) return [key];
        const [, rootPath, relation, rest] = match;
        const root = foundry.utils.getProperty(target, rootPath) as object | undefined;
        if (!root || typeof root !== 'object') return [];
        return FlowNodeRules.nodes(root, relations)
            .filter(found => found.relation === relation)
            .map(found => `${rootPath}.${found.path}.${rest}`);
    },
};

/**
 * A node of the action node tree, holding its own test settings and its child nodes by relation key.
 *
 * Nodes can contain nodes of their own relation, so the schema is recursive. SchemaField builds its
 * fields when constructed, which would never end. FlowNodeField builds them on first access instead,
 * so only nodes reached by data or by a field path are ever built.
 *
 * Foundry also walks schemas without any data, to localize field labels and to collect search fields.
 * SchemaField.apply treats missing data as an empty object and keeps going. FlowNodeField.apply
 * stops at nullable nodes without data, so these walks only reach the nodes that always exist.
 */
export class FlowNodeField<
    const Fields extends DataSchema = DataSchema,
    const Options extends foundry.data.fields.SchemaField.Options<Fields> = foundry.data.fields.SchemaField.DefaultOptions,
> extends SchemaField<Fields, Options> {
    /** How many node schemas have been built, across all nodes. */
    static built = 0;

    readonly relation: string;
    readonly nodeOptions: FlowNodeOptions;

    /**
     * @param relation The relation key of this node, as registered in FlowRelations.
     * @param nodeOptions Options of this node and of its child nodes.
     * @param options Options for the SchemaField itself.
     */
    constructor(relation: string, nodeOptions: FlowNodeOptions = {}, options?: Options) {
        const nullable = nodeOptions.nullable ?? true;
        super({} as Fields, {
            required: true,
            nullable,
            ...(nullable ? { initial: null } : {}),
            ...options,
        } as Options);

        this.relation = relation;
        this.nodeOptions = nodeOptions;

        let fields: Fields | undefined;
        Object.defineProperty(this, 'fields', {
            configurable: true,
            enumerable: true,
            get: () => {
                fields ??= this._initialize(this.buildSchema() as Fields);
                return fields;
            },
            set: (value: Fields) => { fields = value; },
        });
    }

    /**
     * Collect the node's own fields and one field per allowed child relation.
     */
    protected buildSchema(): DataSchema {
        const relations = this.nodeOptions.relations ?? FlowRelations;
        const relation = relations[this.relation];
        if (!relation) throw new Error(`Shadowrun 5e | The flow relation "${this.relation}" isn't registered.`);

        FlowNodeField.built++;

        const schema: DataSchema = relation.fields(this.nodeOptions.defaults ?? {});
        for (const key of relation.children) {
            const options = { relations, ...this.nodeOptions.children?.[key] };
            schema[key] = relations[key]?.map
                // Named entries of a map always hold a node, the map itself is optional.
                ? new TypedObjectField(new FlowNodeField(key, { nullable: false, ...options }), { nullable: true, initial: null })
                : new FlowNodeField(key, options);
        }
        return schema;
    }

    override apply<ApplyOptions, Return>(
        fn: keyof this | ((this: this, value: unknown, options: ApplyOptions) => Return),
        value?: unknown,
        options?: ApplyOptions,
    ): Return {
        if (value == null && this.nullable) {
            const thisFn = (typeof fn === 'string' ? this[fn] : fn) as ((value: unknown, options: unknown) => Return) | undefined;
            thisFn?.call(this, value, options ?? {});
            return value as Return;
        }
        return super.apply(fn, value, options);
    }
}
