import { ModifiableValue } from "./Base";
import { ConditionData } from "./Condition";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

export const TechnologyData = () => ({
    rating: new NumberField({ required: true, nullable: false, initial: 0 }),
    availability: new StringField({ required: true }),
    quantity: new NumberField({ required: true, nullable: false, initial: 0 }),
    cost: new NumberField({ required: true, nullable: false, initial: 0 }),
    equipped: new BooleanField(),
    conceal: new SchemaField(ModifiableValue()),
    condition_monitor: new SchemaField(ConditionData()),
    wireless: new BooleanField({ required: true, initial: true }),
    networkController: new StringField({ required: false }),
    calculated: new SchemaField({
        essence: new SchemaField({
            value: new NumberField({ required: true, nullable: false, initial: 0 }),
            adjusted: new BooleanField({ initial: false })
        }),
        availability: new SchemaField({
            value: new StringField({ required: true }),
            adjusted: new BooleanField({ initial: false })
        }),
        cost: new SchemaField({
            value: new NumberField({ required: true, nullable: false, initial: 0 }),
            adjusted: new BooleanField({ initial: false })
        })
    })
});

export type TechnologyType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof TechnologyData>>;
