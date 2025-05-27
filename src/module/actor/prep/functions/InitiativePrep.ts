import MagicActorData = Shadowrun.MagicActorData;
import MatrixActorData = Shadowrun.MatrixActorData;
import { Helpers } from '../../../helpers';
import { PartsList } from '../../../parts/PartsList';
import ActorTypesData = Shadowrun.ShadowrunActorDataData;
import { SystemActor } from '../../SR5Actor';

export class InitiativePrep {
    /**
     * Current initiative is the selected initiative to be used within FoundryVTT Combat.
     *
     */
    static prepareCurrentInitiative(system: Actor.SystemOfType<SystemActor>) {
        const { initiative } = system;

        if (initiative.perception === 'matrix') initiative.current = initiative.matrix;
        else if (initiative.perception === 'astral') initiative.current = initiative.astral;
        else {
            initiative.current = initiative.meatspace;
            initiative.perception = 'meatspace';
        }        

        // Recalculate selected initiative to be sure.
        initiative.current.base.value = Helpers.calcTotal(initiative.current.base);

        // Apply edge ini rules.
        initiative.current.dice.value = Helpers.calcTotal(initiative.current.dice, {min: 0, max: 5});
        if (initiative.edge) initiative.current.dice.value = 5;
        initiative.current.dice.value = Math.min(5, initiative.current.dice.value); // maximum of 5d6 for initiative
        initiative.current.dice.text = `${initiative.current.dice.value}d6`;        
    }

    /**
     * Physical initiative
     */
    static prepareMeatspaceInit(system: Actor.SystemOfType<'character' | 'critter' | 'spirit' | 'vehicle'>) {
        const { initiative, attributes, modifiers } = system;

        initiative.meatspace.base.base = attributes.intuition.value + attributes.reaction.value;
        initiative.meatspace.base.mod = PartsList.AddUniquePart(initiative.meatspace.base.mod, "SR5.Bonus", Number(modifiers['meat_initiative']));
        initiative.meatspace.base.value = Helpers.calcTotal(initiative.meatspace.base);

        initiative.meatspace.dice.base = 1;
        initiative.meatspace.dice.mod = PartsList.AddUniquePart(initiative.meatspace.dice.mod, "SR5.Bonus", Number(modifiers['meat_initiative_dice']));
        initiative.meatspace.dice.value = Helpers.calcTotal(initiative.meatspace.dice, {min: 0, max: 5});
    }

    static prepareAstralInit(system: Actor.SystemOfType<'character' | 'critter' | 'spirit' | 'vehicle'>) {
        const { initiative, attributes, modifiers } = system;

        initiative.astral.base.base = attributes.intuition.value * 2;
        initiative.astral.base.mod = PartsList.AddUniquePart(initiative.astral.base.mod, "SR5.Bonus", Number(modifiers['astral_initiative']));
        initiative.astral.base.value = Helpers.calcTotal(initiative.astral.base);

        initiative.astral.dice.base = 2;
        initiative.astral.dice.mod = PartsList.AddUniquePart(initiative.astral.dice.mod, "SR5.Bonus", Number(modifiers['astral_initiative_dice']));
        initiative.astral.dice.value = Helpers.calcTotal(initiative.astral.dice, {min: 0, max: 5});
    }

    static prepareMatrixInit(system: Actor.SystemOfType<'character' | 'critter'>) {
        const { initiative, attributes, modifiers, matrix } = system;
        if (matrix) {

            initiative.matrix.base.base = attributes.intuition.value + system.matrix.data_processing.value;
            initiative.matrix.base.mod = PartsList.AddUniquePart(initiative.matrix.base.mod, "SR5.Bonus", Number(modifiers['matrix_initiative']));
            initiative.matrix.base.value = Helpers.calcTotal(initiative.matrix.base);

            initiative.matrix.dice.base = (matrix.hot_sim ? 4 : 3);
            initiative.matrix.dice.mod = PartsList.AddUniquePart(initiative.matrix.dice.mod, "SR5.Bonus", Number(modifiers['matrix_initiative_dice']));
            initiative.matrix.dice.value = Helpers.calcTotal(initiative.matrix.dice, {min: 0, max: 5});
        }
    }
}
