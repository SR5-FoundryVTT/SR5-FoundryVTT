import {_mergeWithMissingSkillFields} from "../../actor/prep/functions/SkillsPrep";

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
     * @param {*} actorSource The actor data (actor.data not actor.data.data) that is used as the basis for the import. Will not be changed.
     * @param {*} chummerChar The chummer character to parse.
     */
    update(actorSource, chummerChar) {

        const clonedActorSource = duplicate(actorSource);

        // Name is required, so we need to always set something (even if the chummer field is empty)
        if (chummerChar.alias) {
            clonedActorSource.name = chummerChar.alias;
        }
        else {
            clonedActorSource.name = chummerChar.name ? chummerChar.name : '[Name not found]';
        }

        this.importBasicData(clonedActorSource.system, chummerChar);
        this.importBio(clonedActorSource.system, chummerChar);
        this.importAttributes(clonedActorSource.system, chummerChar)
        this.importInitiative(clonedActorSource.system, chummerChar);
        this.importSkills(clonedActorSource.system, chummerChar);

        return clonedActorSource;
    }

    importBasicData(system, chummerChar) {

        try {
            if (chummerChar.metatype) {
                system.metatype = chummerChar.metatype;
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
            if (chummerChar.technomancer && chummerChar.technomancer.toLowerCase() === 'true') {
                system.special = 'resonance';
            }
            if (
                (chummerChar.magician && chummerChar.magician.toLowerCase() === 'true') ||
                (chummerChar.adept && chummerChar.adept.toLowerCase() === 'true')
            ) {
                system.special = 'magic';
                let attr = [];
                if (
                    chummerChar.tradition &&
                    chummerChar.tradition.drainattribute &&
                    chummerChar.tradition.drainattribute.attr
                ) {
                    attr = chummerChar.tradition.drainattribute.attr;
                } else if (chummerChar.tradition && chummerChar.tradition.drainattributes) {
                    attr = chummerChar.tradition.drainattributes
                        .split('+')
                        .map((item) => item.trim());
                }
                attr.forEach((att) => {
                    const attName = this.parseAttName(att);
                    if (attName !== 'willpower') system.magic.attribute = att;
                });
            }
            if (chummerChar.totaless) {
                system.attributes.essence.value = chummerChar.totaless;
            }
            if (chummerChar.nuyen) {
                system.nuyen = parseInt(chummerChar.nuyen.replace(',', ''));
            }
        } catch (e) {
            console.error(`Error while parsing character information ${e}`);
        }
    }

    importBio(system, chummerChar) {
        system.description.value = '';

        // Chummer outputs html and wraps every section in <p> tags,
        // so we just concat everything with an additional linebreak in between
        if (chummerChar.description) {
            system.description.value += TextEditor.enrichHTML(chummerChar.description + '<br/>');
        }

        if (chummerChar.background) {
            system.description.value += TextEditor.enrichHTML(chummerChar.background + '<br/>');
        }

        if (chummerChar.concept) {
            system.description.value += TextEditor.enrichHTML(chummerChar.concept + '<br/>');
        }

        if (chummerChar.notes) {
            system.description.value += TextEditor.enrichHTML(chummerChar.notes + '<br/>');
        }
    }

    importAttributes(system, chummerChar) {
        const atts = chummerChar.attributes[1].attribute;
        atts.forEach((att) => {
            try {
                const attName = this.parseAttName(att.name);
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
        const chummerSkills = chummerChar.skills.skill;
        for (let i = 0; i < chummerSkills.length; i++) {
            try {
                const chummerSkill = chummerSkills[i];
                // NOTE: taMiF here: I have no idea what the general islanguage check has been added for.
                //                   it MIGHT be in order to exclude skill groups or some such, but I haven't found a reason
                //                   for it. Since it's working with it, I'll leave it to the pile. Warm your hands.
                if (chummerSkill.rating > 0 && chummerSkill.islanguage) {
                    let determinedGroup = 'active';
                    let parsedSkill = null;

                    // Either find an active skill are prepare knowledge skills.
                    if (chummerSkill.islanguage && chummerSkill.islanguage.toLowerCase() === 'true') {
                        const id = randomID(16);
                        parsedSkill = {};
                        system.skills.language.value[id] = parsedSkill;
                        determinedGroup = 'language';
                    }
                    else if (chummerSkill.knowledge && chummerSkill.knowledge.toLowerCase() === 'true') {
                        const id = randomID(16);
                        const category = chummerSkill.skillcategory_english;
                        parsedSkill = {};

                        // Determine the correct knowledge skill category and assign the skill to it
                        let skillCategory;
                        if (category) {
                            const cat = category.toLowerCase();
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
                            if (chummerSkill.attribute.toLowerCase() === 'int') {
                                system.skills.knowledge.street.value[id] = parsedSkill;
                            }
                            if (chummerSkill.attribute.toLowerCase() === 'log') {
                                system.skills.knowledge.professional.value[id] = parsedSkill;
                            }
                        }
                        determinedGroup = 'knowledge';
                    }
                    else {
                        let name = chummerSkill.name
                            .toLowerCase()
                            .trim()
                            .replace(/\s/g, '_')
                            .replace(/-/g, '_');
                        if (name.includes('exotic') && name.includes('_weapon'))
                            name = name.replace('_weapon', '');
                        if (name === 'pilot_watercraft')
                            name = 'pilot_water_craft';
                        parsedSkill = system.skills.active[name];
                    }

                    // Fill the found skill with a base rating.
                    if (!parsedSkill) {
                        console.error(`Couldn't parse skill ${chummerSkill.name}`);

                    } else {
                        if (determinedGroup !== 'active')
                            parsedSkill.name = chummerSkill.name;
                        parsedSkill.base = parseInt(chummerSkill.rating);

                        if (chummerSkill.skillspecializations) {
                            parsedSkill.specs = this.getArray(
                                chummerSkill.skillspecializations.skillspecialization.name
                            );
                        }

                        // Precaution to later only deal with complete SkillField data models.
                        _mergeWithMissingSkillFields(parsedSkill);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
    }


}

