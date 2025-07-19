import { SkillsPrep } from './functions/SkillsPrep';
import { AttributesPrep } from './functions/AttributesPrep';
import { LimitsPrep } from './functions/LimitsPrep';
import { MovementPrep } from './functions/MovementPrep';
import { WoundsPrep } from './functions/WoundsPrep';
import { ModifiersPrep } from './functions/ModifiersPrep';
import { InitiativePrep } from './functions/InitiativePrep';
import { Helpers } from '../../helpers';
import { PartsList } from "../../parts/PartsList";
import { SkillFlow } from "../flows/SkillFlow";
import { CharacterPrep } from './CharacterPrep';
import { GruntPrep } from './functions/GruntPrep';
import { DataDefaults } from '../../data/DataDefaults';
import { SR5 } from '../../config';
import { SR } from '../../constants';
import { SkillFieldType, SkillsType } from 'src/module/types/template/Skills';
import { SR5Item } from 'src/module/item/SR5Item';
import { AttributesType } from 'src/module/types/template/Attributes';


export class SpiritPrep {
    static prepareBaseData(system: Actor.SystemOfType<'spirit'>) {
        SpiritPrep.prepareSpiritSpecial(system);
        SkillsPrep.prepareSkillData(system);

        ModifiersPrep.clearAttributeMods(system);
        ModifiersPrep.clearArmorMods(system);
        ModifiersPrep.clearLimitMods(system);
    }

    static prepareDerivedData(system: Actor.SystemOfType<'spirit'>, items: SR5Item[]) {
        SpiritPrep.prepareSpiritBaseData(system);

        // Use spirit attribute range to avoid issues with attribute calculation causing unusable attributes.
        AttributesPrep.prepareAttributes(system, SR.attributes.rangesSpirit);
        SpiritPrep.prepareAttributesWithForce(system);
        SkillsPrep.prepareSkills(system);

        LimitsPrep.prepareLimitBaseFromAttributes(system);
        LimitsPrep.prepareLimits(system);
        LimitsPrep.prepareDerivedLimits(system);

        SpiritPrep.prepareSpiritArmor(system);

        GruntPrep.prepareConditionMonitors(system);

        MovementPrep.prepareMovement(system);
        WoundsPrep.prepareWounds(system);

        InitiativePrep.prepareCurrentInitiative(system);

        CharacterPrep.prepareRecoil(system);
        CharacterPrep.prepareRecoilCompensation(system);
    }

    static prepareSpiritSpecial(system: Actor.SystemOfType<'spirit'>) {
        // Spirits will always be awakened.
        // system.special = 'magic';
    }

    static prepareSpiritBaseData(system: Actor.SystemOfType<'spirit'>) {
        const overrides = this.getSpiritStatModifiers(system.spiritType);

        if (overrides) {
            const { attributes, skills, initiative, force, modifiers } = system;

            // set the base of attributes to the provided force
            for (const [attId, value] of Object.entries(overrides.attributes)) {
                if (attributes[attId] !== undefined) {
                    attributes[attId].base = (value ?? 0) + force;
                }
            }

            // set the base of skills to the provided force
            for (const skillId of overrides.skills) {
                // Custom skills need to be created on the actor.
                const skill = SpiritPrep.prepareActiveSkill(skillId, skills.active);
                if (skill === undefined) continue;
                if (SkillFlow.isCustomSkill(skill)) continue;

                skill.base = overrides.halfValueSkill ? Math.ceil(force / 2) : force;
                skills.active[skillId] = skill;
            }

            // prepare initiative data
            initiative.meatspace.base.base = force * overrides.init_mult + overrides.init + Number(modifiers['astral_initiative']);
            initiative.meatspace.base.mod = PartsList.AddUniquePart(initiative.meatspace.base.mod, "SR5.Bonus", Number(modifiers['meat_initiative']));
            initiative.meatspace.dice.base = overrides.init_dice;
            initiative.meatspace.dice.mod = PartsList.AddUniquePart(initiative.meatspace.dice.mod, "SR5.Bonus", Number(modifiers['meat_initiative_dice']));

            initiative.astral.base.base = force * overrides.astral_init_mult + overrides.astral_init + Number(modifiers['astral_initiative_dice']);
            initiative.astral.base.mod = PartsList.AddUniquePart(initiative.astral.base.mod, "SR5.Bonus", Number(modifiers['astral_initiative']));
            initiative.astral.dice.base = overrides.astral_init_dice;
            initiative.astral.dice.mod = PartsList.AddUniquePart(initiative.astral.dice.mod, "SR5.Bonus", Number(modifiers['astral_initiative_dice']));
        }
    }

    /**
     * Spirits can have some none default skills. The must be created first and don't count as custom skills.
     * @param skillId Whatever skill id should be used.
     * @param skills The list of active skills of the sprite.
     * @returns A prepared SkillField without levels.
     */
    static prepareActiveSkill(skillId: string, skills: SkillsType): SkillFieldType {
        if (skills[skillId]) return skills[skillId];

        const label = SR5.activeSkills[skillId];
        const attribute = SR5.activeSkillAttribute[skillId];

        return DataDefaults.createData('skill_field', { label, attribute, canDefault: false })
    }

    static prepareSpiritArmor(system: Actor.SystemOfType<'spirit'>) {
        const { armor, attributes } = system;
        armor.base = (attributes.essence.value ?? 0) * 2;
        armor.value = Helpers.calcTotal(armor);
        armor.hardened = true;
    }

    /**
     * get the attribute and initiative modifiers and skills
     */
    static getSpiritStatModifiers(spiritType: string) {
        if (!spiritType) return;

        const overrides = {
            // value of 0 for attribute makes it equal to the Force
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            attributes: {
                body: 0,
                agility: 0,
                reaction: 0,
                strength: 0,
                willpower: 0,
                logic: 0,
                intuition: 0,
                charisma: 0,
                magic: 0,
                essence: 0,
            } as Partial<Record<keyof AttributesType, number>>,
            // modifiers for after the Force x init_mult + (init_dice)d6 calculation
            init: 0,
            astral_init: 0,
            init_mult: 2,
            astral_init_mult: 2,
            init_dice: 2,
            astral_init_dice: 3,
            // skills are all set to Force
            skills: [] as string[],
            halfValueSkill: false as boolean
        };
        switch (spiritType) {
            case 'air':
                overrides.attributes.body = -2;
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 4;
                overrides.attributes.strength = -3;
                overrides.init = 4;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'unarmed_combat');
                break;
            case 'aircraft':
                overrides.attributes.body = 2;
                overrides.attributes.agility = 1;
                overrides.attributes.strength = 1;
                overrides.attributes.logic = -2;
                overrides.skills.push('free_fall', 'navigation', 'perception', 'pilot_aircraft', 'unarmed_combat');
                break;
            case 'airwave':
                overrides.attributes.body = 2;
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 4;
                overrides.attributes.strength = -3;
                overrides.init = 4;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'impersonation', 'perception', 'running', 'unarmed_combat');
                break;
            case 'ally':
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'unarmed_combat');
                break;
            case 'automotive':
                overrides.attributes.body = 1;
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 1;
                overrides.attributes.logic = -2;
                overrides.init = 1;
                overrides.skills.push('navigation', 'perception', 'pilot_ground_craft', 'running', 'unarmed_combat');
                break;
            case 'beasts':
                overrides.attributes.body = 2;
                overrides.attributes.agility = 1;
                overrides.attributes.strength = 2;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'unarmed_combat');
                break;
            case 'blood_shade':
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = -1;
                overrides.attributes.charisma = 1;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'counterspelling', 'impersonation', 'perception', 'unarmed_combat');
                break;
            case 'bone':
                overrides.attributes.body = 3;
                overrides.attributes.strength = 2;
                overrides.attributes.logic = -1;
                overrides.attributes.charisma = -1;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'unarmed_combat');
                break;
            case 'ceramic':
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 2;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'unarmed_combat');
                break;
            case 'earth':
                overrides.attributes.body = 4;
                overrides.attributes.agility = -2;
                overrides.attributes.reaction = -1;
                overrides.attributes.strength = 4;
                overrides.attributes.logic = -1;
                overrides.init = -1;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'unarmed_combat');
                break;
            case 'energy':
                overrides.attributes.body = 1;
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 3;
                overrides.attributes.strength = -2;
                overrides.attributes.intuition = 1;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'unarmed_combat');
                break;
            case 'fire':
                overrides.attributes.body = 1;
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 3;
                overrides.attributes.strength = -2;
                overrides.attributes.intuition = 1;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'flight', 'perception', 'unarmed_combat');
                break;
            case 'guardian':
                overrides.attributes.body = 1;
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 3;
                overrides.attributes.strength = 2;
                overrides.init = 1;
                overrides.skills.push('assensing', 'astral_combat', 'blades', 'clubs', 'counterspelling', 'exotic_range', 'perception', 'unarmed_combat');
                break;
            case 'guidance':
                overrides.attributes.body = 3;
                overrides.attributes.agility = -1;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 1;
                overrides.skills.push('arcana', 'assensing', 'astral_combat', 'counterspelling', 'perception', 'unarmed_combat');
                break;
            case 'homunculus':
                delete overrides.attributes.body;
                overrides.attributes.agility = -2;
                overrides.attributes.reaction = -2;
                delete overrides.attributes.charisma;
                delete overrides.attributes.intuition;
                delete overrides.attributes.logic;
                delete overrides.attributes.willpower;
                overrides.init = 1;
                overrides.init_dice = 1;
                overrides.init_mult = 1;
                overrides.astral_init_dice = 0;
                overrides.astral_init_mult = 0;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'unarmed_combat');
                overrides.halfValueSkill = true;
                break;
            case 'man':
                overrides.attributes.body = 1;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = -2;
                overrides.attributes.intuition = 1;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'spellcasting', 'unarmed_combat');
                break;
            case 'metal':
                overrides.attributes.body = 4;
                overrides.attributes.agility = -2;
                overrides.attributes.reaction = -1;
                overrides.attributes.strength = 4;
                overrides.attributes.logic = -1;
                overrides.init = -1;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'unarmed_combat');
                break;
            case 'plant':
                overrides.attributes.body = 2;
                overrides.attributes.agility = -1;
                overrides.attributes.strength = 1;
                overrides.attributes.logic = -1;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'exotic_range', 'unarmed_combat');
                break;
            case 'ship':
                overrides.attributes.body = 4;
                overrides.attributes.agility = -1;
                overrides.attributes.reaction = -1;
                overrides.attributes.strength = 2;
                overrides.attributes.logic = -2;
                overrides.init = -1;
                overrides.skills.push('navigation', 'perception', 'pilot_water_craft', 'survival', 'swimming', 'unarmed_combat');
                break;
            case 'task':
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 2;
                overrides.init = 2;
                overrides.skills.push('artisan', 'assensing', 'astral_combat', 'perception', 'unarmed_combat');
                break;
            case 'train':
                overrides.attributes.body = 3;
                overrides.attributes.agility = -1;
                overrides.attributes.reaction = -1;
                overrides.attributes.strength = 2;
                overrides.attributes.willpower = 1;
                overrides.attributes.logic = -2;
                overrides.init = -1;
                overrides.skills.push('intimidation', 'navigation', 'perception', 'pilot_ground_craft', 'unarmed_combat');
                break;
            case 'watcher':
                delete overrides.attributes.body;
                delete overrides.attributes.agility;
                delete overrides.attributes.reaction;
                delete overrides.attributes.strength;
                overrides.attributes.willpower = -2;
                overrides.attributes.logic = -2;
                overrides.attributes.intuition = -2;
                overrides.attributes.charisma = -2;
                overrides.init_dice = 0;
                overrides.init_mult = 0;
                overrides.astral_init_dice = 1;
                overrides.skills.push('assensing', 'astral_combat', 'perception');
                overrides.halfValueSkill = true;
                break;
            case 'water':
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 2;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'unarmed_combat');
                break;

            case 'toxic_air':
                overrides.attributes.body = -2;
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 4;
                overrides.attributes.strength = -3;
                overrides.init = 4;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'running', 'unarmed_combat');
                break;
            case 'toxic_beasts':
                overrides.attributes.body = 2;
                overrides.attributes.agility = 1;
                overrides.attributes.strength = 2;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'gymnastics', 'perception', 'running', 'unarmed_combat');
                break;
            case 'toxic_earth':
                overrides.attributes.body = 4;
                overrides.attributes.agility = -2;
                overrides.attributes.reaction = -1;
                overrides.attributes.strength = 4;
                overrides.attributes.logic = -1;
                overrides.init = -1;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'unarmed_combat');
                break;
            case 'toxic_fire':
                overrides.attributes.body = 1;
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 3;
                overrides.attributes.strength = -2;
                overrides.attributes.intuition = 1;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'flight', 'unarmed_combat');
                break;
            case 'toxic_man':
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = -2;
                overrides.attributes.intuition = 1;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'spell_casting', 'unarmed_combat');
                break;
            case 'toxic_water':
                overrides.attributes.body = 1;
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 2;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'unarmed_combat');
                break;

            case 'blood':
                overrides.attributes.body = 2;
                overrides.attributes.agility = 2;
                overrides.attributes.strength = 2;
                overrides.attributes.logic = -1;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'running', 'unarmed_combat');
                break;

            case 'muse':
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 2;
                overrides.attributes.willpower = 1;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'con', 'gymnastics', 'intimidation', 'perception', 'unarmed_combat');
                break;
            case 'nightmare':
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 2;
                overrides.attributes.willpower = 1;
                overrides.attributes.intuition = 1;
                overrides.attributes.charisma = 2;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'con', 'gymnastics', 'intimidation', 'perception', 'unarmed_combat');
                break;
            case 'shade':
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 2;
                overrides.attributes.willpower = 1;
                overrides.attributes.intuition = 1;
                overrides.attributes.charisma = 2;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'con', 'gymnastics', 'intimidation', 'perception', 'unarmed_combat');
                break;
            case 'succubus':
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 2;
                overrides.attributes.willpower = 1;
                overrides.attributes.intuition = 1;
                overrides.attributes.charisma = 2;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'con', 'gymnastics', 'intimidation', 'perception', 'unarmed_combat');
                break;
            case 'wraith':
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 2;
                overrides.attributes.willpower = 1;
                overrides.attributes.intuition = 1;
                overrides.attributes.charisma = 2;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'con', 'gymnastics', 'intimidation', 'perception', 'unarmed_combat');
                break;

            // Shedim
            case 'shedim':
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 1;
                overrides.init = 2;
                overrides.init_dice = 1;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'unarmed_combat');
                break;

            case 'hopper':
                overrides.attributes.reaction = 4;
                overrides.attributes.intuition = 1;
                overrides.init = 6;
                overrides.init_dice = 1;
                overrides.skills.push('assensing', 'astral_combat', 'blades', 'gymnastics', 'perception', 'running', 'sneaking', 'throwing_weapons', 'unarmed_combat');
                break;

            case 'blade_summoned':
                overrides.attributes.body = 1;
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 1;
                overrides.init = 2;
                overrides.init_dice = 1;
                overrides.skills.push('assensing', 'astral_combat', 'blades', 'gymnastics', 'perception', 'running', 'sneaking', 'throwing_weapons', 'unarmed_combat');
                break;

            case 'horror_show':
                overrides.attributes.body = 1;
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 1;
                overrides.init = 2;
                overrides.init_dice = 1;
                overrides.skills.push('assensing', 'astral_combat', 'blades', 'con', 'disguise', 'gymnastics', 'impersonation', 'perception', 'running', 'sneaking', 'unarmed_combat');
                break;

            case 'unbreakable':
                overrides.attributes.body = 3;
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 1;
                overrides.attributes.strength = 3;
                overrides.attributes.logic = -1;
                overrides.init = 1;
                overrides.init_dice = 1;
                overrides.skills.push('assensing', 'astral_combat', 'clubs', 'perception', 'sneaking', 'throwing_weapons', 'unarmed_combat');
                break;

            case 'master_shedim':
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 1;
                overrides.attributes.logic = 1;
                overrides.attributes.intuition = 1;
                overrides.init = 3;
                overrides.init_dice = 1;
                overrides.skills.push('assensing', 'astral_combat', 'counterspelling', 'perception', 'spellcasting', 'unarmed_combat');
                break;

            // insect
            case 'caretaker':
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 1;
                overrides.init = 1;
                overrides.skills.push('assensing', 'astral_combat', 'leadership', 'perception', 'unarmed_combat');
                break;
            case 'nymph':
                overrides.attributes.body = 1;
                overrides.attributes.reaction = 3;
                overrides.attributes.strength = 1;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'gymnastics', 'spellcasting', 'unarmed_combat');
                break;
            case 'scout':
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 2;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'gymnastics', 'sneaking', 'unarmed_combat');
                break;
            case 'soldier':
                overrides.attributes.body = 3;
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 1;
                overrides.attributes.strength = 3;
                overrides.init = 1;
                overrides.skills.push('assensing', 'astral_combat', 'counterspelling', 'exotic_range', 'gymnastics', 'perception', 'unarmed_combat');
                break;
            case 'worker':
                overrides.attributes.strength = 1;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'unarmed_combat');
                break;
            case 'queen':
                overrides.attributes.body = 5;
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 4;
                overrides.attributes.strength = 5;
                overrides.attributes.willpower = 1;
                overrides.attributes.logic = 1;
                overrides.attributes.intuition = 1;
                overrides.init = 5;
                overrides.skills.push('assensing', 'astral_combat', 'con', 'counterspelling', 'gymnastics', 'leadership', 'negotiation', 'perception', 'spellcasting', 'unarmed_combat' );
                break;
            case "carcass":
                overrides.attributes.body = 3;
                overrides.attributes.strength = 2;
                overrides.attributes.charisma = -1;
                overrides.skills.push("assensing", "astral_combat", "perception", "unarmed_combat");
                break;
            case "corpse":
                overrides.attributes.body = 2;
                overrides.attributes.agility = -1;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = -2;
                overrides.attributes.intuition = 1;
                overrides.attributes.charisma = -1;
                overrides.init = 2;
                overrides.skills.push("assensing", "astral_combat", "perception", "unarmed_combat");
                break;
            case "rot":
                overrides.attributes.body = 3;
                overrides.attributes.agility = -2;
                overrides.attributes.strength = 1;
                overrides.attributes.logic = -1;
                overrides.attributes.charisma = -1;
                overrides.skills.push("assensing", "astral_combat", "counterspelling", "exotic_range", "perception", "unarmed_combat");
                break;
            case "palefile":
                overrides.attributes.body = 2;
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 3;
                overrides.attributes.strength = -2;
                overrides.attributes.intuition = 1;
                overrides.attributes.charisma = -1;
                overrides.init = 3;
                overrides.skills.push("assensing", "astral_combat", "exotic_range", "flight", "perception", "unarmed_combat");
                break;
            case "detritus":
                overrides.attributes.body = 5;
                overrides.attributes.agility = -3;
                overrides.attributes.reaction = -1;
                overrides.attributes.strength = 4;
                overrides.attributes.logic = -1;
                overrides.attributes.charisma = -1;
                overrides.init = -1;
                overrides.skills.push("assensing", "astral_combat", "exotic_range", "perception", "unarmed_combat");
                break;

            // Howling Shadow
            case "anarch":
                overrides.attributes.body = -1;
                overrides.attributes.agility = -1;
                overrides.attributes.reaction = 1;
                overrides.attributes.strength = -1;
                overrides.init = 1;
                overrides.skills.push("assensing", "automatics", "blades", "clubs", "con", "demolitions", "disguise", "forgery", "gymnastics", "impersonation", "locksmith", "palming", "perception", "pistols", "sneaking", "throwing_weapons", "unarmed_combat");
                break;

            case "arboreal":
                overrides.attributes.body = +2;
                overrides.attributes.strength = 1;
                overrides.attributes.essence = -2;
                overrides.skills.push("assensing", "astral_combat", "blade", "clubs", "unarmed_combat", "exotic_range", "perception");
                break;

            case "blackjack":
                overrides.attributes.body = 2;
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 1;
                overrides.init = 1;
                overrides.skills.push("assensing", "automatics", "blades", "clubs", "computer", "first_aid", "gymnastics", "intimidation", "locksmith", "longarms", "perception", "pilot_ground_craft", "pistols", "sneaking", "throwing_weapons", "unarmed_combat");
                break;

            case "boggle":
                overrides.attributes.body = -2;
                overrides.attributes.agility = -1;
                overrides.attributes.reaction = -1;
                overrides.attributes.strength = -2;
                overrides.attributes.willpower = 2;
                overrides.init = -1;
                overrides.skills.push("assensing", "astral_combat", "blades", "clubs", "unarmed_combat", "gymnastics", "perception");
                break;

            case "bugul":
                overrides.attributes.agility = -1;
                overrides.attributes.reaction = -1;
                overrides.attributes.strength = -2;
                overrides.attributes.willpower = 1;
                overrides.attributes.logic = 2;
                overrides.skills.push("artisan", "assensing", "astral_combat", "con", "counterspelling", "disenchanting", "gymnastics", "negotiation", "perception", "unarmed_combat");
                break;

            case "chindi":
                overrides.attributes.body = 2;
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 1;
                overrides.init = 2;
                overrides.skills.push("archery", "blades", "clubs", "first_aid", "gymnastics", "intimidation", "perception", "sneaking", "throwing_weapons", "unarmed_combat");
                break;

            // HS#119: This spirit types has fixed values that don't use general spirit rules...
            case "corpselight":
                break;

            case "croki":
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 2;
                overrides.init = 2;
                overrides.skills.push("artificing", "assensing", "astral_combat", "gymnastics", "perception", "ritual_spellcasting", "spellcasting");
                break;

            case "duende":
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 2;
                overrides.init = 2;
                overrides.skills.push("assensing", "astral_combat", "con", "gymnastics", "perception");
                break;

            case "ejerian":
                overrides.skills.push("assensing", "astral_combat", "automatics", "blades", "clubs", "computer", "first_aid", "gymnastics", "intimidation", "locksmith", "longarms", "perception", "pilot_ground_craft", "pistols", "sneaking", "throwing_weapons", "unarmed_combat");
                break;

            case "elvar":
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 2;
                overrides.init = 2;
                overrides.skills.push("assensing", "astral_combat", "con", "counterspelling", "disenchanting", "gymnastics", "perception", "spellcasting");
                break;

            case "erinyes":
                overrides.attributes.body = -1;
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 2;
                overrides.init = 2;
                overrides.skills.push("assensing", "astral_combat", "flight", "gymnastics", "perception", "sneaking", "unarmed_combat");
                break;

            case "green_man":
                overrides.attributes.body = 3;
                overrides.attributes.agility = -1;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 4;
                overrides.init = 2;
                overrides.skills.push("assensing", "astral_combat", "counterspelling", "gymnastics", "leadership", "perception", "unarmed_combat");
                break;

            case "imp":
                overrides.attributes.reaction = 3;
                overrides.init = 3;
                overrides.skills.push("alchemy", "assensing", "astral_combat", "con", "counterspelling", "disenchanting", "gymnastics", "intimidation", "perception", "spellcasting", "unarmed_combat");
                break;

            case "jarl":
                overrides.attributes.body = 2;
                overrides.attributes.agility = -2;
                overrides.attributes.reaction = 3;
                overrides.attributes.strength = 2;
                overrides.init = 4;
                overrides.skills.push("assensing", "astral_combat", "counterspelling", "gymnastics", "leadership", "perception", "unarmed_combat");
                break;

            case "kappa":
                overrides.attributes.body = 5;
                overrides.attributes.reaction = -1;
                overrides.attributes.strength = 1;
                overrides.attributes.essence = -2;
                overrides.init = -1;
                overrides.skills.push("assensing", "astral_combat", "exotic_range", "gymnastics", "perception", "unarmed_combat");
                break;

            case "kokopelli":
                overrides.attributes.body = -1;
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 2;
                overrides.init = 2;
                overrides.skills.push("artisan", "assensing", "astral_combat", "leadership", "perception", "unarmed_combat");
                break;

            case "morbi":
                overrides.attributes.reaction = 1;
                overrides.attributes.strength = -2;
                overrides.attributes.intuition = 1;
                overrides.attributes.charisma = 2;
                overrides.init = 2;
                overrides.skills.push("assensing", "astral_combat", "perception", "ritual_spellcasting", "sneaking", "unarmed_combat");
                break;

            case "nocnitsa":
                overrides.attributes.body = -3;
                overrides.attributes.agility = 4;
                overrides.attributes.reaction = 5;
                overrides.attributes.strength = -2;
                overrides.attributes.willpower = -1;
                overrides.init = 5;
                overrides.skills.push("assensing", "astral_combat", "perception", "sneaking", "unarmed_combat");
                break;

            case "phantom":
                overrides.attributes.body = 1;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = -2;
                overrides.init = 2;
                overrides.skills.push("assensing", "astral_combat", "gymnastics", "perception", "unarmed_combat");
                break;

            case "preta":
                overrides.attributes.body = -1;
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = -1;
                overrides.init = 2;
                overrides.skills.push("assensing", "astral_combat", "intimidation", "negotiation", "perception", "sneaking", "unarmed_combat");
                break;

            case "stabber":
                overrides.attributes.body = 1;
                overrides.attributes.agility = 4;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 4;
                overrides.init = 2;
                overrides.skills.push("assensing", "astral_combat", "gymnastics", "perception", "unarmed_combat");
                break;

            case "tungak":
                overrides.attributes.body = 1;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = -2;
                overrides.init = 2;
                overrides.skills.push("assensing", "astral_combat", "gymnastics", "perception", "unarmed_combat");
                break;

            case "vucub_caquix":
                overrides.attributes.body = 3;
                overrides.attributes.agility = 4;
                overrides.attributes.reaction = 4;
                overrides.attributes.strength = 2;
                overrides.attributes.intuition = 2;
                overrides.attributes.charisma = 4;
                overrides.init = 5;
                overrides.skills.push("assensing", "flight", "perception", "unarmed_combat");
                break;

            // AET#34-37: This spirit types has fixed values that don't use general spirit rules...
            case "gum_toad":
                overrides.attributes.body = 7;
                overrides.attributes.agility = -2;
                overrides.attributes.strength = 2;
                overrides.attributes.charisma = 1;
                overrides.attributes.willpower = -1;
                overrides.skills.push("assensing", "astral_combat", "perception", "unarmed_combat");
                break;

            case "crawler":
                overrides.attributes.body = 4;
                overrides.attributes.reaction = 3;
                overrides.attributes.strength = 6;
                overrides.attributes.charisma = -1;
                overrides.attributes.intuition = 3;
                overrides.attributes.willpower = -1;
                overrides.init = 6;
                overrides.astral_init = 6;
                overrides.skills.push("assensing", "astral_combat", "perception", "running", "sneaking", "unarmed_combat");
                break;
                
            case "ghasts":
                overrides.attributes.body = 2;
                overrides.attributes.reaction = 2;
                overrides.init = 2;
                overrides.skills.push("assensing", "astral_combat", "flight", "perception", "spellcasting", "unarmed_combat");
                break;

            case "vrygoths":
                overrides.attributes.body = 4;
                overrides.attributes.strength = 3;
                overrides.attributes.logic = 3;
                overrides.skills.push("assensing", "astral_combat", "flight", "perception", "spellcasting", "unarmed_combat");
                break;

            case "gremlin":
                overrides.attributes.reaction = 3;
                overrides.init = 3;
                overrides.skills.push("assensing", "astral_combat", "con", "counterspelling", "intimidation", "perception", "spellcasting", "unarmed_combat");
                break;

            case "anansi":
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 2;
                overrides.init = 2;
                overrides.skills.push("assensing", "astral_combat", "gymnastics", "perception", "sneaking", "unarmed_combat");
                break;

            case "tsuchigumo_warrior":
                overrides.attributes.body = 2;
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 1;
                overrides.attributes.strength = 3;
                overrides.init = 1;
                overrides.skills.push("assensing", "astral_combat", "counterspelling", "perception", "unarmed_combat");
                break;

            // HT#129
            case "corps_cadavre":
                overrides.attributes.body = 2;
                overrides.attributes.agility = -2;
                overrides.attributes.reaction = -2;
                delete overrides.attributes.charisma;
                delete overrides.attributes.intuition;
                delete overrides.attributes.logic;
                delete overrides.attributes.willpower;
                overrides.init = 1;
                overrides.init_dice = 1;
                overrides.init_mult = 1;
                overrides.astral_init_dice = 1;
                overrides.astral_init_mult = 1;
                overrides.skills.push("assensing", "astral_combat", "perception", "unarmed_combat");
                break;
        }

        return overrides;
    }

    /**
     * The spirits force value is used for the force attribute value.
     * 
     * NOTE: This separation is mainly a legacy concern. Attributes are available as testable (and modifiable values)
     *       flat values like force aren't. For this reason the flat value is transformed to an attribute.
     * 
     * @param system The spirit system data to prepare
     */
    static prepareAttributesWithForce(system: Actor.SystemOfType<'spirit'>) {
        const { attributes, force } = system;

        // Allow value to be understandable when displayed.
        attributes.force.base = 0;
        PartsList.AddUniquePart(attributes.force.mod, 'SR5.Force', force);
        AttributesPrep.calculateAttribute('force', attributes.force);
    }
}
