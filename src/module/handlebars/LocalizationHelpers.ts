import { PackItemFlow } from "../item/flows/PackItemFlow";
import { MetatypeFlow } from "../flows/MetatypeFlow";
import { SR5Item } from "../item/SR5Item";

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
        return PackItemFlow.localizePackAction(name);
    });

    /**
     * Localizes a metatype item or name into the user's active language.
     *
     * @param itemOrName An SR5Item of type 'metatype', or a string metatype name/key.
     * @returns The localized metatype name, or original name if no translation exists.
     */
    Handlebars.registerHelper('localizeMetatype', (itemOrName?: SR5Item<'metatype'> | string | null) => {
        return MetatypeFlow.localizeMetatype(itemOrName);
    });

    /**
     * Localizes a metatype subtype (category) into the user's active language.
     *
     * @param itemOrSubtype An SR5Item of type 'metatype', or a string subtype key.
     * @returns The localized subtype name.
     */
    Handlebars.registerHelper('localizeSubtype', (itemOrSubtype?: SR5Item<'metatype'> | string | null) => {
        return MetatypeFlow.localizeSubtype(itemOrSubtype);
    });

    /**
     * Localizes a metatype subsubtype (strain, species, form) into the user's active language.
     *
     * @param itemOrSubsubtype An SR5Item of type 'metatype', or a string subsubtype key.
     * @returns The localized subsubtype name.
     */
    Handlebars.registerHelper('localizeSubsubtype', (itemOrSubsubtype?: SR5Item<'metatype'> | string | null) => {
        return MetatypeFlow.localizeSubsubtype(itemOrSubsubtype);
    });
};