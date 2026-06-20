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
        const force = ModifiableValue.calcTotal(system.attributes.force, { min: 1 });

        SpiritPrep.prepareSpiritAttributes(system, force);
        SpiritPrep.prepareSpiritSkills(system, force);

        // Use spirit attribute range to avoid issues with attribute calculation causing unusable attributes.
        AttributesPrep.prepareAttributes(system, SR.attributes.rangesSpirit);
        SkillsPrep.prepareSkills(system);

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

        for (const skill of skills) {
            if (skill.base > 0)
                skill.base = onSkillValue;
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
