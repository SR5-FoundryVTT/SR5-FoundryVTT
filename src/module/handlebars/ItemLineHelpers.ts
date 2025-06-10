import { SR5 } from "../config";
import MarkedDocument = Shadowrun.MarkedDocument;
import { InventorySheetDataByType } from '../actor/sheets/SR5BaseActorSheet';
import { SR5ActiveEffect } from '../effect/SR5ActiveEffect';
import { formatStrict } from '../utils/strings';
import { SR5Item } from '../item/SR5Item';

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
            title: formatStrict('SR5.Create', { type: 'SR5.Item' }),
            cssClass: 'item-create',
            // Add HTML data attributes using a key<string>:value<string> structure
            data: {}
        };
        switch (type) {
            case 'lifestyle':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.Lifestyle' });
                return [addIcon];
            case 'contact':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Contact' });
                return [addIcon];
            case 'sin':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.SIN' });
                return [addIcon];
            case 'license':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.License' });
                return [addIcon];
            case 'quality':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.Quality' });
                return [addIcon];
            case 'adept_power':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.ItemTypes.AdeptPower' });
                return [addIcon];
            case 'action':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.Action' });
                return [addIcon];
            case 'spell':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Spell' });
                return [addIcon];
            case 'ritual':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Ritual' });
                return [addIcon];
            case 'gear':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.Gear' });
                return [addIcon];
            case 'complex_form':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.ComplexForm' });
                return [addIcon];
            case 'program':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.Program' });
                return [addIcon];
            case 'weapon':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Weapon' });
                return [addIcon];
            case 'armor':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.Armor' });
                return [addIcon];
            case 'ammo':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.Ammo' });
                return [addIcon];
            case 'modification':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.Modification' });
                return [addIcon];
            case 'device':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.Device' });
                return [addIcon];
            case 'equipment':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.Equipment' });
                return [addIcon];
            case 'cyberware':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.Cyberware' });
                return [addIcon];
            case 'bioware':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.ItemTypes.Bioware' });
                return [addIcon];
            case 'critter_power':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.ItemTypes.CritterPower' });
                return [addIcon];
            case 'sprite_power':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.ItemTypes.SpritePower' });
                return [addIcon];
            case 'echo':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.Echo' });
                return [addIcon];
            case 'metamagic':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.Metamagic' });
                return [addIcon];
            case 'summoning':
                // NOTE: summoning is not an actual item type. It's a call_in_action sub type
                addIcon.title = game.i18n.localize('SR5.CallInAction.CreateSummoning');
                return [addIcon];
            case 'compilation':
                // NOTE: compilation is not an actual item type. It's a call_in_action sub type
                addIcon.title = game.i18n.localize('SR5.CallInAction.CreateCompilation');
                return [addIcon];
            case 'effect':
                addIcon.title = formatStrict('SR5.Create', { type: 'SR5.Effect' });
                addIcon.cssClass = 'effect-control';
                addIcon.data = { action: 'create' };
                return [addIcon];
            default:
                return [];
        }
    });

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
                            text: game.i18n.localize('SR5.Spell.Type'),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Spell.Range'),
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
            case 'itemEffects':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.ActiveEffect.ApplyTo')
                        }
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Duration')
                        }
                    },
                    {
                        text: {
                            // Used as a placeholder for effect line icons.
                            // This way the header column is empty (as no +Add makes sense)
                            // However the line column contains the normal interaction icons.
                            text: ''
                        }
                    }
                ]
            case 'effects':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR5.ActiveEffect.ApplyTo')
                        }
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR5.Duration')
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
    Handlebars.registerHelper('ItemRightSide', function (item: SR5Item): ItemListRightSide[] {
        const qtyInput = {
            input: {
                type: 'number',
                value: item.system.technology?.quantity ?? 1,
                cssClass: 'item-qty',
            },
        };

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
            //@ts-expect-error
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
            case 'device':
            case 'equipment':
            case 'cyberware':
            case 'bioware':
                return [qtyInput];
            case 'weapon': {
                const system = item.system as Item.SystemOfType<'weapon'>;
                // Both Ranged and Melee Weapons can have ammo.
                if (system.category === 'ranged' || (system.category === 'melee' && system.ammo?.current.max > 0)) {
                    const count = system.ammo?.current.value ?? 0;
                    const max = system.ammo?.current.max ?? 0;
                    const partialReloadRounds = system.ammo?.partial_reload_value ?? -1;

                    const reloadLinks: ItemListRightSide[] = [];

                    // Show reload on both no ammo configured and partially consumed clips.
                    const textReload = count < max ?
                        `${game.i18n.localize('SR5.Weapon.Reload')} ` :
                        `${game.i18n.localize('SR5.AmmoFull')}`;
                        
                    const cssClassReload = 'no-break';
                    
                    reloadLinks.push({
                        text: {
                            title: `${game.i18n.localize('SR5.Weapon.AmmoCount')}: `,
                            text: textReload,
                            cssClass: cssClassReload,
                        },
                    });

                    if (count < max) {
                        const textFullReload = `${game.i18n.localize('SR5.Weapon.FullReload')} (${count}/${max})`;
                        const cssClassFullReload = 'no-break reload-ammo roll';

                        reloadLinks.push({
                            button: {
                                short: true,
                                text: textFullReload,
                                cssClass: cssClassFullReload,
                            },
                        });
                    }       

                    if(count < max && partialReloadRounds > 0) {
                        const textPartialReload = `${game.i18n.localize('SR5.Weapon.PartialReload')} (+${partialReloadRounds})`;
                        const cssClassPartialReload = 'no-break partial-reload-ammo roll';

                        reloadLinks.push({
                            button: {
                                short: true,
                                text: textPartialReload,
                                cssClass: cssClassPartialReload,
                            },
                        });
                    }       

                    reloadLinks.push(qtyInput)
                    
                    return reloadLinks;
                } else {
                    return [qtyInput];
                }
            }
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
                            text: game.i18n.localize(SR5.spellRanges[(item.system as Item.SystemOfType<'spell'>).range ?? '']),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(SR5.durations[item.system.duration ?? '']),
                        },
                    },
                    {
                        text: {
                            text: Number(item.system.drain),
                        },
                    },
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
            //@ts-expect-error
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

            default:
                return [];
        }
    });

    Handlebars.registerHelper('ItemIcons', function (item: SR5Item) {
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
                    text: game.i18n?.localize(SR5.effectApplyTo[effect.applyTo]),
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

    Handlebars.registerHelper('InventoryItemIcons', function (item: SR5Item) {
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
            icon: `${item.isEquipped() ? 'fas fa-check-circle' : 'far fa-circle'} item-equip-toggle`,
            title: game.i18n.localize('SR5.ToggleEquip'),
        };
        const pdfIcon = {
            icon: 'fas fa-file open-source',
            title: game.i18n.localize('SR5.OpenSource'),
        };

        const icons = [pdfIcon, moveIcon, editIcon, removeIcon];

        if (item.isType('program', 'armor', 'device', 'equipment', 'cyberware', 'bioware', 'weapon'))
            icons.unshift(equipIcon);

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
            data: { action: 'edit' }
        };
        const removeIcon = {
            icon: 'fas fa-trash effect-control',
            title: game.i18n.localize('SR5.DeleteItem'),
            data: { action: 'delete' }
        };
        const disableIcon = {
            icon: `${effect.disabled ? 'far fa-circle' : 'fas fa-check-circle'} effect-control`,
            title: game.i18n.localize('SR5.ToggleActive'),
            data: { action: "toggle" }
        };
        const openOriginIcon = {
            icon: 'fas fa-file effect-control',
            title: game.i18n.localize('SR5.OpenOrigin'),
            data: { action: "open-origin" }
        }
        // Disallow changes to effects that aren't of direct origin.
        let icons = [disableIcon, editIcon, removeIcon];
        if (effect.isOriginOwned) icons = [openOriginIcon, ...icons];
        return icons;
    });

    /**
     * Helper specifically for active effect icons sourced from an actors items to display in list form.
     */
    Handlebars.registerHelper('ItemEffectIcons', function (effect) {
        const openOriginIcon = {
            icon: 'fas fa-file item-effect-control',
            title: game.i18n.localize('SR5.OpenOrigin'),
            data: { action: "open-origin" }
        }
        const disableIcon = {
            icon: `${effect.disabled ? 'far fa-circle' : 'fas fa-check-circle'} item-effect-control`,
            title: game.i18n.localize('SR5.ToggleActive'),
            data: { action: "toggle" }
        };
        const editIcon = {
            icon: 'fas fa-edit item-effect-control',
            title: game.i18n.localize('SR5.EditItem'),
            data: { action: 'edit' }
        };

        return [openOriginIcon, disableIcon, editIcon];
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

    Handlebars.registerHelper('EmptyIcons', () => {
        return [{}];
    })
};
