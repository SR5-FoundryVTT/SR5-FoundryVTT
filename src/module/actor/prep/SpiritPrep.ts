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

export class SpiritPrep {
    static prepareBaseData(system: Actor.SystemOfType<'spirit'>) {
        ModifiableFieldPrep.resetAllModifiers(system);
    }

    static prepareDerivedData(system: Actor.SystemOfType<'spirit'>, _items: SR5Item[]) {
        const force = ModifiableValue.calcTotal(system.attributes.force);

        SpiritPrep.prepareSpiritAttributes(system, force);
        SpiritPrep.prepareSpiritSkills(system, force);
        SpiritPrep.prepareSpiritInitiative(system, force);

        // Use spirit attribute range to avoid issues with attribute calculation causing unusable attributes.
        AttributesPrep.prepareAttributes(system, SR.attributes.rangesSpirit);
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

    static prepareSpiritAttributes(system: Actor.SystemOfType<'spirit'>, force: number) {
        const { attributes, force_applies } = system;

        for (const [attributeId, attribute] of Object.entries(attributes)) {
            if (!force_applies[attributeId]) continue;
            if (!attribute) continue;

            ModifiableValue.addUniqueBase(attribute, 'SR5.Force', force);
        }
    }

    static prepareSpiritSkills(system: Actor.SystemOfType<'spirit'>, force: number) {
        const skills: SkillFieldType[] = [];
        skills.push(...Object.values(system.skills.active));
        skills.push(...Object.values(system.skills.language));

        for (const category of Object.values(system.skills.knowledge)) {
            skills.push(...Object.values(category));
        }

        for (const skill of skills) {
            if (skill.base > 0)
                skill.base = force;
        }
    }

    static prepareSpiritInitiative(system: Actor.SystemOfType<'spirit'>, force: number) {
        const { initiative, modifiers } = system;

        initiative.meatspace.base.base = force * 2;
        ModifiableValue.addUnique(initiative.meatspace.base, 'SR5.Bonus', modifiers.meat_initiative);
        ModifiableValue.calcTotal(initiative.meatspace.base);

        initiative.meatspace.dice.base = 2;
        ModifiableValue.addUnique(initiative.meatspace.dice, 'SR5.Bonus', modifiers.meat_initiative_dice);
        ModifiableValue.calcTotal(initiative.meatspace.dice, { min: 0, max: 5 });

        initiative.astral.base.base = force * 2;
        ModifiableValue.addUnique(initiative.astral.base, 'SR5.Bonus', modifiers.astral_initiative);
        ModifiableValue.calcTotal(initiative.astral.base);

        initiative.astral.dice.base = 3;
        ModifiableValue.addUnique(initiative.astral.dice, 'SR5.Bonus', modifiers.astral_initiative_dice);
        ModifiableValue.calcTotal(initiative.astral.dice, { min: 0, max: 5 });
    }

    /**
     * Prepare armor values for spirit rules. These have some additional caveats in comparison to characters.
     */
    static prepareSpiritArmor(system: Actor.SystemOfType<'spirit'>) {
        const { armor, attributes } = system;

        armor.base = attributes.essence.value * 2;
        if (system.modifiers.armor)
            ModifiableValue.addUnique(armor, game.i18n.localize('SR5.Bonus'), system.modifiers.armor);

        ModifiableValue.calcTotal(armor);
        armor.hardened = true;
    }
}
