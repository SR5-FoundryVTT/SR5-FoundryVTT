import { SR5Actor } from '../actor/SR5Actor';
import { SR5Item } from '../item/SR5Item';
import { Translation } from '../utils/strings';

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

    /**
     * Transform the given document to a string type for sheet display.
     *
     * NOTE: This function is part of sheet rendering, so we fail silently, to not break sheet rendering.
     * 
     * @param document Any markable document
     * @returns A translation key to be translated.
     */
    getDocumentType(document: SR5Actor | SR5Item): Translation {
        if (document instanceof SR5Item && document.type === 'host') return 'SR5.ItemTypes.Host';
        if (document instanceof SR5Item && document.type === 'grid') return 'SR5.ItemTypes.Grid';
        if (document instanceof SR5Item) return 'SR5.Device';

        if (document instanceof SR5Actor && document.type === 'ic') return 'SR5.ActorTypes.IC';

        return 'SR5.Labels.ActorSheet.Persona';
    }
}