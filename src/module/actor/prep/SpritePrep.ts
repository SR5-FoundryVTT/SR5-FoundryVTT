import { SkillsPrep } from './functions/SkillsPrep';
import { InitiativePrep } from './functions/InitiativePrep';
import { AttributesPrep } from './functions/AttributesPrep';
import { LimitsPrep } from './functions/LimitsPrep';
import { MatrixPrep } from './functions/MatrixPrep';
import { SR5Item } from 'src/module/item/SR5Item';
import { ModifiableFieldPrep } from './functions/ModifiableFieldPrep';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import { MatrixRules } from '@/module/rules/MatrixRules';
import { SR5 } from '@/module/config';

/**
 * Prepare a Sprite Type of Actor
 */
export class SpritePrep {
    static prepareBaseData(system: Actor.SystemOfType<'sprite'>) {
        ModifiableFieldPrep.resetAllModifiers(system);
    }

    static prepareDerivedData(system: Actor.SystemOfType<'sprite'>, items: SR5Item[]) {
        const level = SpritePrep.getSpriteLevel(system);

        SpritePrep.prepareSpriteMatrixAttributes(system, level);
        SpritePrep.prepareSpriteAttributes(system, level);
        SpritePrep.prepareSpriteSkills(system, level);

        AttributesPrep.prepareAttributes(system);
        SkillsPrep.prepareSkills(system);

        LimitsPrep.prepareLimits(system);

        MatrixPrep.prepareMatrixToLimitsAndAttributes(system);

        SpritePrep.prepareMatrixTrack(system, level);

        InitiativePrep.prepareInit('sprite', system);
    }

    static getSpriteLevel(system: Actor.SystemOfType<'sprite'>): number {
        return ModifiableValue.calcTotal(system.attributes.level, { min: 1 });
    }

    static prepareSpriteAttributes(system: Actor.SystemOfType<'sprite'>, level: number) {
        const { attributes } = system;
        if (attributes.resonance.applies_special)
            ModifiableValue.addUniqueBase(attributes.resonance, 'SR5.Level', level);
        ModifiableValue.calcTotal(attributes.resonance);
    }

    static prepareSpriteMatrixAttributes(system: Actor.SystemOfType<'sprite'>, level: number) {
        const { matrix } = system;

        const matrixAtts = ['attack', 'sleaze', 'data_processing', 'firewall'] as const;

        for (const att of matrixAtts) {
            if (!matrix[att]) continue;
            if (matrix[att].applies_special)
                ModifiableValue.addUniqueBase(matrix[att], 'SR5.Level', level);
            ModifiableValue.calcTotal(matrix[att]);
        }

        matrix.rating = level;
    }

    static prepareSpriteSkills(system: Actor.SystemOfType<'sprite'>, level: number) {
        const { skills } = system;
        const allSkills = [
            ...Object.values(skills.active),
            ...Object.values(skills.language),
            ...Object.values(skills.knowledge).flatMap(category => Object.values(category)),
        ];

        for (const skill of allSkills) {
            skill.base = skill.base > 0 ? level : 0;
        }
    }

    static prepareMatrixTrack(system: Actor.SystemOfType<'sprite'>, level: number) {
        const { modifiers, track, matrix } = system;

        // Prepare internal matrix condition monitor values
        // LEGACY: matrix.condition_monitor is no TrackType. It will only be used as a info, should ever be needed anywhere
        matrix.condition_monitor.max = modifiers['matrix_track'] + MatrixRules.getConditionMonitor(level);

        // Prepare user visible matrix track values
        track.matrix.base = MatrixRules.getConditionMonitor(level);
        ModifiableValue.addUnique(track.matrix, "SR5.Bonus", modifiers['matrix_track']);
        track.matrix.max = matrix.condition_monitor.max;
        track.matrix.label = SR5.damageTypes.matrix;
    }
}
