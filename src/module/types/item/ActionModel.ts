const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ModifiableValueLinked, BaseValuePair, ModList } from "../template/BaseModel";
import { DescriptionPartData } from "../template/DescriptionModel";
import { ImportFlags } from "../template/ImportFlagsModel";

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
    mod: new NumberField({ required: true, initial: 0 }),
    armor: new BooleanField({ required: true, initial: false }),
    limit: new SchemaField(ModifiableValueLinked())
});

export const DamageData = () => ({
    ...ModifiableValueLinked(),
    type: new SchemaField(BaseValuePair()),
    element: new SchemaField(BaseValuePair()),
    ap: new SchemaField(ModifiableValueLinked()),
    source: new SchemaField({
        actorId: new StringField({ required: true, initial: '' }),
        itemId: new StringField({ required: true, initial: '' }),
        itemName: new StringField({ required: true, initial: '' }),
        itemType: new StringField({ required: true, initial: '' }),
    }, { required: false }),
});

export const OpposedTestData = () => ({
    type: new StringField({ required: true, initial: '' }),
    description: new StringField({ required: true, initial: '' }),
    resist: new SchemaField({
        test: new StringField({ required: true, initial: '' }),
    }),
});

export const ActionRollData = () => ({
    test: new StringField({ required: true, initial: '' }),
    type: new StringField({ required: true, initial: '' }),
    categories: new ArrayField(new StringField({ required: true, initial: '' })),
    spec: new BooleanField({ required: true, initial: false }),
    mod_description: new StringField({ required: true, initial: '' }),
    threshlold: new SchemaField(BaseValuePair()),
    extended: new BooleanField({ required: true, initial: false }),
    modifiers: new ArrayField(new StringField({ required: true, initial: '' })),
    damage: new SchemaField(DamageData()),
    opposed: new SchemaField(OpposedTestData()),
    followed: new SchemaField({
        test: new StringField({ required: true, initial: '' })
    }),
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
