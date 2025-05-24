const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DataSchema } from "node_modules/fvtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const LicenseData = {
    name: new StringField({ required: true, initial: '' }),
    rtg: new StringField({ required: true, initial: '' }),
    description: new HTMLField({ required: true, initial: '' }),
}

const SinData = {
    ...SM.DescriptionPartData,
    ...SM.TechnologyPartData,
    ...SM.ImportFlags,
    licences: new ArrayField(new SchemaField(LicenseData), { required: true, initial: [] }),
}

export class Sin extends foundry.abstract.TypeDataModel<typeof SinData, Item.Implementation> {
    static override defineSchema() {
        return SinData;
    }
}
