import { Helpers } from './helpers';

export const preloadHandlebarsTemplates = async () => {
    const templatePaths = [
        'systems/shadowrun5e/templates/actor/parts/actor-equipment.html',
        'systems/shadowrun5e/templates/actor/parts/actor-spellbook.html',
        'systems/shadowrun5e/templates/actor/parts/actor-skills.html',
        'systems/shadowrun5e/templates/actor/parts/actor-matrix.html',
        'systems/shadowrun5e/templates/actor/parts/actor-actions.html',
        'systems/shadowrun5e/templates/actor/parts/actor-config.html',
        'systems/shadowrun5e/templates/actor/parts/actor-bio.html',
        'systems/shadowrun5e/templates/actor/parts/actor-social.html',
        'systems/shadowrun5e/templates/item/parts/description.html',
        'systems/shadowrun5e/templates/item/parts/technology.html',
        'systems/shadowrun5e/templates/item/parts/header.html',
        'systems/shadowrun5e/templates/item/parts/weapon-ammo-list.html',
        'systems/shadowrun5e/templates/item/parts/weapon-mods-list.html',
        'systems/shadowrun5e/templates/item/parts/action.html',
        'systems/shadowrun5e/templates/item/parts/damage.html',
        'systems/shadowrun5e/templates/item/parts/opposed.html',
        'systems/shadowrun5e/templates/item/parts/spell.html',
        'systems/shadowrun5e/templates/item/parts/complex_form.html',
        'systems/shadowrun5e/templates/item/parts/weapon.html',
        'systems/shadowrun5e/templates/item/parts/armor.html',
        'systems/shadowrun5e/templates/item/parts/matrix.html',
        'systems/shadowrun5e/templates/item/parts/sin.html',
        'systems/shadowrun5e/templates/item/parts/contact.html',
        'systems/shadowrun5e/templates/item/parts/lifestyle.html',
        'systems/shadowrun5e/templates/item/parts/ammo.html',
        'systems/shadowrun5e/templates/item/parts/modification.html',
        'systems/shadowrun5e/templates/item/parts/program.html',
        'systems/shadowrun5e/templates/rolls/parts/parts-list.html',
    ];

    return loadTemplates(templatePaths);
};

export const registerHandlebarHelpers = () => {
    Handlebars.registerHelper('localizeOb', function (strId, obj) {
        if (obj) strId = obj[strId];
        return game.i18n.localize(strId);
    });

    Handlebars.registerHelper('toHeaderCase', function (str) {
        if (str) return Helpers.label(str);
        return '';
    });

    Handlebars.registerHelper('concat', function (strs, c = ',') {
        if (Array.isArray(strs)) {
            return strs.join(c);
        }
        return strs;
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
    Handlebars.registerHelper('sum', function (v1, v2) {
        return v1 + v2;
    });
    Handlebars.registerHelper('damageAbbreviation', function (damage) {
        if (damage === 'physical') return 'P';
        if (damage === 'stun') return 'S';
        if (damage === 'matrix') return 'M';
        return '';
    });
    Handlebars.registerHelper('diceIcon', function (roll) {
        if (roll.roll) {
            switch (roll.roll) {
                case 1:
                    return 'red';
                case 2:
                    return 'grey';
                case 3:
                    return 'grey';
                case 4:
                    return 'grey';
                case 5:
                    return 'green';
                case 6:
                    return 'green';
            }
        }
    });

    Handlebars.registerHelper('elementIcon', function (element) {
        let icon = '';
        if (element === 'electricity') {
            icon = 'fas fa-bolt';
        } else if (element === 'radiation') {
            icon = 'fas fa-radiation-alt';
        } else if (element === 'fire') {
            icon = 'fas fa-fire';
        } else if (element === 'acid') {
            icon = 'fas fa-vials';
        } else if (element === 'cold') {
            icon = 'fas fa-snowflake';
        }
        return icon;
    });

    Handlebars.registerHelper('isDefined', function(value) {
        return value !== undefined;
    })
};
