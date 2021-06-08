import SpriteActorData = Shadowrun.SpriteData;
import { SkillsPrep } from './functions/SkillsPrep';
import { ModifiersPrep } from './functions/ModifiersPrep';
import { InitiativePrep } from './functions/InitiativePrep';
import { AttributesPrep } from './functions/AttributesPrep';
import { LimitsPrep } from './functions/LimitsPrep';
import { MatrixPrep } from './functions/MatrixPrep';
import SpriteType = Shadowrun.SpriteType;
import { Helpers } from '../../helpers';
import { PartsList } from '../../parts/PartsList';
import SpriteData = Shadowrun.SpriteData;
import {SR5ItemDataWrapper} from "../../data/SR5ItemDataWrapper";


export function SpriteDataPrepare(data: SpriteData, items: SR5ItemDataWrapper[]) {
    ModifiersPrep.prepareModifiers(data);
    ModifiersPrep.clearAttributeMods(data);

    SpritePrep.prepareSpriteData(data);
    MatrixPrep.prepareAttributesForDevice(data);

    SkillsPrep.prepareSkills(data);
    AttributesPrep.prepareAttributes(data);
    LimitsPrep.prepareLimits(data);

    MatrixPrep.prepareMatrixToLimitsAndAttributes(data);

    InitiativePrep.prepareCurrentInitiative(data);

    data.special = 'resonance';
}
/**
 * Prepare a Sprite Type of Actor
 */
export class SpritePrep {
    /**
     * Prepares basic Sprite specific data
     * - matrix attribute values
     * - device rating
     * - matrix condition monitor
     * - matrix initiative
     * - skills
     * @param data
     */
    static prepareSpriteData(data: SpriteActorData) {
        const { level, skills, matrix, spriteType, initiative, attributes, modifiers } = data;

        const matrixAtts = ['attack', 'sleaze', 'data_processing', 'firewall'];

        const overrides = this.getSpriteStatModifiers(spriteType);

        // apply the matrix overrides
        matrixAtts.forEach((att) => {
            if (matrix[att] !== undefined) {
                matrix[att].base = level + overrides[att];
                matrix[att].value = Helpers.calcTotal(matrix[att]);
            }
        });

        // setup initiative from overrides
        initiative.matrix.base.base = level * 2 + overrides.init;
        PartsList.AddUniquePart(initiative.matrix.base.mod, 'SR5.Bonus', modifiers['matrix_initiative']);
        Helpers.calcTotal(initiative.matrix.base);

        initiative.matrix.dice.base = 4;
        PartsList.AddUniquePart(initiative.matrix.dice.mod, 'SR5.Bonus', modifiers['matrix_initiative_dice']);
        Helpers.calcTotal(initiative.matrix.dice);

        // always in matrix perception
        initiative.perception = 'matrix';

        // calculate resonance value
        attributes.resonance.base = level + overrides.resonance;
        Helpers.calcTotal(attributes.resonance);

        // apply skill levels
        // clear skills that we don't have
        for (const [skillId, skill] of Object.entries(skills.active)) {
            skill.base = overrides.skills.find((s) => s === skillId) ? level : 0;
        }

        matrix.rating = level;
        matrix.condition_monitor.max = 8 + Math.ceil(level / 2);
    }

    /**
     * Get the stat modifiers for the specified type of sprite
     * @param spriteType
     */
    static getSpriteStatModifiers(spriteType: SpriteType) {
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
        }
        return overrides;
    }
}
