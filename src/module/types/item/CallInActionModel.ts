import { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/fields.mjs";
import { ShadowrunModel as SM } from "../ShadowrunModel";

const SummoningData: DataSchema = {
    spirit: new SchemaField({
        type: new StringField({ required: true, initial: '' }),
        force: new NumberField({ required: true, initial: 0 }),
        uuid: new StringField({ required: true, initial: '' }),
    }, { required: true }),
};

const CompilationData: DataSchema = {
    sprite: new SchemaField({
        type: new StringField({ required: true, initial: '' }),
        level: new NumberField({ required: true, initial: 0 }),
        uuid: new StringField({ required: true, initial: '' }),
    }, { required: true }),
};

const CallInActionData: DataSchema = {
    ...CompilationData,
    ...SummoningData,
    ...SM.DescriptionPartData,
    ...SM.ActionPartData,
    ...SM.ImportFlags,
    actor_type: new StringField({
        required: true,
        initial: '',
        choices: ['spirit', 'sprite', ''],
    }),
}

export class CallInAction extends foundry.abstract.TypeDataModel<typeof CallInActionData, Item> {
    static override defineSchema(): DataSchema {
        return CallInActionData;
    }
}
