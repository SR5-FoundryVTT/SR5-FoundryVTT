import { ModifiableField } from "../fields/ModifiableField";
import { ModifiableValueSchema } from "./Base";
const { NumberField } = foundry.data.fields;

export const Movement = () => ({
    walk: new ModifiableField(ModifiableValueSchema()),
    run: new ModifiableField(ModifiableValueSchema()),
    sprint: new NumberField({ required: true, nullable: false, initial: 0, min: 0 }),
    swimming: new NumberField({ required: true, nullable: false, initial: 0, min: 0 }),
});
