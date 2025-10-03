import { SR5Actor } from '../../SR5Actor';
import { Helpers } from '../../../helpers';

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
        Helpers.calcTotal(initiative.current.base);

        // Apply edge ini rules.
        Helpers.calcTotal(initiative.current.dice, {min: 0, max: 5});
        if (initiative.edge) initiative.current.dice.value = 5;
        initiative.current.dice.text = `${initiative.current.dice.value}d6`;        
    }

    /**
     * Physical initiative
     */
    static prepareMeatspaceInit(system: Actor.SystemOfType<'character' | 'critter' | 'spirit' | 'vehicle'>) {
        const { initiative, attributes, modifiers } = system;

        initiative.meatspace.base.base = attributes.intuition.value + attributes.reaction.value;
        Helpers.addChange(initiative.meatspace.base, { name: "SR5.Bonus", value: modifiers.meat_initiative });
        Helpers.calcTotal(initiative.meatspace.base);

        initiative.meatspace.dice.base = 1;
        Helpers.addChange(initiative.meatspace.dice, { name: "SR5.Bonus", value: modifiers.meat_initiative_dice });
        Helpers.calcTotal(initiative.meatspace.dice, {min: 0, max: 5});
    }

    static prepareAstralInit(system: Actor.SystemOfType<'character' | 'critter' | 'spirit'>) {
        const { initiative, attributes, modifiers } = system;

        initiative.astral.base.base = attributes.intuition.value * 2;
        Helpers.addChange(initiative.astral.base, { name: "SR5.Bonus", value: modifiers.astral_initiative });
        Helpers.calcTotal(initiative.astral.base);

        initiative.astral.dice.base = 2;
        Helpers.addChange(initiative.astral.dice, { name: "SR5.Bonus", value: modifiers.astral_initiative_dice });
        Helpers.calcTotal(initiative.astral.dice, {min: 0, max: 5});
    }

    static prepareMatrixInit(system: Actor.SystemOfType<'character' | 'critter' | 'vehicle'>) {
        const { initiative, attributes, modifiers, matrix } = system;
        if (matrix) {

            initiative.matrix.base.base = attributes.intuition.value + system.matrix.data_processing.value;
            Helpers.addChange(initiative.matrix.base, { name: "SR5.Bonus", value: modifiers.matrix_initiative });
            Helpers.calcTotal(initiative.matrix.base);

            initiative.matrix.dice.base = (matrix.hot_sim ? 4 : 3);
            Helpers.addChange(initiative.matrix.dice, { name: "SR5.Bonus", value: modifiers.matrix_initiative_dice });
            Helpers.calcTotal(initiative.matrix.dice, {min: 0, max: 5});
        }
    }
}
