const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DataSchema } from "node_modules/fvtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

export const TechnologyData = {
    rating: new NumberField({ required: true, initial: 0 }),
    availability: new StringField({ required: true, initial: '' }),
    quantity: new NumberField({ required: true, initial: 0 }),
    cost: new NumberField({ required: true, initial: 0 }),
    equipped: new BooleanField({ required: false, initial: false }),
    conceal: new SchemaField(SM.ModifiableValue),
    condition_monitor: new SchemaField(SM.ConditionData),
    wireless: new BooleanField({ required: false, initial: false }),
    networkController: new StringField({ required: false, initial: '' }),
}

export const TechnologyPartData = {
    technology: new SchemaField(TechnologyData)
}
