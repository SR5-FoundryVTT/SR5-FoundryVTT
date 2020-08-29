import { Helpers } from './helpers';
import SR5ItemType = Shadowrun.SR5ItemType;
import { SR5ItemDataWrapper } from './item/SR5ItemDataWrapper';
import ModList = Shadowrun.ModList;
import { PartsList } from './parts/PartsList';

export const preloadHandlebarsTemplates = async () => {
    const templatePaths = [
        'systems/shadowrun5e/dist/templates/actor/parts/actor-equipment.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-spellbook.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-skills.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-matrix.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-actions.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-config.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-bio.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-social.html',
        'systems/shadowrun5e/dist/templates/actor/parts/matrix/matrix-attribute.html',
        'systems/shadowrun5e/dist/templates/actor/parts/skills/ActorAttribute.html',

        'systems/shadowrun5e/dist/templates/item/parts/description.html',
        'systems/shadowrun5e/dist/templates/item/parts/technology.html',
        'systems/shadowrun5e/dist/templates/item/parts/header.html',
        'systems/shadowrun5e/dist/templates/item/parts/weapon-ammo-list.html',
        'systems/shadowrun5e/dist/templates/item/parts/weapon-mods-list.html',
        'systems/shadowrun5e/dist/templates/item/parts/action.html',
        'systems/shadowrun5e/dist/templates/item/parts/damage.html',
        'systems/shadowrun5e/dist/templates/item/parts/opposed.html',
        'systems/shadowrun5e/dist/templates/item/parts/spell.html',
        'systems/shadowrun5e/dist/templates/item/parts/complex_form.html',
        'systems/shadowrun5e/dist/templates/item/parts/weapon.html',
        'systems/shadowrun5e/dist/templates/item/parts/armor.html',
        'systems/shadowrun5e/dist/templates/item/parts/matrix.html',
        'systems/shadowrun5e/dist/templates/item/parts/sin.html',
        'systems/shadowrun5e/dist/templates/item/parts/contact.html',
        'systems/shadowrun5e/dist/templates/item/parts/lifestyle.html',
        'systems/shadowrun5e/dist/templates/item/parts/ammo.html',
        'systems/shadowrun5e/dist/templates/item/parts/modification.html',
        'systems/shadowrun5e/dist/templates/item/parts/program.html',
        'systems/shadowrun5e/dist/templates/rolls/parts/parts-list.html',

        'systems/shadowrun5e/dist/templates/common/ValueInput.html',
        'systems/shadowrun5e/dist/templates/common/ConditionMonitor.html',
        'systems/shadowrun5e/dist/templates/common/ValueMaxAttribute.html',
        'systems/shadowrun5e/dist/templates/common/UsesAttribute.html',
        'systems/shadowrun5e/dist/templates/common/Attribute.html',
        'systems/shadowrun5e/dist/templates/common/List/ListItem.html',
        'systems/shadowrun5e/dist/templates/common/List/ListHeader.html',
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

    Handlebars.registerHelper('isDefined', function (value) {
        return value !== undefined && value !== null;
    });

    /**
     * Return a default value if the provided value is not defined (null or undefined)
     */
    Handlebars.registerHelper('default', function (value: string, defaultValue: string) {
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

    Handlebars.registerHelper('partsTotal', function (partsList: ModList<number>) {
        const parts = new PartsList(partsList);
        return parts.total;
    })

    Handlebars.registerHelper('ItemHeaderIcons', function (id) {
        const PlusIcon = 'fas fa-plus';
        const AddText = game.i18n.localize('SR5.Add');
        switch (id) {
            case 'complex_form':
                return [
                    {
                        icon: PlusIcon,
                        text: AddText,
                        title: game.i18n.localize('SR5.AddComplexForm'),
                    },
                ];
            case 'program':
                return [
                    {
                        icon: PlusIcon,
                        text: AddText,
                        title: game.i18n.localize('SR5.AddProgram'),
                    },
                ];
        }
    });

    Handlebars.registerHelper('ItemHeaderRightSide', function (id) {
        switch (id) {
            case 'complex_form':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.Target')
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Duration')
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Fade')
                        },
                    },
                ];
            case 'program':
                return [];
            default:
                return [];
        }
    });

    Handlebars.registerHelper('ItemRightSide', function (item: SR5ItemType) {
        const wrapper = new SR5ItemDataWrapper(item);
        switch (item.type) {
            case 'complex_form':
                return [
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.matrixTargets[item.data.target ?? '']),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.durations[item.data.duration ?? '']),
                        },
                    },
                    {
                        text: {
                            text: String(item.data.fade),
                        },
                    },
                ];
            case 'program':
                return [
                    {
                        button: {
                            cssClass: `item-equip-toggle ${wrapper.isEquipped() ? 'light' : ''}`,
                            short: true,
                            text: wrapper.isEquipped() ? game.i18n.localize('SR5.Loaded') : game.i18n.localize('SR5.Load') + ' >>',
                        },
                    },
                ];
            default:
                return [];
        }
    });

    Handlebars.registerHelper('ItemIcons', function (item: SR5ItemType) {
        const addIcon = {
            icon: 'fas fa-plus',
            title: game.i18n.localize('SR5.AddItem'),
        };
        const editIcon = {
            icon: 'fas fa-edit',
            title: game.i18n.localize('SR5.EditItem'),
        };
        const removeIcon = {
            icon: 'fas fa-trash',
            title: game.i18n.localize('SR5.DeleteItem'),
        };
        const equipIcon = {
            icon: `${item.data.technology?.equipped ? 'fas fa-check-circle' : 'far fa-circle'} item-equip-toggle`,
            title: game.i18n.localize('SR5.ToggleEquip'),
        };

        switch (item.type) {
            case 'program':
                return [equipIcon, editIcon, removeIcon];
            default:
                return [editIcon, removeIcon];
        }
    });
};
