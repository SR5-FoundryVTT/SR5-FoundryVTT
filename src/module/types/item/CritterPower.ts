import { ArmorValueData } from "./Armor";
import { ActionRollData } from "./Action";
import { BaseItemData, ItemBase } from "./ItemBase";
const { SchemaField, NumberField, BooleanField, StringField } = foundry.data.fields;

export const CritterPowerCategories = ['mundane', 'paranormal', 'weakness', 'emergent', 'drake', 'shapeshifter', 'free_spirit', 'paranormal_infected', 'echoes'] as const;

const CritterPowerData = () => ({
    ...BaseItemData(),
    action: new SchemaField(ActionRollData()),
    armor: new SchemaField(ArmorValueData()),

    category: new StringField({
        blank: true,
        required: true,
        choices: CritterPowerCategories,
    }),
    powerType: new StringField({ required: true }),
    range: new StringField({ required: true }),
    duration: new StringField({ required: true, initial: "always" }),
    karma: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    optional: new StringField({ required: true, initial: "standard", choices: ['standard', 'enabled_option', 'disabled_option'] }),
    enabled: new BooleanField({ initial: true }),
});

export class CritterPower extends ItemBase<ReturnType<typeof CritterPowerData>> {
    static override defineSchema() {
        return CritterPowerData();
    }
}

console.log("CritterPowerData", CritterPowerData(), new CritterPower());
