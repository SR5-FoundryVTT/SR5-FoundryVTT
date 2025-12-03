import { SR5Actor } from '../../SR5Actor';
import { PartsList } from '@/module/parts/PartsList';

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
        PartsList.calcTotal(initiative.current.base);

        // Apply edge ini rules.
        PartsList.calcTotal(initiative.current.dice, {min: 0, max: 5});
        if (initiative.edge) initiative.current.dice.value = 5;
        initiative.current.dice.text = `${initiative.current.dice.value}d6`;        
    }

    /**
     * Physical initiative
     */
    static prepareMeatspaceInit(system: Actor.SystemOfType<'character' | 'critter' | 'spirit' | 'vehicle'>) {
        const { initiative, attributes, modifiers } = system;

        initiative.meatspace.base.base = attributes.intuition.value + attributes.reaction.value;
        PartsList.addUniquePart(initiative.meatspace.base, "SR5.Bonus", modifiers.meat_initiative);
        PartsList.calcTotal(initiative.meatspace.base);

        initiative.meatspace.dice.base = 1;
        PartsList.addUniquePart(initiative.meatspace.dice, "SR5.Bonus", modifiers.meat_initiative_dice);
        PartsList.calcTotal(initiative.meatspace.dice, {min: 0, max: 5});
    }

    static prepareAstralInit(system: Actor.SystemOfType<'character' | 'critter' | 'spirit'>) {
        const { initiative, attributes, modifiers } = system;

        initiative.astral.base.base = attributes.intuition.value * 2;
        PartsList.addUniquePart(initiative.astral.base, "SR5.Bonus", modifiers.astral_initiative);
        PartsList.calcTotal(initiative.astral.base);

        initiative.astral.dice.base = 2;
        PartsList.addUniquePart(initiative.astral.dice, "SR5.Bonus", modifiers.astral_initiative_dice);
        PartsList.calcTotal(initiative.astral.dice, {min: 0, max: 5});
    }

    static prepareMatrixInit(system: Actor.SystemOfType<'character' | 'critter' | 'vehicle'>) {
        const { initiative, attributes, modifiers, matrix } = system;
        if (matrix) {

            initiative.matrix.base.base = attributes.intuition.value + system.matrix.data_processing.value;
            PartsList.addUniquePart(initiative.matrix.base, "SR5.Bonus", modifiers.matrix_initiative);
            PartsList.calcTotal(initiative.matrix.base);

            initiative.matrix.dice.base = (matrix.hot_sim ? 4 : 3);
            PartsList.addUniquePart(initiative.matrix.dice, "SR5.Bonus", modifiers.matrix_initiative_dice);
            PartsList.calcTotal(initiative.matrix.dice, {min: 0, max: 5});
        }
    }
}
