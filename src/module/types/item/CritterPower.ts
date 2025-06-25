import { ArmorValueData } from "./Armor";
import { ActionRollData } from "./Action";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

const CritterPowerData = {
    action: new SchemaField(ActionRollData()),
    armor: new SchemaField(ArmorValueData()),
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),

    category: new StringField({ required: true }),
    powerType: new StringField({ required: true }),
    range: new StringField({ required: true }),
    duration: new StringField({ required: true, initial: "always" }),
    karma: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    optional: new StringField({ required: true, initial: "standard" }),
    enabled: new BooleanField({ initial: true }),
}

// export type CritterPowerCategory = 'mundane' | 'paranormal' | 'weakness' | 'emergent' | 'drake' | 'shapeshifter' | 'free_spirit' | 'paranormal_infected' | 'echoes' | '';

export class CritterPower extends foundry.abstract.TypeDataModel<typeof CritterPowerData, Item.Implementation> {
    static override defineSchema() {
        return CritterPowerData;
    }
}

console.log("CritterPowerData", CritterPowerData, new CritterPower());
