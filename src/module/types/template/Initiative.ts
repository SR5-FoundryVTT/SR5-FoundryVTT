import { SR5 } from "@/module/config";
import { ModifiableField } from "../fields/ModifiableField";
import { ModifiableValueSchema } from "./Base";
const { SchemaField, BooleanField, StringField, NumberField } = foundry.data.fields;

type InitiativeFormulaDefaults = {
    attributeA: string;
    attributeB: string;
    constant: number;
    dice: number;
};

const InitiativeFormulaSchema = (defaults: InitiativeFormulaDefaults) => ({
    attribute_a: new StringField({ required: true, initial: defaults.attributeA, blank: true, choices: SR5.attributes }),
    attribute_b: new StringField({ required: true, initial: defaults.attributeB, blank: true, choices: SR5.attributes }),
    constant: new NumberField({ required: true, nullable: false, integer: true, initial: defaults.constant }),
    dice: new NumberField({ required: true, nullable: false, integer: true, initial: defaults.dice, min: 0, max: 5, step: 1 }),
});

export const InitiativeSchema = (defaults: InitiativeFormulaDefaults) => ({
    base: new ModifiableField(ModifiableValueSchema()),
    dice: new ModifiableField({
        ...ModifiableValueSchema(),
        text: new StringField({ required: true }),
    }),
    formula: new SchemaField(InitiativeFormulaSchema(defaults)),
});

export const Initiative = <
    T extends Partial<Record<Shadowrun.SpaceTypes, InitiativeFormulaDefaults>>,
>(formulaDefaults: T) => {
    const types = Object.keys(formulaDefaults) as Array<keyof T & Shadowrun.SpaceTypes>;
    const currentType = types[0];
    const currentDefaults = formulaDefaults[currentType];
    if (!currentDefaults)
        throw new Error("Initiative requires at least one formula default mode");

    const initiativeField = (defaults: InitiativeFormulaDefaults) => new SchemaField(InitiativeSchema(defaults));

    const fields = {
        current: initiativeField(currentDefaults),
        blitz: new BooleanField(),
        perception: new StringField({ required: true, initial: currentType, choices: types }),
    } as const;

    return {
        ...fields,
        ...Object.fromEntries(types.map(type => [type, initiativeField(formulaDefaults[type]!)]))
    } as unknown as typeof fields & { [K in keyof T]-?: ReturnType<typeof initiativeField> };
};

export type InitiativeType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof InitiativeSchema>>;
