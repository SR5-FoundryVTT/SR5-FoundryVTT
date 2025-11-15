import { ModifiableField } from "../fields/ModifiableField";
import { ModifiableValue } from "./Base";
const { NumberField } = foundry.data.fields;

export const Movement = () => ({
    walk: new ModifiableField(ModifiableValue()),
    run: new ModifiableField(ModifiableValue()),
    sprint: new NumberField({ required: true, nullable: false, initial: 0, min: 0 }),
    swimming: new NumberField({ required: true, nullable: false, initial: 0, min: 0 }),
});
