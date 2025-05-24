const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ShadowrunModel as SM } from "../ShadowrunModel";

export const ArmorPartData: DataSchema = {
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

const ArmorData: DataSchema = {
    ...ArmorPartData,
    ...SM.DescriptionPartData,
    ...SM.ImportFlags,
    ...SM.TechnologyPartData,
};

export class Armor extends foundry.abstract.TypeDataModel<typeof ArmorData, Item> {
    static override defineSchema(): DataSchema {
        return ArmorData;
    }
}
