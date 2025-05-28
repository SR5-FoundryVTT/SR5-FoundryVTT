const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DescriptionPartData } from "../template/DescriptionModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { TechnologyPartData } from "../template/TechnologyModel";

export const ArmorPartData = () => ({
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
});

const ArmorData = {
    ...ArmorPartData(),
    ...DescriptionPartData(),
    ...ImportFlags(),
    ...TechnologyPartData(),
};

console.log("ArmorData", ArmorData);

export class Armor extends foundry.abstract.TypeDataModel<typeof ArmorData, Item.Implementation> {
    static override defineSchema() {
        return ArmorData;
    }
}
