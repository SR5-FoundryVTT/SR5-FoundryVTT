import { SR5Actor } from '../actor/SR5Actor';
import { SR5Item } from '../item/SR5Item';

/**
 * Handling of sheet presentation around matrix data.
 */
export const MatrixSheetFlow = {
    /**
     * Collect all matrix actions of an actor.
     * @param actor The actor to collect matrix actions from.
     */
    getMatrixActions(actor: SR5Actor): SR5Item[] {
        const actions = actor.itemsForType.get('action');
        // Normaly all item types should exist, though during actor creation this might not be the case.
        if (!actions) {
            return [];
        }
        return actions.filter((action: SR5Item) => action.hasActionCategory('matrix'));
    },
}