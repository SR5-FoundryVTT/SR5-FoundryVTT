import { Typed } from "../typed";
import { SR5 } from "@/module/config";
import { ActionPartData } from "./Action";
import { BaseItemData, ItemBase } from "./ItemBase";
const { SchemaField, NumberField, StringField } = foundry.data.fields;

const CallInActionData = () => ({
    ...BaseItemData(),
    ...ActionPartData({ test: '', type: 'complex' }),

    actor_type: new StringField({
        blank: true,
        required: true,
        choices: Typed.keys(SR5.callInActorTypes),
    }),
    spirit: new SchemaField({
        type: new StringField({
            blank: true,
            required: true,
            choices: Typed.keys(SR5.spiritTypes),
        }),
        force: new NumberField({ required: true, nullable: false, integer: true, initial: 1, min: 0 }),
        uuid: new StringField({ required: true }),
    }),
    sprite: new SchemaField({
        type: new StringField({
            blank: true,
            required: true,
            choices: Typed.keys(SR5.spriteTypes),
        }),
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
