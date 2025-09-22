import { BaseItemData, ItemBase } from "./ItemBase";
import { SR5 } from '@/module/config';
const { NumberField, BooleanField, StringField } = foundry.data.fields;

const LifestyleData = () => ({
    ...BaseItemData(),

    type: new StringField({ required: true, blank: true, choice: SR5.lifestyleTypes }),
    comforts: new NumberField({ required: true, nullable: false, initial: 0 }),
    security: new NumberField({ required: true, nullable: false, initial: 0 }),
    neighborhood: new NumberField({ required: true, nullable: false, initial: 0 }),
    guests: new NumberField({ required: true, nullable: false, integer: true, initial: 0 }),
    permanent: new BooleanField(),
    cost: new NumberField({ required: true, nullable: false, initial: 0 }),
});

export class Lifestyle extends ItemBase<ReturnType<typeof LifestyleData>> {
    static override defineSchema() {
        return LifestyleData();
    }

    static override LOCALIZATION_PREFIXES = ["SR5.Lifestyle", "SR5.Item"];
}

console.log("LifestyleData", LifestyleData(), new Lifestyle());
