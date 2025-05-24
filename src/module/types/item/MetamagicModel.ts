const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ShadowrunModel as SM } from "../ShadowrunModel";

const MetamagicData: DataSchema = {
    ...SM.DescriptionPartData,
    ...SM.ActionPartData,
    ...SM.ImportFlags,
}

export class Metamagic extends foundry.abstract.TypeDataModel<typeof MetamagicData, Item> {
    static override defineSchema(): DataSchema {
        return MetamagicData;
    }
}
