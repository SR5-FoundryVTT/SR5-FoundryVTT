import { BaseActorPrep } from './BaseActorPrep';
import SpiritActorData = Shadowrun.SpiritActorData;
import SR5SpiritType = Shadowrun.SR5SpiritType;
import { ItemPrep } from './functions/ItemPrep';
import { SkillsPrep } from './functions/SkillsPrep';
import { AttributesPrep } from './functions/AttributesPrep';
import { LimitsPrep } from './functions/LimitsPrep';
import { ConditionMonitorsPrep } from './functions/ConditionMonitorsPrep';
import { MovementPrep } from './functions/MovementPrep';
import { WoundsPrep } from './functions/WoundsPrep';
import { ModifiersPrep } from './functions/ModifiersPrep';
import { InitiativePrep } from './functions/InitiativePrep';
import SpiritType = Shadowrun.SpiritType;

export class SpiritPrep extends BaseActorPrep<SR5SpiritType, SpiritActorData> {
    prepare() {
        ModifiersPrep.prepareModifiers(this.data);
        ItemPrep.prepareArmor(this.data, this.items);

        SpiritPrep.prepareSpiritBaseData(this.data);

        SkillsPrep.prepareSkills(this.data);
        AttributesPrep.prepareAttributes(this.data);
        LimitsPrep.prepareLimits(this.data);

        ConditionMonitorsPrep.prepareStun(this.data);
        ConditionMonitorsPrep.preparePhysical(this.data);

        MovementPrep.prepareMovement(this.data);
        WoundsPrep.prepareWounds(this.data);

        InitiativePrep.prepareCurrentInitiative(this.data);

        this.data.special = 'magic';
    }

    static prepareSpiritBaseData(data: SpiritActorData) {
        const overrides = this.getSpiritStatModifiers(data.spiritType);

        if (overrides) {
            const { attributes, skills, initiative, force, modifiers } = data;

            // set the base of attributes to the provided value
            for (const [attId, value] of Object.entries(overrides.attributes)) {
                if (attributes[attId] !== undefined) {
                    attributes[attId].base = value + force;
                }
            }

            for (const [skillId, skill] of Object.entries(skills.active)) {
                skill.base = overrides.skills.find((s) => s === skillId) ? force : 0;
            }

            // prepare initiative data
            initiative.meatspace.base.base = force * 2 + overrides.init + Number(modifiers['astral_initiative']);
            initiative.meatspace.dice.base = 2;
            initiative.astral.base.base = force * 2 + overrides.astral_init + Number(modifiers['astral_initiative_dice']);
            initiative.astral.dice.base = 3;
        }
    }

    /**
    // base types
    air: 'SR5.Spirit.Air',
    beasts: 'SR5.Spirit.Beasts',
    earth: 'SR5.Spirit.Earth',
    fire: 'SR5.Spirit.Fire',
    guardian: 'SR5.Spirit.Guardian',
    guidance: 'SR5.Spirit.Guidance',
    man: 'SR5.Spirit.Man',
    plant: 'SR5.Spirit.Plant',
    task: 'SR5.Spirit.Task',
    water: 'SR5.Spirit.Water',

    // toxic types
    toxic_air: 'SR5.Spirit.ToxicAir',
    toxic_beasts: 'SR5.Spirit.ToxicBeasts',
    toxic_earth: 'SR5.Spirit.ToxicEarth',
    toxic_fire: 'SR5.Spirit.ToxicFire',
    toxic_man: 'SR5.Spirit.ToxicMan',
    toxic_water: 'SR5.Spirit.ToxicWater',

    // blood types
    blood: 'SR5.Spirit.Blood',

    // shadow types
    muse: 'SR5.Spirit.Muse',
    nightmare: 'SR5.Spirit.Nightmare',
    shade: 'SR5.Spirit.Shade',
    succubus: 'SR5.Spirit.Succubus',
    wraith: 'SR5.Spirit.Wraith',

    // shedim types
    shedim: 'SR5.Spirit.Shedim',
    master_shedim: 'SR5.Spirit.MasterShedim',

    // insect types
    caretaker: 'SR5.Spirit.Caretaker',
    nymph: 'SR5.Spirit.Nymph',
    scout: 'SR5.Spirit.Scout',
    soldier: 'SR5.Spirit.Soldier',
    worker: 'SR5.Spirit.Worker',
    queen: 'SR5.Spirit.Queen',
     */
    static getSpiritStatModifiers(spiritType: SpiritType) {
        const overrides = {
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
            },
            init: 0,
            astral_init: 0,
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
            case 'beasts':
                overrides.attributes.body = 2;
                overrides.attributes.agility = 1;
                overrides.attributes.strength = 2;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'unarmed_combat');
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
                overrides.attributes.logic = 1;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'spellcasting', 'unarmed_combat');
                break;
            case 'plant':
                overrides.attributes.body = 2;
                overrides.attributes.agility = -1;
                overrides.attributes.strength = 1;
                overrides.attributes.logic = -1;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'exotic_range', 'unarmed_combat');
                break;
            case 'task':
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 2;
                overrides.init = 2;
                overrides.skills.push('artisan', 'assensing', 'astral_combat', 'perception', 'unarmed_combat');
                break;
            case 'water':
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 2;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'unarmed_combat');
                break;
        }
        return overrides;
    }
}
