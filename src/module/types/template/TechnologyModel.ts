import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

export const TechnologyData: DataSchema = {
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

export const TechnologyPartData: DataSchema = {
    technology: new SchemaField(TechnologyData)
}
