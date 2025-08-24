import { ModifiableValue } from "./Base";
import { ConditionData } from "./Condition";
import { MatrixMasterData } from "./MatrixNetwork";
import { TechnologyAttributes } from "./Attributes";
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
    wireless: new StringField({
        required: true,
        initial: 'none',
        choices: ['online', 'silent', 'offline', 'none'],
    }),
    master: new DocumentUUIDField({ blank: true, required: true, nullable: false }),

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

export const TechnologyPartData = () => ({
    technology: new SchemaField(TechnologyData()),
    attributes: new SchemaField(TechnologyAttributes()),
    matrix: new SchemaField(MatrixMasterData())
});

export type TechnologyType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof TechnologyData>>;
