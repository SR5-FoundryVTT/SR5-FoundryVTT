const { DataField, HTMLField, SchemaField, SetField, NumberField, BooleanField, ObjectField, ArrayField, AnyField, StringField, TypedObjectField } = foundry.data.fields;
import { BaseValuePair, ModifiableValue, KeyValuePair } from "./BaseModel";

export type SkillCategories = 'active' | 'language' | 'knowledge';

export const SkillField = () => ({
    ...ModifiableValue(),
    name: new StringField({ required: true, initial: '' }),
    hidden: new BooleanField({ required: true, initial: false }),
    label: new StringField({ required: true, initial: '' }),
    bonus: new ArrayField(new SchemaField(KeyValuePair())),
    attribute: new StringField({ required: true, initial: '' }),
    _delete: new BooleanField({ required: true, initial: false }), // Does it use it?
    specs: new ArrayField(new StringField({ required: true, initial: '' })),
    canDefault: new BooleanField({ required: true, initial: false }),
    id: new StringField({ required: true, initial: '' }),
    link: new StringField({ required: true, initial: '' }),
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

export type SkillFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof SkillField>>;
// Not yet implemented in fvtt-types curently
export type SkillsType = Record<string, SkillFieldType>;
