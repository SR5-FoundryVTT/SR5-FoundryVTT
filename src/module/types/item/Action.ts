import { SR5 } from "@/module/config";
import { BaseItemData, ItemBase } from "./ItemBase";
import { ModifiableField } from "../fields/ModifiableField";
import { ModifiableValueLinked, BaseValuePair, ChangeList } from "../template/Base";
import { TagifyMultiField } from '@/module/types/fields/TagifyMultiField';
import { INTERVAL_UNITS } from '@/module/utils/timeUnits';
import { FLOW_STEP_MODE } from '@/module/types/flows/FlowStep';
import { FLOW_ACTORS, FLOW_DAMAGE_MODES, FLOW_EFFECT_SELECT, FLOW_ROLLERS, FlowNodeDefaults, FlowNodeField, FlowRelation, FlowRelations } from '@/module/types/flows/FlowNodeField';
const { SchemaField, NumberField, BooleanField, StringField, ArrayField, ObjectField } = foundry.data.fields;

const ResultActionData = () => ({
    action: new StringField({
        blank: true,
        required: true,
        choices: ['modifyCombatantInit', 'forceReboot', 'placeMarks']
    }),
    label: new StringField({ required: true }),
    value: new StringField({ required: true })
});

const ActionResultData = () => ({
    // TODO success: Record<string, any>
    success: new SchemaField({
        matrix: new SchemaField({
            placeMarks: new BooleanField(),
        }),
    })
});

export const MinimalActionData = () => ({
    attribute: new StringField({
        blank: true,
        required: true,
        choices: SR5.attributes
    }),
    attribute2: new StringField({
        blank: true,
        required: true,
        choices: SR5.attributes
    }),
    armor: new BooleanField(),
    limit: new ModifiableField({ ...ModifiableValueLinked(), formula: new StringField({ required: true, blank: true }) }),
    mod: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    skill: new StringField({ required: true }),
});

export const ActionCategory = () => ({
    matrix: new SchemaField({
        owner: new BooleanField(),
        marks: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    }),
});

export const DamageData = ({ normal_weapon = false } = {}) => ({
    ...ModifiableValueLinked(),
    // A formula giving the base damage value, read against the flow value context. See FlowContext.
    formula: new StringField({ required: true, blank: true }),
    type: new SchemaField({
        base: new StringField({
            blank: true,
            required: true,
            choices: SR5.damageTypes,
        }),
        value: new StringField({
            blank: true,
            required: true,
            choices: SR5.damageTypes,
        }),
    }),
    element: new SchemaField({
        base: new StringField({
            blank: true,
            required: true,
            choices: SR5.elementTypes,
        }),
        value: new StringField({
            blank: true,
            required: true,
            choices: SR5.elementTypes
        }),
    }),
    // Further elements the damage is of at the same time. See DamageRules.elements.
    elements: new ArrayField(new StringField({ required: true, blank: false, choices: SR5.elementTypes })),
    ap: new ModifiableField(ModifiableValueLinked()),
    biofeedback: new StringField({
        blank: true,
        required: true,
        choices: SR5.biofeedbackOptions,
    }),
    attribute: new StringField({
        blank: true,
        required: true,
        choices: SR5.attributes
    }),
    source: new SchemaField({
        actorId: new StringField({ required: true }),
        itemId: new StringField({ required: true }),
        itemName: new StringField({ required: true }),
        itemType: new StringField({ required: true }),
    }, { required: false }),
    normal_weapon: new BooleanField({ initial: normal_weapon }),
});

/**
 * The test settings every node of the action node tree shares with the root action.
 *
 * Formulas resolve against the flow value context (see FlowContext). When set, they replace the
 * pool, limit or threshold the other settings would give.
 */
const NodeTestFields = () => ({
    mod: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    skill: new StringField({ required: true }),
    attribute: new StringField({
        blank: true,
        required: true,
        choices: SR5.attributes
    }),
    attribute2: new StringField({
        blank: true,
        required: true,
        choices: SR5.attributes
    }),
    armor: new BooleanField(),
    spec: new BooleanField(),
    pool: new SchemaField({ formula: new StringField({ required: true, blank: true }) }),
    limit: new ModifiableField({ ...ModifiableValueLinked(), formula: new StringField({ required: true, blank: true }) }),
    threshold: new SchemaField({ ...BaseValuePair(), formula: new StringField({ required: true, blank: true }) }),
    categories: new TagifyMultiField(),
    features: new ArrayField(new StringField({ required: true, blank: false })),
});

/**
 * Which effects of the item a node applies. An empty selection keeps the default: all targeted actor effects.
 */
const NodeEffectsField = () => new SchemaField({
    select: new StringField({ required: true, blank: true, choices: FLOW_EFFECT_SELECT }),
    ids: new ArrayField(new StringField({ required: true, blank: false })),
});

/**
 * All fields of a node of the action node tree, without its child nodes.
 *
 * Fields left empty take the value of the preset of the relation the node is stored under (see FlowRelations).
 */
const NodeFields = ({ test = '', type = '' }: FlowNodeDefaults = {}) => ({
    test: new StringField({ required: true, initial: test }),
    // A flow step kind other than 'test', like 'choice' or 'applyDamage'. Empty for test nodes.
    kind: new StringField({ required: true, blank: true }),
    type: new StringField({ required: true, initial: type }),
    description: new StringField({ required: true }),
    actor: new StringField({ required: true, blank: true, choices: FLOW_ACTORS }),
    // Who rolls for a node without an actor.
    roller: new StringField({ required: true, blank: true, choices: FLOW_ROLLERS }),
    // Any of these outcomes of the parent lets the node run.
    when: new ArrayField(new StringField({ required: true, blank: false })),
    mode: new StringField({ required: true, blank: true, choices: FLOW_STEP_MODE }),
    condition: new StringField({ required: true, blank: true }),
    // The test the value context calls primary. Defaults to the root.
    primary: new BooleanField(),
    // Outcomes of this node releasing the parent of the before subtree it's in.
    releases: new ArrayField(new StringField({ required: true, blank: false })),
    ...NodeTestFields(),
    // The damage this node deals itself. Empty when it has none.
    damage: new ModifiableField(DamageData(), { required: true, nullable: true, initial: null }),
    damageMode: new StringField({ required: true, blank: true, choices: FLOW_DAMAGE_MODES }),
    damageScale: new SchemaField({
        factor: new NumberField({ required: true, nullable: false, initial: 1, min: 0 }),
        round: new StringField({ required: true, initial: 'up', choices: ['up', 'down'] }),
    }),
    // Damage this node applies can't be resisted, SR5#231.
    unresisted: new BooleanField(),
    effects: NodeEffectsField(),
    results: new ArrayField(new SchemaField(ResultActionData())),
    // The defender may choose not to defend, or never can, SR5#190.
    noDefense: new SchemaField({
        allowed: new BooleanField({ initial: true }),
        condition: new StringField({ required: true, blank: true }),
    }),
    config: new ObjectField(),
});

type NodeSchema = ReturnType<typeof NodeFields>;
type NullableNode = { required: true, nullable: true, initial: null };
type OptionalNode = FlowNodeField<NodeSchema, NullableNode>;
type OpposedNodeSchema = NodeSchema & { resist: FlowNodeField<NodeSchema>, followed: OptionalNode, before: OptionalNode };
type FollowedNodeSchema = NodeSchema & { resist: OptionalNode };

/**
 * The relation keys of the action node tree and their presets.
 */
Object.assign(FlowRelations, {
    // The defense against the parent test, rolled by each of its targets.
    opposed: {
        fields: (defaults: FlowNodeDefaults) => NodeFields({ test: 'OpposedTest', ...defaults }),
        // An opposed node below one is someone else defending against the same test, like on a miss.
        children: ['resist', 'followed', 'before', 'opposed'],
        preset: { actor: 'other', when: ['always'], mode: 'prompt', damage: 'incoming' },
    },
    // Soaking incoming damage. Under opposed it's the defender, directly under the root each target.
    resist: {
        fields: NodeFields,
        children: ['followed'],
        preset: { actor: 'same', rootActor: 'other', when: ['hit'], rootWhen: ['success'], mode: 'auto', damage: 'incoming' },
    },
    // Tests following the parent for the same actor: drain, fading, biofeedback.
    followed: {
        fields: NodeFields,
        children: ['resist'],
        preset: { actor: 'same', when: ['always'], mode: 'auto', damage: 'own' },
    },
    // Runs before its parent, which waits until a node within releases it. Touch, pool splits.
    before: {
        fields: NodeFields,
        children: ['option', 'opposed', 'followed', 'before'],
        preset: { actor: 'same', when: ['always'], mode: 'prompt', damage: 'none', timing: 'before' },
    },
    // The options of a choice, keyed by option name. A node runs when its option is chosen.
    option: {
        fields: NodeFields,
        children: ['opposed', 'resist', 'followed'],
        map: true,
        preset: { actor: 'other', when: [], mode: 'prompt', damage: 'none' },
    },
    // Teamwork assistants, rolling before the leader. SR5#49.
    assist: {
        fields: NodeFields,
        children: ['followed'],
        preset: { actor: 'allies', when: ['always'], mode: 'prompt', damage: 'none', timing: 'before' },
    },
} satisfies Record<string, FlowRelation>);

export const OpposedActionRollData = ({ type = '', opposedTest = 'OpposedTest', resistTest = '' } = {}) =>
    new FlowNodeField<OpposedNodeSchema>('opposed', {
        nullable: false,
        defaults: { test: opposedTest, type },
        children: { resist: { nullable: false, defaults: { test: resistTest } } },
    });

export const ActionRollData = (
    {
        test = 'SuccessTest',
        opposedTest = '',
        resistTest = '',
        followedTest = '',
        type = '',
        normal_weapon = false,
    } = {}
) => ({
    ...MinimalActionData(),
    test: new StringField({ required: true, initial: test }),
    type: new StringField({ required: true, initial: type, blank: true, choices: SR5.actionTypes }),
    initiative_mod: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    category: new SchemaField(ActionCategory()),
    categories: new TagifyMultiField(),
    spec: new BooleanField(),
    mod_description: new StringField({ required: true }),
    threshold: new SchemaField({ ...BaseValuePair(), formula: new StringField({ required: true, blank: true }) }),
    extended: new SchemaField({
        value: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
        unit: new StringField({ required: true, initial: 'minutes', choices: INTERVAL_UNITS }),
    }),
    modifiers: new TagifyMultiField(),
    damage: new ModifiableField(DamageData({ normal_weapon })),
    // A formula replacing the pool given by skill and attributes, see NodeTestFields.
    pool: new SchemaField({ formula: new StringField({ required: true, blank: true }) }),
    features: new ArrayField(new StringField({ required: true, blank: false })),
    // Effects and results of the action itself. See FlowTree.
    effects: NodeEffectsField(),
    results: new ArrayField(new SchemaField(ResultActionData())),
    // The node tree of tests and steps around this action.
    opposed: OpposedActionRollData({ opposedTest, resistTest }),
    followed: new FlowNodeField<FollowedNodeSchema>('followed', { nullable: false, defaults: { test: followedTest } }),
    resist: new FlowNodeField<NodeSchema, NullableNode>('resist'),
    before: new FlowNodeField<NodeSchema, NullableNode>('before'),
    assist: new FlowNodeField<NodeSchema, NullableNode>('assist'),
    alt_mod: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    dice_pool_mod: ChangeList(),
    roll_mode: new StringField({
        blank: true,
        required: true,
        choices: () => Object.entries(CONFIG.ChatMessage.modes)
            .reduce<Record<string, string>>((choices, [mode, { label }]) => {
                choices[mode] = label;
                return choices;
            }, {}),
    }),
});

export const ActionPartData = (args: {
    test?: string;
    opposedTest?: string;
    resistTest?: string;
    followedTest?: string;
    type?: string;
    normal_weapon?: boolean;
} = {}) => ({
    action: new SchemaField(ActionRollData(args)),
});

const ActionData = () => ({
    ...BaseItemData(),
    ...ActionPartData(),

    result: new SchemaField(ActionResultData()),
});

export type DamageType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof DamageData>>;
export type DamageTypeType = DamageType['type']['base'];
export type ActionRollType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ActionRollData>>;
export type OpposedTestType = ActionRollType['opposed'];
export type ActionResultType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ActionResultData>>;
export type ResultActionType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ResultActionData>>;
export type MinimalActionType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof MinimalActionData>>;
export type BiofeedbackDamageType = DamageType['biofeedback'];

export class Action extends ItemBase<ReturnType<typeof ActionData>> {
    static override defineSchema() {
        return ActionData();
    }
}

