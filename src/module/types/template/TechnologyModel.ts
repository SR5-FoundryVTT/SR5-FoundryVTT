const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ModifiableValue } from "./BaseModel";
import { ConditionData } from "./ConditionModel";

const TechnologyData = () => ({
    rating: new NumberField({ required: true, initial: 0 }),
    availability: new StringField({ required: true, initial: '' }),
    quantity: new NumberField({ required: true, initial: 0 }),
    cost: new NumberField({ required: true, initial: 0 }),
    equipped: new BooleanField({ required: false, initial: false }),
    conceal: new SchemaField(ModifiableValue()),
    condition_monitor: new SchemaField(ConditionData()),
    wireless: new BooleanField({ required: false, initial: false }),
    networkController: new StringField({ required: false, initial: '' }),
});

export const TechnologyPartData = () => ({
    technology: new SchemaField(TechnologyData())
});
