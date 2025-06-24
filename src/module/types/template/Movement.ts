import { ModifiableValue } from "./Base";
const { SchemaField, NumberField } = foundry.data.fields;

export const MovementField = () => ({
    ...ModifiableValue(),
    value: new NumberField({ required: true, nullable: false, initial: 0 }),
    mult: new NumberField({ required: true, nullable: false, initial: 0 }),
    base: new NumberField({ required: true, nullable: false, initial: 0 }),
});

export const Movement = () => ({
    walk: new SchemaField(MovementField()),
    run: new SchemaField(MovementField()),
    sprint: new NumberField({ required: true, nullable: false, initial: 0 }),
    swimming: new NumberField({ required: true, nullable: false, initial: 0 }),
});
