import { ActionRollData } from "./Action";
import { ImportFlagData } from "../template/ImportFlags";
import { DescriptionData } from "../template/Description";
const { SchemaField, NumberField, StringField } = foundry.data.fields;

const CallInActionData = {
    action: new SchemaField(ActionRollData({ test: '' }), { required: true }),
    description: new SchemaField(DescriptionData(), { required: true }),
    importFlags: new SchemaField(ImportFlagData(), { required: true }),

    actor_type: new StringField({
        required: true,
        initial: '',
        blank: true,
        choices: ['spirit', 'sprite', ''],
    }),
    spirit: new SchemaField({
        type: new StringField({ required: true, initial: '' }),
        force: new NumberField({ required: true, nullable: false, initial: 0 }),
        uuid: new StringField({ required: true, initial: '' }),
    }, { required: true }),
    sprite: new SchemaField({
        type: new StringField({ required: true, initial: '' }),
        level: new NumberField({ required: true, nullable: false, initial: 0 }),
        uuid: new StringField({ required: true, initial: '' }),
    }, { required: true }),
}


export class CallInAction extends foundry.abstract.TypeDataModel<typeof CallInActionData, Item.Implementation> {
    static override defineSchema() {
        return CallInActionData;
    }
}

console.log("CallInActionData", CallInActionData, new CallInAction());
