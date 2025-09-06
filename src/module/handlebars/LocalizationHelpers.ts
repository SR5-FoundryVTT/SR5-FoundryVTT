import { PackActionFlow } from "../item/flows/PackActionFlow";

/**
 * Provide helpers for localization purposes.
 */
export const registerLocalizationHelpers = () => {
    /**
     * Localizes content based on the provided name.
     *
     * Intended for use when localizing content names (for example pack items) from
     * their names to the users language.
     * 
     * @param name The name of the content to localize. Example 'Brute Force' 
     * @returns Either the localized value or the original name.
     */
    Handlebars.registerHelper('localizeContent', (name: string) => {
        return PackActionFlow.localizePackAction(name);
    });
};