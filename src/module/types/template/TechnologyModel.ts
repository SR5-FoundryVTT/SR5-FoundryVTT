import { ModifiableValue } from "./BaseModel";
import { ConditionData } from "./ConditionModel";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

export const TechnologyData = () => ({
    rating: new NumberField({ required: true, nullable: false, initial: 0 }),
    availability: new StringField({ required: true, initial: '' }),
    quantity: new NumberField({ required: true, nullable: false, initial: 0 }),
    cost: new NumberField({ required: true, nullable: false, initial: 0 }),
    equipped: new BooleanField({ initial: false }),
    conceal: new SchemaField(ModifiableValue()),
    condition_monitor: new SchemaField(ConditionData()),
    wireless: new BooleanField({ required: false, initial: false }),
    networkController: new StringField({ required: false, initial: '' }),
    calculated: new SchemaField({
        essence: new SchemaField({
            value: new NumberField({ required: true, nullable: false, initial: 0 }),
            adjusted: new BooleanField({ initial: false })
        }, { required: true }),
        availability: new SchemaField({
            value: new StringField({ required: true, initial: '' }),
            adjusted: new BooleanField({ initial: false })
        }, { required: true }),
        cost: new SchemaField({
            value: new NumberField({ required: true, nullable: false, initial: 0 }),
            adjusted: new BooleanField({ initial: false })
        }, { required: true })
    }, { required: true })
});

export type TechnologyType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof TechnologyData>>;

export const TechnologyPartData = () => ({
    technology: new SchemaField(TechnologyData())
});
