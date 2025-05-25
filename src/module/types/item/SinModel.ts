const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DescriptionPartData } from "../template/DescriptionModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { TechnologyPartData } from "../template/TechnologyModel";

const LicenseData = {
    name: new StringField({ required: true, initial: '' }),
    rtg: new StringField({ required: true, initial: '' }),
    description: new HTMLField({ required: true, initial: '' }),
}

const SinData = {
    ...DescriptionPartData,
    ...TechnologyPartData,
    ...ImportFlags,
    licenses: new ArrayField(new SchemaField(LicenseData), { required: true, initial: [] }),
}

export class Sin extends foundry.abstract.TypeDataModel<typeof SinData, Item.Implementation> {
    static override defineSchema() {
        return SinData;
    }
}
