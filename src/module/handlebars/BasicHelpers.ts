import { Helpers } from '../helpers';
import {SafeString} from "handlebars";
import SkillField = Shadowrun.SkillField;
import {SR5} from "../config";
import {FLAGS, SR, SYSTEM_NAME} from "../constants";

export const registerBasicHelpers = () => {
    Handlebars.registerHelper('localizeOb', function (strId, obj) {
        if (obj) strId = obj[strId];
        return game.i18n.localize(strId);
    });

    Handlebars.registerHelper('localizeSkill', function (skill: SkillField): string {
        return skill.label ? game.i18n.localize(skill.label) : skill.name;
        // NOTE: Below is code to append a shortened attribute name to the skill name. It's been removed for readability.
        //       But still might useful for someone.
        // if (!game.settings.get(SYSTEM_NAME, FLAGS.ShowSkillsWithDetails) || !translatedSkill || !skill.attribute)
        //     return translatedSkill;
        //
        // // Try showing the first three letters, or less.
        // const translatedAttribute = game.i18n.localize(SR5.attributes[skill.attribute]);
        // if (!translatedAttribute) return translatedSkill;
        //
        // const cutToIndex = translatedAttribute.length < SR.attributes.SHORT_NAME_LENGTH ?
        //     translatedAttribute.length -1 :
        //     SR.attributes.SHORT_NAME_LENGTH;
        // const translatedAttributeShorthand = translatedAttribute.substring(0, cutToIndex).toUpperCase();
        // return `${translatedSkill} (${translatedAttributeShorthand})`;
    });

    Handlebars.registerHelper('toHeaderCase', function (str) {
        if (str) return Helpers.label(str);
        return '';
    });

    Handlebars.registerHelper('concatStrings', function (...args) {
        return args.filter(a => typeof a === 'string').join('');
    });

    Handlebars.registerHelper('concat', function (strs, c = ',') {
        if (Array.isArray(strs)) {
            return strs.join(c);
        }
        return strs;
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
    Handlebars.registerHelper('hasprop', function (obj, prop, options) {
        if (obj.hasOwnProperty(prop)) {
            return options.fn(this);
        } else return options.inverse(this);
    });
    Handlebars.registerHelper('ifin', function (val, arr, options) {
        if (arr.includes(val)) return options.fn(this);
        else return options.inverse(this);
    });
    // if greater than
    Handlebars.registerHelper('ifgt', function (v1, v2, options) {
        if (v1 > v2) return options.fn(this);
        else return options.inverse(this);
    });
    // if less than
    Handlebars.registerHelper('iflt', function (v1, v2, options) {
        if (v1 < v2) return options.fn(this);
        else return options.inverse(this);
    });
    // if less than or equal
    Handlebars.registerHelper('iflte', function (v1, v2, options) {
        if (v1 <= v2) return options.fn(this);
        else return options.inverse(this);
    });
    // if not equal
    Handlebars.registerHelper('ifne', function (v1, v2, options) {
        if (v1 !== v2) return options.fn(this);
        else return options.inverse(this);
    });
    // if equal
    Handlebars.registerHelper('ife', function (v1, v2, options) {
        if (v1 === v2) return options.fn(this);
        else return options.inverse(this);
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
        return val ? val : undefined;
    });
    // TODO: This helper doesn't work... Don't why, but it doesn't.
    Handlebars.registerHelper('localizeShortened', function (label: string, length: number, options: any): SafeString {
        return new Handlebars.SafeString(Helpers.shortenAttributeLocalization(label, length));
    });
};
