import { ActionPartData } from "./Action";
import { BaseItemData, ItemBase } from "./ItemBase";
const { SchemaField, NumberField, StringField } = foundry.data.fields;

const CallInActionData = () => ({
    ...BaseItemData(),
    ...ActionPartData({ test: '', type: 'complex' }),

    actor_type: new StringField({
        blank: true,
        required: true,
        choices: ['spirit', 'sprite'],
    }),
    spirit: new SchemaField({
        type: new StringField({ required: true }),
        force: new NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 0 }),
        uuid: new StringField({ required: true }),
    }),
    sprite: new SchemaField({
        type: new StringField({ required: true }),
        level: new NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 0 }),
        uuid: new StringField({ required: true }),
    }),
});

export class CallInAction extends ItemBase<ReturnType<typeof CallInActionData>> {
    static override defineSchema() {
        return CallInActionData();
    }
}

console.log("CallInActionData", CallInActionData(), new CallInAction());
