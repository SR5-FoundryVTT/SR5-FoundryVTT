import { SR5 } from "@/module/config";
import { BaseItemData, ItemBase } from "./ItemBase";
import { OpposedActionRollData } from "./Action";
const { ArrayField, BooleanField, NumberField, StringField, SchemaField } = foundry.data.fields;

const SkillLanguageData = () => ({
    isNative: new BooleanField({ required: true, initial: false }),
});

const SkillSpecializationData = () => ({
    name: new StringField({ required: true, initial: '', blank: true }),
});

/**
 * Mimic action limit field without the full ModifiableValue strucutre.
 * But should that ever need to be applied, we can add in on top and still
 * be flexible with the data structure as well.
 */
const SkillLimitData = () => ({
    attribute: new StringField({ required: true, initial: '', blank: true, choices: SR5.limits }),
});
/**
 * Skillsets can be configured to be automatic defaults for new actors of a certain type.
 * 
 * NOTE: This is a schema field to allow for additional fields in the future, such as actor type 
 * specific sub types.
 */
const SkillSetDefaultData = () => ({
    type: new StringField({ required: true, initial: '', blank: true, choices: SR5.actorTypes }),
});

const SkillTypeData = () => ({
    // Use default values instead of empty or null to avoid skills not showing up 
    // in the skill list of actor sheets.
    category: new StringField({ required: true, initial: 'active', choices: SR5.skillCategories }),
    knowledgeType: new StringField({ required: false, initial: 'academic', choices: SR5.skillKnowledgeTypes }),
    group: new StringField({ required: true, blank: true, initial: '' }),
    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    defaulting: new BooleanField({ required: true, nullable: false, initial: false }),
    attribute: new StringField({ required: true, blank: true, choices: SR5.attributes }),
    limit: new SchemaField(SkillLimitData()),
    // Will contain custom specialization entries.
    specializations: new ArrayField(new SchemaField(SkillSpecializationData())),
    requirement: new StringField({ required: true, initial: 'mundane', choices: SR5.specialTypes }),
    // Partial action data to allow skills to have a configured opposed test.
    action: new SchemaField({
        opposed: OpposedActionRollData({ opposedTest: 'OpposedTest' })
    }),

    language: new SchemaField(SkillLanguageData()),
});

const SkillGroupTypeData = () => ({
    // will contain skill names.
    skills: new ArrayField(new StringField({ required: true })),
    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
});

const SkillSetSkillData = () => ({
    // will contain a single skill name.
    name: new StringField({ required: true }),
    // will contain rating for that skill.
    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    // will contain custom specialization entries for that skill.
    specializations: new ArrayField(new SchemaField(SkillSpecializationData())),
});

const SkillSetGroupData = () => ({
    // will contain a single skill group name.
    name: new StringField({ required: true }),
    // will contain rating for that group.
    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
});

const SkillSetTypeData = () => ({
    skills: new ArrayField(new SchemaField(SkillSetSkillData())),
    groups: new ArrayField(new SchemaField(SkillSetGroupData())),
    // default actor skillset configuration
    default: new SchemaField(SkillSetDefaultData()),
});

const SkillData = () => ({
    ...BaseItemData(),

    // fields shared across all skill types.
    type: new StringField({ required: true, initial: 'skill', choices: SR5.skillTypes }),

    // data depending on skill type.
    skill: new SchemaField(SkillTypeData()),
    group: new SchemaField(SkillGroupTypeData()),
    set: new SchemaField(SkillSetTypeData()),
});

/**
 * Skill items implement Shadowrun skill and skill related functionality for use
 * inside of actor classes.
 * 
 * Implementation supports normal skills, groups, and sets, which both reference
 * skills from the local collection or compendiums by name.
 */
export class Skill extends ItemBase<ReturnType<typeof SkillData>> {
    static override defineSchema() {
        return SkillData();
    }

    static override LOCALIZATION_PREFIXES = ["SR5.Skill", "SR5.Item"];
}

console.log("SkillData", SkillData(), new Skill());