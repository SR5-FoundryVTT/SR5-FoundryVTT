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
        // Level is authored and never rewritten by preparation, so it anchors on the persisted `_source`.
        ModifiableValue.applyChanges(system.attributes.level, {
            from: ModifiableValue.sourceAnchor(system, 'attributes.level'), min: 1,
        });
        system.parent?.applyActiveEffects('level');
        const level = system.attributes.level.value;

        SpritePrep.prepareSpriteMatrixAttributes(system, level);
        SpritePrep.prepareSpriteAttributes(system, level);
        SpritePrep.prepareSpriteSkills(system, level);

        AttributesPrep.prepareAttributes(system, undefined, new Set(['level']));
        SkillsPrep.prepareSkills(system);
        system.parent?.applyActiveEffects('attributes');

        LimitsPrep.prepareLimits(system);

        system.parent?.applyActiveEffects('matrix');
        MatrixPrep.prepareMatrixToLimitsAndAttributes(system, true);

        SpritePrep.prepareMatrixTrack(system, level);

        InitiativePrep.prepareInit('sprite', system);
        system.parent?.applyActiveEffects('derived');
    }

    static prepareSpriteAttributes(system: Actor.SystemOfType<'sprite'>, level: number) {
        const { attributes } = system;
        if (attributes.resonance.applies_special)
            ModifiableValue.addUniqueBase(attributes.resonance, 'SR5.Level', level);
        // Authored attribute: anchor on the persisted `_source` rather than the prepared `base`.
        ModifiableValue.applyChanges(attributes.resonance, {
            from: ModifiableValue.sourceAnchor(system, 'attributes.resonance'),
        });
    }

    static prepareSpriteMatrixAttributes(system: Actor.SystemOfType<'sprite'>, level: number) {
        const { matrix } = system;

        const matrixAtts = ['attack', 'sleaze', 'data_processing', 'firewall'] as const;

        for (const att of matrixAtts) {
            if (!matrix[att]) continue;
            if (matrix[att].applies_special)
                ModifiableValue.addUniqueBase(matrix[att], 'SR5.Level', level);
            // Authored matrix attribute: anchor on the persisted `_source`.
            ModifiableValue.applyChanges(matrix[att], {
                from: ModifiableValue.sourceAnchor(system, `matrix.${att}`),
            });
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

        // `skill.base` here is the skill item's authored rating: SR5Actor.prepareBaseData rebuilds
        // system.skills from skill items every cycle, so this reads fresh data, not the previous pass.
        // A rating above zero means the sprite has the skill, which then resolves from Level.
        for (const skill of allSkills) {
            const hasSkill = skill.base > 0;

            skill.base = 0;
            ModifiableValue.addUniqueBase(skill, 'SR5.BaseValue', hasSkill ? level : 0);
        }
    }

    static prepareMatrixTrack(system: Actor.SystemOfType<'sprite'>, level: number) {
        const { modifiers, track, matrix } = system;

        // Prepare internal matrix condition monitor values
        // LEGACY: matrix.condition_monitor is no TrackType. It will only be used as a info, should ever be needed anywhere
        matrix.condition_monitor.max = modifiers['matrix_track'] + MatrixRules.getConditionMonitor(level);

        // Prepare user visible matrix track values. `max` comes from the condition monitor above; the track's
        // own `base` was write-only (nothing reads it), so it is no longer set.
        ModifiableValue.addUnique(track.matrix, "SR5.Bonus", modifiers['matrix_track']);
        track.matrix.max = matrix.condition_monitor.max;
        track.matrix.label = SR5.damageTypes.matrix;
    }
}
