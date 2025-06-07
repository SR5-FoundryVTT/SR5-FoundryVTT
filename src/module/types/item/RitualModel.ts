import { DescriptionPartData } from "../template/DescriptionModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { ActionPartData } from "./ActionModel";

const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const RitualData = {
    ...DescriptionPartData(),
    ...ImportFlags(),
    ...ActionPartData(),
    type: new StringField({ required: true, initial: '' }),
    descriptors: new StringField({ required: true, initial: '' }),
};

export class Ritual extends foundry.abstract.TypeDataModel<typeof RitualData, Item.Implementation> {
    static override defineSchema() {
        return RitualData;
    }
}

console.log("Ritual", RitualData, new Ritual());
