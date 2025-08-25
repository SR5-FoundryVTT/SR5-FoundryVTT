import { DataDefaults } from "src/module/data/DataDefaults";
import { InitiationParser } from "../itemImporter/magicImport/InitiationParser";
import { SubmersionParser } from "../itemImporter/technoImport/SubmersionParser";
import { ActorSchema } from "../ActorSchema";
import { SR5Actor } from "src/module/actor/SR5Actor";
import { SkillFieldType } from "src/module/types/template/Skills";
import { ImportHelper as IH } from "@/module/apps/itemImport/helper/ImportHelper";

/**
 * Parses all non-item character information from a chummer character object.
 */
export class CharacterInfoUpdater {     
    /**
     * Maps Chummer attribute abbreviations to SR5-Foundry attribute names.
     * @param attName The Chummer attribute abbreviation.
     * @returns The corresponding SR5-Foundry attribute name, or an empty string if not found.
     */
    private parseAttName(attName: string) {
        const ATTRIBUTE_MAP = {
            bod: "body",
            agi: "agility",
            rea: "reaction",
            str: "strength",
            cha: "charisma",
            int: "intuition",
            log: "logic",
            wil: "willpower",
            edg: "edge",
            mag: "magic",
            res: "resonance"
        } as const;

        type AttributeMapValue = typeof ATTRIBUTE_MAP[keyof typeof ATTRIBUTE_MAP];
        return (ATTRIBUTE_MAP[attName.trim().toLowerCase()] ?? "") as AttributeMapValue | "";
    };

    /**
     * Parses the actor data from the chummer file and returns an updated clone of the actor data.
     * @param {*} actorSource The actor data (actor not actor.system) that is used as the basis for the import. Will not be changed.
     * @param {*} chummerChar The chummer character to parse.
     */
    async update(actorSource: SR5Actor<'character'>, chummerChar: ActorSchema) {

        const clonedActorSource = foundry.utils.duplicate(actorSource);

        // Name is required, so we need to always set something (even if the chummer field is empty)
        clonedActorSource.name = chummerChar.alias ?? chummerChar.name ?? '[Name not found]';

        this.importBasicData(clonedActorSource.system, chummerChar);
        await this.importBio(clonedActorSource.system, chummerChar);
        this.importAttributes(clonedActorSource.system, chummerChar)
        this.importInitiative(clonedActorSource.system, chummerChar);
        this.importSkills(clonedActorSource.system, chummerChar);

        if(chummerChar.critterpowers?.critterpower)
            clonedActorSource.system.is_critter = true;

        return clonedActorSource;
    }

    importBasicData(system: SR5Actor<'character'>['system'], chummerChar: ActorSchema) {
        if (chummerChar.metatype) {
            // Avoid i18n metatype field issues. Chummer metatype aren't lowercase but foundry system metatypes are.
            system.metatype = chummerChar.metatype_english.toLowerCase();
        }

        system.street_cred = Number(chummerChar.calculatedstreetcred) || 0;
        system.notoriety = Number(chummerChar.calculatednotoriety) || 0;
        system.public_awareness = Number(chummerChar.calculatedpublicawareness) || 0;
        system.karma.value = Number(chummerChar.karma) || 0;
        system.karma.max = Number(chummerChar.totalkarma) || 0;
        system.nuyen = parseInt(chummerChar.nuyen.replace(',', '').replace('.', ''));

        if (chummerChar.technomancer === 'True') {
            system.special = 'resonance';
            
            if (chummerChar.initiationgrade)
                new SubmersionParser().parseSubmersions(chummerChar, system)
        } else if (chummerChar.magician === 'True' || chummerChar.adept === 'True') {
            system.special = 'magic';

            let attr: string[] = [];
            // @ts-expect-error legacy chummer attribute
            if (chummerChar.tradition?.drainattribute?.attr) {
                // @ts-expect-error legacy chummer attribute
                attr = chummerChar.tradition.drainattribute.attr;
            } else if (chummerChar.tradition?.drainattributes) {
                attr = chummerChar.tradition.drainattributes
                    .split('+')
                    .map((item) => item.trim());
            }

            const filteredAttr = attr.filter((att) => att !== 'willpower')[0];

            if (filteredAttr)
                system.magic.attribute = this.parseAttName(filteredAttr);

            if (chummerChar.initiationgrade)
                new InitiationParser().parseInitiation(chummerChar, system);
        }
    }

    async importBio(system: SR5Actor<'character'>['system'], chummerChar: ActorSchema) {
        system.description.value = '';

        // Adding the option async.true is necessary for the pdf-pager module not to cause an error on import.

        // Chummer outputs html and wraps every section in <p> tags,
        // so we just concat everything with an additional linebreak in between
        if (chummerChar.description)
            system.description.value += await foundry.applications.ux.TextEditor.implementation.enrichHTML(chummerChar.description + '<br/>');

        if (chummerChar.background)
            system.description.value += await foundry.applications.ux.TextEditor.implementation.enrichHTML(chummerChar.background + '<br/>');

        if (chummerChar.concept)
            system.description.value += await foundry.applications.ux.TextEditor.implementation.enrichHTML(chummerChar.concept + '<br/>');

        if (chummerChar.notes)
            system.description.value += await foundry.applications.ux.TextEditor.implementation.enrichHTML(chummerChar.notes + '<br/>');
    }

    importAttributes(system: SR5Actor<'character'>['system'], chummerChar: ActorSchema) {
        if(!chummerChar.attributes) return;

        for (const att of chummerChar.attributes[1].attribute) {
            const attName = this.parseAttName(att.name_english);

            if (!attName) continue;

            // The edge attribute value is stored in the "base" field instead of the total field
            // In chummer, the "total" field is used for the amount of edge remaining to a character
            if (attName === 'edge')
                system.attributes[attName].base = parseInt(att.base);
            else
                system.attributes[attName].base = parseInt(att.total);
        }
    }

    // TODO: These modifiers are very unclear in how they're used here and where they come from.
    importInitiative(system: SR5Actor<'character'>['system'], chummerChar: ActorSchema) {
        system.modifiers.meat_initiative = Number(chummerChar.initbonus) || 0;

        // 'initdice' contains the total amount of initiative dice, not just the bonus.
        system.modifiers.meat_initiative_dice = (Number(chummerChar.initdice) || 1) - 1;
        system.modifiers.astral_initiative_dice = (Number(chummerChar.astralinitdice) || 2) - 2;
        system.modifiers.matrix_initiative_dice = (Number(chummerChar.matrixarinitdice) || 3) - 3;
    }

    importSkills(system: SR5Actor<'character'>['system'], chummerChar: ActorSchema) {
        const skills = IH.getArray(chummerChar.skills.skill);

        const languageSkills: typeof skills = [];
        const knowledgeSkills: typeof skills = [];
        const activeSkills: typeof skills = [];

        for (const skill of skills) {
            const rating = Number(skill.rating) || 0;

            if (skill.islanguage === 'True')
                languageSkills.push(skill);
            else if (skill.knowledge === 'True' && rating > 0)
                knowledgeSkills.push(skill);
            else if (rating > 0)
                activeSkills.push(skill);
        }

        this.handleLanguageSkills(system, languageSkills);
        this.handleKnowledgeSkills(system, knowledgeSkills);
        this.handleActiveSkills(system, activeSkills);
    }

    handleActiveSkills(system: SR5Actor<'character'>['system'], activeSkills: ActorSchema['skills']['skill']) {

        for (const skill of activeSkills) {
            let name = skill.name_english.toLowerCase().replace(/[\s-]/g, '_').trim();

            if (name.includes('exotic') && name.includes('_weapon'))
                name = name.replace('_weapon', '');

            if (name.includes('exotic') && name.includes('_ranged'))
                name = name.replace('_ranged', '_range');
               
            if (name === 'pilot_watercraft')
                name = 'pilot_water_craft';
                
            const parsedSkill = system.skills.active[name];

            parsedSkill.base = parseInt(skill.rating);
            if (skill.skillspecializations)
                parsedSkill.specs = IH.getArray(skill.skillspecializations.skillspecialization).map(spec => spec.name);

            // Precaution to later only deal with complete SkillField data models.
            system.skills.active[name] = DataDefaults.createData('skill_field', parsedSkill);
        }
    }

    handleLanguageSkills(system: SR5Actor<'character'>['system'], languageSkills: ActorSchema['skills']['skill']) {
        system.skills.language.value = {}

        for (const skill of languageSkills) {
            const parsedSkill = DataDefaults.createData('skill_field');
            const id = foundry.utils.randomID();
            system.skills.language.value[id] = parsedSkill;

            // Transform native rating into max rating.
            if (skill.isnativelanguage === 'True')
                skill.rating = '12';

            parsedSkill.name = skill.name;
            parsedSkill.base = Number(skill.rating) || 0;
    
            if (skill.skillspecializations)
                parsedSkill.specs = IH.getArray(skill.skillspecializations.skillspecialization).map(spec => spec.name);
        }
    }

    handleKnowledgeSkills(system: SR5Actor<'character'>['system'], knowledgeSkills: ActorSchema['skills']['skill']) {
        system.skills.knowledge.academic.value = {}
        system.skills.knowledge.interests.value = {}
        system.skills.knowledge.professional.value = {}
        system.skills.knowledge.street.value = {}

        for (const skill of knowledgeSkills) {
            const id = foundry.utils.randomID(16);
            const parsedSkill = DataDefaults.createData('skill_field');

            // Determine the correct knowledge skill category and assign the skill to it
            let skillCategory: Record<string, SkillFieldType> | undefined;
            if (skill.skillcategory_english) {
                const cat = skill.skillcategory_english.toLowerCase();
                if (cat === 'street')
                    skillCategory = system.skills.knowledge.street.value;
                if (cat === 'academic')
                    skillCategory = system.skills.knowledge.academic.value;
                if (cat === 'professional')
                    skillCategory = system.skills.knowledge.professional.value;
                if (cat === 'interest')
                    skillCategory = system.skills.knowledge.interests.value;

                if (skillCategory)
                    skillCategory[id] = parsedSkill;
            } else {
                if (skill.attribute.toLowerCase() === 'int')
                    system.skills.knowledge.street.value[id] = parsedSkill;
                if (skill.attribute.toLowerCase() === 'log')
                    system.skills.knowledge.professional.value[id] = parsedSkill;
            }

            parsedSkill.name = skill.name;
            parsedSkill.base = parseInt(skill.rating);

            if (skill.skillspecializations)
                parsedSkill.specs = IH.getArray(skill.skillspecializations.skillspecialization).map(spec => spec.name);
        }
    }
}
