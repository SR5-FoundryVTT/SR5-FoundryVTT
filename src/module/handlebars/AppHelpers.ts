export const registerAppHelpers = () => {
    // TODO: Add modifiers.env typing and add missing type
    /** Determine if a environmental modifier of a specific category is active
     *
     * @param active
     * @param category A environment modifier category (wind, range, ...)
     * @param modifier A environmental modifier value (0, -1)
     */
    Handlebars.registerHelper('IsEnvModifierActive', (active, category: string, modifier: number) => {
        return active[category] === modifier;
    })
}