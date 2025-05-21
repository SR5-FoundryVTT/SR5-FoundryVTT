import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const MovementField: DataSchema = {
    ...SM.ModifiableValue,
    value: new NumberField({ required: true, initial: 0 }),
    mult: new NumberField({ required: true, initial: 0 }),
    base: new NumberField({ required: true, initial: 0 }),
}

export const Movement: DataSchema = {
    walk: new SchemaField(MovementField),
    run: new SchemaField(MovementField),
    sprint: new NumberField({ required: true, initial: 0 }),
    swimming: new NumberField({ required: true, initial: 0 }),
}
