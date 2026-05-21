import { SR5 } from "@/module/config";
import { ModifiableField } from "../fields/ModifiableField";
import { ModifiableValueSchema } from "./Base";
const { SchemaField, BooleanField, StringField } = foundry.data.fields;

type InitiativeFormulaDefaults = {
    attributeA: string;
    attributeB: string;
    constant: number;
    dice: number;
};

export const InitiativeSchema = (defaults: InitiativeFormulaDefaults) => ({
    constant: new ModifiableField({
        ...ModifiableValueSchema({ baseValue: defaults.constant }),
    }),
    dice: new ModifiableField({
        ...ModifiableValueSchema({ baseValue: defaults.dice }),
        text: new StringField({ required: true, initial: `${defaults.dice}d6` }),
    }),
    attribute_a: new StringField({ required: true, initial: defaults.attributeA, blank: true, choices: SR5.attributes }),
    attribute_b: new StringField({ required: true, initial: defaults.attributeB, blank: true, choices: SR5.attributes }),
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
