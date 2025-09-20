import { ModifiableField } from "../fields/ModifiableField";
import { ModifiableValue } from "./Base";
const { NumberField } = foundry.data.fields;

export const MovementField = () => ({
    ...ModifiableValue(),
    mult: new NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 0 }),
});

export const Movement = () => ({
    walk: new ModifiableField(MovementField()),
    run: new ModifiableField(MovementField()),
    sprint: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    swimming: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
});
