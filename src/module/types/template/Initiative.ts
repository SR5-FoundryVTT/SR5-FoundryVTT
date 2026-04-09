import { ModifiableField } from "../fields/ModifiableField";
import { ModifiableValue } from "./Base";
const { SchemaField, BooleanField, StringField } = foundry.data.fields;

const InitiativeSchema = () => ({
    base: new ModifiableField(ModifiableValue()),
    dice: new ModifiableField({
        ...ModifiableValue(),
        text: new StringField({ required: true }),
    }),
});

export const Initiative = <
    T extends Shadowrun.SpaceTypes[] = ['meatspace', 'astral', 'matrix']
>(...types: T) => {
    const initiativeField = () => new SchemaField(InitiativeSchema());

    const fields = {
        current: initiativeField(),
        blitz: new BooleanField(),
        perception: new StringField({ required: true, initial: types[0], choices: types }),
    } as const;

    return {
        ...fields,
        ...Object.fromEntries(types.map(type => [type, initiativeField()]))
    } as unknown as typeof fields & Record<T[number], ReturnType<typeof initiativeField>>;
};

export type InitiativeType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof InitiativeSchema>>;