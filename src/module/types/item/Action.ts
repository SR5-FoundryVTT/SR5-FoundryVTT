import { BaseItemData, ItemBase } from "./ItemBase";
import { ModifiableField } from "../fields/ModifiableField";
import { ModifiableValueLinked, BaseValuePair, ModList } from "../template/Base";
const { SchemaField, NumberField, BooleanField, ArrayField, StringField } = foundry.data.fields;

const ResultActionData = () => ({
    action: new StringField({
        blank: true,
        required: true,
        choices: ['modifyCombatantInit', 'forceReboot']
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
    attribute: new StringField({ required: true }),
    attribute2: new StringField({ required: true }),
    armor: new BooleanField(),
    limit: new ModifiableField(ModifiableValueLinked()),
    mod: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    skill: new StringField({ required: true }),
});

export const ActionCategory = () => ({
    matrix: new SchemaField({
        owner: new BooleanField(),
        marks: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    }),
});

export const DamageData = () => ({
    ...ModifiableValueLinked(),
    type: new SchemaField({
        base: new StringField({
            blank: true,
            required: true,
            choices: ["physical", "matrix", "stun"]
        }),
        value: new StringField({
            blank: true,
            required: true,
            choices: ["physical", "matrix", "stun"]
        }),
    }),
    element: new SchemaField({
        base: new StringField({
            blank: true,
            required: true,
            choices: ["fire", "cold", "acid", "electricity", "radiation"]
        }),
        value: new StringField({
            blank: true,
            required: true,
            choices: ["fire", "cold", "acid", "electricity", "radiation"]
        }),
    }),
    ap: new ModifiableField(ModifiableValueLinked()),
    biofeedback: new StringField({
        required: true,
        blank: true,
        choices: ["physical", "stun"],
    }),
    attribute: new StringField({ required: true }),
    source: new SchemaField({
        actorId: new StringField({ required: true }),
        itemId: new StringField({ required: true }),
        itemName: new StringField({ required: true }),
        itemType: new StringField({ required: true }),
    }, { required: false }),
});

export const ActionRollData = (
    {
        test = 'SuccessTest',
        opposedTest = '',
        resistTest = '',
        followedTest = '',
        type = ''
    }: {
        test?: string;
        opposedTest?: string;
        resistTest?: string;
        followedTest?: string;
        type?: string;
    } = {}
) => ({
    ...MinimalActionData(),
    test: new StringField({ required: true, initial: test }),
    type: new StringField({ required: true, initial: type }),
    category: new SchemaField(ActionCategory()),
    categories: new ArrayField(new StringField({ required: true })),
    spec: new BooleanField(),
    mod_description: new StringField({ required: true }),
    threshold: new SchemaField(BaseValuePair()),
    extended: new BooleanField({ initial: false }),
    modifiers: new ArrayField(new StringField({ required: true })),
    damage: new ModifiableField(DamageData()),
    opposed: new SchemaField({
        test: new StringField({ required: true, initial: opposedTest }),
        type: new StringField({ required: true }),
        description: new StringField({ required: true }),
        mod: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
        skill: new StringField({ required: true }),
        attribute: new StringField({ required: true }),
        attribute2: new StringField({ required: true }),
        armor: new BooleanField(),
        resist: new SchemaField({
            test: new StringField({ required: true, initial: resistTest }),
            skill: new StringField({ required: true }),
            mod: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
            attribute: new StringField({ required: true }),
            attribute2: new StringField({ required: true }),
            armor: new BooleanField(),
        }),
    }),
    followed: new SchemaField({
        test: new StringField({ required: true, initial: followedTest }),
        mod: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
        skill: new StringField({ required: true }),
        attribute: new StringField({ required: true }),
        attribute2: new StringField({ required: true }),
        armor: new BooleanField(),
    }),
    alt_mod: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    dice_pool_mod: ModList(),
    roll_mode: new StringField({
        blank: true,
        required: true,
        choices: CONFIG.Dice.rollModes,
    }),
});

export const ActionPartData = (args: {
    test?: string;
    opposedTest?: string;
    resistTest?: string;
    followedTest?: string;
    type?: string;
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

console.log("ActionData", ActionData(), new Action());
