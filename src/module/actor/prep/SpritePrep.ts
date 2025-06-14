import { SkillsPrep } from './functions/SkillsPrep';
import { ModifiersPrep } from './functions/ModifiersPrep';
import { InitiativePrep } from './functions/InitiativePrep';
import { AttributesPrep } from './functions/AttributesPrep';
import { LimitsPrep } from './functions/LimitsPrep';
import { MatrixPrep } from './functions/MatrixPrep';
import { Helpers } from '../../helpers';
import { PartsList } from '../../parts/PartsList';
import { SkillFieldType } from 'src/module/types/template/Skills';
import { SR5Item } from 'src/module/item/SR5Item';

/**
 * Prepare a Sprite Type of Actor
 */
export class SpritePrep {
    static prepareBaseData(system: Actor.SystemOfType<'sprite'>) {
        SpritePrep.prepareSpriteSpecial(system);
        SkillsPrep.prepareSkillData(system);

        ModifiersPrep.prepareModifiers(system);
        ModifiersPrep.clearAttributeMods(system);
        ModifiersPrep.clearLimitMods(system);
    }

    static prepareDerivedData(system: Actor.SystemOfType<'sprite'>, items: SR5Item[]) {
        SpritePrep.prepareSpriteMatrixAttributes(system);
        SpritePrep.prepareSpriteAttributes(system);
        SpritePrep.prepareSpriteSkills(system);

        AttributesPrep.prepareAttributes(system);
        SkillsPrep.prepareSkills(system);

        LimitsPrep.prepareLimits(system);

        MatrixPrep.prepareMatrixToLimitsAndAttributes(system);

        SpritePrep.prepareSpriteConditionMonitor(system);
        SpritePrep.prepareSpriteInitiative(system);

        InitiativePrep.prepareCurrentInitiative(system);
    }

    static prepareSpriteSpecial(system: Actor.SystemOfType<'sprite'>) {
        // Sprites are always awakened
        system.special = 'resonance';
    }

    static prepareSpriteAttributes(system: Actor.SystemOfType<'sprite'>) {
        const {attributes, level, spriteType} = system;

        const overrides = this.getSpriteStatModifiers(spriteType);

        // calculate resonance value
        attributes.resonance.base = level + overrides.resonance;
        Helpers.calcTotal(attributes.resonance);
    }

    static prepareSpriteMatrixAttributes(system: Actor.SystemOfType<'sprite'>) {
        const {level, matrix, spriteType} = system;

        const matrixAtts = ['attack', 'sleaze', 'data_processing', 'firewall'];

        const overrides = this.getSpriteStatModifiers(spriteType);

        // apply the matrix overrides
        matrixAtts.forEach((att) => {
            if (matrix[att] !== undefined) {
                matrix[att].base = level + overrides[att];
                matrix[att].value = Helpers.calcTotal(matrix[att]);
            }
        });

        matrix.rating = level;
    }

    static prepareSpriteSkills(system: Actor.SystemOfType<'sprite'>) {
        const {skills, level, spriteType} = system;

        const overrides = this.getSpriteStatModifiers(spriteType);

        // apply skill levels
        // clear skills that we don't have
        // FVTT types currently do not support the `TypedObjectField` type, so we need to cast it.
        for (const [skillId, skill] of Object.entries(skills.active as {[x: string]: SkillFieldType})) {
            skill.base = overrides.skills.find((s) => s === skillId) ? level : 0;
        }
    }

    static prepareSpriteConditionMonitor(system: Actor.SystemOfType<'sprite'>) {
        const {matrix, level, modifiers} = system;

        matrix.condition_monitor.max = 8 + Math.ceil(level / 2) + Number(modifiers.matrix_track);
    }

    static prepareSpriteInitiative(system: Actor.SystemOfType<'sprite'>) {
        const {initiative, level, spriteType, modifiers} = system;

        // always in matrix perception
        initiative.perception = 'matrix';

        const overrides = this.getSpriteStatModifiers(spriteType);

        // setup initiative from overrides
        initiative.matrix.base.base = level * 2 + overrides.init;
        PartsList.AddUniquePart(initiative.matrix.base.mod, 'SR5.Bonus', modifiers['matrix_initiative']);
        Helpers.calcTotal(initiative.matrix.base, {min: 0});

        initiative.matrix.dice.base = 4;
        PartsList.AddUniquePart(initiative.matrix.dice.mod, 'SR5.Bonus', modifiers['matrix_initiative_dice']);
        Helpers.calcTotal(initiative.matrix.dice, {min: 0});
    }

    /**
     * Get the stat modifiers for the specified type of sprite
     * @param spriteType
     */
    static getSpriteStatModifiers(spriteType: string) {
        const overrides = {
            attack: 0,
            sleaze: 0,
            data_processing: 0,
            firewall: 0,
            resonance: 0,
            init: 0,
            // all sprites have computer
            skills: ['computer'],
        };
        switch (spriteType) {
            case 'courier':
                overrides.sleaze = 3;
                overrides.data_processing = 1;
                overrides.firewall = 2;
                overrides.init = 1;
                overrides.skills.push('hacking');
                break;
            case 'crack':
                overrides.sleaze = 3;
                overrides.data_processing = 2;
                overrides.firewall = 1;
                overrides.init = 2;
                overrides.skills.push('hacking', 'electronic_warfare');
                break;
            case 'data':
                overrides.attack = -1;
                overrides.data_processing = 4;
                overrides.firewall = 1;
                overrides.init = 4;
                overrides.skills.push('electronic_warfare');
                break;
            case 'fault':
                overrides.attack = 3;
                overrides.data_processing = 1;
                overrides.firewall = 2;
                overrides.init = 1;
                overrides.skills.push('cybercombat', 'hacking');
                break;
            case 'machine':
                overrides.attack = 1;
                overrides.data_processing = 3;
                overrides.firewall = 2;
                overrides.init = 3;
                overrides.skills.push('electronic_warfare', 'hardware');
                break;
            case 'companion':
                overrides.attack = -1;
                overrides.sleaze = 1;
                overrides.firewall = 4;
                overrides.skills.push('electronic_warfare');
                break;
            case 'generalist':
                overrides.attack = 1;
                overrides.sleaze = 1;
                overrides.data_processing = 1;
                overrides.firewall = 1;
                overrides.init = 1;
                overrides.skills.push('hacking','electronic_warfare');
                break;
        }
        return overrides;
    }
}
