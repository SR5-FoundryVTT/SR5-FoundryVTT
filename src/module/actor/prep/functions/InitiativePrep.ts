import SR5ActorData = Shadowrun.SR5ActorData;
import MagicActorData = Shadowrun.MagicActorData;
import MatrixActorData = Shadowrun.MatrixActorData;

export class InitiativePrep {
    static prepareCurrentInitiative(data: SR5ActorData) {
        const { initiative } = data;

        if (initiative.perception === 'matrix') initiative.current = initiative.matrix;
        else if (initiative.perception === 'astral') initiative.current = initiative.astral;
        else {
            initiative.current = initiative.meatspace;
            initiative.perception = 'meatspace';
        }

        initiative.current.dice.value = initiative.current.dice.base;
        if (initiative.edge) initiative.current.dice.value = 5;
        initiative.current.dice.value = Math.min(5, initiative.current.dice.value); // maximum of 5d6 for initiative
        initiative.current.dice.text = `${initiative.current.dice.value}d6`;
        initiative.current.base.value = initiative.current.base.base;
    }

    static prepareMeatspaceInit(data: SR5ActorData) {
        const { initiative, attributes, modifiers } = data;
        initiative.meatspace.base.base = attributes.intuition.value + attributes.reaction.value + Number(modifiers['meat_initiative']);
        initiative.meatspace.dice.base = 1 + Number(modifiers['meat_initiative_dice']);
    }

    static prepareAstralInit(data: SR5ActorData & MagicActorData) {
        const { initiative, attributes, modifiers } = data;
        initiative.astral.base.base = attributes.intuition.value * 2 + Number(modifiers['astral_initiative']);
        initiative.astral.dice.base = 2 + Number(modifiers['astral_initiative_dice']);
    }

    static prepareMatrixInit(data: SR5ActorData & MatrixActorData) {
        const { initiative, attributes, modifiers, matrix } = data;
        if (matrix) {
            initiative.matrix.base.base = attributes.intuition.value + data.matrix.data_processing.value + Number(modifiers['matrix_initiative']);
            initiative.matrix.dice.base = (matrix.hot_sim ? 4 : 3) + Number(modifiers['matrix_initiative_dice']);
        }
    }
}
