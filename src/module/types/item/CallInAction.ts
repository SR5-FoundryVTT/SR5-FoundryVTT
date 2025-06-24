import { ActionRollData } from "./Action";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField, NumberField, StringField } = foundry.data.fields;

const CallInActionData = {
    action: new SchemaField(ActionRollData({ test: '' })),
    description: new SchemaField(DescriptionData()),
    importFlags: new SchemaField(ImportFlagData()),

    actor_type: new StringField({
        blank: true,
        required: true,
        choices: ['spirit', 'sprite', ''],
    }),
    spirit: new SchemaField({
        type: new StringField({ required: true }),
        force: new NumberField({ required: true, nullable: false, initial: 0 }),
        uuid: new StringField({ required: true }),
    }, { required: true }),
    sprite: new SchemaField({
        type: new StringField({ required: true }),
        level: new NumberField({ required: true, nullable: false, initial: 0 }),
        uuid: new StringField({ required: true }),
    }, { required: true }),
}


export class CallInAction extends foundry.abstract.TypeDataModel<typeof CallInActionData, Item.Implementation> {
    static override defineSchema() {
        return CallInActionData;
    }
}

console.log("CallInActionData", CallInActionData, new CallInAction());
