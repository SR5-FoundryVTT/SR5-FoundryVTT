export const registerItemHeaderHelpers = () => {
    /**
     * Retrun a data object to be incjected into the addItem action.
     */
    // TODO: actorType actual type
    Handlebars.registerHelper('callInActionHeaderAddData', (actorType: string) => {
        return { 'actor-type': actorType };
    });
};