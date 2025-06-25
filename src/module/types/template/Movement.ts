import { ModifiableValue } from "./Base";
const { SchemaField, NumberField } = foundry.data.fields;

export const MovementField = () => ({
    ...ModifiableValue(),
    mult: new NumberField({ required: true, nullable: false, initial: 0 }),
});

export const Movement = () => ({
    walk: new SchemaField(MovementField()),
    run: new SchemaField(MovementField()),
    sprint: new NumberField({ required: true, nullable: false, initial: 0 }),
    swimming: new NumberField({ required: true, nullable: false, initial: 0 }),
});
