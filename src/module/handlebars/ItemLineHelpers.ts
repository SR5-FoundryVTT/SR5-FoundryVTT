import SR5ItemType = Shadowrun.SR5ItemType;
import { SR5ItemDataWrapper } from '../item/SR5ItemDataWrapper';

export const registerItemLineHelpers = () => {
    Handlebars.registerHelper('ItemHeaderIcons', function (id) {
        const PlusIcon = 'fas fa-plus';
        const AddText = game.i18n.localize('SR5.Add');
        const addIcon = {
            icon: PlusIcon,
            text: AddText,
            title: game.i18n.localize('SR5.CreateItem'),
            cssClass: 'item-create',
        };
        switch (id) {
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
            case 'device':
                addIcon.title = game.i18n.localize('SR5.CreateItemDevice');
                return [addIcon];
            case 'equipment':
                addIcon.title = game.i18n.localize('SR5.CreateItemEquipment');
                return [addIcon];
            case 'cyberware':
                addIcon.title = game.i18n.localize('SR5.CreateItemCyberware');
                return [addIcon];
            case 'critter_power':
                addIcon.title = game.i18n.localize('SR5.CreateItemCritterPower');
                return [addIcon];
            default:
                return [];
        }
    });

    Handlebars.registerHelper('ItemHeaderRightSide', function (id) {
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
            case 'program':
                return [];
            default:
                return [];
        }
    });

    Handlebars.registerHelper('ItemRightSide', function (item: SR5ItemType) {
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
                return [
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.activeSkills[wrapper.getActionSkill() ?? '']),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.attributes[wrapper.getActionAttribute() ?? '']),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.attributes[wrapper.getActionAttribute2() ?? '']),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: wrapper.getLimitAttribute()
                                ? game.i18n.localize(CONFIG.SR5.attributes[wrapper.getLimitAttribute() ?? ''])
                                : wrapper.getActionLimit(),
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
            case 'device':
            case 'equipment':
            case 'cyberware':
                return [qtyInput];
            case 'weapon':
                if (wrapper.isRangedWeapon()) {
                    const count = wrapper.getAmmo()?.current.value ?? 0;
                    const max = wrapper.getAmmo()?.current.max ?? 0;
                    const text = count < max ? `${game.i18n.localize('SR5.WeaponReload')} (${count}/${max})` : game.i18n.localize('SR5.AmmoFull');
                    const cssClass = 'no-break' + (count < max ? ' reload-ammo roll' : ' faded');
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
                            text: game.i18n.localize(CONFIG.SR5.qualityTypes[item.data.type ?? '']),
                        },
                    },
                ];

            case 'adept_power':
                return [
                    {
                        text: {
                            text: game.i18n.localize(item.data.type ?? ''),
                        },
                    },
                ];
            case 'spell':
                return [
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.spellTypes[item.data.type ?? '']),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.spellRanges[item.data.range ?? '']),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.durations[item.data.duration ?? '']),
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
                            text: game.i18n.localize(CONFIG.SR5.critterPower.types[item.data.powerType ?? '']),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.critterPower.durations[item.data.duration ?? '']),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(CONFIG.SR5.critterPower.ranges[item.data.range ?? '']),
                        },
                    },
                ]

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
        const editIcon = {
            icon: 'fas fa-edit item-edit',
            title: game.i18n.localize('SR5.EditItem'),
        };
        const removeIcon = {
            icon: 'fas fa-trash item-delete',
            title: game.i18n.localize('SR5.DeleteItem'),
        };
        const equipIcon = {
            icon: `${item.data.technology?.equipped ? 'fas fa-check-circle' : 'far fa-circle'} item-equip-toggle`,
            title: game.i18n.localize('SR5.ToggleEquip'),
        };

        switch (item.type) {
            case 'program':
            case 'armor':
            case 'device':
            case 'equipment':
            case 'cyberware':
            case 'weapon':
                return [equipIcon, editIcon, removeIcon];
            default:
                return [editIcon, removeIcon];
        }
    });
};
