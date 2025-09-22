import { ArmorPartData } from "./Armor";
import { ActionPartData } from "./Action";
import { BaseItemData, ItemBase } from "./ItemBase";
import { SR5 } from '@/module/config';
const { NumberField, BooleanField, StringField } = foundry.data.fields;

export const CritterPowerCategories = ['mundane', 'paranormal', 'weakness', 'emergent', 'drake', 'shapeshifter', 'free_spirit', 'paranormal_infected', 'echoes'] as const;

const CritterPowerData = () => ({
    ...BaseItemData(),
    ...ActionPartData(),
    ...ArmorPartData(),

    category: new StringField({
        blank: true,
        required: true,
        choices: CritterPowerCategories,
    }),
    powerType: new StringField({ required: true, blank: true, choices: SR5.critterPower.types }),
    range: new StringField({ required: true, blank: true, choices: SR5.critterPower.ranges }),
    duration: new StringField({ required: true, initial: "always", choices: SR5.critterPower.durations }),
    karma: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    optional: new StringField({ required: true, initial: "standard", choices: SR5.critterPower.optional }),
    enabled: new BooleanField({ initial: true }),
});

export class CritterPower extends ItemBase<ReturnType<typeof CritterPowerData>> {
    static override defineSchema() {
        return CritterPowerData();
    }

    static override LOCALIZATION_PREFIXES = ["SR5.CritterPower", "SR5.Item"];
}

console.log("CritterPowerData", CritterPowerData(), new CritterPower());
