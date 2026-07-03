import { SR5 } from "@/module/config";
import { BaseValuePair, ModifiableValueSchema } from "./Base";
import { ConditionData } from "./Condition";
import { MatrixMasterData } from "./MatrixNetwork";
import { TechnologyAttributes } from "./Attributes";
import { ModifiableField } from "../fields/ModifiableField";
const { SchemaField, NumberField, BooleanField, StringField, DocumentUUIDField } = foundry.data.fields;

export const TechnologyData = () => ({
    // === Basic Info ===
    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 0 }),
    availability: new ModifiableField({
        ...ModifiableValueSchema(),
        restriction: new StringField({ required: true, nullable: false, initial: 'none', choices: SR5.availabilityRestrictions }),
        label: new StringField({ required: true, nullable: false, initial: '0' }),
    }),
    quantity: new NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 0 }),
    cost: new ModifiableField(ModifiableValueSchema({ integer: false })),
    equipped: new BooleanField(),

    // === Condition & Concealment ===
    conceal: new ModifiableField(ModifiableValueSchema()),
    condition_monitor: new SchemaField(ConditionData()),

    // === Wireless & Networking ===
    wireless: new StringField({
        required: true,
        initial: 'none',
        choices: SR5.wirelessModes,
    }),
    master: new DocumentUUIDField({ blank: true, required: true, nullable: false }),

    // === Essence ===
    essence: new SchemaField(BaseValuePair({ integer: false })),
});

export const TechnologyPartData = () => ({
    technology: new SchemaField(TechnologyData()),
    attributes: new SchemaField(TechnologyAttributes()),
    matrix: new SchemaField(MatrixMasterData())
});

export type TechnologyType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof TechnologyData>>;
export type AvailabilityValueType = TechnologyType['availability'];
