import SR5ActorData = Shadowrun.SR5ActorData;
import MagicActorData = Shadowrun.MagicActorData;
import MatrixActorData = Shadowrun.MatrixActorData;
import { Helpers } from '../../../helpers';
import { PartsList } from '../../../parts/PartsList';
import ActorTypesData = Shadowrun.ActorTypesData;

export class InitiativePrep {
    static prepareCurrentInitiative(data: ActorTypesData) {
        const { initiative } = data;

        if (initiative.perception === 'matrix') initiative.current = initiative.matrix;
        else if (initiative.perception === 'astral') initiative.current = initiative.astral;
        else {
            initiative.current = initiative.meatspace;
            initiative.perception = 'meatspace';
        }

        initiative.current.dice.value = Helpers.calcTotal(initiative.current.dice);
        if (initiative.edge) initiative.current.dice.value = 5;
        initiative.current.dice.value = Math.min(5, initiative.current.dice.value); // maximum of 5d6 for initiative
        initiative.current.dice.text = `${initiative.current.dice.value}d6`;

        initiative.current.base.value = Helpers.calcTotal(initiative.current.base);
    }

    static prepareMeatspaceInit(data: ActorTypesData) {
        const { initiative, attributes, modifiers } = data;

        initiative.meatspace.base.base = attributes.intuition.value + attributes.reaction.value;
        initiative.meatspace.base.mod = PartsList.AddUniquePart(initiative.meatspace.base.mod, "SR5.Bonus", Number(modifiers['meat_initiative']));

        initiative.meatspace.dice.base = 1;
        initiative.meatspace.dice.mod = PartsList.AddUniquePart(initiative.meatspace.dice.mod, "SR5.Bonus", Number(modifiers['meat_initiative_dice']));
    }

    static prepareAstralInit(data: ActorTypesData & MagicActorData) {
        const { initiative, attributes, modifiers } = data;

        initiative.astral.base.base = attributes.intuition.value * 2;
        initiative.astral.base.mod = PartsList.AddUniquePart(initiative.astral.base.mod, "SR5.Bonus", Number(modifiers['astral_initiative']));

        initiative.astral.dice.base = 2;
        initiative.astral.dice.mod = PartsList.AddUniquePart(initiative.astral.dice.mod, "SR5.Bonus", Number(modifiers['astral_initiative_dice']));
    }

    static prepareMatrixInit(data: ActorTypesData & MatrixActorData) {
        const { initiative, attributes, modifiers, matrix } = data;
        if (matrix) {

            initiative.matrix.base.base = attributes.intuition.value + data.matrix.data_processing.value;
            initiative.matrix.base.mod = PartsList.AddUniquePart(initiative.matrix.base.mod, "SR5.Bonus", Number(modifiers['matrix_initiative']));

            initiative.matrix.dice.base = (matrix.hot_sim ? 4 : 3);
            initiative.matrix.dice.mod = PartsList.AddUniquePart(initiative.matrix.dice.mod, "SR5.Bonus", Number(modifiers['matrix_initiative_dice']));
        }
    }
}
