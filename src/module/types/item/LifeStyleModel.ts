const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DescriptionPartData } from "../template/DescriptionModel";
import { ImportFlags } from "../template/ImportFlagsModel";

const LifestyleData = {
    ...DescriptionPartData(),
    ...ImportFlags(),
    type: new StringField({ required: true, initial: '' }),
    comforts: new NumberField({ required: true, initial: 0 }),
    security: new NumberField({ required: true, initial: 0 }),
    neighborhood: new NumberField({ required: true, initial: 0 }),
    guests: new NumberField({ required: true, initial: 0 }),
    permanent: new BooleanField({ required: true, initial: false }),
    cost: new NumberField({ required: true, initial: 0 }),
    // todo what the hell is this?
    // mods: new ArrayField({ required: true, initial: [] }),
}

console.log("LifestyleData", LifestyleData);

export class Lifestyle extends foundry.abstract.TypeDataModel<typeof LifestyleData, Item.Implementation> {
    static override defineSchema() {
        return LifestyleData;
    }
}
