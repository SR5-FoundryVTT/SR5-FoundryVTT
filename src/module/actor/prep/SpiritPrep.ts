import { SkillsPrep } from './functions/SkillsPrep';
import { AttributesPrep } from './functions/AttributesPrep';
import { LimitsPrep } from './functions/LimitsPrep';
import { MovementPrep } from './functions/MovementPrep';
import { WoundsPrep } from './functions/WoundsPrep';
import { InitiativePrep } from './functions/InitiativePrep';
import { CharacterPrep } from './CharacterPrep';
import { GruntPrep } from './functions/GruntPrep';
import { SR } from '../../constants';
import { SR5Item } from 'src/module/item/SR5Item';
import { ModifiableFieldPrep } from './functions/ModifiableFieldPrep';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import { SkillFieldType } from 'src/module/types/template/Skills';
import { ItemPrep } from './functions/ItemPrep';

export class SpiritPrep {
    static prepareBaseData(system: Actor.SystemOfType<'spirit'>) {
        ModifiableFieldPrep.resetAllModifiers(system);
    }

    static prepareDerivedData(system: Actor.SystemOfType<'spirit'>, items: SR5Item[]) {
        // Force is authored and never rewritten by preparation, so it anchors on the persisted `_source`.
        ModifiableValue.applyChanges(system.attributes.force, {
            from: ModifiableValue.sourceAnchor(system, 'attributes.force'), min: 1,
        });
        system.parent?.applyActiveEffects('force');
        AttributesPrep.clampAttributesToRange(system, SR.attributes.rangesSpirit);
        const force = system.attributes.force.value;

        SpiritPrep.prepareSpiritAttributes(system, force);
        SpiritPrep.prepareSpiritSkills(system, force);

        // Use spirit attribute range to avoid issues with attribute calculation causing unusable attributes.
        AttributesPrep.prepareAttributes(system, SR.attributes.rangesSpirit, new Set(['force']));
        SkillsPrep.prepareSkills(system);
        system.parent?.applyActiveEffects('attributes');
        AttributesPrep.clampAttributesToRange(system, SR.attributes.rangesSpirit);

        LimitsPrep.prepareLimitBaseFromAttributes(system);
        LimitsPrep.prepareLimits(system);
        LimitsPrep.prepareDerivedLimits(system);

        SpiritPrep.prepareSpiritArmor(system);
        ItemPrep.prepareArmor(system, items);

        GruntPrep.prepareConditionMonitors(system);

        MovementPrep.prepareMovement(system);
        WoundsPrep.prepareWounds(system);

        InitiativePrep.prepareInit('spirit', system);

        CharacterPrep.prepareRecoil(system);
        CharacterPrep.prepareRecoilCompensation(system);
        system.parent?.applyActiveEffects('derived');
    }

    static prepareSpiritAttributes(system: Actor.SystemOfType<'spirit'>, force: number) {
        const { attributes } = system;

        attributes.force.hidden = true;
        for (const attribute of Object.values(attributes)) {
            if (!attribute?.applies_special) continue;

            ModifiableValue.addUniqueBase(attribute, 'SR5.Force', force);
        }
    }

    static prepareSpiritSkills(system: Actor.SystemOfType<'spirit'>, force: number) {
        const onSkillValue = system.half_value_skill ? Math.ceil(force / 2) : force;
        const skills: SkillFieldType[] = [];
        skills.push(...Object.values(system.skills.active));
        skills.push(...Object.values(system.skills.language));
        skills.push(...Object.values(system.skills.knowledge).flatMap(category => Object.values(category)));

        // `skill.base` here is the skill item's authored rating: SR5Actor.prepareBaseData rebuilds
        // system.skills from skill items every cycle, so this reads fresh data, not the previous pass.
        // A rating above zero means the spirit has the skill, which then resolves from Force.
        for (const skill of skills) {
            if (skill.base <= 0) continue;

            skill.base = 0;
            ModifiableValue.addUniqueBase(skill, 'SR5.BaseValue', onSkillValue);
        }
    }

    /**
     * Prepare armor values for spirit rules. These have some additional caveats in comparison to characters.
     */
    static prepareSpiritArmor(system: Actor.SystemOfType<'spirit'>) {
        const { armor, attributes, modifiers } = system;

        const immunityRating = Math.max(attributes.essence.value * 2, 0);
        ModifiableValue.addUnique(armor.immunities.normal_weapons, 'SR5.armorImmunityTypes.normal_weapons', immunityRating);

        if (modifiers.armor)
            ModifiableValue.addUnique(armor.rating, game.i18n.localize('SR5.Bonus'), modifiers.armor);
    }
}
