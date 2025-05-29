const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { DescriptionPartData } from "../template/DescriptionModel";
import { ImportFlags } from "../template/ImportFlagsModel";
import { ActionPartData } from "./ActionModel";

const SummoningData = () => ({
    spirit: new SchemaField({
        type: new StringField({ required: true, initial: '' }),
        force: new NumberField({ required: true, initial: 0 }),
        uuid: new StringField({ required: true, initial: '' }),
    }, { required: true }),
});

const CompilationData = () => ({
    sprite: new SchemaField({
        type: new StringField({ required: true, initial: '' }),
        level: new NumberField({ required: true, initial: 0 }),
        uuid: new StringField({ required: true, initial: '' }),
    }, { required: true }),
});

const CallInActionData = {
    ...CompilationData,
    ...SummoningData,
    ...DescriptionPartData(),
    ...ActionPartData(),
    ...ImportFlags(),
    actor_type: new StringField({
        required: true,
        initial: '',
        blank: true,
        choices: ['spirit', 'sprite', ''],
    }),
}


export class CallInAction extends foundry.abstract.TypeDataModel<typeof CallInActionData, Item.Implementation> {
    static override defineSchema() {
        return CallInActionData;
    }
}

console.log("CallInActionData", CallInActionData, new CallInAction());
