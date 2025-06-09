import { ModifiableValueLinked, BaseValuePair, ModList } from "../template/BaseModel";
import { DescriptionPartData } from "../template/DescriptionModel";
import { ImportFlags } from "../template/ImportFlagsModel";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const ActionResultData = () => ({
    success: new SchemaField({
        matrix: new SchemaField({
            placeMarks: new BooleanField({ required: true, initial: false }),
        }),
    })
});

export const MinimalActionData = () => ({
    skill: new StringField({ required: true, initial: '' }),
    attribute: new StringField({ required: true, initial: '' }),
    attribute2: new StringField({ required: true, initial: '' }),
    mod: new NumberField({ required: true, nullable: false, initial: 0 }),
    armor: new BooleanField({ required: true, initial: false }),
    limit: new SchemaField(ModifiableValueLinked())
});

export const DamageData = () => ({
    ...ModifiableValueLinked(),
    type: new SchemaField({
        base: new StringField({
            blank: true,
            required: true,
            initial: 'physical',
            choices: ["physical", "matrix", "stun", ""]
        }),
        value: new StringField({
            blank: true,
            required: true,
            initial: 'physical',
            choices: ["physical", "matrix", "stun", ""]
        }),
    }),
    element: new SchemaField({
        base: new StringField({
            required: true,
            initial: '',
            blank: true,
            choices: ["fire", "cold", "acid", "electricity", "radiation", '']
        }),
        value: new StringField({
            required: true,
            initial: '',
            blank: true,
            choices: ["fire", "cold", "acid", "electricity", "radiation", '']
        }),
    }),
    ap: new SchemaField(ModifiableValueLinked()),
    source: new SchemaField({
        actorId: new StringField({ required: true, initial: '' }),
        itemId: new StringField({ required: true, initial: '' }),
        itemName: new StringField({ required: true, initial: '' }),
        itemType: new StringField({ required: true, initial: '' }),
    }, { required: true }),
});

export const OpposedTestData = () => ({
    type: new StringField({ required: true, initial: '' }),
    description: new StringField({ required: true, initial: '' }),
    mod: new NumberField({ required: true, nullable: false, initial: 0 }), // Does it use it?
    skill: new StringField({ required: true, initial: '' }), // Does it use it?
    attribute: new StringField({ required: true, initial: '' }), // Does it use it?
    attribute2: new StringField({ required: true, initial: '' }), // Does it use it?
    test: new StringField({ required: true, initial: '' }), // Does it use it?
    resist: new SchemaField({ // Does it use it?
        test: new StringField({ required: true, initial: '' }),
    }),
});

export const ActionRollData = () => ({
    ...MinimalActionData(),
    test: new StringField({ required: true, initial: '' }),
    type: new StringField({ required: true, initial: '' }),
    categories: new ArrayField(new StringField({ required: true, initial: '' })),
    spec: new BooleanField({ required: true, initial: false }),
    mod_description: new StringField({ required: true, initial: '' }),
    threshold: new SchemaField(BaseValuePair()),
    extended: new BooleanField({ required: true, initial: false }),
    modifiers: new ArrayField(new StringField({ required: true, initial: '' })),
    damage: new SchemaField(DamageData()),
    opposed: new SchemaField(OpposedTestData()),
    followed: new SchemaField({
        test: new StringField({ required: true, initial: '' }),
        mod: new NumberField({ required: true, nullable: false, initial: 0 }), // Does it use it?
        skill: new StringField({ required: true, initial: '' }), // Does it use it?
        attribute: new StringField({ required: true, initial: '' }), // Does it use it?
        attribute2: new StringField({ required: true, initial: '' }), // Does it use it?
    }),
    alt_mod: new NumberField({ required: true, initial: 0 }),
    dice_pool_mod: ModList(),
    rool_mode: new StringField({ required: true, initial: '' }),
});

export const ActionPartData = () => ({
    action: new SchemaField(ActionRollData()),
});

const ActionData = {
    ...ActionPartData(),
    ...ImportFlags(),
    ...DescriptionPartData(),
    result: new SchemaField(ActionResultData()),
};


export class Action extends foundry.abstract.TypeDataModel<typeof ActionData, Item.Implementation> {
    static override defineSchema() {
        return ActionData;
    }
};

console.log("ActionData", ActionData, new Action());

export type DamageType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof DamageData>>;
export type ActionRollType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ActionRollData>>;
export type OpposedTestType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof OpposedTestData>>;
export type ActionResultType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof ActionResultData>>;
export type MinimalActionType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof MinimalActionData>>;
