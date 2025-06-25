import { ModifiableValue } from "./Base";
const { SchemaField, NumberField } = foundry.data.fields;

export const MovementField = () => ({
    ...ModifiableValue(),
    mult: new NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 0 }),
});

export const Movement = () => ({
    walk: new SchemaField(MovementField()),
    run: new SchemaField(MovementField()),
    sprint: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    swimming: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
});
