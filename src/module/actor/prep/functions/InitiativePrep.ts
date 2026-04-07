import { SR5Actor } from '../../SR5Actor';
import { ModifiableValue } from '@/module/mods/ModifiableValue';

export class InitiativePrep {
    /**
     * Current initiative is the selected initiative to be used within FoundryVTT Combat.
     *
     */
    static prepareCurrentInitiative(system: SR5Actor['system']) {
        const { initiative } = system;

        if (initiative.perception === 'matrix') initiative.current = initiative.matrix;
        else if (initiative.perception === 'astral') initiative.current = initiative.astral;
        else {
            initiative.current = initiative.meatspace;
            initiative.perception = 'meatspace';
        }

        // Recalculate selected initiative to be sure.
        ModifiableValue.calcTotal(initiative.current.base);

        // Apply edge ini rules.
        ModifiableValue.calcTotal(initiative.current.dice, {min: 0, max: 5});
        if (initiative.edge) initiative.current.dice.value = 5;
        initiative.current.dice.text = `${initiative.current.dice.value}d6`;        
    }

    /**
     * Physical initiative
     */
    static prepareMeatspaceInit(system: Actor.SystemOfType<'character' | 'spirit' | 'vehicle'>) {
        const { initiative, attributes, modifiers } = system;

        initiative.meatspace.base.base = attributes.intuition.value + attributes.reaction.value;
        ModifiableValue.addUnique(initiative.meatspace.base, "SR5.Bonus", modifiers.meat_initiative);
        ModifiableValue.calcTotal(initiative.meatspace.base);

        initiative.meatspace.dice.base = 1;
        ModifiableValue.addUnique(initiative.meatspace.dice, "SR5.Bonus", modifiers.meat_initiative_dice);
        ModifiableValue.calcTotal(initiative.meatspace.dice, {min: 0, max: 5});
    }

    static prepareAstralInit(system: Actor.SystemOfType<'character' | 'spirit'>) {
        const { initiative, attributes, modifiers } = system;

        initiative.astral.base.base = attributes.intuition.value * 2;
        ModifiableValue.addUnique(initiative.astral.base, "SR5.Bonus", modifiers.astral_initiative);
        ModifiableValue.calcTotal(initiative.astral.base);

        initiative.astral.dice.base = 2;
        ModifiableValue.addUnique(initiative.astral.dice, "SR5.Bonus", modifiers.astral_initiative_dice);
        ModifiableValue.calcTotal(initiative.astral.dice, {min: 0, max: 5});
    }

    static prepareMatrixInit(system: Actor.SystemOfType<'character' | 'vehicle'>) {
        const { initiative, attributes, modifiers, matrix } = system;
        if (matrix) {

            initiative.matrix.base.base = attributes.intuition.value + system.matrix.data_processing.value;
            ModifiableValue.addUnique(initiative.matrix.base, "SR5.Bonus", modifiers.matrix_initiative);
            ModifiableValue.calcTotal(initiative.matrix.base);

            initiative.matrix.dice.base = (matrix.hot_sim ? 4 : 3);
            ModifiableValue.addUnique(initiative.matrix.dice, "SR5.Bonus", modifiers.matrix_initiative_dice);
            ModifiableValue.calcTotal(initiative.matrix.dice, {min: 0, max: 5});
        }
    }
}
