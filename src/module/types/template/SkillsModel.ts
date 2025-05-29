const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField, TypedObjectField } = foundry.data.fields;
import { BaseValuePair, ModifiableValue, KeyValuePair } from "./BaseModel";

export type SkillCategories = 'active' | 'language' | 'knowledge';

const SkillField = () => ({
    ...ModifiableValue(),
    name: new StringField({ required: true, initial: '' }),
    hide: new BooleanField({ required: false, initial: false }),
    label: new StringField({ required: false, initial: '' }),
    bonus: new ArrayField(new SchemaField(KeyValuePair())),
    //todo
    attribute: new StringField({ required: false, initial: '' }),
    _delete: new BooleanField({ required: false, initial: false }),
    specs: new ArrayField(new StringField({ required: false, initial: '' })),
    canDefault: new BooleanField({ required: false, initial: false }),
    id: new StringField({ required: false, initial: '' }),
    link: new StringField({ required: false, initial: '' }),
});

export const Skills = () => new TypedObjectField(new SchemaField(SkillField()), { required: true, initial: {} });

export const KnowledgeSkillList = () => ({
    attribute: new StringField({
        required: true,
        initial: 'charisma',
        choices: ["willpower", "logic", "intuition", "charisma"]
    }),
    value: Skills(),
});

export const KnowledgeSkills = () => ({
    street: new SchemaField(KnowledgeSkillList()),
    academic: new SchemaField(KnowledgeSkillList()),
    professional: new SchemaField(KnowledgeSkillList()),
    interests: new SchemaField(KnowledgeSkillList()),
});
