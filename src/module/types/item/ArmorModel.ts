const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DataSchema } from "node_modules/fvtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

export const ArmorPartData = {
    armor: new SchemaField({
        mod: new BooleanField({ required: true, initial: false }),
        value: new NumberField({ required: true, initial: 0 }),
        acid: new NumberField({ required: true, initial: 0 }),
        cold: new NumberField({ required: true, initial: 0 }),
        fire: new NumberField({ required: true, initial: 0 }),
        electricity: new NumberField({ required: true, initial: 0 }),
        radiation: new NumberField({ required: true, initial: 0 }),
        hardened: new BooleanField({ required: true, initial: false }),
    }, { required: true })
};

const ArmorData = {
    ...ArmorPartData,
    ...SM.DescriptionPartData,
    ...SM.ImportFlags,
    ...SM.TechnologyPartData,
};

export class Armor extends foundry.abstract.TypeDataModel<typeof ArmorData, Item.Implementation> {
    static override defineSchema(): DataSchema {
        return ArmorData;
    }
}
