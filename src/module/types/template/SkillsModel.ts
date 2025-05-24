const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField } = foundry.data.fields;
import { ShadowrunModel as SM } from "../ShadowrunModel";

export type SkillCategories = 'active' | 'language' | 'knowledge';

export const SkillField: DataSchema = {
    ...SM.BaseValuePair,
    ...SM.ModifiableValue,
    name: new StringField({ required: true, initial: '' }),
    hide: new BooleanField({ required: false, initial: false }),
    label: new StringField({ required: false, initial: '' }),
    bonus: new ArrayField(new SchemaField(SM.KeyValuePair)),
    //todo
    attribute: new StringField({ required: false, initial: '' }),
    _delete: new BooleanField({ required: false, initial: false }),
    specs: new ArrayField(new StringField({ required: false, initial: '' })),
    canDefault: new BooleanField({ required: false, initial: false }),
    id: new StringField({ required: false, initial: '' }),
    link: new StringField({ required: false, initial: '' }),
}

//todo
export const KnowledgeSkillList: DataSchema = {
    attribute: new StringField({ required: true, initial: '' }),
    value: new SchemaField(SkillField),
}
