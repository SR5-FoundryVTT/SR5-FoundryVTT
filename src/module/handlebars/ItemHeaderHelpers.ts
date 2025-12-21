
import { SR5 } from '../config';

export const registerItemHeaderHelpers = () => {
    /**
     * Return a data object to be injected into the addItem action.
     */
    Handlebars.registerHelper('callInActionHeaderAddData', (actorType: keyof typeof SR5.callInActorTypes) => {
        return { 'actor-type': actorType };
    });
};