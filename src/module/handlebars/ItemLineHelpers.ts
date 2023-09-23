import {SR5ItemDataWrapper} from '../data/SR5ItemDataWrapper';
import {SR5} from "../config";
import ShadowrunItemData = Shadowrun.ShadowrunItemData;
import MarkedDocument = Shadowrun.MarkedDocument;
import { InventorySheetDataByType } from '../actor/sheets/SR5BaseActorSheet';


/**
 * Typing around the legacy item list helper.
 */
interface ItemListRightSide {
    // Provide a simple text, main use for column headers.
    text?: {
        text: string|number|undefined
        title?: string // TODO: This doesn't seem to be doing anything in ListItem.html
        cssClass?: string
    }
    // Provide a button element, main use for column values.
    button?: {
        text: string|number
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
    html? :{
        text: string
        cssClass?: string
    }
}

export const registerItemLineHelpers = () => {
    Handlebars.registerHelper('InventoryHeaderIcons', function (section: InventorySheetDataByType) {
        var icons = Handlebars.helpers['ItemHeaderIcons'](section.type) as object[];

        icons.push(section.isOpen
            ? {
                icon: 'fas fa-square-chevron-up',
                title: game.i18n.localize('SR5.Collapse'),
                cssClass: 'item-toggle',
                // Add HTML data attributes using a key<string>:value<string> structure
                data: {}
            }
            : {
                icon: 'fas fa-square-chevron-down',
                title: game.i18n.localize('SR5.Expand'),
                cssClass: 'item-toggle',
                // Add HTML data attributes using a key<string>:value<string> structure
                data: {}
            }
        );

        return icons;
    })

    Handlebars.registerHelper('ItemHeaderIcons', function (type: string) {
        const PlusIcon = 'fas fa-plus';
        const AddText = game.i18n.localize('SR5.Add');
        const addIcon = {
            icon: PlusIcon,
            text: AddText,
            title: game.i18n.localize('SR5.CreateItem'),
            cssClass: 'item-create',
            // Add HTML data attributes using a key<string>:value<string> structure
            data: {}
        };
        switch (type) {
            case 'lifestyle':
                addIcon.title = game.i18n.localize('SR5.CreateItemLifestyle');
                return [addIcon];
            case 'contact':
                addIcon.title = game.i18n.localize('SR5.CreateItemContact');
                return [addIcon];
            case 'sin':
                addIcon.title = game.i18n.localize('SR5.CreateItemSIN');
                return [addIcon];
            case 'license':
                addIcon.title = game.i18n.localize('SR5.CreateItemLicense');
                return [addIcon];
            case 'quality':
                addIcon.title = game.i18n.localize('SR5.CreateItemQuality');
                return [addIcon];
            case 'adept_power':
                addIcon.title = game.i18n.localize('SR5.CreateItemAdeptPower');
                return [addIcon];
            case 'action':
                addIcon.title = game.i18n.localize('SR5.CreateItemAction');
                return [addIcon];
            case 'spell':
                addIcon.title = game.i18n.localize('SR5.CreateItemSpell');
                return [addIcon];
            case 'gear':
                addIcon.title = game.i18n.localize('SR5.CreateItemGear');
                return [addIcon];
            case 'complex_form':
                addIcon.title = game.i18n.localize('SR5.CreateItemComplexForm');
                return [addIcon];
            case 'program':
                addIcon.title = game.i18n.localize('SR5.CreateItemProgram');
                return [addIcon];
            case 'weapon':
                addIcon.title = game.i18n.localize('SR5.CreateItemWeapon');
                return [addIcon];
            case 'armor':
                addIcon.title = game.i18n.localize('SR5.CreateItemArmor');
                return [addIcon];
            case 'ammo':
                addIcon.title = game.i18n.localize('SR5.CreateItemAmmo');
                return [addIcon];
            case 'modification':
                addIcon.title = game.i18n.localize('SR5.CreateItemModification');
                return [addIcon];
            case 'device':
                addIcon.title = game.i18n.localize('SR5.CreateItemDevice');
                return [addIcon];
            case 'equipment':
                addIcon.title = game.i18n.localize('SR5.CreateItemEquipment');
                return [addIcon];
            case 'cyberware':
                addIcon.title = game.i18n.localize('SR5.CreateItemCyberware');
                return [addIcon];
            case 'bioware':
                addIcon.title = game.i18n.localize('SR5.CreateItemBioware');
                return [addIcon];
            case 'critter_power':
                addIcon.title = game.i18n.localize('SR5.CreateItemCritterPower');
                return [addIcon];
            case 'sprite_power':
                addIcon.title = game.i18n.localize('SR5.CreateItemSpritePower');
                return [addIcon];
            case 'summoning':
                // NOTE: summoning is not an actual item type. It's an call_in_action sub type
                addIcon.title = game.i18n.localize('SR5.CallInAction.CreateSummoning');
                return [addIcon];
            case 'compilation':
                // NOTE: compilation is not an actual item type. It's an call_in_action sub type
                addIcon.title = game.i18n.localize('SR5.CallInAction.CreateCompilation');
                return [addIcon];
            case 'effect':
                addIcon.title = game.i18n.localize('SR5.CreateEffect');
                addIcon.cssClass = 'effect-control';
                addIcon.data = {action: 'create'};
                return [addIcon];
            default:
                return [];
        }
    });

    Handlebars.registerHelper('InventoryIcons', function(name: string) {
        const addItemIcon = {
            icon: 'fas fa-plus',
            text: game.i18n.localize('SR5.Add'),
            title: game.i18n.localize('SR5.CreateItem'),
            cssClass: 'inventory-item-create',
            // Add HTML data attributes using a key<string>:value<string> structure
            data: {inventory: name}
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
                            text: game.i18n.localize('SR5.Skill'),
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
            case 'weapon':
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
            case 'adept_power':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.PowerType'),
                        },
                    },
                ];
            case 'spell':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.SpellType'),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.SpellRange'),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Duration'),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Drain'),
                        },
                    },
                ];
            case 'critter_power':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.CritterPower.Type'),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.CritterPower.Range'),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.CritterPower.Duration'),
                        },
                    },
                ];
            case 'quality':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.QualityType'),
                        },
                    },
                ];
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
    Handlebars.registerHelper('ItemRightSide', function (item: ShadowrunItemData): ItemListRightSide[] {
        const wrapper = new SR5ItemDataWrapper(item);
        const qtyInput = {
            input: {
                type: 'number',
                value: wrapper.getQuantity(),
                cssClass: 'item-qty',
            },
        };
        
        switch (item.type) {
            case 'action':

                // Only show a limit, when one is defined. Either by name or attribute
                const limitAttribute = item.system.action.limit.attribute;
                const limitBase = Number(item.system.action.limit.base);
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
                            // Either use the legacy skill localization OR just the skill name/id instead.
                            text: game.i18n.localize(SR5.activeSkills[wrapper.getActionSkill() ?? ''] ?? wrapper.getActionSkill()),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(SR5.attributes[wrapper.getActionAttribute() ?? '']),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(SR5.attributes[wrapper.getActionAttribute2() ?? '']),
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
                            text: wrapper.getActionDicePoolMod(),
                            cssClass: 'six',
                        },
                    },
                ];
            case 'armor':
            case 'ammo':
            case 'modification':
            case 'device':
            case 'equipment':
            case 'cyberware':
            case 'bioware':
                return [qtyInput];
            case 'weapon':
                if (wrapper.isRangedWeapon()) {
                    const count = wrapper.getAmmo()?.current.value ?? 0;
                    const max = wrapper.getAmmo()?.current.max ?? 0;
                    // Show reload on both no ammo configured and partially consumed clips.
                    const text = count < max || max === 0 ? 
                        `${game.i18n.localize('SR5.WeaponReload')} (${count}/${max})` : 
                        game.i18n.localize('SR5.AmmoFull');

                    const cssClass = 'no-break' + (count < max ? ' reload-ammo roll' : 'faded');
                    return [
                        {
                            text: {
                                title: `${game.i18n.localize('SR5.WeaponAmmoCount')}: ${count}`,
                                text,
                                cssClass,
                            },
                        },
                        {
                            text: {
                                text: '',
                            },
                        },
                        qtyInput,
                    ];
                } else {
                    return [qtyInput];
                }

            case 'quality':
                return [
                    {
                        text: {
                            text: game.i18n.localize(SR5.qualityTypes[item.system.type ?? '']),
                        },
                    },
                ];

            case 'adept_power':
                return [
                    {
                        text: {
                            text: game.i18n.localize(SR5.adeptPower.types[item.system.type ?? '']),
                        },
                    },
                ];
            case 'spell':
                return [
                    {
                        text: {
                            text: game.i18n.localize(SR5.spellTypes[item.system.type ?? '']),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(SR5.spellRanges[item.system.range ?? '']),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(SR5.durations[item.system.duration ?? '']),
                        },
                    },
                    {
                        text: {
                            text: wrapper.getDrain(),
                        },
                    },
                ];
            case 'critter_power':
                return [
                    {
                        text: {
                            text: game.i18n.localize(SR5.critterPower.types[item.system.powerType ?? '']),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(SR5.critterPower.ranges[item.system.range ?? '']),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(SR5.critterPower.durations[item.system.duration ?? '']),
                        },
                    },
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
                            cssClass: `item-equip-toggle ${wrapper.isEquipped() ? 'light' : ''}`,
                            short: true,
                            text: wrapper.isEquipped() ? game.i18n.localize('SR5.Loaded') : game.i18n.localize('SR5.Load') + ' >>',
                        },
                    },
                ];
            /**
             * Call In Actions differ depending on called in actor type.
             */
            case 'call_in_action':
                if (item.system.actor_type === 'spirit') {
                    const summoningData = item.system as Shadowrun.CallInActionData;
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
                    const compilationData = item.system as Shadowrun.CallInActionData;
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

            default:
                return [];
        }
    });

    Handlebars.registerHelper('ItemIcons', function (item: ShadowrunItemData) {
        const wrapper = new SR5ItemDataWrapper(item);

        const editIcon = {
            icon: 'fas fa-edit item-edit',
            title: game.i18n.localize('SR5.EditItem'),
        };
        const removeIcon = {
            icon: 'fas fa-trash item-delete',
            title: game.i18n.localize('SR5.DeleteItem'),
        };
        const equipIcon = {
            icon: `${wrapper.isEquipped() ? 'fas fa-check-circle' : 'far fa-circle'} item-equip-toggle`,
            title: game.i18n.localize('SR5.ToggleEquip'),
        };
        const pdfIcon = {
            icon: 'fas fa-file open-source',
            title: game.i18n.localize('SR5.OpenSource'),
        };

        const icons = [pdfIcon, editIcon, removeIcon];

        switch (wrapper.getType()) {
            case 'program':
            case 'armor':
            case 'device':
            case 'equipment':
            case 'cyberware':
            case 'bioware':
            case 'weapon':
                icons.unshift(equipIcon);
        }

        return icons;
    });

    Handlebars.registerHelper('InventoryItemIcons', function (item: ShadowrunItemData) {
        const wrapper = new SR5ItemDataWrapper(item);
        const moveIcon = {
            icon: 'fas fa-exchange-alt inventory-item-move',
            title: game.i18n.localize('SR5.MoveItemInventory')
        };
        const editIcon = {
            icon: 'fas fa-edit item-edit',
            title: game.i18n.localize('SR5.EditItem'),
        };
        const removeIcon = {
            icon: 'fas fa-trash item-delete',
            title: game.i18n.localize('SR5.DeleteItem'),
        };
        const equipIcon = {
            icon: `${wrapper.isEquipped() ? 'fas fa-check-circle' : 'far fa-circle'} item-equip-toggle`,
            title: game.i18n.localize('SR5.ToggleEquip'),
        };
        const pdfIcon = {
            icon: 'fas fa-file open-source',
            title: game.i18n.localize('SR5.OpenSource'),
        };

        const icons = [pdfIcon, moveIcon, editIcon, removeIcon];

        switch (wrapper.getType()) {
            case 'program':
            case 'armor':
            case 'device':
            case 'equipment':
            case 'cyberware':
            case 'bioware':
            case 'weapon':
                icons.unshift(equipIcon);
        }

        return icons;
    });

    /**
     * Helper specifically for active effect icons.
     *
     * Add HTML data attributes using a key<string>:value<string> structure for each icon.
     */
    Handlebars.registerHelper('EffectIcons', function (effect) {
        const editIcon = {
            icon: 'fas fa-edit effect-control',
            title: game.i18n.localize('SR5.EditItem'),
            data: {action: 'edit'}
        };
        const removeIcon = {
            icon: 'fas fa-trash effect-control',
            title: game.i18n.localize('SR5.DeleteItem'),
            data: {action: 'delete'}
        };
        const disableIcon = {
            icon: `${effect.disabled ? 'far fa-circle' : 'fas fa-check-circle'} effect-control`,
            title: game.i18n.localize('SR5.ToggleActive'),
            data: {action: "toggle"}
        };
        const openOriginIcon = {
            icon: 'fas fa-file effect-control',
            title: game.i18n.localize('SR5.OpenOrigin'),
            data: {action: "open-origin"}
        }
        // Disallow changes to effects that aren't of direct origin.
        let icons = [disableIcon, editIcon, removeIcon];
        if (effect.isOriginOwned) icons = [openOriginIcon, ...icons];
        return icons;
    });

    Handlebars.registerHelper('EffectData', function(effectType: string) {
        return {'effect-type': effectType};
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
            data: {action: 'add-one'}
        };
        const decrementIcon = {
            icon: 'fas fa-minus marks-remove-one',
            title: game.i18n.localize('SR5.Labels.Sheet.SubtractOne'),
            data: {action: 'remove-one'}
        }

        return [incrementIcon, decrementIcon];
    });

    Handlebars.registerHelper('MarkListHeaderRightSide', () => {
        return [
            {
                text: {
                    text: game.i18n.localize('SR5.FOUNDRY.Scene'),
                },
            },
            {
                text: {
                    text: game.i18n.localize('SR5.FOUNDRY.Item'),
                },
            },
            {
                text: {
                    text: game.i18n.localize('SR5.Qty'),
                },
            }]
    });

    Handlebars.registerHelper('MarkListHeaderIcons', () => {
        return [{
            icon: 'fas fa-trash',
            title: game.i18n.localize('SR5.ClearMarks'),
            text: game.i18n.localize('SR5.Del'),
            cssClass: 'marks-clear-all'
        }];
    });

    Handlebars.registerHelper('NetworkDevicesListRightSide', () => {
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

    Handlebars.registerHelper('NetworkDevicesListHeaderIcons', () => {
        return [{
            icon: 'fas fa-trash',
            title: game.i18n.localize('SR5.Labels.Sheet.ClearNetwork'),
            text: game.i18n.localize('SR5.Del'),
            cssClass: 'network-clear'
        }];
    })
};
