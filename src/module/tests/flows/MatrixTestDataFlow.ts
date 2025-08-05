import { SR5Actor } from "../../actor/SR5Actor";
import { SR5 } from "../../config";
import { Helpers } from "../../helpers";
import { SR5Item } from "../../item/SR5Item";
import { PartsList } from "../../parts/PartsList";
import { SuccessTest } from "../SuccessTest";

/**
 * Apply Matrix Rules to Success Test Data relating to matrix.
 */
export const MatrixTestDataFlow = {
    addMatrixModifiers: function(test: SuccessTest) {
        if (test.source instanceof SR5Item) return;

        MatrixTestDataFlow.removeMatrixModifiers(test);

        const pool = new PartsList<number>(test.data.pool.mod);
        const action = test.data.action;
        const actor = test.source;

        if (!action) return;
        if (!actor) return;

        if (action.attribute && MatrixTestDataFlow.isMatrixAttribute(action.attribute)) MatrixTestDataFlow.addMatrixModifiersToPool(actor, pool, true);
        if (action.attribute2 && MatrixTestDataFlow.isMatrixAttribute(action.attribute2)) MatrixTestDataFlow.addMatrixModifiersToPool(actor, pool, true);
        if (action.limit.attribute && MatrixTestDataFlow.isMatrixAttribute(action.limit.attribute)) MatrixTestDataFlow.addMatrixModifiersToPool(actor, pool, true);
    },

    /**
     * Is the given attribute id a matrix attribute
     * @param attribute
     */
    isMatrixAttribute(attribute: string): boolean {
        return SR5.matrixAttributes.hasOwnProperty(attribute);
    },

    /**
     * Remove matrix modifier values to the given modifier part
     * 
     * @param test A Value.mod field as a PartsList
     */
    removeMatrixModifiers(test: SuccessTest) {
        const pool = new PartsList<number>(test.data.pool.mod);
        ['SR5.HotSim', 'SR5.RunningSilent'].forEach(part => pool.removePart(part));
    },

    /**
     * Wrapping legacy implementation of SR5Actor._addMatrixParts.
     * 
     * Will add modifiers based on actor data to test pool
     * @param actor
     * @param pool 
     * @param atts 
     * @returns 
     */
    addMatrixModifiersToPool(actor: SR5Actor, pool: PartsList<number>, atts: any) {
        if (Helpers.isMatrix(atts)) {
            if (!("matrix" in actor.system)) return;

            // Apply general matrix modifiers based on commlink/cyberdeck status.
            const matrix = actor.system.matrix!;
            if (matrix.hot_sim) pool.addUniquePart('SR5.HotSim', 2);
            if (matrix.running_silent) pool.addUniquePart('SR5.RunningSilent', -2);
        }
    }
}