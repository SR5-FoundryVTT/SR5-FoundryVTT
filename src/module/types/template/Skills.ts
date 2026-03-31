import { SR5 } from "@/module/config";
import { ModifiableValue } from "./Base";
import { ModifiableField } from "../fields/ModifiableField";
import { FixedTypeObjectField } from "../fields/FixedTypeObjectField";
const { SchemaField, BooleanField, ArrayField, StringField, TypedObjectField, HTMLField } = foundry.data.fields;

export type SkillCategories = 'active' | 'language' | 'knowledge';

export const SkillField = () => ({
    ...ModifiableValue(),
    name: new StringField({ required: true }),
    key: new StringField({ required: true }),
    img: new StringField({ required: true }),
    description: new HTMLField({ required: true }),
    label: new StringField({ required: true }),
    attribute: new StringField({
        blank: true,
        required: true,
        choices: SR5.attributes
    }),
    limit: new StringField({
        blank: true,
        required: true,
        choices: SR5.limits
    }),
    specs: new ArrayField(new StringField({ required: true })),
    canDefault: new BooleanField({ initial: true }),
    isNative: new BooleanField({ initial: false }), // this only actually applies to language skills
    id: new StringField({ required: true }),
    link: new StringField({ required: true }),
    group: new StringField({ required: true }),
    requirement: new StringField({ required: true, initial: 'mundane', choices: SR5.specialTypes })
});

/**
 * Derived Data structure build from an actors skill items.
 * will use skill item id as key and derived ModifiableSkillField as value
 */
export const Skills = () => new FixedTypeObjectField(
    new ModifiableField(SkillField()),
    {
        required: true,
        initial: {}
    }
);

export const KnowledgeSkillList = (initialAttribute: string) => ({
    attribute: new StringField({
        required: true,
        initial: initialAttribute,
        choices: ["willpower", "logic", "intuition", "charisma"]
    }),
    value: new TypedObjectField(new ModifiableField(SkillField()), {required: true, initial: {}}),
});

export const KnowledgeSkills = () => ({
    street: Skills(),
    academic: Skills(),
    professional: Skills(),
    interests: Skills(),
});

// Not yet implemented in fvtt-types curently
export type SkillsType = Record<string, SkillFieldType>;
export type SkillFieldType = foundry.data.fields.SchemaField.InitializedData<ReturnType<typeof SkillField>>;
export type KnowledgeSkillCategory = keyof ReturnType<typeof KnowledgeSkills>;
