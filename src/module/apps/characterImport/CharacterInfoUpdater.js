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
     * @param {*} actorData The actor data (actor.data not actor.data.data) that is used as the basis for the import. Will not be changed.
     * @param {*} chummerChar The chummer character to parse.
     */
    update(actorData, chummerChar) {

        const clonedActorData = duplicate(actorData);

        // Name is required, so we need to always set something (even if the chummer field is empty)
        if (chummerChar.alias) {
            clonedActorData.name = chummerChar.alias;
        }
        else {
            clonedActorData.name = chummerChar.name ? chummerChar.name : '[Name not found]';
        }

        this.importBasicData(clonedActorData.data, chummerChar);
        this.importBio(clonedActorData.data, chummerChar);
        this.importAttributes(clonedActorData.data, chummerChar)
        this.importInitiative(clonedActorData.data, chummerChar);
        this.importSkills(clonedActorData.data, chummerChar);

        return clonedActorData;
    }

    importBasicData(actorDataData, chummerChar) {

        try {
            if (chummerChar.playername) {
                actorDataData.player_name = chummerChar.playername;
            }
            if (chummerChar.alias) {
                actorDataData.name = chummerChar.alias;
            }
            if (chummerChar.metatype) {
                actorDataData.metatype = chummerChar.metatype;
            }
            if (chummerChar.sex) {
                actorDataData.sex = chummerChar.sex;
            }
            if (chummerChar.age) {
                actorDataData.age = chummerChar.age;
            }
            if (chummerChar.height) {
                actorDataData.height = chummerChar.height;
            }
            if (chummerChar.weight) {
                actorDataData.weight = chummerChar.weight;
            }
            if (chummerChar.calculatedstreetcred) {
                actorDataData.street_cred = chummerChar.calculatedstreetcred;
            }
            if (chummerChar.calculatednotoriety) {
                actorDataData.notoriety = chummerChar.calculatednotoriety;
            }
            if (chummerChar.calculatedpublicawareness) {
                actorDataData.public_awareness = chummerChar.calculatedpublicawareness;
            }
            if (chummerChar.karma) {
                actorDataData.karma.value = chummerChar.karma;
            }
            if (chummerChar.totalkarma) {
                actorDataData.karma.max = chummerChar.totalkarma;
            }
            if (chummerChar.technomancer && chummerChar.technomancer.toLowerCase() === 'true') {
                actorDataData.special = 'resonance';
            }
            if (
                (chummerChar.magician && chummerChar.magician.toLowerCase() === 'true') ||
                (chummerChar.adept && chummerChar.adept.toLowerCase() === 'true')
            ) {
                actorDataData.special = 'magic';
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
                    if (attName !== 'willpower') actorDataData.magic.attribute = att;
                });
            }
            if (chummerChar.totaless) {
                actorDataData.attributes.essence.value = chummerChar.totaless;
            }
            if (chummerChar.nuyen) {
                actorDataData.nuyen = parseInt(chummerChar.nuyen.replace(',', ''));
            }
        } catch (e) {
            console.error(`Error while parsing character information ${e}`);
        }
    }

    importBio(actorDataData, chummerChar) {
        actorDataData.description.value = '';

        // Chummer outputs html and wraps every section in <p> tags,
        // so we just concat everything with an additional linebreak in between
        if (chummerChar.description) {
            actorDataData.description.value += TextEditor.enrichHTML(chummerChar.description + '<br/>');
        }

        if (chummerChar.background) {
            actorDataData.description.value += TextEditor.enrichHTML(chummerChar.background + '<br/>');
        }

        if (chummerChar.concept) {
            actorDataData.description.value += TextEditor.enrichHTML(chummerChar.concept + '<br/>');
        }

        if (chummerChar.notes) {
            actorDataData.description.value += TextEditor.enrichHTML(chummerChar.notes + '<br/>');
        }
    }

    importAttributes(actorDataData, chummerChar) {
        const atts = chummerChar.attributes[1].attribute;
        atts.forEach((att) => {
            try {
                const attName = this.parseAttName(att.name);
                if (attName) {
                    actorDataData.attributes[attName].base = this.parseAttBaseValue(att);
                }

            } catch (e) {
                console.error(`Error while parsing attributes ${e}`);
            }
        });
    }

    // TODO: These modifiers are very unclear in how they're used here and where they come from.
    importInitiative(actorDataData, chummerChar) {
        try {
            actorDataData.modifiers.meat_initiative = chummerChar.initbonus;

            // 'initdice' contains the total amount of initiative dice, not just the bonus.
            actorDataData.modifiers.meat_initiative_dice = chummerChar.initdice - 1;
        } catch (e) {
            console.error(`Error while parsing initiative ${e}`);
        }
    }

    importSkills(actorDataData, chummerChar) {
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
                        actorDataData.skills.language.value[id] = parsedSkill;
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
                                skillCategory = actorDataData.skills.knowledge.street.value;
                            if (cat === 'academic')
                                skillCategory = actorDataData.skills.knowledge.academic.value;
                            if (cat === 'professional')
                                skillCategory = actorDataData.skills.knowledge.professional.value;
                            if (cat === 'interest')
                                skillCategory = actorDataData.skills.knowledge.interests.value;
                            if (skillCategory)
                                skillCategory[id] = parsedSkill;
                        }
                        else {
                            if (chummerSkill.attribute.toLowerCase() === 'int') {
                                actorDataData.skills.knowledge.street.value[id] = parsedSkill;
                            }
                            if (chummerSkill.attribute.toLowerCase() === 'log') {
                                actorDataData.skills.knowledge.professional.value[id] = parsedSkill;
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
                        parsedSkill = actorDataData.skills.active[name];
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

