import { SR5Actor } from "src/module/actor/SR5Actor";
import { ImportHelper as IH } from "src/module/apps/itemImport/helper/ImportHelper";

import { DataDefaults } from "@/module/data/DataDefaults";
import { Sanitizer } from "@/module/sanitizer/Sanitizer";
import { SkillFieldType } from "@/module/types/template/Skills";

import { ActorSchema } from "../ActorSchema";
import { ItemsParser } from "../itemImporter/ItemsParser";
import { VehicleParser } from "../itemImporter/vehicleImport/VehicleParser";

// Type Definitions
export type importOptionsType = Partial<{
    assignIcons: boolean;
    folderId: string | null;
    armor: boolean;
    contacts: boolean;
    cyberware: boolean;
    equipment: boolean;
    lifestyles: boolean;
    metamagics: boolean;
    powers: boolean;
    qualities: boolean;
    rituals: boolean;
    spells: boolean;
    vehicles: boolean;
    weapons: boolean;
}>;

export interface BlankCharacter extends Actor.CreateData {
    type: 'character',
    name: string,
    items: Item.CreateData[],
    effects: ActiveEffect.CreateData[],
    system: ReturnType<typeof DataDefaults.baseSystemData<'character'>>,
};

/**
 * Imports characters from other tools into an existing foundry actor.
 */
export class CharacterImporter {
    private static readonly ATTRIBUTE_MAP = {
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

    /**
     * Maps Chummer attribute abbreviations to SR5-Foundry attribute names.
     * @param attName The Chummer attribute abbreviation.
     * @returns The corresponding SR5-Foundry attribute name, or an empty string if not found.
     */
    static parseAttName(
        attName: string
    ): typeof CharacterImporter.ATTRIBUTE_MAP[keyof typeof CharacterImporter.ATTRIBUTE_MAP] | "" {
        const key = attName.trim().toLowerCase();
        return this.ATTRIBUTE_MAP[key] ?? "";
    }

    static parseSkillName(skillName: string): string {
        let name = skillName.trim().toLowerCase().replace(/[\s-]/g, '_');
        if (name.includes('exotic') && name.includes('_weapon')) name = name.replace('_weapon', '');
        if (name.includes('exotic') && name.includes('_ranged')) name = name.replace('_ranged', '_range');
        if (name === 'pilot_watercraft') name = 'pilot_water_craft';

        return name;
    }

    // --------------------------------------------------------------------------
    // Public Methods
    // --------------------------------------------------------------------------

    /**
     * Imports a chummer character into an existing actor. The actor will be updated. This might lead to duplicate items.
     * @param chummerCharacter The complete chummer file as json object. The first character will be selected for import.
     * @param importOptions Additional import option that specify what parts of the chummer file will be imported.
     */
    static async import(chummerCharacter: ActorSchema, importOptions: importOptionsType): Promise<[SR5Actor<'character'>, ...SR5Actor<'vehicle'>[]]> {
        const character: BlankCharacter = {
            effects: [],
            type: 'character',
            folder: importOptions.folderId ?? null,
            system: DataDefaults.baseSystemData('character'),
            items: await new ItemsParser().parse(chummerCharacter, importOptions),
            name: chummerCharacter.alias ?? chummerCharacter.name ?? '[Name not found]',
        };

        await this.update(character, chummerCharacter);

        const consoleLogs = Sanitizer.sanitize(CONFIG.Actor.dataModels.character.schema, character.system);
        if (consoleLogs) {
            console.warn(`Document Sanitized on Import; Name: ${chummerCharacter.name}\n`);
            console.table(consoleLogs);
        }

        const actor = (await SR5Actor.create(character))! as SR5Actor<'character'>;

        await this.fixAttributes(actor, chummerCharacter);

        let createdVehicles: SR5Actor<'vehicle'>[] = [];
        if (importOptions.vehicles) {
            const chummerVehicles = IH.getArray(chummerCharacter.vehicles?.vehicle);
            const vehicleData = await new VehicleParser().parseVehicles(actor, chummerVehicles);
            const createdDocs = await SR5Actor.create(vehicleData) as SR5Actor<'vehicle'>[] | SR5Actor<'vehicle'>;
            createdVehicles = Array.isArray(createdDocs) ? createdDocs : [createdDocs];
        }

        return [actor, ...createdVehicles];
    }

    // --------------------------------------------------------------------------
    // Private Orchestration Methods
    // --------------------------------------------------------------------------

    /**
     * Parses the actor data from the chummer file and returns an updated clone of the actor data.
     * @param actor The actor data (actor not actor.system) that is used as the basis for the import. Will not be changed.
     * @param chummerChar The chummer character to parse.
     */
    private static async update(actor: BlankCharacter, chummerChar: ActorSchema) {
        // Name is required, so we need to always set something (even if the chummer field is empty)
        actor.name = chummerChar.alias ?? chummerChar.name ?? '[Name not found]';

        this.importBasicData(actor.system, chummerChar);
        await this.importBio(actor.system, chummerChar);
        this.importAttributes(actor.system, chummerChar);
        this.importInitiative(actor.system, chummerChar);
        this.importSkills(actor.system, chummerChar);

        actor.system.is_critter = chummerChar.critter === 'True';
    }

    // --------------------------------------------------------------------------
    // Private Data Import Methods
    // --------------------------------------------------------------------------

    private static importBasicData(system: BlankCharacter['system'], chummerChar: ActorSchema) {
        if (chummerChar.metatype) {
            // Avoid i18n metatype field issues. Chummer metatype aren't lowercase but foundry system metatypes are.
            system.metatype = chummerChar.metatype_english.toLowerCase();
        }

        system.street_cred = Number(chummerChar.calculatedstreetcred) || 0;
        system.notoriety = Number(chummerChar.calculatednotoriety) || 0;
        system.public_awareness = Number(chummerChar.calculatedpublicawareness) || 0;
        system.karma.value = Number(chummerChar.karma) || 0;
        system.karma.max = Number(chummerChar.totalkarma) || 0;
        system.nuyen = parseInt(chummerChar.nuyen.replace(/[,.]/g, ''));

        if (chummerChar.technomancer === 'True') {
            system.special = 'resonance';
            const initiationGrades = IH.getArray(chummerChar.initiationgrade?.initiationgrade);
            const technoGrades = initiationGrades
                .filter(grade => grade.technomancer === 'True')
                .map(grade => Number(grade.grade) || 0);
            system.technomancer.submersion = Math.max(0, ...technoGrades);
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
            if (filteredAttr) {
                system.magic.attribute = this.parseAttName(filteredAttr);
            }

            const initiationGrades = IH.getArray(chummerChar.initiationgrade?.initiationgrade);
            const magicianGrades = initiationGrades
                .filter(grade => grade.technomancer === 'False')
                .map(grade => Number(grade.grade) || 0);
            system.magic.initiation = Math.max(0, ...magicianGrades);
        }
    }

    private static async importBio(system: BlankCharacter['system'], chummerChar: ActorSchema) {
        let bioHtml = '';

        if (chummerChar.description) bioHtml += chummerChar.description + '<br/>';
        if (chummerChar.background) bioHtml += chummerChar.background + '<br/>';
        if (chummerChar.concept) bioHtml += chummerChar.concept + '<br/>';
        if (chummerChar.notes) bioHtml += chummerChar.notes + '<br/>';

        // Chummer outputs html and wraps every section in <p> tags.
        // Adding the option async.true is necessary for the pdf-pager module not to cause an error on import.
        system.description.value = await foundry.applications.ux.TextEditor.implementation.enrichHTML(bioHtml);
    }

    private static importAttributes(system: BlankCharacter['system'], chummerChar: ActorSchema) {
        if (!chummerChar.attributes) return;

        for (const att of chummerChar.attributes[1].attribute) {
            const attName = this.parseAttName(att.name_english);
            if (!attName) continue;

            system.attributes[attName].base = parseInt(att.base);
        }
    }

    private static async fixAttributes(actor: SR5Actor, chummerChar: ActorSchema) {
        const fixes: Partial<Record<ReturnType<typeof CharacterImporter['parseAttName']>, number>> = {};
        for (const att of chummerChar.attributes[1].attribute) {
            const attName = this.parseAttName(att.name_english);
            if (!attName) continue;

            if (actor.system.attributes[attName].value !== parseInt(att.total))
                fixes[attName] = parseInt(att.total) - actor.system.attributes[attName].value;
        }

        if (Object.keys(fixes).length > 0) {
            const changes = Object.entries(fixes).map(([key, value]) => ({
                key: `system.attributes.${key}.value`, value: String(value)
            }));
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: `Attribute Fixes on Import`, changes
            }]);
        }
    }

    private static importInitiative(system: BlankCharacter['system'], chummerChar: ActorSchema) {
        // TODO: These modifiers are very unclear in how they're used here and where they come from.
        system.modifiers.meat_initiative = Number(chummerChar.initbonus) || 0;

        // 'initdice' contains the total amount of initiative dice, not just the bonus.
        system.modifiers.meat_initiative_dice = (Number(chummerChar.initdice) || 1) - 1;
        system.modifiers.astral_initiative_dice = (Number(chummerChar.astralinitdice) || 2) - 2;
        system.modifiers.matrix_initiative_dice = (Number(chummerChar.matrixarinitdice) || 3) - 3;
    }

    // --------------------------------------------------------------------------
    // Private Skill Handling Methods
    // --------------------------------------------------------------------------

    private static importSkills(system: BlankCharacter['system'], chummerChar: ActorSchema) {
        const skills = IH.getArray(chummerChar.skills.skill);
        const languageSkills: typeof skills = [];
        const knowledgeSkills: typeof skills = [];
        const activeSkills: typeof skills = [];

        for (const skill of skills) {
            const rating = Number(skill.rating) || 0;
            if (skill.islanguage === 'True') {
                languageSkills.push(skill);
            } else if (skill.knowledge === 'True' && rating > 0) {
                knowledgeSkills.push(skill);
            } else if (rating > 0) {
                activeSkills.push(skill);
            }
        }

        this.handleLanguageSkills(system, languageSkills);
        this.handleKnowledgeSkills(system, knowledgeSkills);
        this.handleActiveSkills(system, activeSkills);
    }

    private static handleActiveSkills(system: BlankCharacter['system'], activeSkills: ActorSchema['skills']['skill']) {
        for (const skill of activeSkills) {
            const skillName = this.parseSkillName(skill.name_english);

            const parsedSkill = system.skills.active[skillName] ?? DataDefaults.createData('skill_field');
            parsedSkill.base = parseInt(skill.rating);
            if (skill.skillspecializations) {
                parsedSkill.specs = IH.getArray(skill.skillspecializations.skillspecialization).map(spec => spec.name);
            }

            // Precaution to later only deal with complete SkillField data models.
            system.skills.active[skillName] = DataDefaults.createData('skill_field', parsedSkill);
        }
    }

    private static handleLanguageSkills(system: BlankCharacter['system'], languageSkills: ActorSchema['skills']['skill']) {
        system.skills.language.value = {};
        for (const skill of languageSkills) {
            const parsedSkill = DataDefaults.createData('skill_field');
            const id = foundry.utils.randomID();
            system.skills.language.value[id] = parsedSkill;

            // Transform native rating into max rating.
            skill.rating = (skill.isnativelanguage === 'True') ? '12' : skill.rating;

            if (skill.skillspecializations) {
                parsedSkill.specs = IH.getArray(skill.skillspecializations.skillspecialization).map(spec => spec.name);
            }

            parsedSkill.name = skill.name;
            parsedSkill.base = Number(skill.rating) || 0;
            if (skill.skillspecializations) {
                parsedSkill.specs = IH.getArray(skill.skillspecializations.skillspecialization).map(spec => spec.name);
            }
        }
    }

    private static handleKnowledgeSkills(system: BlankCharacter['system'], knowledgeSkills: ActorSchema['skills']['skill']) {
        system.skills.knowledge.academic.value = {};
        system.skills.knowledge.interests.value = {};
        system.skills.knowledge.professional.value = {};
        system.skills.knowledge.street.value = {};

        for (const skill of knowledgeSkills) {
            const id = foundry.utils.randomID(16);
            const parsedSkill = DataDefaults.createData('skill_field');
            parsedSkill.name = skill.name;
            parsedSkill.base = parseInt(skill.rating);
            if (skill.skillspecializations) {
                parsedSkill.specs = IH.getArray(skill.skillspecializations.skillspecialization).map(spec => spec.name);
            }

            let skillCategory: Record<string, SkillFieldType> | undefined;
            if (skill.skillcategory_english) {
                const cat = skill.skillcategory_english.toLowerCase();
                switch (cat) {
                    case 'street': skillCategory = system.skills.knowledge.street.value; break;
                    case 'academic': skillCategory = system.skills.knowledge.academic.value; break;
                    case 'professional': skillCategory = system.skills.knowledge.professional.value; break;
                    case 'interest': skillCategory = system.skills.knowledge.interests.value; break;
                }
            } else {
                // Fallback for older chummer versions
                if (skill.attribute.toLowerCase() === 'int') skillCategory = system.skills.knowledge.street.value;
                if (skill.attribute.toLowerCase() === 'log') skillCategory = system.skills.knowledge.professional.value;
            }

            if (skillCategory) {
                skillCategory[id] = parsedSkill;
            }
        }
    }
}
