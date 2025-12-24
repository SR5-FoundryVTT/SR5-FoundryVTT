import { SR5 } from "@/module/config";
import { BaseItemData, ItemBase } from "./ItemBase";
const { ArrayField, BooleanField, NumberField, StringField, SchemaField } = foundry.data.fields;

const SkillTypeData = () => ({ 
    // TODO: taMiF - Use 'type' as in SR5#128 instead of category. better differentiate between system.type and system.skill.type
    category: new StringField({ required: true, initial: 'active', choices: SR5.skillCategories }),
    knowledgeType: new StringField({ required: false, blank: true, choices: SR5.skillKnowledgeTypes }),
    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
    defaulting: new BooleanField({ required: true, nullable: false, initial: false }),
    attribute: new StringField({ required: true, blank: true, choices: SR5.attributes }),
    // Will contain custom specialization names.
    specializations: new ArrayField(new StringField({ required: true })),
});

const SkillGroupTypeData = () => ({
    // will contain skill names.
    skills: new ArrayField(new StringField({ required: true })),
});

const SkillSetSkillData = () => ({
    // will contain a single skill name.
    name: new StringField({ required: true }),
    // will contain rating for that skill.
    rating: new NumberField({ required: true, nullable: false, integer: true, initial: 0, min: 0 }),
});

const SkillSetTypeData = () => ({
    skills: new ArrayField(new SchemaField(SkillSetSkillData())),
    groups: new ArrayField(new SchemaField(SkillSetSkillData())),
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
 * Implementation supports normal skills and group and sets, which both reference
 * skills from the local collection or compendiums by name.
 */
export class Skill extends ItemBase<ReturnType<typeof SkillData>> {
    static override defineSchema() {
        return SkillData();
    }

    static override LOCALIZATION_PREFIXES = ["SR5.Skill", "SR5.Item"];
}

console.log("SkillData", SkillData(), new Skill());