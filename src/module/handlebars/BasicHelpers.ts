import { Helpers } from '../helpers';
import { SafeString } from "handlebars";
import { SYSTEM_NAME } from "../constants";
import { SR5Actor } from "../actor/SR5Actor";
import { Translation } from '../utils/strings';
import { LinksHelpers } from '@/module/utils/links';
import { SR5Item } from '../item/SR5Item';
import { SkillFlow } from '../actor/flows/SkillFlow';

export const registerBasicHelpers = () => {
    /**
     * Localization helper for mapping a key to a key-localization mapping.
     * 
     * This is used for mapping an Item type to it's localization label and other similar mappings.
     */
    Handlebars.registerHelper('localizeOb', function (strId, obj) {
        if (obj) strId = obj[strId];
        return game.i18n.localize(strId);
    });

    Handlebars.registerHelper('localizeDocumentType', function (document) {  
        if (document.type.length < 1) return '';
        const documentClass = document instanceof SR5Actor ? 'Actor' : 'Item';
        const i18nTypeLabel = `TYPES.${documentClass}.${document.type}`;
        return game.i18n.localize(i18nTypeLabel as Translation);
    });

    Handlebars.registerHelper('localizeSkill', function (skill: SR5Item<'skill'> | string, options): string {
        console.error('TODO: tamif - what is this doing?');
        if (typeof skill === 'string') {
            const actor = options.data.root.actor as SR5Actor;
            if (!actor) return skill;
            const newSkill = actor.items.get(skill) as SR5Item<'skill'> | undefined;
            if (!newSkill) return skill;
            skill = newSkill;
        }
        return SkillFlow.localizeSkillName(skill.name);
    });

    Handlebars.registerHelper('concatStrings', function (...args) {
        return args.filter(a => typeof a === 'string').join('');
    });

    Handlebars.registerHelper('for', function (from: number, to: number, options) {
        let accum = '';
        for (let i = from; i < to; i += 1) {
            accum += options.fn(i);
        }

        return accum;
    });
    Handlebars.registerHelper('modulo', function (v1: number, v2: number) {
        return v1 % v2;
    });
    Handlebars.registerHelper('divide', function (v1: number, v2: number) {
        if (v2 === 0) return 0;
        return v1 / v2;
    });
    Handlebars.registerHelper('hasprop', function (this: any, obj, prop, options) {
        if (Object.hasOwn(obj, prop)) {
            return options.fn(this);
        } else return options.inverse(this);
    });
    Handlebars.registerHelper('ifin', function (this: any, val, arr, options) {
        if (arr.includes(val)) return options.fn(this);
        else return options.inverse(this);
    });
    // if greater than
    Handlebars.registerHelper('ifgt', function (this: any, v1, v2, options) {
        if (v1 > v2) return options.fn(this);
        else return options.inverse(this);
    });
    // if less than
    Handlebars.registerHelper('iflt', function (this: any, v1, v2, options) {
        if (v1 < v2) return options.fn(this);
        else return options.inverse(this);
    });
    // if less than or equal
    Handlebars.registerHelper('iflte', function (this: any, v1, v2, options) {
        if (v1 <= v2) return options.fn(this);
        else return options.inverse(this);
    });
    // if not equal
    Handlebars.registerHelper('ifne', function (this: any, v1, v2, options) {
        if (v1 !== v2) return options.fn(this);
        else return options.inverse(this);
    });
    // if equal
    Handlebars.registerHelper('ife', function (this: any, v1, v2, options) {
        if (v1 === v2) return options.fn(this);
        else return options.inverse(this);
    });
    // if then
    Handlebars.registerHelper('ift', function (v1, v2) {
        if (v1) return v2;
    });

    // if empty (object, array, string)
    Handlebars.registerHelper('empty', function (value) {
        if (foundry.utils.getType(value) === 'Array') return value.length === 0;
        if (foundry.utils.getType(value) === 'Object') return Object.keys(value).length === 0;
        if (foundry.utils.getType(value) === 'string') return value.length === 0;
        return false; // for all other types, we assume it's not empty
    });
    Handlebars.registerHelper('not', function (v1) {
        return !v1;
    });
    Handlebars.registerHelper('sum', function (v1, v2) {
        return v1 + v2;
    });

    Handlebars.registerHelper('isDefined', function (value) {
        return value !== undefined && value !== null;
    });
    /**
     * Return a fallback value if the provided value is not defined (null or undefined)
     * NOTE: original helper 'default' caused incompatibilities with module AFK Ready Check, as both were overwriting it.
     */
    Handlebars.registerHelper('fallbackValue', function (value: string, defaultValue: string) {
        return new Handlebars.SafeString(value ?? defaultValue);
    });

    Handlebars.registerHelper('log', function (value: string) {
        console.log(value);
    });
    Handlebars.registerHelper('buildName', function (options) {
        const hash: string[] = Helpers.orderKeys(options.hash);
        const name = Object.values(hash).reduce((retVal, current, index) => {
            if (index > 0) retVal += '.';
            return retVal + current;
        }, '');
        return new Handlebars.SafeString(name);
    });
    Handlebars.registerHelper('disabledHelper', function (value) {
        const val = Boolean(value);
        return val || undefined;
    });
    // TODO: This helper doesn't work... Don't know why, but it doesn't.
    Handlebars.registerHelper('localizeShortened', function (label: string, length: number, options: any): SafeString {
        return new Handlebars.SafeString(Helpers.shortenAttributeLocalization(label, length));
    });

    /**
     * Given an object return the value for a given key.
     */
    Handlebars.registerHelper('objValue', function(obj: Record<string, unknown>, key: string) {
        return obj[key] ||  '';
    });

    /**
     * Creates an array from a spread set of objects ie. (toArray "foo" "bar") => ["foo", "bar"]
     */
    Handlebars.registerHelper('toArray', function(...vals) {
        const copy = [...vals];
        copy.splice(-1); //Remove handlebars options object from last item in array
        return copy;
    });

    /**
     * Checks if an element should be displayed based on the value of the MarkImports Setting
     * 'ANY' option returns true as long as the setting isn't set to 'NONE'
     */
    Handlebars.registerHelper('itemMarking', function(element: string) {
        const mark = game.settings.get(SYSTEM_NAME, 'MarkImports');
        if (element === 'ANY' && mark !== 'NONE') {
            return true;
        }
        if (mark === element || mark === 'BOTH') {
            return true;
        }
        return false;
    });

    /**
     * Check whether an actor has any items that are freshly imported
     */
    Handlebars.registerHelper('hasAnyFreshImports', function(actor: SR5Actor) {
        if (game.settings.get(SYSTEM_NAME, 'MarkImports') !== 'NONE') {
            const allItems = actor.items;
            for (const item of allItems) {
                if (item.system.importFlags) {
                    if (item.system.importFlags.isFreshImport) {
                        return true;
                    }
                }
            }
        }

        return false;
    });

    /**
     * Allow using the first given value that's defined.
     * @params * A open list of parameters, from which the first defined value will be returned.
     */
    Handlebars.registerHelper('firstDefined', function(...values) {
        for (const value of values) {
            if (value !== undefined) return value;
        }
        return undefined;
    });

    Handlebars.registerHelper('isURL', function(value: string) {
        return LinksHelpers.isURL(value);
    })

    Handlebars.registerHelper('isPDF', function(value: string) {
        return LinksHelpers.isPDF(value);
    })

    Handlebars.registerHelper('isUuid', function(value: string) {
        return LinksHelpers.isUuid(value);
    })

    /**
     * Expects a config object and turns it into an array of objects for FormGroup options
     */
    Handlebars.registerHelper('config2Array', function(config: Record<string, string>) {
        return Object.keys(config).map(category => ({
            label: config[category] ?? category,
            value: category
        }));
    })

    /**
     * Expects a config object and turns it into an array of objects for FormGroup options
     */
    Handlebars.registerHelper('tests2Array', function(config: Record<string, any>) {
        return Object.keys(config).map(test => ({
            label: test,
            value: test
        }));
    })

    /**
     * Display the Nuyen value in a format using locale separators
     */
    Handlebars.registerHelper('nuyenValue', function(nuyen: number) {
        return Number(nuyen).toLocaleString(game.i18n.lang);
    })

    Handlebars.registerHelper('hasKey', function(obj: Record<string, unknown>, key: string) {
        if (!obj || typeof obj !== 'object') return false;
        return Object.hasOwn(obj, key);
    });
};
