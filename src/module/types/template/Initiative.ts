import { ModifiableField } from "../fields/ModifiableField";
import { ModifiableValue } from "./Base";
const { SchemaField, BooleanField, StringField } = foundry.data.fields;

export const InitiativeType = () => ({
    base: new ModifiableField(ModifiableValue()),
    dice: new ModifiableField({
        ...ModifiableValue(),
        text: new StringField({ required: true }),
    }),
});

export const Initiative = <
    T extends Shadowrun.SpaceTypes[] = ['meatspace', 'astral', 'matrix']
>(...types: T) => {
    const initiativeField = () => new SchemaField(InitiativeType());

    const fields = {
        current: initiativeField(),
        edge: new BooleanField(),
        perception: new StringField({ required: true, initial: types[0], choices: types }),
    }

    return {
        ...fields,
        ...Object.fromEntries(types.map(type => [type, initiativeField()]))
    } as unknown as typeof fields & {
        [K in T[number]]: ReturnType<typeof initiativeField>;
    };
};
