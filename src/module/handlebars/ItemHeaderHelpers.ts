export const registerItemHeaderHelpers = () => {
    /**
     * Return a data object to be injected into the addItem action.
     */
    // TODO: actorType actual type
    Handlebars.registerHelper('callInActionHeaderAddData', (actorType: string) => {
        return { 'actor-type': actorType };
    });
};