import MagicActorData = Shadowrun.MagicActorData;
import MatrixActorData = Shadowrun.MatrixActorData;
import { Helpers } from '../../../helpers';
import { PartsList } from '../../../parts/PartsList';
import ActorTypesData = Shadowrun.ShadowrunActorDataData;

export class InitiativePrep {
    static prepareCurrentInitiative(system: ActorTypesData) {
        const { initiative } = system;

        if (initiative.perception === 'matrix') initiative.current = initiative.matrix;
        else if (initiative.perception === 'astral') initiative.current = initiative.astral;
        else {
            initiative.current = initiative.meatspace;
            initiative.perception = 'meatspace';
        }

        initiative.current.dice.value = Helpers.calcTotal(initiative.current.dice, {min: 0, max: 5});
        if (initiative.edge) initiative.current.dice.value = 5;
        initiative.current.dice.value = Math.min(5, initiative.current.dice.value); // maximum of 5d6 for initiative
        initiative.current.dice.text = `${initiative.current.dice.value}d6`;

        initiative.current.base.value = Helpers.calcTotal(initiative.current.base);
    }

    static prepareMeatspaceInit(system: ActorTypesData) {
        const { initiative, attributes, modifiers } = system;

        initiative.meatspace.base.base = attributes.intuition.value + attributes.reaction.value;
        initiative.meatspace.base.mod = PartsList.AddUniquePart(initiative.meatspace.base.mod, "SR5.Bonus", Number(modifiers['meat_initiative']));

        initiative.meatspace.dice.base = 1;
        initiative.meatspace.dice.mod = PartsList.AddUniquePart(initiative.meatspace.dice.mod, "SR5.Bonus", Number(modifiers['meat_initiative_dice']));
    }

    static prepareAstralInit(system: ActorTypesData & MagicActorData) {
        const { initiative, attributes, modifiers } = system;

        initiative.astral.base.base = attributes.intuition.value * 2;
        initiative.astral.base.mod = PartsList.AddUniquePart(initiative.astral.base.mod, "SR5.Bonus", Number(modifiers['astral_initiative']));

        initiative.astral.dice.base = 2;
        initiative.astral.dice.mod = PartsList.AddUniquePart(initiative.astral.dice.mod, "SR5.Bonus", Number(modifiers['astral_initiative_dice']));
    }

    static prepareMatrixInit(system: ActorTypesData & MatrixActorData) {
        const { initiative, attributes, modifiers, matrix } = system;
        if (matrix) {

            initiative.matrix.base.base = attributes.intuition.value + system.matrix.data_processing.value;
            initiative.matrix.base.mod = PartsList.AddUniquePart(initiative.matrix.base.mod, "SR5.Bonus", Number(modifiers['matrix_initiative']));

            initiative.matrix.dice.base = (matrix.hot_sim ? 4 : 3);
            initiative.matrix.dice.mod = PartsList.AddUniquePart(initiative.matrix.dice.mod, "SR5.Bonus", Number(modifiers['matrix_initiative_dice']));
        }
    }
}
