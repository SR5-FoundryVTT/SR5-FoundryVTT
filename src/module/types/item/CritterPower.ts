import { ArmorValueData } from "./Armor";
import { ActionRollData } from "./Action";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

const CritterPowerData = {
    action: new SchemaField(ActionRollData(), { required: true }),
    armor: new SchemaField(ArmorValueData(), { required: true }),
    description: new SchemaField(DescriptionData(), { required: true }),
    importFlags: new SchemaField(ImportFlagData(), { required: true }),

    category: new StringField({ required: true, initial: '' }),
    powerType: new StringField({ required: true, initial: '' }),
    range: new StringField({ required: true, initial: '' }),
    duration: new StringField({ required: true, initial: '' }),
    karma: new NumberField({ required: true, nullable: false, initial: 0 }),
    rating: new NumberField({ required: true, nullable: false, initial: 0 }),
    optional: new StringField({ required: true, initial: '' }),
    enabled: new BooleanField({ required: true, initial: true }),
}

// export type CritterPowerCategory = 'mundane' | 'paranormal' | 'weakness' | 'emergent' | 'drake' | 'shapeshifter' | 'free_spirit' | 'paranormal_infected' | 'echoes' | '';

export class CritterPower extends foundry.abstract.TypeDataModel<typeof CritterPowerData, Item.Implementation> {
    static override defineSchema() {
        return CritterPowerData;
    }
}

console.log("CritterPowerData", CritterPowerData, new CritterPower());
