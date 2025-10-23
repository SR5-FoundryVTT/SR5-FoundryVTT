import { SituationModifier } from '../../rules/modifiers/SituationModifier';
import { SituationModifiersApplication } from '../../apps/SituationModifiersApplication';
import { Helpers } from '../../helpers';
import { SR5Item } from '../../item/SR5Item';
import { prepareSortedEffects, prepareSortedItemEffects } from '../../effects';
import { SR5 } from '../../config';
import { SR5Actor } from '../SR5Actor';
import { MoveInventoryDialog } from '../../apps/dialogs/MoveInventoryDialog';
import { ChummerImportForm } from '../../apps/chummer-import-form';
import { LinksHelpers } from '../../utils/links';
import { SR5ActiveEffect } from '../../effect/SR5ActiveEffect';
import { InventoryType } from 'src/module/types/actor/Common';
import { SkillFieldType, SkillsType } from 'src/module/types/template/Skills';

import SR5ApplicationMixin from '@/module/handlebars/SR5ApplicationMixin';
import { SheetFlow } from '@/module/flows/SheetFlow';
import { PackActionFlow } from '@/module/item/flows/PackActionFlow';
import { SkillEditSheet } from '@/module/apps/skills/SkillEditSheet';
import { KnowledgeSkillEditSheet } from '@/module/apps/skills/KnowledgeSkillEditSheet';
import { LanguageSkillEditSheet } from '@/module/apps/skills/LanguageSkillEditSheet';
import { InventoryRenameApp } from '@/module/apps/actor/InventoryRenameApp';
import SR5SheetFilters = Shadowrun.SR5SheetFilters;
import SR5ActorSheetData = Shadowrun.SR5ActorSheetData;
import MatrixAttribute = Shadowrun.MatrixAttribute;

const { ActorSheetV2 } = foundry.applications.sheets;
const { TextEditor } = foundry.applications.ux;

/**
 * Designed to work with Item.toObject() but it's not fully implementing all ItemData fields.
 */
export interface SheetItemData<SubType extends Item.ConfiguredSubType = Item.ConfiguredSubType> {
    type: string,
    name: string,
    system: SR5Item<SubType>['system'],
    properties: string[],
    description: DescriptionType
}

export interface InventorySheetDataByType {
    type: string;
    label: string;
    isOpen: boolean;
    items: SR5Item[];
}

// Meant for sheet display only. Doesn't use the SR5Item.getChatData approach to avoid changing system data.
type sheetAction = {
    name: string,
    description: string,
    action: SR5Item
}

export interface InventorySheetData {
    name: string,
    label: string,
    types: Record<string, InventorySheetDataByType>
}

export type InventoriesSheetData = Record<string, InventorySheetData>;

/**
 * Sort a list of items by name in ascending alphabetical order.
 *
 * @param a Any type of item data
 * @param b Any type of item data
 * @returns
 */
const sortByName = (a: { name: string }, b: { name: string }) => {
    return a.name.localeCompare(b.name, game.i18n.lang);
};

/**
 * Sort a list of items by equipped and name in ascending alphabetical order.
 *
 * @param a Any type of item data
 * @param b Any type of item data
 * @returns
 */
const sortByEquipped = (a: SheetItemData, b: SheetItemData) => {
    const leftEquipped = a.system?.technology?.equipped;
    const rightEquipped = b.system?.technology?.equipped;

    if (leftEquipped && !rightEquipped) return -1;
    if (rightEquipped && !leftEquipped) return 1;
    return sortByName(a, b);
};

/**
 * Sort a list of items by quality type and name in ascending alphabetical order.
 *
 * @param a A quality item data
 * @param b A quality item data
 * @returns
 */
const sortByQuality = (a: SheetItemData<'quality'>, b: SheetItemData<'quality'>) => {
    if (a.system.type === 'positive' && b.system.type === 'negative') return -1;
    if (a.system.type === 'negative' && b.system.type === 'positive') return 1;
    return sortByName(a, b);
}

export interface SR5BaseSheetDelays {
    skills: ReturnType<typeof setTimeout> | null;
}

/**
 * This class should not be used directly but be extended for each actor type.
 *
 */
export class SR5BaseActorSheet<T extends SR5ActorSheetData = SR5ActorSheetData> extends SR5ApplicationMixin(ActorSheetV2)<T> {
    declare isEditMode: boolean;

    // If something needs filtering, store those filters here.
    _filters: SR5SheetFilters = {
        skills: '', // filter based on user input and skill name/label.
        showUntrainedSkills: true, // filter based on pool size.
    };
    // Indicate if specific sections on sheet should be opened or closed.
    _inventoryOpenClose: Record<string, boolean> = {};

    // Store the currently selected inventory.
    selectedInventory: string;

    private readonly expandedSkills = new Set<string>();

    // flag set while preparing effects to know if we have any effects
    private hasEffects = false;

    constructor(options) {
        super(options);

        // Preselect default inventory.
        this.selectedInventory = this.actor.defaultInventory.name;
        this._setInventoryVisibility(true);
    }

    /**
     * All actors will handle these item types specifically.
     *
     * All others will be collected somewhere.
     *
     * @return A string of item types from the template.json Item section.
     */
    getHandledItemTypes(): string[] {
        return ['action'];
    }

    /**
     * All actors will always show these in their 'inventory'.
     * The inventory might be named differently for each actor.
     *
     * All other item types will only be shown when they've been added to that actor.
     * This allows all players/GMs to add item types to each actor that the system may not find useful
     * but the players/GMs might.
     *
     * @return An array of item types from the template.json Item section.
     */
    getInventoryItemTypes(): string[] {
        return [];
    }

    /**
     * These item types aren't allowed to be created on this actor sheet.
     *
     * This includes dropping them onto this actor.
     */
    getForbiddenItemTypes(): string[] {
        return [];
    }

    /**
     * Extend and override the default options used by the 5e Actor Sheet
     * @returns {Object}
     */
    static override DEFAULT_OPTIONS: any = {
        classes: ['actor', 'named-sheet'],
        position: {
            width: 700,
            height: 600,
        },
        actions: {
            rollAttribute: SR5BaseActorSheet.#rollAttribute,
            rollItem: SR5BaseActorSheet.#rollItem,
            rollSkill: SR5BaseActorSheet.#rollSkill,
            editSkill: SR5BaseActorSheet.#editSkill,
            rollSkillSpec: SR5BaseActorSheet.#rollSkillSpec,
            openSkillDescription: SR5BaseActorSheet.#toggleSkillDescription,
            filterTrainedSkills: SR5BaseActorSheet.#filterUntrainedSkills,
            addKnowledgeSkill: SR5BaseActorSheet.#createKnowledgeSkill,
            addLanguageSkill: SR5BaseActorSheet.#createLanguageSkill,
            addActiveSkill: SR5BaseActorSheet.#createActiveSkill,
            removeKnowledgeSkill: SR5BaseActorSheet.#deleteKnowledgeSkill,
            removeLanguageSkill: SR5BaseActorSheet.#deleteLanguageSkill,
            removeActiveSkill: SR5BaseActorSheet.#deleteActiveSkill,

            resetActorRunData: SR5BaseActorSheet.#resetActorRunData,
            showImportCharacter: SR5BaseActorSheet.#showImportCharacter,

            addEffect: SR5BaseActorSheet.#createEffect,
            editEffect: SR5BaseActorSheet.#editEffect,
            deleteEffect: SR5BaseActorSheet.#deleteEffect,
            toggleEffect: SR5BaseActorSheet.#toggleEffect,

            addItem: SR5BaseActorSheet.#createItem,
            editItem: SR5BaseActorSheet.#editItem,
            deleteItem: SR5BaseActorSheet.#deleteItem,
            favoriteItem: SR5BaseActorSheet.#favoriteItem,

            renameInventory: SR5BaseActorSheet.#renameInventory,
            removeInventory: SR5BaseActorSheet.#removeInventory,
            createInventory: SR5BaseActorSheet.#createInventory,

            addItemQty: SR5BaseActorSheet.#addItemQty,
            removeItemQty: SR5BaseActorSheet.#removeItemQty,
            equipItem: SR5BaseActorSheet.#onToggleEquippedItem,
            toggleItemWireless: SR5BaseActorSheet.#toggleWirelessState,
            toggleExpanded: SR5BaseActorSheet.#toggleInventoryVisibility,
            toggleItemVisible: SR5BaseActorSheet.#toggleItemVisible,

            weaponFullReload: SR5BaseActorSheet.#reloadAmmo,
            weaponPartialReload: SR5BaseActorSheet.#partialReloadAmmo,

            toggleInitiativeBlitz: SR5BaseActorSheet.#toggleInitiativeBlitz,
            rollInitiative: SR5BaseActorSheet.#rollInitiative,

            modifyConditionMonitor: SR5BaseActorSheet.#modifyConditionMonitor,
            clearConditionMonitor: SR5BaseActorSheet.#clearConditionMonitor,
            rollConditionMonitor: SR5BaseActorSheet.#rollConditionMonitor,
        },
        filters: [{ inputSelector: '#filter-active-skills', callback: SR5BaseActorSheet.#handleFilterActiveSkills }],
    }

    static override TABS = {
        primary: {
            initial: 'actions',
            tabs: [
                { id: 'actions', label: 'Actions', cssClass: '' },
                { id: 'effects', label: 'Effects', cssClass: '' },
                { id: 'description', label: '', icon: 'far fa-info', tooltip: 'SR5.Tooltips.Sheet.Description', cssClass: 'skinny' },
                { id: 'misc', label: '', icon: 'fas fa-gear', tooltip: 'SR5.Tooltips.Sheet.MiscConfig', cssClass: 'skinny' },
            ]
        },
    }

    static override PARTS = {
        header: {
            template: SheetFlow.templateBase('actor/header'),
            templates: SheetFlow.templateActorSystemParts('movement', 'initiative'),
        },
        rollBar: {
            template: SheetFlow.templateBase('actor/parts/common-rolls'),
            templates: SheetFlow.templateActorSystemParts('movement'),
        },
        tabs: {
            template: SheetFlow.templateBase('common/primary-tab-group'),
        },
        actions: {
            template: SheetFlow.templateBase('actor/tabs/actions'),
            templates: SheetFlow.templateListItem('action'),
            scrollable: ['.scrollable']
        },
        effects: {
            template: SheetFlow.templateBase('actor/tabs/effects'),
            templates: SheetFlow.templateListItem('effect'),
            scrollable: ['.scrollable']
        },
        misc: {
            template: SheetFlow.templateBase('actor/tabs/misc'),
            scrollable: ['scrollable']
        },
        description: {
            template: SheetFlow.templateBase('actor/tabs/description'),
            scrollable: ['.scrollable']
        },
        footer: {
            template: SheetFlow.templateBase('actor/footer'),
        },
    }

    /** SheetData used by _all_ actor types! */
    override async _prepareContext(options) {
        // Remap Foundry default v8/v10 mappings to better match systems legacy foundry versions mapping accross it's templates.
        // NOTE: If this is changed, you'll have to match changes on all actor sheets.
        const data = await super._prepareContext(options) as any;
        data.actor = this.actor;

        // Sheet related general purpose fields. These aren't persistent.
        data.filters = this._filters;

        this._prepareActorModifiers(data);

        // Valid data fields for all actor types.
        this._prepareActorTypeFields(data);
        this._prepareSpecialFields(data);
        this._prepareSkillsWithFilters(data);

        data.itemType = await this._prepareItemTypes(data);
        data.effects = prepareSortedEffects(this.actor.effects.contents);
        data.itemEffects = prepareSortedItemEffects(this.actor, { applyTo: this.itemEffectApplyTos });

        this.hasEffects = (data.effects.length > 0 || data.itemEffects.length > 0);

        data.inventories = await this._prepareItemsInventory();
        data.inventory = this._prepareSelectedInventory(data.inventories);
        data.spells = this._prepareSortedCategorizedSpells(data.itemType["spell"]);
        data.hasInventory = this._prepareHasInventory(data.inventories);
        data.selectedInventory = this.selectedInventory;
        data.program_count = this._prepareProgramCount(data.itemType);

        data.situationModifiers = this._prepareSituationModifiers();

        data.contentVisibility = this._prepareContentVisibility(data);

        data.bindings = this._prepareKeybindings();

        data.initiativePerception = this._prepareInitiativePresence();

        data.primaryTabs = this._prepareTabs('primary');

        data.expandedSkills = {};
        for (const id of this.expandedSkills) {
            const skill = this.actor.getSkill(id);
            if (skill) {
                const html = await TextEditor.enrichHTML(skill.description, { secrets: this.actor.isOwner, });
                data.expandedSkills[id] = { html, }
            }
        }

        return data;
    }

    override async _preparePartContext(partId, context, options) {
        const partContext = await super._preparePartContext(partId, context, options) as any;
        if (partId === 'actions') {
            partContext.actions = await this._prepareActions();
        }
        if (partId === 'rollBar') {
            partContext.favorites = await this._prepareFavorites();
        }
        if (partId === 'description') {
            if ('description' in this.actor.system) {
                partContext.biographyHTML = await TextEditor.enrichHTML(this.actor.system.description.value, {
                    relativeTo: this.actor,
                    secrets: this.actor.isOwner,
                });
            }
        }

        return partContext;
    }
    async _prepareFavorites() {
        const favorites: SR5Item[] = [];
        for (const uuid of this.actor.system.favorites) {
            let doc = SheetFlow.fromUuidSync(uuid as string);
            if (!doc) doc = await fromUuid(uuid as string);
            if (doc && doc instanceof SR5Item) favorites.push(doc);
        }
        return favorites;
    }

    protected override _prepareTabs(group: string) {
        const parts = super._prepareTabs(group);
        if (group === 'primary' && !game.user?.isGM && this.actor.limited) {
            const description = parts.description;
            description.active = true;
            return { description };
        }
        if (group === 'primary') {
            this._cleanParts(this.actor, parts);
        }
        return parts;
    }

    protected override _configureRenderParts(options) {
        const retVal = super._configureRenderParts(options);
        if (!game.user?.isGM && this.actor.limited) {
            return {
                header: retVal.header,
                tabs: retVal.tabs,
                description: retVal.description,
                footer: retVal.footer,
            }
        }
        this._cleanParts(this.actor, retVal);
        return retVal;
    }

    protected _cleanParts(actor: SR5Actor, parts: Record<string, any>) {
        // if we should hide empty tabs
        if (!this.isEditMode && !actor.system.category_visibility.default) {
            // look for actor items that go in the inventory tab and delete the tab/part if none exist
            if (actor.items.filter(i => i.isType('modification', 'weapon', 'equipment', 'armor', 'bioware', 'cyberware', 'device')).length === 0) {
                delete parts['inventory'];
            }
            if (actor.isType('character') && actor.getMatrixDevice() === undefined) {
                delete parts['matrix'];
                delete parts['matrixActions'];
                delete parts['networkIcons'];
                delete parts['markedIcons'];
                delete parts['ownedIcons'];
                delete parts['programs'];
            }
            if (actor.items.filter(i => i.isType('sin', 'contact', 'lifestyle')).length === 0) {
                delete parts['social']
            }
            if (actor.items.filter(i => i.isType('quality', 'metamagic', 'echo')).length === 0) {
                delete parts['bio'];
            }
            if (!this.hasEffects) {
                delete parts['effects'];
            }
        }
        return parts;
    }

    override async _onRender(context, options) {
        this.activateListeners_LEGACY($(this.element));
        this.prepareModifierTooltips();
        this.#filterActiveSkillsElements();
        return super._onRender(context, options);
    }

    /** Listeners used by _all_ actor types! */
    activateListeners_LEGACY(html) {
        Helpers.setupCustomCheckbox(this, html)

        // General item header/list actions...
        html.find('.item-qty').on('change', this._onListItemChangeQuantity.bind(this));

        // Actor inventory handling....
        html.find('#select-inventory').on('change', this._onSelectInventory.bind(this));

        // Misc. actor actions...
        html.find('.show-hidden-skills').on('click', this._onShowHiddenSkills.bind(this));

        html.find('.matrix-att-selector').on('change', this._onMatrixAttributeSelected.bind(this));

        // Situation modifiers application
        html.find('.show-situation-modifiers-application').on('click', this._onShowSituationModifiersApplication.bind(this));

        html.find('select[name="initiative-select"]').on('change', this._onInitiativePerceptionChange.bind(this));
    }

    /**
     * Prepare Tooltips For Skills, Attributes, and Limits
     * - these tooltips display all the modifiers for the ModifiedValue
     */
    prepareModifierTooltips() {
        this.element?.querySelectorAll('[data-attribute-modifier-tooltip]').forEach((el) => {
            el.addEventListener('mouseenter', async (e: any) => {
                const attributeId = e.target.closest('[data-attribute-modifier-tooltip]').dataset.attributeModifierTooltip;
                const attribute = this.actor.getAttribute(attributeId);
                if (attribute) {
                    const html = await foundry.applications.handlebars.renderTemplate(
                        SheetFlow.templateBase('common/modifiers-tooltip'),
                        {
                            value: attribute,
                            isEssence: attributeId === 'essence'
                        });
                    game.tooltip.activate(e.target, { html, cssClass: 'sr5v2' });
                }
            })
            el.addEventListener('mouseleave', () => { game.tooltip.deactivate(); });
        })
        this.element?.querySelectorAll('[data-limit-modifier-tooltip]').forEach((el) => {
            el.addEventListener('mouseenter', async (e: any) => {
                const limitId = e.target.closest('[data-limit-modifier-tooltip]').dataset.limitModifierTooltip;
                const limit = this.actor.getLimit(limitId);
                if (limit) {
                    const html = await foundry.applications.handlebars.renderTemplate(
                        SheetFlow.templateBase('common/modifiers-tooltip'),
                        {
                            value: limit,
                        });
                    game.tooltip.activate(e.target, { html, cssClass: 'sr5v2' });
                }
            })
            el.addEventListener('mouseleave', () => { game.tooltip.deactivate(); });
        })
        this.element?.querySelectorAll('[data-skill-modifier-tooltip]').forEach((el) => {
            el.addEventListener('mouseenter', async (e: any) => {
                const skillId = e.target.closest('[data-skill-modifier-tooltip]').dataset.skillModifierTooltip;
                const skill = this.actor.getSkill(skillId);
                if (skill) {
                    const html = await foundry.applications.handlebars.renderTemplate(
                        SheetFlow.templateBase('common/modifiers-tooltip'),
                        {
                            value: skill,
                        });
                    game.tooltip.activate(e.target, { html, cssClass: 'sr5v2' });
                }
            })
            el.addEventListener('mouseleave', () => { game.tooltip.deactivate(); });
        })
    }

    protected override _getHeaderControls() {
        const controls = super._getHeaderControls();
        controls.unshift({
            action: 'showImportCharacter',
            icon: 'fas fa-cloud-arrow-up',
            label: 'SR5.ImportCharacter',
            ownership: 3, // OWNER
        })
        controls.unshift({
            action: 'resetActorRunData',
            icon: 'fas fa-arrow-rotate-right',
            label: 'SR5.Labels.ActorSheet.ResetActorForNewRun',
            ownership: 3, // OWNER
        })

        return controls;
    }

    static async #favoriteItem(this: SR5BaseActorSheet, event) {
        const uuid = SheetFlow.closestUuid(event.target);
        const newFavorites = this.actor.system.favorites.slice();

        if (newFavorites.includes(uuid)) {
            newFavorites.splice(newFavorites.indexOf(uuid), 1);
        } else {
            newFavorites.push(uuid);
        }
        await this.actor.update({system: { favorites: newFavorites }});
    }

    /**
     * Get the options for Initiative Perception
     */
    _prepareInitiativePresence() {
        const options: { label: string, value: string }[] = [];
        let value = '';
        if (this.actor.isType('spirit', 'character')) {
            const initiative = this.actor.system.initiative;
            value = initiative.perception === 'matrix'
                ? this.actor.isUsingHotSim
                    ? 'hot_sim' : 'cold_sim'
                : initiative.perception;
            if (initiative.meatspace) {
                options.push({
                    label: 'SR5.InitCatMeatspace',
                    value: 'meatspace'
                })
            }
            if (this.actor.system.special === 'magic') {
                options.push({
                    label: 'SR5.InitCatAstral',
                    value: 'astral'
                })
            }
            if (initiative['matrix']) {
                options.push({
                    label: 'SR5.Labels.ActorSheet.ColdSim',
                    value: 'cold_sim',
                });
                options.push({
                    label: 'SR5.HotSim',
                    value: 'hot_sim'
                });
            }
        }

        return { options, value }
    }

    /**
     * Handle Changing Initiative Perception
     * - the select handles hot sim vs cold sim and doesn't match our dataset exactly
     * - this is more of a band-aid until we do appv2
     * @param event
     */
    async _onInitiativePerceptionChange(event) {
        const newValue = event.currentTarget?.value;
        if (newValue === 'meatspace' || newValue === 'astral') {
            // meatspace and magic can be directly applied as the perception type
            // disable VR as well
            await this.actor.update({ system: {
                    initiative: { perception: newValue, },
                    matrix: { vr: false, hot_sim: false }
                }});
        } else if (newValue === 'hot_sim' || newValue === 'cold_sim') {
            // if we are hot sim or cold sim, we are in VR and using matrix init perception
            await this.actor.update({
                system: {
                    initiative: {
                        perception: 'matrix',
                    },
                    matrix: { vr: true, hot_sim: newValue === 'hot_sim' }
                },
            });
        }
    }

    /**
     * Handle display of item types within the actors inventory section.
     *
     * Unexpected means there is no use for this type but the user added it anyway.
     * Inventory types means they should always be shown, even if there are none.
     * All other item types will be collected at some tab / place on the sheet.
     */
    _addInventoryItemTypes(inventory) {
        // Show all item types but remove empty unexpected item types.
        const inventoryTypes = this.getInventoryItemTypes();
        for (const type of Object.keys(inventory.types)) {
            if (inventoryTypes.includes(type)) continue;
            if (inventory.types[type].items.length === 0) delete inventory.types[type];
        }

        return inventory;
    }

    /**
     * Add any item type to the inventory display that's configured for this actor sheet type.
     *
     * @param inventory The inventory to check and add types to.
     */
    _addInventoryTypes(inventory: InventorySheetData) {
        for (const type of this.getInventoryItemTypes()) {
            if (inventory.types.hasOwnProperty(type)) continue;

            inventory.types[type] = {
                type,
                label: SR5.itemTypes[type],
                isOpen: this._inventoryOpenClose[type],
                items: []
            };
        }
    }

    async _onDropActiveEffect(event: DragEvent, effect: SR5ActiveEffect) {
        console.log('onDropActiveEffect', event, effect);
        if (effect.actor?.uuid === this.actor.uuid) return;
        // if the effect is just supposed to apply to the item's test, it won't work on an actor
        if (effect.system.applyTo === 'test_item') {
            ui.notifications?.warn(game.i18n.localize('SR5.ActiveEffect.CannotAddTestViaItemToActor'));
            return;
        }
        // @ts-expect-error hates inheritance I guess
        super._onDropActiveEffect(event, effect);
    }

    async _onDropActor(event: DragEvent, actor: SR5Actor) {
        //@ts-expect-error someday ill figure this out
        super._onDropActor(event, actor);
        const itemData = {
            name: actor.name ?? `${game.i18n.localize('SR5.New')} ${game.i18n.localize(SR5.itemTypes['contact'])}`,
            type: 'contact' as Item.SubType,
            system: {linkedActor: actor.uuid }
        };
        this.actor.createEmbeddedDocuments('Item', [itemData], { renderSheet: true });
    }

    static async #toggleInventoryVisibility(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const listHeader = $(event.target).closest('.list-item-header');
        const type = listHeader.data().itemType;

        const current = this._inventoryOpenClose[type] ?? true;

        this._setInventoryTypeVisibility(type, !current);
        this.render();
    }

    _setInventoryVisibility(this: SR5BaseActorSheet, isOpen: boolean) {
        Object.keys(CONFIG.Item.typeLabels).forEach(type => { this._setInventoryTypeVisibility(type, isOpen); });
    }

    _setInventoryTypeVisibility(this: SR5BaseActorSheet, type: string, isOpen: boolean) {
        this._inventoryOpenClose[type] = isOpen
    }

    static async #createEffect(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const effect = [{
            name: game.i18n.localize("SR5.ActiveEffect.New"),
            origin: this.actor.uuid,
        }];

        return this.actor.createEmbeddedDocuments('ActiveEffect', effect);
    }

    static async #editEffect(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const id = SheetFlow.closestEffectId(event.target);
        const item = this.actor.effects.get(id);
        if (item) {
            await item.sheet?.render(true);
        } else {
            // check for uuid
            const uuid = SheetFlow.closestUuid(event.target);
            const doc = SheetFlow.fromUuidSync(uuid);
            if (doc && doc instanceof SR5ActiveEffect) {
                await doc.sheet?.render(true);
            }
        }
    }

    static async #toggleEffect(this: SR5BaseActorSheet, event) {
        event.preventDefault();

        const id = SheetFlow.closestEffectId(event.target);
        const item = this.actor.effects.get(id);
        if (item) {
            const disabled = !item.disabled;
            await item.update({disabled});
        } else {
            const uuid = SheetFlow.closestUuid(event.target);
            const doc = SheetFlow.fromUuidSync(uuid);
            if (doc && doc instanceof SR5ActiveEffect) {
                const disabled = !doc.disabled;
                await doc.update({disabled});
            }
        }
    }

    static async #deleteEffect(this: SR5BaseActorSheet, event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const id = SheetFlow.closestEffectId(event.target);
        const item = this.actor.effects.get(id);
        if (!item) return;

        return this.actor.deleteEmbeddedDocuments('ActiveEffect', [id]);
    }

    /**
     * Create a new item based on the Item Header creation action and the item type of that header.
     * 
     * @param event 
     * @param data Optional additional data to be injected into the create item data.
     */
    static async #createItem(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const type = SheetFlow.closestAction(event.target).dataset.itemType;

        // Unhide section it it was
        this._setInventoryTypeVisibility(type, true);

        // TODO: Add translation for item names...
        const itemData = {
            type,
            name: `${game.i18n.localize('SR5.New')} ${Helpers.label(game.i18n.localize(SR5.itemTypes[type]))}`
        };
        const items = await this.actor.createEmbeddedDocuments('Item', [itemData], { renderSheet: true });
        if (!items) return;

        // Add the item to the selected inventory.
        if (this.selectedInventory !== this.actor.defaultInventory.name)
            await this.actor.inventory.addItems(this.selectedInventory, items as SR5Item[]);
    }

    static async #editItem(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const id = SheetFlow.closestItemId(event.target);
        const item = this.actor.items.get(id);
        if (item) await item.sheet?.render(true);
    }

    _handleDeleteItem(item: SR5Item) {
        // remove from the inventory tracking system
        return this.actor.inventory.removeItem(item).then(() => {
            return this.actor.deleteEmbeddedDocuments('Item', [item.id!]);
        })
    }

    static async #deleteItem(this: SR5BaseActorSheet, event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const id = SheetFlow.closestItemId(event.target);
        const item = this.actor.items.get(id);
        if (!item) return;
        this._handleDeleteItem(item);
    }

    static async #rollItem(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const iid = SheetFlow.closestUuid(event.target);
        const item = SheetFlow.fromUuidSync(iid);

        if (!item || !(item instanceof SR5Item)) return;
        await this._handleRollItem(item, event);
    }

    async _handleRollItem(item: SR5Item, event) {
        if (!Hooks.call('SR5_PreActorItemRoll', this.actor, item)) return;
        await item.castAction(event, this.actor);
    }

    /**
     * Set any kind of condition monitor to a specific cell value.
     *
     * @event Most return a currentTarget with a value dataset
     */
    static async #modifyConditionMonitor(this: SR5BaseActorSheet, event) {
        event.preventDefault();

        const target = event.target.closest('[data-action="modifyConditionMonitor"]');

        const track = target.dataset.id;
        const data: Actor.UpdateData = {};
        let value = Number(target.dataset.value);

        // if the clicked on cell is the current value for it's track, set the value to 0 to clear it
        if (track === 'stun' && this.actor.getStunTrack()?.value === value) {
            value = 0;
        } else if (track === 'physical' && this.actor.getPhysicalTrack()?.value === value) {
            value = 0;
        } else if (track === 'edge' && this.actor.getEdge().uses === value) {
            value = 0;
        } else if (track === 'matrix' && this.actor.getMatrixTrack()?.value === value) {
            value = 0;
        }

        if (track === 'stun' || track === 'physical') {
            const property = `system.track.${track}.value`;
            data[property] = value;
        } else if (track === 'edge') {
            const property = `system.attributes.edge.uses`;
            data[property] = value;
        } else if (track === 'overflow') {
            const property = 'system.track.physical.overflow.value';
            data[property] = value;
        } else if (track === 'matrix') {
            await this.actor.setMatrixDamage(value);
        }

        if (data) await this.actor.update(data);

        await this.document.applyDefeatedStatus();
    }

    /**
     * Reset all condition tracks to zero values.
     * @param event
     */
    static async #clearConditionMonitor(this: SR5BaseActorSheet, event) {
        event.preventDefault();

        const track = event.target.closest('[data-id]').dataset.id;
        const data = {};
        if (track === 'stun') {
            data[`system.track.stun.value`] = 0;
        }
        // Clearing the physical monitor should also clear the overflow.
        else if (track === 'physical') {
            data[`system.track.physical.value`] = 0;
            data['system.track.physical.overflow.value'] = 0;

        } else if (track === 'edge') {
            data[`system.attributes.edge.uses`] = 0;

        } else if (track === 'overflow') {
            data['system.track.physical.overflow.value'] = 0;

        } else if (track === 'matrix') {
            await this.actor.setMatrixDamage(0);
        }

        if (data) await this.actor.update(data);
        await this.actor.applyDefeatedStatus();
    }

    /**
     * Handle interaction with a damage track title.
     * @param event
     */
    static async #rollConditionMonitor(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const track = event.target.closest('[data-id]').dataset.id;

        switch (track) {
            case 'stun':
                await this.actor.rollGeneralAction('natural_recovery_stun', { event });
                break;
            case 'physical':
                await this.actor.rollGeneralAction('natural_recovery_physical', { event });
                break;
            case 'edge':
                await this.actor.rollAttribute('edge', { event });
                break;
            case 'matrix':
                if (this.actor.isType('character')) {
                    await this.actor.getMatrixDevice()?.repairItem();
                } else if (this.actor.isType('vehicle')) {

                }
        }
    }

    /**
     * Special fields are shared across all actor types.
     *
     * These are used as indicators about what kind of 'special' a character might be.
     *
     * @param sheetData ActorSheetData as created within getData method
     */
    _prepareSpecialFields(sheetData: SR5ActorSheetData) {
        sheetData.awakened = sheetData.system.special === 'magic';
        sheetData.emerged = sheetData.system.special === 'resonance';
    }

    /**
     * Pretty up display of zero value actor modifiers.
     *
     * @param sheetData ActorSheetData as created within getData method
     */
    _prepareActorModifiers(sheetData: SR5ActorSheetData) {
        // Empty zero value modifiers for display purposes.
        const { modifiers } = sheetData.system;

        const modifierList = Object.keys(modifiers);
        modifierList.sort();
        // shift global to the front of the list
        modifierList.splice(modifierList.indexOf("global"), 1);
        modifierList.unshift('global');

        const sorted = {};
        for (const modifier of modifierList) {
            sorted[modifier] = Number(modifiers[modifier]) || '';
        }

        sheetData.system.modifiers = sorted as any;
        sheetData.woundTolerance = 3 + ('wound_tolerance' in modifiers ? modifiers.wound_tolerance : 0);
    }

    _prepareMatrixAttributes(sheetData: SR5ActorSheetData) {
        const { matrix } = sheetData.system;
        if (matrix) {
            const cleanupAttribute = (attribute: MatrixAttribute) => {
                const att = matrix[attribute];
                if (att) {
                    if (!att.mod) att.mod = [];
                }
            };

            (['firewall', 'data_processing', 'sleaze', 'attack'] as MatrixAttribute[]).forEach(att => { cleanupAttribute(att); });
        }
    }

    /**
     * Prepare Actor Sheet Inventory display.
     *
     * Each item can  be in one custom inventory or the default inventory.
     */
    async _prepareItemsInventory() {
        // All custom and default actor inventories.
        const inventoriesSheet: InventoriesSheetData = {};
        // Simple item to inventory mapping.
        const itemIdInventory: Record<string, InventoryType> = {};

        // All inventories for showing all items, but not as default
        // Add first, for it to appear on top.
        inventoriesSheet[this.actor.allInventories.name] = {
            name: this.actor.allInventories.name,
            label: this.actor.allInventories.label,
            types: {}
        };
        this._addInventoryTypes(inventoriesSheet[this.actor.allInventories.name]);

        // Default inventory for items without a defined one.
        // Add first for display purposes on sheet.
        inventoriesSheet[this.actor.defaultInventory.name] = {
            name: this.actor.defaultInventory.name,
            label: this.actor.defaultInventory.label,
            types: {}
        };
        this._addInventoryTypes(inventoriesSheet[this.actor.defaultInventory.name]);

        Object.values(this.actor.system.inventories).forEach(inventory => {
            const { name, label, itemIds } = inventory;

            // Avoid re-adding default inventories.
            if (!inventoriesSheet.hasOwnProperty(name)) {
                inventoriesSheet[name] = {
                    name,
                    label,
                    types: {}
                }
            }

            // Add default inventory types for this sheet type first, so they appear on top.
            this._addInventoryTypes(inventoriesSheet[name]);

            // Inform user about duplicate inventory mapping for a single item.
            itemIds.forEach(id => {
                itemIdInventory[id] = inventory;
            });
        });

        const handledTypes = this.getHandledItemTypes();

        // Check all items and using the item to inventory mapping add them to that inventory.
        for (const item of this.actor.items) {
            if (!item.id) continue;

            // Handled types are on the sheet outside the inventory.
            if (handledTypes.includes(item.type)) continue;

            // Determine what inventory the item sits in.
            const inventory = itemIdInventory[item.id] || this.actor.defaultInventory;
            // Build inventory list this item should be shown an.
            const addTo: string[] = inventory.showAll ? Object.keys(inventoriesSheet) : [inventory.name];

            for (const name of addTo) {
                const inventorySheet = inventoriesSheet[name];

                // Should an item have been added to any inventory that wouldn't cary it's type normaly
                // add missing type so the user can interact with it.
                if (!inventorySheet.types[item.type]) {
                    inventorySheet.types[item.type] = {
                        type: item.type,
                        label: SR5.itemTypes[item.type],
                        isOpen: this._inventoryOpenClose[item.type],
                        items: []
                    };
                }

                inventorySheet.types[item.type].items.push(item);
            }
        }

        Object.values(inventoriesSheet).forEach(inventory => {
            this._addInventoryItemTypes(inventory);

            // Sort the items.
            Object.values(inventory.types).forEach((type) => {
                type.items.sort(sortByName);
            })
        });

        return inventoriesSheet;
    }

    /**
     * Choose the selected inventory to actually display.
     *
     * @param inventories
     */
    _prepareSelectedInventory(inventories: InventoriesSheetData) {
        return inventories[this.selectedInventory];
    }

    /**
     * Categorize and sort spells to display cleanly.
     * 
     * @param inventories 
     */
    _prepareSortedCategorizedSpells(spellSheets: SR5Item[]) {
        const sortedSpells : Record<string, SR5Item[]> = {};
        const spellTypes : string[] = ['combat', 'detection', 'health', 'illusion', 'manipulation', 'notfound'];

        // Add all spell types in system.
        spellTypes.forEach(type => {
            sortedSpells[type] = [];
        });

        spellSheets.forEach(spell => {
            // Check if the spell category is defined and if it's something we expect, if not we use the 'notfound' category
            const category = ((spell.system.category === undefined) || !spellTypes.includes(spell.system.category)) ? 'notfound' : spell.system.category;
            sortedSpells[category].push(spell);
        });

        spellTypes.forEach(type => {
            sortedSpells[type].sort((a, b) : number => {
                return a.name.localeCompare(b.name);
            });
        });

        return sortedSpells;
    }

    /**
     * Used by the sheet to choose whether to show or hide hideable fields
     */
    _prepareContentVisibility(data) {
        const contentVisibility : Record<string, boolean> = {}
        const defaultVisibility = data.system.category_visibility.default;

        // If prefix is empty uses the category as a prefix
        const setVisibility = (category: string, prefix?: string) => {
            contentVisibility[prefix || category + '_list'] = defaultVisibility || data.itemType[category].length > 0;
        }

        contentVisibility['default'] = defaultVisibility;
        setVisibility('adept_power');
        setVisibility('spell');
        setVisibility('ritual');
        setVisibility('summoning');

        return contentVisibility;
    }

    /**
     * Show if any items are in the inventory or if the actor is supposed to have an inventory.
     *
     * A sheet is supposed to show an inventory if there are item types defined or an item of some
     * type exists in any of its inventories.
     *
     * @param inventories
     */
    _prepareHasInventory(inventories: InventoriesSheetData) {
        if (this.getInventoryItemTypes().length > 0) return true;

        for (const inventory of Object.values(inventories)) {
            if (Object.keys(inventory.types).length > 0) return true;
        }

        return false;
    }

    /**
     * Prepare items for easy type by type display on actors sheets with lists per item type.
     *
     * NOTE: This method uses sheet item types, instead of item types. A sheet item type allows
     * to sub-group items of one type into separate lists as needed.
     *
     * @param data An object containing Actor Sheet data, as would be returned by ActorSheet.getData
     * @returns Sorted item lists per sheet item type.
     */
    async _prepareItemTypes(data): Promise<Record<string, SR5Item[]>> {
        const itemsByType: Record<string, SR5Item[]> = {};

        // Most sheet items are raw item types, some are sub types.
        // These are just for display purposes and has been done for call_in_action items.
        const sheetItemTypes = [
            ...Object.keys(CONFIG.Item.typeLabels),
            'summoning',
            'compilation'
        ];

        // Add all item types in system.
        sheetItemTypes.forEach(type => {
            itemsByType[type] = [];
        });

        // Add existing items to their sheet types as sheet items
        for (const item of this.actor.items) {
            itemsByType[item.type].push(item);

            if (item.isSummoning) itemsByType['summoning'].push(item);
            if (item.isCompilation) itemsByType['compilation'].push(item);
        }

        // Sort items for each sheet type.
        Object.entries(itemsByType).forEach(([type, items]) => {
            switch (type) {
                case 'quality':
                    (items as SheetItemData<'quality'>[]).sort(sortByQuality);
                    break;
                case 'program':
                    items.sort(sortByEquipped);
                    break;
                default:
                    items.sort(sortByName);
                    break;
            }
        });

        return itemsByType
    }

    /**
     * @param sheetData An object containing Actor Sheet data, as would be returned by ActorSheet.getData
     */
    _prepareActorTypeFields(sheetData: SR5ActorSheetData) {
        sheetData.isCharacter = this.actor.isType('character');
        sheetData.isSpirit = this.actor.isType('spirit');
        sheetData.isCritter = this.actor.isType('critter');
        sheetData.isVehicle = this.actor.isType('vehicle');
        sheetData.hasSkills = this.actor.hasSkills;
        sheetData.canAlterSpecial = this.actor.canAlterSpecial;
        sheetData.hasFullDefense = this.actor.hasFullDefense;
    }

    /**
     * Count the currently active and max programs for sheet display in this style:
     * 
     * Only personas using a device will show this count.
     * 
     * @param itemTypes 
     * @returns (<active>/<max>) or ''
     */
    _prepareProgramCount(itemTypes: Record<string, SR5Item[]>): string {
        if (!itemTypes.program) return '';
        if (!this.actor.hasDevicePersona()) return '';

        const active = itemTypes.program.filter(program => program.system.technology?.equipped).length;
        const activeDevice = this.actor.getMatrixDevice();
        const max = activeDevice?.system.programs ?? 0;

        return `(${active}/${max})`;
    }
    /**
     * Prepare skills with sorting and filtering given by this sheet.
     * 
     * @param sheetData What is to be displayed on sheet.
     */
    _prepareSkillsWithFilters(sheetData: SR5ActorSheetData) {
        this._filterActiveSkills(sheetData);
    }

    _filterSkills(data: SR5ActorSheetData, skills: SkillsType = {}) : SkillsType {
        const filteredSkills = {};
        for (const [key, skill] of Object.entries(skills)) {
            // Don't show hidden skills.
            if (skill.hidden) {
                continue;
            }
            // Filter visible skills.
            if (this._showSkill(key, skill, data)) {
                filteredSkills[key] = skill;
            }
        }

        return Helpers.sortSkills(filteredSkills);
    }

    _showSkill(key, skill, data) {
        if (this._showMagicSkills(key, skill, data)) {
            return true;
        }
        if (this._showResonanceSkills(key, skill, data)) {
            return true;
        }

        return this._showGeneralSkill(key, skill);
    }

    _showGeneralSkill(skillId, skill: SkillFieldType) {
        return !this._isSkillMagic(skillId, skill) && !this._isSkillResonance(skill);
    }

    _showMagicSkills(skillId, skill: SkillFieldType, sheetData: SR5ActorSheetData) {
        return this._isSkillMagic(skillId, skill) && sheetData.system.special === 'magic';
    }

    _showResonanceSkills(skillId, skill: SkillFieldType, sheetData: SR5ActorSheetData) {
        return this._isSkillResonance(skill) && sheetData.system.special === 'resonance';
    }

    /** Setup untrained skill filter within getData */
    static async #filterUntrainedSkills(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        this._filters.showUntrainedSkills = !this._filters.showUntrainedSkills;
        event.target.closest('.active-skills-header')
            .querySelector('.skill-rtg-label').innerText = new Handlebars.SafeString(game.i18n.localize(this._filters.showUntrainedSkills ? 'SR5.Rtg' : 'SR5.RtgAboveZero'));
        this.#filterActiveSkillsElements();
    }

    static async #handleFilterActiveSkills(this: SR5BaseActorSheet, event, query, rgx, html) {
        this._filters.skills = query;
        this.#filterActiveSkillsElements();
    }

    #filterActiveSkillsElements() {
        let count = 0;
        this.element.querySelector('#active-skills-scroll')
            ?.querySelectorAll<HTMLDivElement>('[data-skill-id]')
            .forEach((listItemElem) => {

                const container = listItemElem.parentElement;
                if (!container) return;
                const id = listItemElem.dataset.skillId;
                if (!id) return;
                const skill = this.actor.getSkill(id);
                if (!skill) return;
                if (this._isSkillFiltered(id, skill)) {
                    container.classList.remove('hidden')
                    count++;
                    if (count % 2) {
                        container.classList.add('nobg')
                        container.classList.remove('forcebg')
                    } else {
                        container.classList.add('forcebg')
                        container.classList.remove('nobg')
                    }
                } else {
                    container.classList.add('hidden');
                    container.classList.remove('nobg')
                    container.classList.remove('forcebg')
                }
            });
    }

    _isSkillFiltered(skillId, skill) {
        // a newly created skill shouldn't be filtered, no matter what.
        // Therefore disqualify empty skill labels/names from filtering and always show them.
        const isFilterable = this._getSkillLabelOrName(skill).length > 0;
        const isHiddenForText = !this._doesSkillContainText(skillId, skill, this._filters.skills);
        const isHiddenForUntrained = !this._filters.showUntrainedSkills && skill.value === 0;

        return !(isFilterable && (isHiddenForUntrained || isHiddenForText));
    }

    _getSkillLabelOrName(skill) {
        return Helpers.getSkillLabelOrName(skill);
    }

    _doesSkillContainText(key, skill, text) {
        if (!text) {
            return true;
        }

        // Search both english keys, localized labels and all specializations.
        const name = this._getSkillLabelOrName(skill);
        const searchKey = skill.name === undefined ? key : '';
        // some "specs" were a string from old code I think
        const specs = skill.specs !== undefined && Array.isArray(skill.specs) ? skill.specs.join(' ') : '';
        const searchString = `${searchKey} ${name} ${specs}`;

        return searchString.toLowerCase().search(text.toLowerCase()) > -1;
    }

    _filterActiveSkills(sheetData: SR5ActorSheetData) {
        // Handle active skills directly, as it doesn't use sub-categories.
        sheetData.system.skills.active = this._filterSkills(sheetData, sheetData.system.skills.active);
    }

    _isSkillMagic(id, skill) {
        return skill.attribute === 'magic' || id === 'astral_combat' || id === 'assensing';
    }

    _isSkillResonance(skill) {
        return skill.attribute === 'resonance';
    }

    private _closestSkillTarget(target) {
        return target.closest('[data-skill-id]');
    }

    async _editSkill(target) {
        const closest = this._closestSkillTarget(target);
        const skillId = closest?.dataset.skillId;
        const category = closest?.dataset.category;

        if (skillId) {
            if (!category || category === 'active') {
                const app = new SkillEditSheet({document: this.actor}, skillId)
                await app.render(true);
            } else if (category === 'knowledge') {
                const subcategory = closest?.dataset.subcategory;
                if (subcategory) {
                    const app = new KnowledgeSkillEditSheet({document: this.actor}, skillId, subcategory)
                    await app.render(true);
                }
            } else if (category === 'language') {
                const app = new LanguageSkillEditSheet({document: this.actor}, skillId)
                await app.render(true);
            }
        }
    }

    static async #editSkill(this: SR5BaseActorSheet, event) {
        await this._editSkill(event.target);
    }

    static async #rollSkill(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const closest = this._closestSkillTarget(event.target);
        const skillId = closest?.dataset.skillId;
        if (skillId) {
            await this.actor.rollSkill(skillId, { event });
        }
    }

    static async #rollSkillSpec(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        // NOTE: Knowledge skills still use a combined id in order for the legacy skill editing dialog to work.
        // const skillId = itemId.includes('.') ? itemId.split('.')[0] : itemId;
        const skillId = $(event.target).closest('a').data().skill;
        return this.actor.rollSkill(skillId, { event, specialization: true });
    }

    async _openSkillSource(target) {
        const skillId = this._closestSkillTarget(target).dataset.skillId;

        const skill = this.actor.getSkill(skillId);
        if (!skill) {
            console.error(`Shadowrun 5e | Editing skill failed due to missing skill ${skillId}`); return;
        }

        await LinksHelpers.openSource(skill.link);
    }

    static async #createLanguageSkill(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        await this.actor.addLanguageSkill({ name: '' });
    }

    static async #deleteLanguageSkill(this: SR5BaseActorSheet, event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const skillId = $(event.target).closest('a').data().skill;
        await this.actor.removeLanguageSkill(skillId);
    }

    static async #createKnowledgeSkill(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const category = $(event.target).closest('a').data().skillType;
        const skillId = await this.actor.addKnowledgeSkill(category);
        if (!skillId) return;
    }

    static async #deleteKnowledgeSkill(this: SR5BaseActorSheet, event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const skillId = $(event.target).closest('a').data().skill;
        const category = $(event.target).closest('a').data().category;
        await this.actor.removeKnowledgeSkill(skillId, category);
    }

    /** Add an active skill and show the matching edit application afterwards.
     *
     * @param event The HTML event from which the action resulted.
     */
    static async #createActiveSkill(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        await this.actor.addActiveSkill();
    }

    static async #deleteActiveSkill(this: SR5BaseActorSheet, event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const skillId = event.target.closest('[data-skill]').dataset.skill;
        await this.actor.removeActiveSkill(skillId);
    }

    static async #rollAttribute(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const attribute = event.target.closest('[data-attribute-id]').dataset.attributeId;
        if (attribute === 'rating') {
            await this.actor.rollDeviceRating();
        } else if (attribute) {
            await this.actor.rollAttribute(attribute, { event });
        }
    }

    async _onShowHiddenSkills(event) {
        event.preventDefault();

        await this.actor.showHiddenSkills();
    }

    /**
     * Change the quantity on an item shown within a sheet item list.
     *
     * @param event A DOM mouse/touch event
     */
    async _onListItemChangeQuantity(event) {
        const iid = Helpers.listItemId(event);
        const item = this.actor.items.get(iid);
        const quantity = parseInt(event.currentTarget.value);

        // Inform users about issues with templating or programming.
        if (!item?.system || !('technology' in item?.system) || item?.system.technology === undefined || !(item && quantity && item.system.technology)) {
            console.error(`Shadowrun 5e | Tried alterting technology quantity on an item without technology data: ${item?.id}`, item); return;
        }

        await item.update({ system: { technology: { quantity } } });
    }

    static async #toggleItemVisible(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const uuid = SheetFlow.closestUuid(event.target);
        if (uuid) {
            const hidden_items = this.actor.system.hidden_items.slice();

            const index = hidden_items.indexOf(uuid);

            if (index >= 0) {
                hidden_items.splice(index, 1);
            } else {
                hidden_items.push(uuid);
            }
            await this.actor.update({system: { hidden_items }});
        }
    }

    /**
     * Change the equipped status of an item shown within a sheet item list.
     */
    static async #onToggleEquippedItem(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const id = SheetFlow.closestItemId(event.target);
        const item = this.actor.items.get(id);
        if (!item) return;

        if (item.isType('critter_power') || item.isType('sprite_power')) {
            switch (item.system.optional) {
                case 'standard':
                    return;
                case 'enabled_option':
                    await item.update({ system: { optional: 'disabled_option', enabled: false } });
                    break;
                case 'disabled_option':
                    await item.update({ system: { optional: 'enabled_option', enabled: true } });
                    break;
            }
        } else if (item.canBeEquipped()) {
            // Handle the equipped state.
            if (item.isType('device')) {
                await this.document.equipOnlyOneItemOfType(item);
            } else {
                await item.update({ system: { technology: { equipped: !item.isEquipped() }}})
            }
            this.actor.render(false);
        }
    }

    /**
     * Toggle the Wireless state of an item, iterating through the different states
     * @param event
     */
    static async #toggleWirelessState(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        event.stopPropagation();

        const uuid = SheetFlow.closestUuid(event.target);
        const item = SheetFlow.fromUuidSync(uuid);
        if (!item || !(item instanceof SR5Item)) return;

        // iterate through the states of online -> silent -> offline
        const newState = event.shiftKey ? 'none'
                                        : item.isWireless()
                                            ? item.isRunningSilent()
                                                ? 'offline'
                                                : 'silent'
                                            : 'online';

        // update the embedded item with the new wireless state
        await item.update({ system: { technology: { wireless: newState } } });
    }

    /**
     * Change selected inventory for this sheet.
     *
     * @param event
     */
    async _onSelectInventory(event) {
        event.preventDefault();

        const inventory = String($(event.currentTarget).val());

        if (inventory)
            this.selectedInventory = inventory;

        this.render();
    }

    static async #reloadAmmo(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const id = SheetFlow.closestItemId(event.target);
        const item = this.actor.items.get(id);
        if (item) return item.reloadAmmo(false);
    }

    static async #partialReloadAmmo(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const id = SheetFlow.closestItemId(event.target);
        const item = this.actor.items.get(id);
        if (item) return item.reloadAmmo(true);
    }

    /**
     * Sync matrix attribute changes (order) made on the actor sheet into item data of the selected cyberdeck.
     *
     * This is done whenever a user changes matrix attribute order directly from the actor sheet matrix section.
     * Its intent is to also order matrix attribute order on the selected matrix device of that actor.
     *
     * @param event A mouse/pointer event
     */
    async _onMatrixAttributeSelected(event) {
        if (!("matrix" in this.actor.system)) return;

        const iid = this.actor.system.matrix!.device;
        const item = this.actor.items.get(iid);
        if (!item) {
            console.error('could not find item');
            return;
        }
        // grab matrix attribute (sleaze, attack, etc.)
        const attribute = event.currentTarget.dataset.att;
        // grab device attribute (att1, att2, ...)
        const changedSlot = event.currentTarget.value;

        return item.changeMatrixAttributeSlot(changedSlot, attribute);
    }

    /**
     * Open the Chummer Character import handling.
     * @param event
     */
    static async #showImportCharacter(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const options = {
            name: 'chummer-import',
            title: 'Chummer Import',
        };
        new ChummerImportForm(this.actor, options).render(true);
    }

    /**
     * Prepare applied Situation Modifiers for display (read-only) on any actor sheet.
     *
     * Some modifiers might be hidden, when the document doesn't fullfill criterea for it.
     *
     * @returns List of prepare sit. mod data
     */
    _prepareSituationModifiers(): { category: string, label: string, value: number, hidden: boolean }[] {
        const modifiers = this.actor.getSituationModifiers();
        modifiers.applyAll();
        if (!modifiers) return [];

        return Object.entries(modifiers._modifiers).map(
            ([category, modifier]: [string, SituationModifier]) => {
                const hidden = this._hideSituationModifier(category as Shadowrun.SituationModifierType);

                const label = SR5.modifierTypes[category];
                return { category, value: modifier.total, hidden, label };
            }
        );
    }

    /**
     * Determine if a situation modifier category should be hidden from an actor sheet.
     *
     * @param category Modifier category to maybe hide
     * @returns true, hide this category from the actors sheet.
     */
    _hideSituationModifier(category: Shadowrun.SituationModifierType): boolean {
        switch (category) {
            case 'background_count':
                return !this.actor.isAwakened();
            case 'environmental':
                return this.actor.isType('sprite');
            // Defense modifier is already shown in general modifier section.
            case 'defense':
                return true;
            case 'recoil':
                return !this.actor.hasPhysicalBody
            default:
                return false;
        }
    }

    /**
     * Show the situation modifiers application for this actor doucment
     *
     * @param event
     */
    _onShowSituationModifiersApplication(event) {
        new SituationModifiersApplication(this.actor).render(true);
    }

    /**
     * Toggle to isFreshImport property of importFlags for all items on the character sheet
     *
     * @param event
     */
    async _toggleAllFreshImportFlags(event, onOff: boolean) {
        const allItems = this.actor.items;
        console.debug('Toggling all importFlags on owned items to ->', onOff, event);
        for (const item of allItems) {
            if (item.system.importFlags) {
                await item.update({ system: { importFlags: { isFreshImport: onOff } } });
            }
        }
    }

    /**
     * Trigger a full reset of all run related actor data.
     *
     * @param event
     */
    static async #resetActorRunData(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;
        await this.actor.resetRunData()
    }

    /**
     * Prepare keybindings to be shown when hovering over a rolling icon 
     * in any list item view that has rolls.
     */
    _prepareKeybindings() {
        return {
            skip: game.keybindings.get('shadowrun5e', 'hide-test-dialog').map(binding => binding.key.replace('Key', '').toUpperCase()).join(', '),
            card: game.keybindings.get('shadowrun5e', 'show-item-card').map(binding => binding.key.replace('Key', '').toUpperCase()).join(', '),
        }
    }

    /**
     * These effect apply to types are meant to be shown on the item effects section of the effects sheet.
     * 
     * They are limited to those effects directly affecting this actor. Effects affecting other actors, aren't shown 
     * on the actors own sheet.
     */
    get itemEffectApplyTos() {
        return ['actor', 'item', 'test_all', 'test_item', 'modifier'];
    }

    override async _onFirstRender(context, options) {
        await super._onFirstRender(context, options);

        this._createContextMenu(this._getItemListContextOptions.bind(this), "[data-item-id]", {
            hookName: "getItemListContextOptions",
            jQuery: false,
            fixed: true,
        });
        this._createContextMenu(this._getEffectListContextOptions.bind(this), "[data-effect-id]", {
            hookName: "getEffectListContextOptions",
            jQuery: false,
            fixed: true,
        });
        this._createContextMenu(this._getSkillListContextOptions.bind(this), "[data-skill-id]", {
            hookName: "getSkillListContextOptions",
            jQuery: false,
            fixed: true,
        });
        this._createContextMenu(this._getAttributeContextOptions.bind(this), "[data-attribute-id]", {
            hookName: "getAttributeContextOptions",
            jQuery: false,
            fixed: true,
        });
    }
    _getSkillListContextOptions() {
        return [
            SheetFlow._getSourceContextOption(),
            {
                name: "SR5.ContextOptions.AddSkillEffect",
                icon: "<i class='fas fa-file-circle-plus'></i>",
                callback: async (target) => {
                    const skillTarget = this._closestSkillTarget(target);
                    const skillId = skillTarget.dataset.skillId;
                    const subCategory = skillTarget.dataset.subcategory;
                    let path = '';
                    switch (skillTarget.dataset.category) {
                        case 'knowledge':
                            path = `system.skills.knowledge.${subCategory}.${skillId}`;
                            break;
                        case 'language':
                            path = `system.skills.language.${skillId}`;
                            break;
                        case 'active':
                        default:
                            path = `system.skills.active.${skillId}`;
                            break;
                    }
                    if (!path) return;
                    const skill = this.actor.getSkill(skillId)!;
                    const effectData = {
                            name: `${game.i18n.localize(skill.label) ?? skill.name} ${game.i18n.localize('SR5.Effect')}`,
                            system: {
                                applyTo: 'actor' as const,
                            },
                            changes: [
                                {
                                    key: path,
                                    mode: 0 as any,
                                    priority: 0,
                                    value: '',
                                }
                            ]
                        }
                        await this.actor.createEmbeddedDocuments("ActiveEffect", [effectData], { renderSheet: true });
                }
            },
            {
                name: "SR5.ContextOptions.EditSkill",
                icon: "<i class='fas fa-pen-to-square'></i>",
                callback: async (target) => {
                    await this._editSkill(target);
                }
            },
            {
                name: "SR5.ContextOptions.DeleteSkill",
                icon: "<i class='fas fa-trash'></i>",
                callback: async (target) => {
                    const userConsented = await Helpers.confirmDeletion();
                    if (!userConsented) return;

                    const skillTarget = this._closestSkillTarget(target);
                    const skillId = skillTarget.dataset.skillId;
                    const subCategory = skillTarget.dataset.subcategory;
                    switch (skillTarget.dataset.category) {
                        case 'active':
                            await this.actor.removeActiveSkill(skillId);
                            break;
                        case 'knowledge':
                            await this.actor.removeKnowledgeSkill(skillId, subCategory);
                            break;
                        case 'language':
                            await this.actor.removeLanguageSkill(skillId);
                            break;
                    }
                }
            }
        ]
    }

    _getAttributeContextOptions() {
        return [
            SheetFlow._getSourceContextOption(),
            {
                name: "SR5.ContextOptions.AddAttributeEffect",
                icon: "<i class='fas fa-file-circle-plus'></i>",
                callback: async (target) => {
                    const attributeId = target.closest('[data-attribute-id]')?.dataset.attributeId;
                    if (!attributeId) return;
                    const attribute = this.actor.getAttribute(attributeId);
                    if (!attribute) return;
                    let path = '';
                    if (this.actor.matrixData()?.[attributeId]) {
                        path = `system.matrix.${attributeId}`;
                    } else if (this.actor.getVehicleStats()?.[attributeId]) {
                        path = `system.vehicle_stats.${attributeId}`;
                    } else if (this.actor.getAttributes()[attributeId]) {
                        path = `system.attributes.${attributeId}`;
                    }
                    const effectData = {
                        name: `${game.i18n.localize(attribute.label)} ${game.i18n.localize('SR5.Effect')}`,
                        changes: [
                            {
                                key: path,
                                mode: 0 as any,
                                priority: 0,
                                value: '',
                            }
                        ],
                        system: {
                            applyTo: 'actor' as const,
                        }
                    }
                    await this.actor.createEmbeddedDocuments("ActiveEffect", [effectData], { renderSheet: true });
                }
            },
        ]
    }

    _getItemListContextOptions() {
        return [
            SheetFlow._getSourceContextOption(),
            {
                // context menu to view items that aren't an embedded item of this actor
                name: "SR5.ContextOptions.ViewItem",
                icon: "<i class='fas fa-eye'></i>",
                condition: (target) => {
                    const id = SheetFlow.closestItemId(target);
                    const item = this.actor.items.get(id);
                    if (item) return false;
                    const uuid = SheetFlow.closestUuid(target);
                    const document = SheetFlow.fromUuidSync(uuid);
                    return document && document instanceof SR5Item;
                },
                callback: async (target) => {
                    const uuid = SheetFlow.closestUuid(target);
                    const document = SheetFlow.fromUuidSync(uuid);
                    if (document && document instanceof SR5Item) {
                        await document.sheet?.render(true)
                    }
                }
            },
            {
                name: "SR5.ContextOptions.EditItem",
                icon: "<i class='fas fa-pen-to-square'></i>",
                condition: (target) => {
                    const id = SheetFlow.closestItemId(target);
                    const item = this.actor.items.get(id);
                    return item !== undefined;
                },
                callback: async (target) => {
                    const id = SheetFlow.closestItemId(target);
                    const item = this.actor.items.get(id);
                    if (item) {
                        await item.sheet?.render(true)
                    }
                }
            },
            {
                name: "SR5.ContextOptions.MoveItem",
                icon: "<i class='fas fa-arrow-right-arrow-left'></i>",
                condition: (target) => {
                    const id = SheetFlow.closestItemId(target);
                    const item = this.actor.items.get(id);
                    if (!item) return false;
                    return item.isType('equipment', 'weapon', 'ammo', 'modification', 'armor', 'bioware', 'cyberware', 'device');
                },
                callback: async (target) => {
                    await this._moveItemToInventory(target);
                }
            },
            {
                name: "SR5.ContextOptions.DeleteItem",
                icon: "<i class='fas fa-trash'></i>",
                condition: (target) => {
                    const id = SheetFlow.closestItemId(target);
                    const item = this.actor.items.get(id);
                    return item !== undefined;
                },
                callback: async (target) => {
                    const userConsented = await Helpers.confirmDeletion();
                    if (!userConsented) return;

                    const id = SheetFlow.closestItemId(target);
                    const item = this.actor.items.get(id);
                    if (item) {
                        this._handleDeleteItem(item);
                    }
                }
            }
        ]
    }

    _getEffectListContextOptions() {
        return [
            SheetFlow._getSourceContextOption(),
            {
                name: "SR5.ContextOptions.EditEffect",
                icon: "<i class='fas fa-pen-to-square'></i>",
                condition: (target) => {
                    const id = SheetFlow.closestEffectId(target);
                    const item = this.actor.effects.get(id);
                    if (item) return true;
                    const uuid = SheetFlow.closestUuid(target);
                    const doc = SheetFlow.fromUuidSync(uuid);
                    return !!(doc && doc instanceof SR5ActiveEffect);
                },
                callback: async (target) => {
                    const id = SheetFlow.closestEffectId(target);
                    const item = this.actor.effects.get(id);
                    if (item) {
                        await item.sheet?.render(true)
                    } else {
                        const uuid = SheetFlow.closestUuid(target);
                        const doc = SheetFlow.fromUuidSync(uuid);
                        if (doc && doc instanceof SR5ActiveEffect) {
                            await doc.sheet?.render(true);
                        }
                    }
                }
            },
            {
                name: "SR5.ContextOptions.DeleteEffect",
                icon: "<i class='fas fa-trash'></i>",
                condition: (target) => {
                    const id = SheetFlow.closestEffectId(target);
                    const item = this.actor.effects.get(id);
                    return item !== undefined;
                    // don't check for effects by uuid for deletion
                },
                callback: async (target) => {
                    const userConsented = await Helpers.confirmDeletion();
                    if (!userConsented) return;

                    const id = SheetFlow.closestEffectId(target);
                    await this.actor.deleteEmbeddedDocuments('ActiveEffect', [id]);
                }
            }
        ]
    }

    async _prepareActions() {
        const actions = await PackActionFlow.getActorSheetActions(this.actor);

        // Prepare sorting and display of a possibly translated document name.
        const sheetActions: sheetAction[] = [];
        for (const action of actions) {
            sheetActions.push({
                name: PackActionFlow.localizePackAction(action.name),
                description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(action.system.description.value),
                action
            });
        }

        return sheetActions.sort(Helpers.sortByName.bind(Helpers));
    }

    static async #toggleInitiativeBlitz(this: SR5BaseActorSheet, event) { event.preventDefault();
        event.preventDefault();
        event.stopPropagation();

        const blitz = this.actor.system.initiative.edge;
        await this.actor.update({system: { initiative: { edge: !blitz }}});
    }

    static async #rollInitiative(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        event.stopPropagation();
        await this.actor.rollInitiative();
        // TODO figure out how to roll initiative, probably want to prompt the GM to allow it?
    }

    static async #renameInventory(this: SR5BaseActorSheet, event) {
        const inventory = SheetFlow.closestAction(event.target).dataset.inventory;
        if (this.actor.inventory.disallowRename(inventory)) {
            ui.notifications?.warn(game.i18n.localize('SR5.Warnings.CantEditDefaultInventory'));
            return;
        }
        const app = new InventoryRenameApp(this.actor, inventory, 'edit');
        await app.render(true);
    }
    /**
     * Create an inventory place on the actor for gear organization.
     */
    static async #createInventory(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const app = new InventoryRenameApp(this.actor, '', 'create');
        await app.render(true);
        this.render();
    }

    /**
     * Remove the currently selected inventory.
     * @param event
     */
    static async #removeInventory(this: SR5BaseActorSheet, event) {
        event.preventDefault();

        // TODO: Allow for options overwriting title/message and so forth.
        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;
        const inventory = SheetFlow.closestAction(event.target).dataset.inventory;

        if (this.actor.inventory.disallowRemove(inventory)) {
            ui.notifications?.warn(game.i18n.localize('SR5.Warnings.CantRemoveDefaultInventory'));
            return;
        }

        await this.actor.inventory.remove(this.selectedInventory);

        // Preselect default instead of none.
        this.selectedInventory = this.actor.defaultInventory.name;
        this.render();
    }

    async _moveItemToInventory(target) {

        const id = SheetFlow.closestItemId(target);
        const item = this.actor.items.get(id);
        if (!item) return;

        // Ask user about what inventory to move the item to.
        const dialog = new MoveInventoryDialog(this.actor, item, this.selectedInventory);
        const inventory = await dialog.select();
        if (dialog.canceled) return;

        await this.actor.inventory.addItems(inventory, item);
    }

    /**
     * Move an item between two inventories.
     * @param event
     */
    static async #moveItemToInventory(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        await this._moveItemToInventory(event.target);
    }

    /**
     * Show / hide the items description within a sheet item l ist.
     */
    static async #toggleSkillDescription(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const id = this._closestSkillTarget(event.target).dataset.skillId;
        if (!id) return;
        if (this.expandedSkills.has(id)) {
            this.expandedSkills.delete(id);
            event.target.closest('.list-item-container').classList.remove('expanded');
        } else {
            this.expandedSkills.add(id);
            event.target.closest('.list-item-container').classList.add('expanded');
            const skill = this.actor.getSkill(id);
            if (skill) {
                const html = await TextEditor.enrichHTML(skill.description, { secrets: this.actor.isOwner, });
                if (html) {
                    event.target.closest('.list-item-container')
                        .querySelector('.description-body')
                        .innerHTML = html;
                }
            }
        }
    }

    static async #addItemQty(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const id = SheetFlow.closestItemId(event.target);
        let item = this.actor.items.get(id);
        if (!item) {
            const uuid = SheetFlow.closestUuid(event.target);
            item = SheetFlow.fromUuidSync(uuid);
        }
        if (item && item instanceof SR5Item) {
            const qty = item.getTechnologyData()?.quantity ?? 0;
            const newQty = event.shiftKey ? qty + 5 : event.ctrlKey ? qty + 20 : qty + 1;
            await item.update({system: {technology: {quantity: newQty}}})
        }
    }

    static async #removeItemQty(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const id = SheetFlow.closestItemId(event.target);
        let item = this.actor.items.get(id);
        if (!item) {
            const uuid = SheetFlow.closestUuid(event.target);
            item = SheetFlow.fromUuidSync(uuid);
        }
        if (item && item instanceof SR5Item) {
            const qty = item.getTechnologyData()?.quantity ?? 0;
            const newQty = event.shiftKey ? qty - 5 : event.ctrlKey ? qty - 20 : qty - 1;
            await item.update({system: { technology: { quantity: newQty}}})
        }
    }

}
