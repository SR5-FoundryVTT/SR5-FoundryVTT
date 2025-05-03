import {_mergeWithMissingSkillFields} from "../../../../actor/prep/functions/SkillsPrep";
import { InitiationParser } from "../itemImporter/magicImport/InitiationParser";
import { SubmersionParser } from "../itemImporter/technoImport/SubmersionParser";

/**
 * Parses all non-item character information from a chummer character object.
 */
export class CharacterInfoUpdater {

    /**
     *  Maps the chummer attribute name to our sr5-foundry attribute name
     *  @param attName name of the chummer attribute
     */
    parseAttName = (attName) =>  {
        if (attName.toLowerCase() === 'bod') {
            return 'body';
        }
        if (attName.toLowerCase() === 'agi') {
            return 'agility';
        }
        if (attName.toLowerCase() === 'rea') {
            return 'reaction';
        }
        if (attName.toLowerCase() === 'str') {
            return 'strength';
        }
        if (attName.toLowerCase() === 'cha') {
            return 'charisma';
        }
        if (attName.toLowerCase() === 'int') {
            return 'intuition';
        }
        if (attName.toLowerCase() === 'log') {
            return 'logic';
        }
        if (attName.toLowerCase() === 'wil') {
            return 'willpower';
        }
        if (attName.toLowerCase() === 'edg') {
            return 'edge';
        }
        if (attName.toLowerCase() === 'mag') {
            return 'magic';
        }
        if (attName.toLowerCase() === 'res') {
            return 'resonance';
        }
    };

    getArray = (value) => {
        return Array.isArray(value) ? value : [value];
    };


    /**
     *  Converts the chummer attribute value to our sr5-foundry attribute value
     *  @param att the chummer attribute
     */
    parseAttBaseValue = (att) => {
        if (att.name.toLowerCase() === 'edg') {
            // The edge attribute value is stored in the "base" field instead of the total field
            // In chummer, the "total" field is used for the amount of edge remaining to a character
            return parseInt(att.base);
        }
        else {
            return parseInt(att.total);
        }
    }

    /**
     * Parses the actor data from the chummer file and returns an updated clone of the actor data.
     * @param {*} actorSource The actor data (actor not actor.system) that is used as the basis for the import. Will not be changed.
     * @param {*} chummerChar The chummer character to parse.
     */
    async update(actorSource, chummerChar) {

        const clonedActorSource = foundry.utils.duplicate(actorSource);

        // Name is required, so we need to always set something (even if the chummer field is empty)
        if (chummerChar.alias) {
            clonedActorSource.name = chummerChar.alias;
        }
        else {
            clonedActorSource.name = chummerChar.name ? chummerChar.name : '[Name not found]';
        }
        clonedActorSource.prototypeToken.name = clonedActorSource.name;

        this.importBasicData(clonedActorSource.system, chummerChar);
        await this.importBio(clonedActorSource.system, chummerChar);
        this.importAttributes(clonedActorSource.system, chummerChar)
        this.importInitiative(clonedActorSource.system, chummerChar);
        this.importSkills(clonedActorSource.system, chummerChar);

        if(chummerChar.critterpowers?.critterpower) {
            clonedActorSource.system.is_critter = true;
        }

        return clonedActorSource;
    }

    importBasicData(system, chummerChar) {

        try {
            if (chummerChar.metatype) {
                // Avoid i18n metatype field issues. Chummer metatype aren't lowercase but foundry system metatypes are.
                system.metatype = chummerChar.metatype_english.toLowerCase();
            }
            if (chummerChar.sex) {
                system.sex = chummerChar.sex;
            }
            if (chummerChar.age) {
                system.age = chummerChar.age;
            }
            if (chummerChar.height) {
                system.height = chummerChar.height;
            }
            if (chummerChar.weight) {
                system.weight = chummerChar.weight;
            }
            if (chummerChar.calculatedstreetcred) {
                system.street_cred = chummerChar.calculatedstreetcred;
            }
            if (chummerChar.calculatednotoriety) {
                system.notoriety = chummerChar.calculatednotoriety;
            }
            if (chummerChar.calculatedpublicawareness) {
                system.public_awareness = chummerChar.calculatedpublicawareness;
            }
            if (chummerChar.karma) {
                system.karma.value = chummerChar.karma;
            }
            if (chummerChar.totalkarma) {
                system.karma.max = chummerChar.totalkarma;
            }
            if (chummerChar.technomancer?.toLowerCase() === 'true') {
                system.special = 'resonance';
                
                if(chummerChar.initiationgrade) {
                    new SubmersionParser().parseSubmersions(chummerChar, system)
               }
            }
            if (
                chummerChar.magician?.toLowerCase() === 'true' ||
                chummerChar.adept?.toLowerCase() === 'true'
            ) {
                system.special = 'magic';
                let attr = [];
                if (chummerChar.tradition?.drainattribute?.attr) {
                    attr = chummerChar.tradition.drainattribute.attr;
                } else if (chummerChar.tradition?.drainattributes) {
                    attr = chummerChar.tradition.drainattributes
                        .split('+')
                        .map((item) => item.trim());
                }
                attr.forEach((att) => {
                    const attName = this.parseAttName(att);
                    if (attName !== 'willpower') {
                        system.magic.attribute = attName;
                    }
                });

                if(chummerChar.initiationgrade) {
                     new InitiationParser().parseInitiation(chummerChar, system)
                }

            }
            if (chummerChar.totaless) {
                system.attributes.essence.value = chummerChar.totaless;
            }
            if (chummerChar.nuyen) {
                system.nuyen = parseInt(chummerChar.nuyen.replace(',', '').replace('.', ''));
            }
        } catch (e) {
            console.error(`Error while parsing character information ${e}`);
        }
    }

    async importBio(system, chummerChar) {
        system.description.value = '';

        // Adding the option async.true is necessary for the pdf-pager module not to cause an error on import.

        // Chummer outputs html and wraps every section in <p> tags,
        // so we just concat everything with an additional linebreak in between
        if (chummerChar.description) {
            system.description.value += await TextEditor.enrichHTML(chummerChar.description + '<br/>', {async: true});
        }

        if (chummerChar.background) {
            system.description.value += await TextEditor.enrichHTML(chummerChar.background + '<br/>', {async: true});
        }

        if (chummerChar.concept) {
            system.description.value += await TextEditor.enrichHTML(chummerChar.concept + '<br/>', {async: true});
        }

        if (chummerChar.notes) {
            system.description.value += await TextEditor.enrichHTML(chummerChar.notes + '<br/>', {async: true});
        }
    }

    importAttributes(system, chummerChar) {
        if(!chummerChar.attributes) {
            return;
        }

        const atts = chummerChar.attributes[1].attribute;
        atts.forEach((att) => {
            try {
                const attName = this.parseAttName(att.name_english);
                if (attName) {
                    system.attributes[attName].base = this.parseAttBaseValue(att);
                }

            } catch (e) {
                console.error(`Error while parsing attributes ${e}`);
            }
        });
    }

    // TODO: These modifiers are very unclear in how they're used here and where they come from.
    importInitiative(system, chummerChar) {
        try {
            system.modifiers.meat_initiative = chummerChar.initbonus;

            // 'initdice' contains the total amount of initiative dice, not just the bonus.
            system.modifiers.meat_initiative_dice = chummerChar.initdice - 1;
        } catch (e) {
            console.error(`Error while parsing initiative ${e}`);
        }
    }

    importSkills(system, chummerChar) {
        const chummerSkills = chummerChar.skills?.skill;

        try {
            let languageSkills = chummerSkills?.filter(skill => skill.islanguage && skill.islanguage.toLowerCase() === 'true') ?? []
            this.handleLanguageSkills(system, languageSkills)
    
            let knowledgeSkills = chummerSkills?.filter(skill => skill.rating > 0 && skill.knowledge && skill.knowledge.toLowerCase() === 'true') ?? []
            this.handleKnowledgeSkills(system, knowledgeSkills)
    
            let activeSkills = chummerSkills?.filter( skill => skill.rating > 0 && !languageSkills.includes(skill) && !knowledgeSkills.includes(skill) ) ?? [];
            this.handleActiveSkills(system, activeSkills)
        } catch (e) {
            console.error(e);
        }
    }

    handleActiveSkills(system, activeSkills) {

        for (let skill of activeSkills) {
            let name = skill.name_english
                .toLowerCase()
                .trim()
                .replace(/\s/g, '_')
                .replace(/-/g, '_');

            if (name.includes('exotic') && name.includes('_weapon')) {
                name = name.replace('_weapon', '');
            }

            if (name.includes('exotic') && name.includes('_ranged')) {
                name = name.replace('_ranged', '_range');
            }
               
            if (name === 'pilot_watercraft') {
                name = 'pilot_water_craft';
            }
                
            let parsedSkill = system.skills.active[name];

            parsedSkill.base = parseInt(skill.rating);

            if (skill.skillspecializations) {
                parsedSkill.specs = this.getArray(skill.skillspecializations.skillspecialization).map(spec => spec.name);
            }

            // Precaution to later only deal with complete SkillField data models.
            _mergeWithMissingSkillFields(parsedSkill);
        }
    }

    handleLanguageSkills(system, languageSkills) {
        system.skills.language.value = {}

        for (let skill of languageSkills) {
            let parsedSkill = {};
            const id = randomID(16);
            system.skills.language.value[id] = parsedSkill;

            // Transform native rating into max rating.
            if (skill.isnativelanguage.toLowerCase() === 'true') {
                skill.rating = 6;
            }

            parsedSkill.name = skill.name;
            parsedSkill.base = parseInt(skill.rating);
    
            if (skill.skillspecializations) {
                parsedSkill.specs = this.getArray(skill.skillspecializations.skillspecialization).map(spec => spec.name);
            }
    
            // Precaution to later only deal with complete SkillField data models.
            _mergeWithMissingSkillFields(parsedSkill);
        }
    }

    handleKnowledgeSkills(system, knowledgeSkills) {
        system.skills.knowledge.academic.value = {}
        system.skills.knowledge.interests.value = {}
        system.skills.knowledge.professional.value = {}
        system.skills.knowledge.street.value = {}

        for (let skill of knowledgeSkills) {
            const id = randomID(16);
            let parsedSkill = {};
    
            
            // Determine the correct knowledge skill category and assign the skill to it
            let skillCategory;
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
            }
            else {
                if (skill.attribute.toLowerCase() === 'int') {
                    system.skills.knowledge.street.value[id] = parsedSkill;
                }
                if (skill.attribute.toLowerCase() === 'log') {
                    system.skills.knowledge.professional.value[id] = parsedSkill;
                }
            }

            parsedSkill.name = skill.name;
            parsedSkill.base = parseInt(skill.rating);

            if (skill.skillspecializations) {
                parsedSkill.specs = this.getArray(skill.skillspecializations.skillspecialization).map(spec => spec.name);
            }

            // Precaution to later only deal with complete SkillField data models.
            _mergeWithMissingSkillFields(parsedSkill);
        }
    }
}

