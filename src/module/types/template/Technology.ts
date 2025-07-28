import { ModifiableValue } from "./Base";
import { ConditionData } from "./Condition";
import { ModifiableField } from "../fields/ModifiableField";
const { SchemaField, NumberField, BooleanField, StringField, DocumentUUIDField } = foundry.data.fields;

export const TechnologyData = () => ({
    // === Basic Info ===
    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 0 }),
    availability: new StringField({ required: true }),
    quantity: new NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 0 }),
    cost: new NumberField({ required: true, nullable: false, initial: 0 }),
    equipped: new BooleanField(),

    // === Condition & Concealment ===
    conceal: new ModifiableField(ModifiableValue()),
    condition_monitor: new SchemaField(ConditionData()),

    // === Wireless & Networking ===
    wireless: new BooleanField({ required: true, initial: true }),
    master: new DocumentUUIDField(),
    networkController: new StringField({ required: false }),

    // === Calculated Values ===
    calculated: new SchemaField({
        essence: new SchemaField({
            value: new NumberField({ required: true, nullable: false, initial: 0 }),
            adjusted: new BooleanField({ initial: false }),
        }),
        availability: new SchemaField({
            value: new StringField({ required: true }),
            adjusted: new BooleanField({ initial: false }),
        }),
        cost: new SchemaField({
            value: new NumberField({ required: true, nullable: false, initial: 0 }),
            adjusted: new BooleanField({ initial: false }),
        }),
    }),
});

export type TechnologyType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof TechnologyData>>;
