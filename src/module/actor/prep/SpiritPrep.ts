import {SkillsPrep} from './functions/SkillsPrep';
import {AttributesPrep} from './functions/AttributesPrep';
import {LimitsPrep} from './functions/LimitsPrep';
import {ConditionMonitorsPrep} from './functions/ConditionMonitorsPrep';
import {MovementPrep} from './functions/MovementPrep';
import {WoundsPrep} from './functions/WoundsPrep';
import {ModifiersPrep} from './functions/ModifiersPrep';
import {InitiativePrep} from './functions/InitiativePrep';
import {Helpers} from '../../helpers';
import {PartsList} from "../../parts/PartsList";
import {SR5ItemDataWrapper} from "../../data/SR5ItemDataWrapper";
import {SkillFlow} from "../flows/SkillFlow";
import SpiritType = Shadowrun.SpiritType;
import SpiritData = Shadowrun.SpiritData;


export class SpiritPrep {
    static prepareBaseData(data: SpiritData) {
        SpiritPrep.prepareSpiritSpecial(data);

        ModifiersPrep.prepareModifiers(data);
        ModifiersPrep.clearAttributeMods(data);
        ModifiersPrep.clearArmorMods(data);
        ModifiersPrep.clearLimitMods(data);
    }

    static prepareDerivedData(data: SpiritData, items: SR5ItemDataWrapper[]) {
        SpiritPrep.prepareSpiritBaseData(data);

        AttributesPrep.prepareAttributes(data);
        SkillsPrep.prepareSkills(data);

        LimitsPrep.prepareLimitBaseFromAttributes(data);
        LimitsPrep.prepareLimits(data);

        SpiritPrep.prepareSpiritArmor(data);

        ConditionMonitorsPrep.prepareStun(data);
        ConditionMonitorsPrep.preparePhysical(data);

        MovementPrep.prepareMovement(data);
        WoundsPrep.prepareWounds(data);

        InitiativePrep.prepareCurrentInitiative(data);
    }

    static prepareSpiritSpecial(data: SpiritData) {
        // Spirits will always be awakened.
        data.special = 'magic';
    }

    static prepareSpiritBaseData(data: SpiritData) {
        const overrides = this.getSpiritStatModifiers(data.spiritType);

        if (overrides) {
            const {attributes, skills, initiative, force, modifiers} = data;

            // set the base of attributes to the provided force
            for (const [attId, value] of Object.entries(overrides.attributes)) {
                if (attributes[attId] !== undefined) {
                    attributes[attId].base = value + force;
                }
            }

            // set base of skill according to force and spirit type
            for (const [skillId, skill] of Object.entries(skills.active)) {
                // Leave custom skills alone to allow users to change those at will.
                if (SkillFlow.isCustomSkill(skill)) continue;

                // Change default skills to the force rating.
                skill.base = overrides.skills.find((s) => s === skillId) ? force : 0;
            }

            // prepare initiative data
            initiative.meatspace.base.base = force * 2 + overrides.init + Number(modifiers['astral_initiative']);
            initiative.meatspace.base.mod = PartsList.AddUniquePart(initiative.meatspace.base.mod, "SR5.Bonus", Number(modifiers['meat_initiative']));
            initiative.meatspace.dice.base = 2;
            initiative.meatspace.dice.mod = PartsList.AddUniquePart(initiative.meatspace.dice.mod, "SR5.Bonus", Number(modifiers['meat_initiative_dice']));

            initiative.astral.base.base = force * 2 + overrides.astral_init + Number(modifiers['astral_initiative_dice']);
            initiative.astral.base.mod = PartsList.AddUniquePart(initiative.astral.base.mod, "SR5.Bonus", Number(modifiers['astral_initiative']));
            initiative.astral.dice.base = 3;
            initiative.astral.dice.mod = PartsList.AddUniquePart(initiative.astral.dice.mod, "SR5.Bonus", Number(modifiers['astral_initiative_dice']));
        }
    }

    static prepareSpiritArmor(data: SpiritData) {
        const {armor, attributes} = data;
        armor.base = (attributes.essence.value ?? 0) * 2;
        armor.value = Helpers.calcTotal(armor);
    }

    /**
     * get the attribute and initiative modifiers and skills
     */
    static getSpiritStatModifiers(spiritType: SpiritType) {
        const overrides = {
            // value of 0 for attribute makes it equal to the Force
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
            },
            // modifiers for after the Force x 2 calculation
            init: 0,
            astral_init: 0,
            // skills are all set to Force
            skills: [] as string[],
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
                overrides.skills.push('assensing', 'astral_combat', 'blades', 'clubs', 'counter_spelling', 'exotic_range', 'perception', 'unarmed_combat');
                break;
            case 'guidance':
                overrides.attributes.body = 3;
                overrides.attributes.agility = -1;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 1;
                overrides.skills.push('arcana', 'assensing', 'astral_combat', 'counter_spelling', 'perception', 'unarmed_combat');
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

            case 'shedim':
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 1;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'unarmed_combat');
                break;
            case 'master_shedim':
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 1;
                overrides.attributes.logic = 1;
                overrides.attributes.intuition = 1;
                overrides.init = 3;
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
                overrides.skills.push(
                    'assensing',
                    'astral_combat',
                    'con',
                    'counterspelling',
                    'gymnastics',
                    'leadership',
                    'negotiation',
                    'perception',
                    'spellcasting',
                    'unarmed_combat',
                );
                break;
        }
        return overrides;
    }
}
