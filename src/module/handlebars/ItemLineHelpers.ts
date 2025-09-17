import { SR5 } from "../config";
import MarkedDocument = Shadowrun.MarkedDocument;
import { InventorySheetDataByType } from '../actor/sheets/SR5BaseActorSheet';
import { SR5ActiveEffect } from '../effect/SR5ActiveEffect';
import { formatStrict } from '../utils/strings';
import { SR5Item } from '../item/SR5Item';
import { SR5Actor } from "../actor/SR5Actor";
import { MatrixNetworkFlow } from "../item/flows/MatrixNetworkFlow";
import { SheetFlow } from '@/module/flows/SheetFlow';
import { ActorOwnershipFlow } from '@/module/actor/flows/ActorOwnershipFlow';

/**
 * Typing around the legacy item list helper.
 */
interface ItemListRightSide {
    // Provide a simple text, main use for column headers.
    text?: {
        text: string | number | undefined
        title?: string // TODO: This doesn't seem to be doing anything in ListItem.html
        cssClass?: string
    }
    // Provide a button element, main use for column values.
    button?: {
        text: string | number
        cssClass?: string
        // Shorten the button visually...
        short?: boolean
    }
    // Provide a input element, main use for column values.
    input?: {
        type: string
        value: any
        cssClass?: string
    }
    // Provide html as string.
    html?: {
        text: string
        cssClass?: string
    }
}

export const registerItemLineHelpers = () => {

    Handlebars.registerHelper('hasRoll', function (item: SR5Item, options) {
        return item?.hasRoll ?? false;
    })

    Handlebars.registerHelper('isBroken', function (item: SR5Item, options) {
        return item?.isMatrixDevice && item.isBroken;
    })

    Handlebars.registerHelper('canBeWireless', function (item: SR5Item, options) {
        return item?.canBeWireless() ?? false;
    })
    Handlebars.registerHelper('isWireless', function (item: SR5Item, options) {
        return item?.isWireless() ?? false;
    })

    Handlebars.registerHelper('isRunningSilent', function (item: SR5Item, options) {
        return item?.isRunningSilent() ?? false;
    })

    Handlebars.registerHelper('hasSource', function (item: SR5Item, options) {
        console.log(item, options);
        // todo figure out source for active effects and actors
        const source = (item instanceof SR5Item) ? item.getSource() ?? '' : ''
        return source !== '';
    })

    Handlebars.registerHelper('isOwner', function (item: SR5Item, options) {
        console.log('isOwner', item, options);
        const owner = options.hash.owner;
        if (!owner || !(owner instanceof SR5Actor)) return false;
        return ActorOwnershipFlow._isOwnerOfItem(owner, item);
    })

    Handlebars.registerHelper('isMatrixAction', function (item: SR5Item, options) {
        return item.isType('action') && item.hasActionCategory('matrix');
    })

    Handlebars.registerHelper('isEquipped', function (item: SR5Item, options) {
        return item.isEquipped();
    })

    Handlebars.registerHelper('marksRequired', function (item: SR5Item, options) {
        const neededMarks: number = item.getAction()?.category.matrix.marks ?? 0;
        const needed = neededMarks > 0 ? `${neededMarks}` : '';
        const owner = item.getAction()?.category.matrix.owner ? game.i18n.localize('SR5.Owner') : '';
        return new Handlebars.SafeString(needed || owner);
    })

    Handlebars.registerHelper('createItemHeaderLabel', function (type: string) {
        return new Handlebars.SafeString(SheetFlow._getCreateItemText(type));
    })

    Handlebars.registerHelper('effectDurationLabel', function (effect: SR5ActiveEffect) {
        const getDurationLabel = () => {
            if (effect.duration.seconds) return `${effect.duration.seconds}s`;
            if (effect.duration.rounds && effect.duration.turns) return `${effect.duration.rounds}r, ${effect.duration.turns}t`;
            if (effect.duration.rounds) return `${effect.duration.rounds}r`;
            if (effect.duration.turns) return `${effect.duration.turns}t`;

            return '';
        }
        return new Handlebars.SafeString(getDurationLabel());
    })

    Handlebars.registerHelper('isFreshImport', function (document, options) {
        if (!(document instanceof SR5Item)) return false;
        return document.system
    })

    Handlebars.registerHelper('usesAmmo', function (item, options) {
        if (!(item instanceof SR5Item)) return false;
        return item.usesAmmo();
    })

   ///////////////////////////////////////////////////////////////////////////////////////////////

    Handlebars.registerHelper('InventoryIcons', function (name: string) {
        const addItemIcon = {
            icon: 'fas fa-plus',
            text: game.i18n.localize('SR5.Add'),
            title: formatStrict('SR5.Create', { type: 'SR5.Item' }),
            cssClass: 'inventory-item-create',
            // Add HTML data attributes using a key<string>:value<string> structure
            data: { inventory: name }
        };

        return [addItemIcon];
    });

    /**
     * The legacy ItemList helper to provide a generic way of defining headers and columns
     * on the 'right side' of an item list across all document sheets.
     */
    Handlebars.registerHelper('ItemHeaderRightSide', function (id: string): ItemListRightSide[] {
        switch (id) {
            case 'action':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.ActionType'),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Skill.Skill'),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Attribute'),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Attribute'),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Limit'),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Modifier'),
                            cssClass: 'six',
                        },
                    },
                ];
            case 'armor':
            case 'device':
            case 'equipment':
            case 'cyberware':
            case 'bioware':
            case 'modification':
            case 'ammo':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.Qty'),
                        },
                    },
                ];
            case 'complex_form':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.Target'),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Duration'),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Fade'),
                        },
                    },
                ];
            case 'critter_power':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.CritterPower.Type')
                        }
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.CritterPower.Range')
                        }
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.CritterPower.Duration')
                        }
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Rating')
                        }
                    },
                ];
            case 'quality':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.QualityType'),
                        }
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Rating'),
                        },
                    },
                ];
            case 'echo':
            case 'metamagic':
                return [{}];
            case 'summoning':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.Summoning.SpiritType')
                        }
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Force')
                        }
                    }
                ]
            case 'compilation':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.Compilation.SpriteType')
                        }
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Level')
                        }
                    }
                ]

            // General use case item lines
            case 'modifiers':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.Value')
                        }
                    }
                ]
            default:
                return [];
        }
    });

    /**
     * Helper for ListItem parts do define segments on the right hand sight per list row.
     *
     * These must match in order and quantity to the ItemHeadersRightSide helper.
     * Example of a matching list header by ItemHeader:
     * <header name>                          <ItemHeaderRightSide>['First Header', 'Second Header']
     * Example of a list item row:
     * <list name>                            <ItemRightSide>      ['First Value',  'Second Value']
     *
     * @param item The item to render the right side for.
     *             NOTE: ItemHeaderRightSide doesn't use the whole item to determine what to show, while
     *                   ItemRightSide does. This is due to ItemRightSide showing content, while ItemHeaderRightSide
     *                   showing dscriptors for that content.
     */
    Handlebars.registerHelper('ItemRightSide', function (itemStored: Item.Stored): ItemListRightSide[] {
        const item = new SR5Item(itemStored as SR5Item);
        const qtyInput = {
            input: {
                type: 'number',
                value: item.system.technology?.quantity ?? 1,
                cssClass: 'item-qty',
            },
        };

        const cmField = {
                text: {
                    text: item.isBroken ? game.i18n.localize('SR5.Broken') : `[${item.getConditionMonitor().value}/${item.getConditionMonitor().max}]`,
                    cssClass: item.isBroken ? 'is-broken' :  item.isDamaged ? 'is-damaged' : '',
            }
        }

        const technologyItems: ItemListRightSide[] = [];

        if (item.getConditionMonitor().max > 0 && item.getConditionMonitor().value > 0) {
            technologyItems.push(cmField);
        }

        switch (item.type) {
            case 'action': {
                const system = item.system as Item.SystemOfType<'action'>;
                // Only show a limit, when one is defined. Either by name or attribute
                const limitAttribute = system.action.limit.attribute;
                const limitBase = Number(system.action.limit.base);
                // Transform into text values, either numerical or localized.
                const textLimitParts: string[] = [];
                if (!isNaN(limitBase) && limitBase > 0) {
                    textLimitParts.push(limitBase.toString());
                }
                if (limitAttribute) {
                    textLimitParts.push(game.i18n.localize(SR5.limits[limitAttribute ?? '']));
                }
                const textLimit = textLimitParts.join(' + ');

                return [
                    {
                        text: {
                            // Instead of 'complex' only show C. This might break in some languages. At that point, you can call me lazy.
                            text: system.action.type ? game.i18n.localize(SR5.actionTypes[system.action.type] ?? '')[0] : ''
                        },
                    },
                    {
                        text: {
                            // Either use the legacy skill localization OR just the skill name/id instead.
                            text: game.i18n.localize(SR5.activeSkills[system.action.skill ?? ''] ?? system.action.skill),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(SR5.attributes[system.action.attribute ?? '']),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            // Legacy actions could have both skill and attribute2 set, which would show both information, when it shouldn't.
                            text: system.action.skill ? '' : game.i18n.localize(SR5.attributes[system.action.attribute2 ?? '']),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: textLimit,
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: system.action.mod,
                            cssClass: 'six',
                        },
                    },
                ];
            }
            case 'armor':
            case 'ammo':
                return [qtyInput];
            case 'modification':
                if (item.isType('modification') && item.system.type === 'vehicle') {
                    return [
                        {
                            text: {
                                text: game.i18n.localize(SR5.modificationCategories[item.system.modification_category])
                            },

                        },
                        {
                            text: {
                                text: item.system.slots || ''
                            },
                        },
                        qtyInput,
                    ];
                };

                if (item.isType('modification') && item.system.type === 'drone') {
                    return [
                        {
                            text: {
                                text: item.system.slots || ''
                            },
                        },
                        qtyInput,
                    ];
                }
                break;
            case 'device':
            case 'equipment':
            case 'cyberware':
            case 'bioware':
                return [...technologyItems, qtyInput];
            case 'quality':
                return [
                    {
                        text: {
                            text: game.i18n.localize(SR5.qualityTypes[item.system.type ?? '']),
                        }
                    },
                    {
                        text: {
                            text: item.system.rating || '',
                        },
                    }
                ];

            case 'critter_power':
                return [
                    {
                        text: {
                            text: game.i18n.localize(SR5.critterPower.types[item.system.powerType ?? ''])
                        }
                    },
                    {
                        text: {
                            text: game.i18n.localize(SR5.critterPower.ranges[(item.system as Item.SystemOfType<'critter_power'>).range ?? ''])
                        }
                    },
                    {
                        text: {
                            text: game.i18n.localize(SR5.critterPower.durations[item.system.duration ?? ''])
                        }
                    },
                    {
                        text: {
                            text: item.system.rating ?? ''
                        }
                    }
                ];

            case 'complex_form':
                return [
                    {
                        text: {
                            text: game.i18n.localize(SR5.matrixTargets[item.system.target ?? '']),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(SR5.durations[item.system.duration ?? '']),
                        },
                    },
                    {
                        text: {
                            text: String(item.system.fade),
                        },
                    },
                ];
            case 'program':
                return [
                    {
                        button: {
                            cssClass: `item-equip-toggle ${item.isEquipped() ? 'light' : ''}`,
                            short: true,
                            text: item.isEquipped() ? game.i18n.localize('SR5.Loaded') : game.i18n.localize('SR5.Load') + ' >>',
                        },
                    },
                ];

            case 'echo':
            case 'metamagic':
                return [{}];
            /**
             * Call In Actions differ depending on called in actor type.
             */
            case 'call_in_action':
                if (item.system.actor_type === 'spirit') {
                    const summoningData = item.system as Item.SystemOfType<'call_in_action'>;
                    const spiritTypeLabel = SR5.spiritTypes[summoningData.spirit.type] ?? '';

                    return [
                        {
                            text: {
                                text: game.i18n.localize(spiritTypeLabel)
                            }
                        },
                        {
                            text: {
                                text: summoningData.spirit.force
                            }
                        }
                    ]
                }

                if (item.system.actor_type === 'sprite') {
                    const compilationData = item.system as Item.SystemOfType<'call_in_action'>;
                    const spriteTypeLabel = SR5.spriteTypes[compilationData.sprite.type] ?? '';

                    return [
                        {
                            text: {
                                text: game.i18n.localize(spriteTypeLabel)
                            }
                        },
                        {
                            text: {
                                text: compilationData.sprite.level
                            }
                        }
                    ]
                }
            }
            return [];
        });

    // TODO delete
    Handlebars.registerHelper('ItemIcons', function (itemStored: Item.Stored) {
        const item = new SR5Item(itemStored as SR5Item);
        const editIcon = {
            icon: 'fas fa-edit item-edit',
            title: game.i18n.localize('SR5.EditItem'),
        };
        const removeIcon = {
            icon: 'fas fa-trash item-delete',
            title: game.i18n.localize('SR5.DeleteItem'),
        };
        const equipIcon = {
            icon: `${item.isEquipped() ? 'fas fa-check-circle' : 'far fa-circle'} item-equip-toggle`,
            title: game.i18n.localize('SR5.ToggleEquip'),
        };
        const enableIcon = {
            icon: `${item.system.enabled ? 'fas fa-check-circle' : 'far fa-circle'} item-enable-toggle`,
            title: game.i18n.localize('SR5.ToggleEquip'),
        }
        const pdfIcon = {
            icon: 'fas fa-file open-source',
            title: game.i18n.localize('SR5.OpenSource'),
        };

        const icons = [pdfIcon, editIcon, removeIcon];

        if (item.isType('program', 'armor', 'device', 'equipment', 'cyberware', 'bioware', 'weapon'))
            icons.unshift(equipIcon);
        else if (item.isType('critter_power', 'sprite_power') && item.system.optional !== 'standard')
            icons.unshift(enableIcon);

        return icons;
    });

    /**
     * Used for the actor sheets display of active effects.
     */
    Handlebars.registerHelper('EffectRightSide', function (effect: SR5ActiveEffect) {
        const getDurationLabel = () => {
            if (effect.duration.seconds) return `${effect.duration.seconds}s`;
            if (effect.duration.rounds && effect.duration.turns) return `${effect.duration.rounds}r, ${effect.duration.turns}t`;
            if (effect.duration.rounds) return `${effect.duration.rounds}r`;
            if (effect.duration.turns) return `${effect.duration.turns}t`;

            return '';
        }

        return [
            {
                // Apply To Column
                text: {
                    text: game.i18n?.localize(SR5.effectApplyTo[effect.system.applyTo]),
                    cssClass: 'six',
                }
            },
            {
                // Duration Column
                text: {
                    text: getDurationLabel(),
                    cssClass: 'six',
                }
            }
        ];
    });

    // TODO delete
    Handlebars.registerHelper('InventoryItemIcons', function (itemStored: Item.Stored) {
        const item = new SR5Item(itemStored as SR5Item);
        const moveIcon = {
            icon: 'fas fa-exchange-alt inventory-item-move',
            title: game.i18n.localize('SR5.MoveItemInventory')
        };
        const editIcon = {
            icon: 'fas fa-edit item-edit',
            title: game.i18n.localize('SR5.EditItem'),
        };
        const brokenIcon = {
            icon: 'fa-regular fa-link-slash',
            title: game.i18n.localize('SR5.Broken')
        }
        const wirelessIcon = {
            icon: `${item.isWireless() ?
                        item.isRunningSilent()
                            ? 'fa-duotone fa-wifi-fair'
                            : 'fas fa-wifi'
                        : 'fa-duotone fa-wifi-slash'
                    } item-wireless-toggle`,
            title: game.i18n.localize(item.isWireless()
                                        ? item.isRunningSilent()
                                            ? 'SR5.RunningSilent'
                                            : 'SR5.WirelessOnline'
                                        : 'SR5.WirelessOffline')
        }
        const removeIcon = {
            icon: 'fas fa-trash item-delete',
            title: game.i18n.localize('SR5.DeleteItem'),
        };
        const equipIcon = {
            icon: `${item.isEquipped() ? 'fas fa-check-circle' : 'far fa-circle'} item-equip-toggle`,
            title: game.i18n.localize('SR5.ToggleEquip'),
        };
        const pdfIcon = {
            icon: 'fas fa-file open-source',
            title: game.i18n.localize('SR5.OpenSource'),
        };

        const icons = [pdfIcon, moveIcon, editIcon, removeIcon];

        if (item.isType('program', 'armor', 'device', 'equipment', 'cyberware', 'bioware', 'weapon')) {
            if (!item.isBroken) {
                if (item.canBeWireless())
                    icons.unshift(wirelessIcon)

                icons.unshift(equipIcon);
            } else {
                icons.unshift(brokenIcon);
            }
        }

        return icons;
    });

    // Allow Matrix Marks to be changed on the spot on a Sheet.
    Handlebars.registerHelper('MarksRightSide', (marked: MarkedDocument) => {
        const quantityInput = {
            input: {
                type: 'number',
                value: marked.marks,
                cssClass: 'marks-qty',
            },
        };
        return [quantityInput]
    });

    // Matrix Mark interaction on a Sheet.
    Handlebars.registerHelper('MarksIcons', (marked: MarkedDocument) => {
        const incrementIcon = {
            icon: 'fas fa-plus marks-add-one',
            title: game.i18n.localize('SR5.Labels.Sheet.AddOne'),
            data: { action: 'add-one' }
        };
        const decrementIcon = {
            icon: 'fas fa-minus marks-remove-one',
            title: game.i18n.localize('SR5.Labels.Sheet.SubtractOne'),
            data: { action: 'remove-one' }
        }

        return [incrementIcon, decrementIcon];
    });

    /**
     * Only used for the Matrix HackingTab Mark List
     */
    Handlebars.registerHelper('MarkListHeaderRightSide', () => {
        return [
            {
                text: {
                    text: game.i18n.localize('SR5.Labels.Sheet.Type'),
                },
            },
            {
                text: {
                    text: game.i18n.localize('SR5.Labels.ActorSheet.Network'),
                },
            },
            {
                text: {
                    text: game.i18n.localize('SR5.Qty'),
                },
            }]
    });

    /**
     * Only used for the Matrix HackingTab Target List
     */
    Handlebars.registerHelper('TargetListHeaderRightSide', () => {
        return [
            {
                text: {
                    text: game.i18n.localize('SR5.Labels.Sheet.Type'),
                },
            },
            {
                text: {
                    text: game.i18n.localize('SR5.Labels.ActorSheet.Network'),
                },
            }
        ]
    });

    Handlebars.registerHelper('MarkListHeaderIcons', () => {
        return [{
            icon: 'fas fa-trash',
            title: game.i18n.localize('SR5.ClearMarks'),
            text: game.i18n.localize('SR5.Del'),
            cssClass: 'marks-clear-all'
        }];
    });

    Handlebars.registerHelper('TargetListHeaderIcons', () => {
        return [{
            icon: 'fas fa-refresh',
            title: game.i18n.localize('SR5.Refresh'),
            text: game.i18n.localize('SR5.Refresh'),
            cssClass: 'targets-refresh'
        }];
    });

    Handlebars.registerHelper('SlavesListRightSide', () => {
        return [
            {
                text: {
                    text: game.i18n.localize('SR5.FOUNDRY.Actor'),
                },
            },
            {
                text: {
                    text: game.i18n.localize('SR5.FOUNDRY.Item'),
                },
            }]
    })

    Handlebars.registerHelper('SlavesListHeaderIcons', () => {
        return [{
            icon: 'fas fa-trash',
            title: game.i18n.localize('SR5.Labels.Sheet.ClearNetwork'),
            text: game.i18n.localize('SR5.Del'),
            cssClass: 'network-clear'
        }];
    })

    Handlebars.registerHelper('EmptyIcons', () => {
        return [{}];
    })

    /**
     * Only used for the Item NetworksTab
     */
    Handlebars.registerHelper('NetworksHeaderRightSide', () => {
        return [{
            text: {
                text: game.i18n.localize('SR5.Labels.Sheet.Type'),
            },
        }]
    });
    /**
     * Only used for the Item NetworksTab
     */
    Handlebars.registerHelper('NetworksItemRightSide', (item: SR5Item) => {
        const type = MatrixNetworkFlow.getDocumentType(item);
        return [{
            text: {
                text: game.i18n.localize(type),
            },
        }]
    });
    /**
     * Only used for the Item NetworksTab
     */
    Handlebars.registerHelper('NetworksItemIcons', () => {
        return [{
            icon: 'fas fa-trash item-delete',
            cssClass: 'sin-remove-network',
            title: game.i18n.localize('SR5.DeleteItem'),
        }]
    });

    /**
     * Application - Matrix Network Hacking
     */
    Handlebars.registerHelper('MatrixNetworksItemIcons', () => {
        return [{
            icon: 'fas fa-door-open',
            cssClass: 'matrix-network-invite',
            title: game.i18n.localize('SR5.MatrixNetworkHackingApplication.Invite'),
        },
        {
            icon: 'fas fa-explosion',
            cssClass: 'matrix-network-bruteforce',
            title: game.i18n.localize('SR5.Labels.Actions.BruteForce'),
        },
        {
            icon: 'fas fa-microchip',
            cssClass: 'matrix-network-hackonthefly',
            title: game.i18n.localize('SR5.Labels.Actions.HackontheFly'),
        }]
    });

    /**
     * Return list of css classes to be used in the list of matrix targets.
     * @param target The matrix target to render.
     */
    Handlebars.registerHelper('MatrixTargetCssClass', (target: Shadowrun.MatrixTargetDocument) => {
        const classes: string[] = [];
        if (target.selected) classes.push('selected-list-item');
        return classes;
    });
    Handlebars.registerHelper('MatrixTargetItemIcons', (target: Shadowrun.MatrixTargetDocument) => {
        const toggleConnectedItemsIcon = target.icons.length > 0 ?
            {
                icon: 'fas fa-square-chevron-down',
                cssClass: 'toggle-connected-matrix-icons'
            }:
            {
                icon: 'fas fa-square-chevron-up',
                cssClass: 'toggle-connected-matrix-icons'
            };

        const icons: any = [];
        if (target.document instanceof SR5Actor && target.document.hasWirelessDevices) icons.push(toggleConnectedItemsIcon);

        // if there are no icons, add an empty object to the list so that the columns match up correctly
        if (icons.length === 0) icons.push({});
        return icons;
    });
    Handlebars.registerHelper('MatrixTargetItemRightSide', (target: Shadowrun.MatrixTargetDocument) => {
        return [
            {text: {
                    text: game.i18n.localize(target.type)
            }},
            {text: {
                    text: target.network
            }},
        ];
    });
    Handlebars.registerHelper('MatrixMarkedDocumentItemIcons', (target: Shadowrun.MarkedDocument) => {
        const toggleConnectedItemsIcon = target.icons.length > 0 ?
            {
                icon: 'fas fa-square-chevron-down',
                cssClass: 'toggle-connected-matrix-icons'
            }:
            {
                icon: 'fas fa-square-chevron-up',
                cssClass: 'toggle-connected-matrix-icons'
            };
        const connectNetworkIcon = 
            {
                icon: 'fas fa-right-to-bracket',
                cssClass: 'marks-connect-network'
            };

        const icons = [
            {
                icon: 'fas fa-plus',
                cssClass: 'marks-add-one'
            },
            {
                icon: 'fas fa-minus', 
                cssClass: 'marks-remove-one'
            },
            {
                icon: 'fas fa-trash', 
                cssClass: 'marks-delete'
            }
        ];

        // Handle document type specific icons.
        if (target.document instanceof SR5Item && target.document.isNetwork()) icons.unshift(connectNetworkIcon);
        if (target.document instanceof SR5Actor && target.document.hasWirelessDevices) icons.push(toggleConnectedItemsIcon)

        return icons;
    });
    Handlebars.registerHelper('MatrixMarkedDocumentItemRightSide', (target: Shadowrun.MarkedDocument) => {
        return [
            {text: {
                    text: game.i18n.localize(target.type)
            }},
            {text: {
                    text: target.network
            }},
            {input: {
                type: 'number',
                value: target.marks,
                cssClass: 'marks-qty',
            }}
        ];
    });

    /**
     * Sprite Power Tabs on the sprite actor need a way to differentiate between different sections based on the
     * sprite power values.
     * 
     * The resulting value will be used for ItemHeader handlebar part itemData to determine the correct section for +Add actions.
     */
    Handlebars.registerHelper('SpritePowerItemData', (optional: string) => {
        return {optional};
    });

    /**
     * Return list of css classes to be used in the list of matrix targets.
     * @param target The matrix target to render.
     */
    Handlebars.registerHelper('MatrixOwnedItemIcons', (target: Shadowrun.MatrixTargetDocument) => {
        const toggleConnectedItemsIcon = target.icons.length > 0 ?
            {
                icon: 'fas fa-square-chevron-down',
                cssClass: 'toggle-connected-matrix-icons'
            }:
            {
                icon: 'fas fa-square-chevron-up',
                cssClass: 'toggle-connected-matrix-icons'
            };

        const wirelessIcon = {
            cssClass: 'toggle-owned-icon-silent',
            icon: `${target.document.isRunningSilent()
                    ? 'fa-duotone fa-wifi-fair'
                    : 'fas fa-wifi'
            }`,
            title: game.i18n.localize(
                target.document.isRunningSilent()
                    ? 'SR5.RunningSilent'
                    : 'SR5.WirelessOnline')
        }
        if (target.document instanceof SR5Actor) {
            return target.document.hasWirelessDevices ? [wirelessIcon, toggleConnectedItemsIcon] : [wirelessIcon];
        }
        return [wirelessIcon];
    });

    Handlebars.registerHelper('MatrixOwnedItemRightSide', (target: Shadowrun.MatrixTargetDocument) => {
        return [
            {text: {
                    text: game.i18n.localize(target.type)
                }},
            {text: {
                    text: target.network
                }},
        ];
    });
};
