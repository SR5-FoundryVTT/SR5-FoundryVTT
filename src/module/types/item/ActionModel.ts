import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

export const ActionTypeLabel: DataSchema = {
    label: new StringField({ required: true, initial: '' }),
    uuid: new StringField({ required: true, initial: '' }),
};

export const ActionResultData: DataSchema = {
    success: new SchemaField({
        matrix: new SchemaField({
            placeMarks: new BooleanField({ required: true, initial: false }),
        } as DataSchema),
    } as DataSchema)
};

export const MinimalActionData: DataSchema = {
    skill: new StringField({ required: true, initial: '' }),
    attribute: new StringField({ required: true, initial: '' }),
    attribute2: new StringField({ required: true, initial: '' }),
    mod: new NumberField({ required: true, initial: 0 }),
    armor: new BooleanField({ required: true, initial: false }),
    limit: new SchemaField(SM.ModifiableValueLinked)
};

export const DamageData: DataSchema = {
    ...SM.ModifiableValueLinked,
    type: new SchemaField(SM.BaseValuePair),
    element: new SchemaField(SM.BaseValuePair),
    ap: new SchemaField(SM.ModifiableValueLinked),
    source: new SchemaField({
        actorId: new StringField({ required: true, initial: '' }),
        itemId: new StringField({ required: true, initial: '' }),
        itemName: new StringField({ required: true, initial: '' }),
        itemType: new StringField({ required: true, initial: '' }),
    }, { required: false }),
};

export const OpposedTestData: DataSchema = {
    type: new StringField({ required: true, initial: '' }),
    description: new StringField({ required: true, initial: '' }),
    resist: new SchemaField({
        test: new StringField({ required: true, initial: '' }),
    }),
};

export const ActionRollData: DataSchema = {
    test: new StringField({ required: true, initial: '' }),
    type: new StringField({ required: true, initial: '' }),
    categories: new ArrayField(new StringField({ required: true, initial: '' })),
    spec: new BooleanField({ required: true, initial: false }),
    mod_description: new StringField({ required: true, initial: '' }),
    threshlold: new SchemaField(SM.BaseValuePair),
    extended: new BooleanField({ required: true, initial: false }),
    modifiers: new ArrayField(new StringField({ required: true, initial: '' })),
    damage: new SchemaField(DamageData),
    opposed: new SchemaField(OpposedTestData),
    followed: new SchemaField({
        test: new StringField({ required: true, initial: '' })
    }),
    dice_pool_mod: new SchemaField(SM.ModList),
    rool_mode: new StringField({ required: true, initial: '' }),
};

export const ActionPartData: DataSchema = {
    action: new SchemaField(ActionRollData),
};

export const ActionData: DataSchema = {
    ...ActionPartData,
    ...SM.ImportFlags,
    ...SM.DescriptionPartData,
    result: new SchemaField(ActionResultData),
};

export class Action extends foundry.abstract.TypeDataModel<typeof ActionData, Item> {
    static override defineSchema(): DataSchema {
        return ActionData;
    }
}
