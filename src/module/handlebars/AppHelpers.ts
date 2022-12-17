export const registerAppHelpers = () => {
    // TODO: Add modifiers.env typing and add missing type
    /** 
     * An environmental modifier is active when the the set value matches the expected modifier value
     * for this selection.
     *
     * @param active The applied environmental modifiers 
     * @param category A environment modifier category (wind, range, ...)
     * @param modifier A environmental modifier value (0, -1)
     */
    Handlebars.registerHelper('IsEnvModifierActive', (active, category: string, modifier: number) => {
        return active[category] === modifier;
    })
}