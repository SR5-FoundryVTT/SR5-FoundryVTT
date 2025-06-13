import { ArmorPartData } from "./Armor";
import { ActionPartData } from "./Action";
import { ImportFlags } from "../template/ImportFlags";
import { DescriptionPartData } from "../template/Description";
const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;

const CritterPowerData = {
    ...DescriptionPartData(),
    ...ActionPartData(),
    ...ImportFlags(),
    ...ArmorPartData(),
    category: new StringField({ required: true, initial: '' }),
    powerType: new StringField({ required: true, initial: '' }),
    range: new StringField({ required: true, initial: '' }),
    duration: new StringField({ required: true, initial: '' }),
    karma: new NumberField({ required: true, nullable: false, initial: 0 }),
    rating: new NumberField({ required: true, nullable: false, initial: 0 }),
    optional: new StringField({ required: true, initial: '' }),
    enabled: new BooleanField({ required: true, initial: false }),
}

// export type CritterPowerCategory = 'mundane' | 'paranormal' | 'weakness' | 'emergent' | 'drake' | 'shapeshifter' | 'free_spirit' | 'paranormal_infected' | 'echoes' | '';

export class CritterPower extends foundry.abstract.TypeDataModel<typeof CritterPowerData, Item.Implementation> {
    static override defineSchema() {
        return CritterPowerData;
    }
}

console.log("CritterPowerData", CritterPowerData, new CritterPower());
