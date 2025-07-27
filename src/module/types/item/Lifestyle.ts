import { BaseItemData, ItemBase } from "./ItemBase";
const { NumberField, BooleanField, StringField } = foundry.data.fields;

const LifestyleData = () => ({
    ...BaseItemData(),

    type: new StringField({ required: true }),
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
}

console.log("LifestyleData", LifestyleData(), new Lifestyle());
