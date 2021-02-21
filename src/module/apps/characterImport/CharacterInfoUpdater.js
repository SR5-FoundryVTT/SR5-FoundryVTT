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
        clonedActorData.name = chummerChar.alias ? chummerChar.alias : '[Name not found]';
        
        this.importBasicData(clonedActorData.data, chummerChar);
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
        const skills = chummerChar.skills.skill;
        for (let i = 0; i < skills.length; i++) {
            try {
                const s = skills[i];
                if (s.rating > 0 && s.islanguage) {
                    let group = 'active';
                    let skill = null;
                    const id = randomID(16);
                    if (s.islanguage && s.islanguage.toLowerCase() === 'true') {
                        skill = {};
                        actorDataData.skills.language.value[id] = skill;
                        group = 'language';
                    } else if (s.knowledge && s.knowledge.toLowerCase() === 'true') {
                        const category = s.skillcategory_english;
                        console.log(category);
                        skill = {};
                        let skillCategory;
                        if (category) {
                            console.log('found category', category);
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
                                skillCategory[id] = skill;
                        } else {
                            if (s.attribute.toLowerCase() === 'int') {
                                actorDataData.skills.knowledge.street.value[id] = skill;
                            }
                            if (s.attribute.toLowerCase() === 'log') {
                                actorDataData.skills.knowledge.professional.value[id] = skill;
                            }
                        }
                        group = 'knowledge';
                    } else {
                        let name = s.name
                            .toLowerCase()
                            .trim()
                            .replace(/\s/g, '_')
                            .replace(/-/g, '_');
                        if (name.includes('exotic') && name.includes('_weapon'))
                            name = name.replace('_weapon', '');
                        skill = actorDataData.skills.active[name];
                    }
                    if (!skill)
                        console.error(`Couldn't parse skill ${s.name}`);
                    if (skill) {
                        if (group !== 'active')
                            skill.name = s.name;
                        skill.base = parseInt(s.rating);

                        if (s.skillspecializations) {
                            skill.specs = this.getArray(
                                s.skillspecializations.skillspecialization.name
                            );
                        }

                        skill = _mergeWithMissingSkillFields(skill);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
    }


}

