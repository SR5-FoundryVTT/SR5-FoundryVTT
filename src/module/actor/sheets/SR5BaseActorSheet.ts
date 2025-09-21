import { SituationModifier } from '../../rules/modifiers/SituationModifier';
import { SituationModifiersApplication } from '../../apps/SituationModifiersApplication';
import { Helpers } from "../../helpers";
import { SR5Item } from "../../item/SR5Item";
import { onManageActiveEffect, onManageItemActiveEffect, prepareSortedItemEffects, prepareSortedEffects } from "../../effects";
import { SR5 } from "../../config";
import { SR5Actor } from "../SR5Actor";
import { MoveInventoryDialog } from "../../apps/dialogs/MoveInventoryDialog";
import { ChummerImportForm } from '../../apps/chummer-import-form';
import SR5SheetFilters = Shadowrun.SR5SheetFilters;
import SR5ActorSheetData = Shadowrun.SR5ActorSheetData;
import MatrixAttribute = Shadowrun.MatrixAttribute;
import { LinksHelpers } from '../../utils/links';
import { SR5ActiveEffect } from '../../effect/SR5ActiveEffect';
import { parseDropData } from '../../utils/sheets';
import { InventoryType } from 'src/module/types/actor/Common';
import { KnowledgeSkillCategory, SkillFieldType, SkillsType } from 'src/module/types/template/Skills';

import SR5ApplicationMixin from '@/module/handlebars/SR5ApplicationMixin';
import { SheetFlow } from '@/module/flows/SheetFlow';

const { ActorSheetV2 } = foundry.applications.sheets;

/**
 * Designed to work with Item.toObject() but it's not fully implementing all ItemData fields.
 */

export interface InventorySheetDataByType {
    type: string;
    label: string;
    isOpen: boolean;
    items: SR5Item[];
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
const sortByName = (a, b) => {
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;
};

/**
 * Sort a list of items by equipped and name in ascending alphabetical order.
 *
 * @param a Any type of item data
 * @param b Any type of item data
 * @returns
 */
const sortByEquipped = (a, b) => {
    const leftEquipped = a.system?.technology?.equipped;
    const rightEquipped = b.system?.technology?.equipped;

    if (leftEquipped && !rightEquipped) return -1;
    if (rightEquipped && !leftEquipped) return 1;
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;
};

/**
 * Sort a list of items by quality type and name in ascending alphabetical order.
 *
 * @param a A quality item data
 * @param b A quality item data
 * @returns
 */
const sortyByQuality = (a: any, b: any) => {
    if (a.system.type === 'positive' && b.system.type === 'negative') return -1;
    if (a.system.type === 'negative' && b.system.type === 'positive') return 1;
    return a.name < b.name ? -1 : 1;
}

export interface SR5BaseSheetDelays {
    skills: ReturnType<typeof setTimeout> | null;
}

/**
 * This class should not be used directly but be extended for each actor type.
 *
 */
export class SR5BaseActorSheet<T extends SR5ActorSheetData = SR5ActorSheetData> extends SR5ApplicationMixin(ActorSheetV2)<T> {
    // If something needs filtering, store those filters here.
    _filters: SR5SheetFilters = {
        skills: '', // filter based on user input and skill name/label.
        showUntrainedSkills: true, // filter based on pool size.
    };
    // Used together with _filters to delay textinput
    _delays: SR5BaseSheetDelays = {
        skills: null
    }
    // Indicate if specific sections on sheet should be opened or closed.
    _inventoryOpenClose: Record<string, boolean> = {};

    // Store the currently selected inventory.
    selectedInventory: string;

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
        classes: ['actor'],
        position: {
            width: 700,
            height: 600,
        },
        actions: {
            commonRoll: SR5BaseActorSheet.#rollById,

            openSkillSource: SR5BaseActorSheet.#openSkillSource,
            rollAttribute: SR5BaseActorSheet.#rollAttribute,
            rollItem: SR5BaseActorSheet.#rollItem,
            rollSkill: SR5BaseActorSheet.#rollSkill,
            rollSkillSpec: SR5BaseActorSheet.#rollSkillSpec,
            filterTrainedSkills: SR5BaseActorSheet.#filterUntrainedSkills,
            addKnowledgeSkill: SR5BaseActorSheet.#createKnowledgeSkill,
            addLanguageSkill: SR5BaseActorSheet.#createLanguageSkill,
            addActiveSkill: SR5BaseActorSheet.#createActiveSkill,
            removeKnowledgeSkill: SR5BaseActorSheet.#deleteKnowledgeSkill,
            removeLanguageSkill: SR5BaseActorSheet.#deleteLanguageSkill,
            removeActiveSkill: SR5BaseActorSheet.#deleteActiveSkill,

            addItem: SR5BaseActorSheet.#createItem,
            editItem: SR5BaseActorSheet.#editItem,
            deleteItem: SR5BaseActorSheet.#deleteItem,

            openItemSource: SR5BaseActorSheet.#openSource,

            equipItem: SR5BaseActorSheet.#onToggleEquippedItem,
            toggleItemWireless: SR5BaseActorSheet.#toggleWirelessState,
            toggleExpanded: SR5BaseActorSheet.#toggleInventoryVisibility,

            weaponFullReload: SR5BaseActorSheet.#reloadAmmo,
            weaponPartialReload: SR5BaseActorSheet.#partialReloadAmmo,
        }
    }

    static override TABS = {
        primary: {
            initial: 'actions',
            tabs: [
                { id: 'actions', label: 'Actions', cssClass: '' },
                { id: 'effects', label: 'Effects', cssClass: '' },
                { id: 'misc', label: 'Misc', cssClass: '' },
            ]
        },
    }

    static override PARTS = {
        header: {
            template: SheetFlow.templateBase('actor/header'),
            templates: SheetFlow.actorSystemParts('movement', 'initiative'),
            scrollable: ['scrollable']
        },
        tabs: {
            template: SheetFlow.templateBase('common/primary-tab-group'),
            scrollable: ['scrollable']
        },
        actions: {
            template: SheetFlow.templateBase('actor/tabs/actions'),
            templates: SheetFlow.listItem('action'),
            scrollable: ['scrollable']
        },
        effects: {
            template: SheetFlow.templateBase('actor/tabs/effects'),
            templates: SheetFlow.listItem('effect'),
            scrollable: ['scrollable']
        },
        misc: {
            template: SheetFlow.templateBase('actor/tabs/misc'),
            scrollable: ['scrollable']
        },
        footer: {
            template: SheetFlow.templateBase('actor/footer'),
            scrollable: ['scrollable']
        },
    }

    /** SheetData used by _all_ actor types! */
    override async _prepareContext(options) {
        // Remap Foundry default v8/v10 mappings to better match systems legacy foundry versions mapping accross it's templates.
        // NOTE: If this is changed, you'll have to match changes on all actor sheets.
        const data = await super._prepareContext(options) as any;
        data.actor = this.actor;

        // Sheet related general purpose fields. These aren't persistent.
        data.config = SR5;
        data.filters = this._filters;

        this._prepareActorAttributes(data);
        this._prepareActorModifiers(data);

        // Valid data fields for all actor types.
        this._prepareActorTypeFields(data);
        this._prepareSpecialFields(data);
        this._prepareSkillsWithFilters(data);

        data.itemType = await this._prepareItemTypes(data);
        data.effects = prepareSortedEffects(this.actor.effects.contents);
        data.itemEffects = prepareSortedItemEffects(this.actor, { applyTo: this.itemEffectApplyTos });
        data.inventories = await this._prepareItemsInventory();
        data.inventory = this._prepareSelectedInventory(data.inventories);
        data.spells = this._prepareSortedCategorizedSpells(data.itemType["spell"]);
        data.hasInventory = this._prepareHasInventory(data.inventories);
        data.hasActions = this._prepareHasActions();
        data.selectedInventory = this.selectedInventory;
        data.program_count = this._prepareProgramCount(data.itemType);

        data.situationModifiers = this._prepareSituationModifiers();

        data.contentVisibility = this._prepareContentVisibility(data);

        if ('description' in data.system)
            data.biographyHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(data.system.description.value, {
                // secrets: this.actor.isOwner,
                // rollData: this.actor.getRollData.bind(this.actor),
                relativeTo: this.actor
            });

        data.bindings = this._prepareKeybindings();

        data.initiativePerception = this._prepareInitiativePerception();

        data.primaryTabs = this._prepareTabs('primary');

        return data;
    }

    override async _onRender(context, options) {
        this.activateListeners_LEGACY($(this.element));
        return super._onRender(context, options);
    }

    /** Listeners used by _all_ actor types! */
    activateListeners_LEGACY(html) {
        Helpers.setupCustomCheckbox(this, html)

        // Active Effect management
        html.find(".effect-control").on('click', async event => onManageActiveEffect(event, this.actor));
        html.find(".item-effect-control").on('click', async event => onManageItemActiveEffect(event));

        // General item header/list actions...
        html.find('.item-qty').on('change', this._onListItemChangeQuantity.bind(this));
        html.find('.item-rtg').on('change', this._onListItemChangeRating.bind(this));

        // Item list description display handling...
        html.find('.hidden').hide();

        // Actor inventory handling....
        html.find('.inventory-inline-create').on('click', this._onInventoryCreate.bind(this));
        html.find('.inventory-remove').on('click', this._onInventoryRemove.bind(this));
        html.find('.inventory-edit').on('click', this._onInplaceInventoryEdit.bind(this));
        html.find('.inventory-input-cancel').on('click', this._onInplaceInventoryEditCancel.bind(this));
        html.find('.inventory-input-save').on('click', this._onInplaceInventoryEditSave.bind(this));
        html.find('input#input-inventory').on('keydown', this._onInplaceInventoryEditCancel.bind(this));
        html.find('input#input-inventory').on('keydown', this._onInplaceInventoryEditSave.bind(this));
        html.find('input#input-inventory').on('change', this._onInventoryChangePreventSheetSubmit.bind(this));
        html.find('#select-inventory').on('change', this._onSelectInventory.bind(this));
        html.find('.inventory-item-move').on('click', this._onItemMoveToInventory.bind(this));

        // Condition monitor track handling...
        html.find('.horizontal-cell-input .cell').on('click', this._onSetConditionTrackCell.bind(this));
        html.find('.horizontal-cell-input .cell').on('contextmenu', this._onClearConditionTrack.bind(this));

        // Skill Filter handling...
        html.find('#filter-skills').on('input', this._onFilterSkills.bind(this));

        // Conditon monitor test rolling...
        html.find('.cell-input-roll').on('click', this._onRollCellInput.bind(this));

        // Misc. actor actions...
        html.find('.show-hidden-skills').on('click', this._onShowHiddenSkills.bind(this));
        html.find('.list-item').each(this._addDragSupportToListItemTemplatePartial.bind(this));
        html.find('.import-character').on('click', this._onShowImportCharacter.bind(this));

        html.find('.matrix-att-selector').on('change', this._onMatrixAttributeSelected.bind(this));

        // Situation modifiers application
        html.find('.show-situation-modifiers-application').on('click', this._onShowSituationModifiersApplication.bind(this));

        // Freshly imported item toggle
        html.find('.toggle-fresh-import-all-off').on('click', async (event) => this._toggleAllFreshImportFlags(event, false));
        html.find('.toggle-fresh-import-all-on').on('click', async (event) => this._toggleAllFreshImportFlags(event, true));

        // Reset Actor Run Data
        html.find('.reset-actor-run-data').on('click', this._onResetActorRunData.bind(this));

        html.find('select[name="initiative-select"]').on('change', this._onInitiativePerceptionChange.bind(this));
    }

    static async #showItemDescription(this: SR5BaseActorSheet, event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        await this.render();
    }

    /**
     * Get the options for Initiative Perception
     */
    _prepareInitiativePerception() {
        const initiative = this.actor.system.initiative.perception;
        if (initiative === 'matrix') {
            return this.actor.isUsingHotSim ? 'hot_sim' : 'cold_sim';
        }
        return initiative;
    }

    /**
     * Handle Changing Initiative Perception
     * - the select handles hot sim vs cold sim and doesn't match our dataset exactly
     * - this is more of a band-aid until we do appv2
     * @param event
     */
    async _onInitiativePerceptionChange(event) {
        const newValue = event.currentTarget?.value;
        if (newValue === 'meatspace' || newValue === 'magic') {
            // meatspace and magic can be directly applied as the perception type
            // disable VR as well
            await this.actor.update({ system: {
                    initiative: { perception: newValue, },
                    matrix: { vr: false }
                }});
        } else if (newValue === 'hot_sim' || newValue === 'cold_sim') {
            // if we are hot sim or cold sim, we are in VR and using matrix init perception
            await this.actor.update({
                system: {
                    initiative: {
                        perception: 'matrix',
                    },
                    matrix: { hot_sim: newValue === 'hot_sim', vr: true }
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

    /**
     * @override Default drag start handler to add Skill support
     * @param event
     */
    // TODO fix this
    async _onDragStart(event) {
        // Create drag data
        const dragData = {
            actorId: this.actor.id,
            sceneId: this.actor.isToken ? canvas.scene?.id : null,
            tokenId: this.actor.isToken ? this.actor.token?.id : null,
            type: '',
            data: {}
        };

        // Handle different item type data transfers.
        // These handlers depend on behavior of the template partial ListItem.html.
        const element = event.currentTarget;
        switch (element.dataset.itemType) {
            // Skill data transfer. (Active and language skills)
            case 'skill':
                // Prepare data transfer
                dragData.type = 'Skill';
                dragData.data = {
                    skillId: element.dataset.itemId,
                    skill: this.actor.getSkill(element.dataset.itemId)
                };

                // Set data transfer
                event.dataTransfer.setData("text/plain", JSON.stringify(dragData));

                return;

            // Knowlege skill data transfer
            case 'knowledgeskill': {
                // Knowledge skills have a multi purpose id built: <id>.<knowledge_category>
                const skillId = element.dataset.itemId.includes('.') ? element.dataset.itemId.split('.')[0] : element.dataset.itemId;

                dragData.type = 'Skill';
                dragData.data = {
                    skillId,
                    skill: this.actor.getSkill(skillId)
                };

                // Set data transfer
                event.dataTransfer.setData("text/plain", JSON.stringify(dragData));

                return;
            }
            // if we are dragging an active effect, get the effect from our list of effects and set it in the data transfer
            case 'ActiveEffect':
                {
                    const effectId = element.dataset.itemId;
                    let effect = this.actor.effects.get(effectId);
                    if (!effect) {
                        // check to see if it belongs to an item we own
                        effect = await fromUuid(effectId) as SR5ActiveEffect | undefined;
                    }
                    if (effect) {
                        // Prepare data transfer
                        dragData.type = 'ActiveEffect';
                        dragData.data = effect;

                        // Set data transfer
                        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
                    }
                    return;
                }

            // All default Foundry data transfer.
            default:
        }
    }

    /** Handle all document drops onto all actor sheet types.
     *
     * @param event
     */
    // TODO fix this
    async _onDrop(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!event.dataTransfer) return;

        const data = parseDropData(event);
        if (data !== undefined) {
            if (data.type === 'ActiveEffect' && data.actorId !== this.actor.id) {
                const effect = data.data;
                // if the effect is just supposed to apply to the item's test, it won't work on an actor
                if (effect.system.applyTo === 'test_item') {
                    ui.notifications?.warn(game.i18n.localize('SR5.ActiveEffect.CannotAddTestViaItemToActor'));
                    return;
                }
                // delete the id so a new one is generated
                delete effect._id;
                await this.actor.createEmbeddedDocuments('ActiveEffect', [effect]);
                // don't process anything else since we handled the drop
                return;
            }
            if (data.type === 'Actor' && data.uuid !== this.actor.uuid) {
                const actor = await fromUuid(data.uuid) as SR5Actor;
                const itemData = {
                    name: actor.name ?? `${game.i18n.localize('SR5.New')} ${game.i18n.localize(SR5.itemTypes['contact'])}`,
                    type: 'contact' as Item.SubType,
                    system: {linkedActor: actor.uuid }
                };
                await this.actor.createEmbeddedDocuments('Item', [itemData], { renderSheet: true });
            }
        }
    }

    static async #toggleInventoryVisibility(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const listHeader = $(event.target).closest('.new-list-item-header');
        const type = listHeader.data().itemType;

        console.log('type', type);
        console.log('inventoryOpenClose', this._inventoryOpenClose);

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

    /**
     * Create a new item based on the Item Header creation action and the item type of that header.
     * 
     * @param event 
     * @param data Optional additional data to be injected into the create item data.
     */
    static async #createItem(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        console.log('onItemCreate', this, event);
        const type = event.target.dataset.itemType ?? $(event.target).closest('a').data().itemType;

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
        const iid = event.target.dataset.itemId;
        const item = await fromUuid(iid);
        if (item && item instanceof SR5Item) await item.sheet?.render(true);
    }

    static async #deleteItem(this: SR5BaseActorSheet, event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        // deleting items use the item's _id property instead of uuid
        // this may need to change at some point to allow deleting linked items
        const iid = event.target.dataset.itemId;
        const item = this.actor.items.get(iid);
        if (!item) return;
        await this.actor.inventory.removeItem(item);

        return this.actor.deleteEmbeddedDocuments('Item', [iid]);
    }

    static async #rollItem(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const iid = event.target.dataset.itemId;
        const item = await fromUuid(iid);

        if (!item || !(item instanceof SR5Item)) return;
        await this._handleRollItem(item, event);
    }

    async _handleRollItem(item: SR5Item, event) {
        if (!Hooks.call('SR5_PreActorItemRoll', this.actor, item)) return;
        await item.castAction(event);
    }

    /**
     * Setup all general system rolls after clicking on their roll on the sheet.
     *
     * @param event Must contain a currentTarget with a rollId dataset
     */
    static async #rollById(this: SR5BaseActorSheet, event) {
        event.preventDefault();

        // look for roll id data in the current line
        const rollId = event.target.dataset.rollId;

        const split = rollId.split('.');
        const options = { event };
        switch (split[0]) {
            case 'prompt-roll':
                await this.actor.promptRoll();
                break;
            case 'armor':
                await this.actor.rollGeneralAction('armor', options);
                break;
            case 'fade':
                await this.actor.rollGeneralAction('fade', options);
                break;
            case 'drain':
                await this.actor.rollGeneralAction('drain', options);
                break;
            case 'defense':
                // await this.actor.rollAttackDefense(options);
                await this.actor.rollGeneralAction('physical_defense', options);
                break;
            case 'damage-resist':
                await this.actor.rollGeneralAction('physical_damage_resist', options);
                break;

            // attribute only rolls
            case 'composure':
                await this.actor.rollGeneralAction('composure', options);
                break;
            case 'judge-intentions':
                await this.actor.rollGeneralAction('judge_intentions', options);
                break;
            case 'lift-carry':
                await this.actor.rollGeneralAction('lift_carry', options);
                break;
            case 'memory':
                await this.actor.rollGeneralAction('memory', options);
                break;

            case 'vehicle-stat':
                console.log('roll vehicle stat', rollId);
                break;

            case 'drone': {
                const droneRoll = split[1];
                switch (droneRoll) {
                    case 'perception':
                        await this.actor.rollGeneralAction('drone_perception', options);
                        break;
                    case 'infiltration':
                        await this.actor.rollGeneralAction('drone_infiltration', options);
                        break;
                    case 'pilot-vehicle':
                        await this.actor.rollGeneralAction('drone_pilot_vehicle', options);
                        break;
                }
                break;
            }

            case 'attribute': {
                const attribute = split[1];
                if (attribute) {
                    await this.actor.rollAttribute(attribute, options);
                }
                break;
            }

            case 'skill': {
                const skillId = split[2];
                await this.actor.rollSkill(skillId, options);
                break;
            }

            case 'matrix': {
                const matrixRoll = split[1];
                switch (matrixRoll) {
                    case 'attribute': {
                        const attr = split[2];
                        await this.actor.rollAttribute(attr, options);
                        break;
                    }
                    case 'device-rating':
                        await this.actor.rollDeviceRating(options);
                        break;
                }

                break;
            }
        }
    }

    /**
     * Set any kind of condition monitor to a specific cell value.
     *
     * @event Most return a currentTarget with a value dataset
     */
    async _onSetConditionTrackCell(event) {
        event.preventDefault();

        const value = Number(event.currentTarget.dataset.value);
        const track = $(event.currentTarget).closest('.horizontal-cell-input').data().id;
        const data: Actor.UpdateData = {};

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
    async _onClearConditionTrack(event) {
        event.preventDefault();

        const track = $(event.currentTarget).closest('.horizontal-cell-input').data().id;
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

    _prepareActorAttributes(sheetData: SR5ActorSheetData) {
        // Clear visible, zero value attributes temporary modifiers so they appear blank.
        const attributes = sheetData.system.attributes;
        for (const [, attribute] of Object.entries(attributes)) {
            if (!attribute.hidden) {
                if (attribute.temp === 0)
                    // @ts-expect-error - temp is not defined in the SR5Attribute type
                    attribute.temp = null;
            }
        }
    }

    _prepareMatrixAttributes(sheetData: SR5ActorSheetData) {
        const { matrix } = sheetData.system;
        if (matrix) {
            const cleanupAttribute = (attribute: MatrixAttribute) => {
                const att = matrix[attribute];
                if (att) {
                    if (!att.mod) att.mod = [];
                    if (att.temp === 0)
                        // @ts-expect-error - so it doesn't show in sheet
                        att.temp = null;
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

            addTo.forEach(name => {
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
            })
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
     * Prepare if this actor has an "Action" Items in their list of items
     */
    _prepareHasActions() {
        return this.actor.items.filter(item => item.type === 'action').length > 0;
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
                    items.sort(sortyByQuality);
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
        return !this._isSkillMagic(skillId, skill) && !this._isSkillResonance(skill) && this._isSkillFiltered(skillId, skill);
    }

    _showMagicSkills(skillId, skill: SkillFieldType, sheetData: SR5ActorSheetData) {
        return this._isSkillMagic(skillId, skill) && sheetData.system.special === 'magic' && this._isSkillFiltered(skillId, skill);
    }

    _showResonanceSkills(skillId, skill: SkillFieldType, sheetData: SR5ActorSheetData) {
        return this._isSkillResonance(skill) && sheetData.system.special === 'resonance' && this._isSkillFiltered(skillId, skill);
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

    /** Setup untrained skill filter within getData */
    static async #filterUntrainedSkills(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        this._filters.showUntrainedSkills = !this._filters.showUntrainedSkills;
        await this.render();
    }

    /**
     * Parameterize skill filtering within getData and implement a general delay around it.
     *
     * NOTE: Be aware of UTF-8/16 multi character input languages, using mulitple separate input symbol to form a single alphabet character.
     * NOTE: This is ONLY necessary as shadowrun5e filters through the render -> getData -> template chain instead of
     *       hiding HTML elements based on their text.
     */
    async _onFilterSkills(event) {
        if (this._delays.skills)
            clearTimeout(this._delays.skills);

        this._delays.skills = setTimeout(() => {
            this._filters.skills = event.currentTarget.value;
            this.render();
        }, game.shadowrun5e.inputDelay);
    }

    static async #rollSkill(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const skillId = $(event.target).closest('a').data().skill;
        return this.actor.rollSkill(skillId, { event });
    }

    static async #rollSkillSpec(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        // NOTE: Knowledge skills still use a combined id in order for the legacy skill editing dialog to work.
        // const skillId = itemId.includes('.') ? itemId.split('.')[0] : itemId;
        const skillId = $(event.target).closest('a').data().skill;
        return this.actor.rollSkill(skillId, { event, specialization: true });
    }

    static async #openSkillSource(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const skillId = $(event.target).closest('a').data().skill;

        const skill = this.actor.getSkill(skillId);
        if (!skill) {
            console.error(`Shadowrun 5e | Editing skill failed due to missing skill ${skillId}`); return;
        }

        LinksHelpers.openSource(skill.link);
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

        const skillId = $(event.target).closest('a').data().skill;
        await this.actor.removeActiveSkill(skillId);
    }

    static async #rollAttribute(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const attribute = $(event.target).closest('a').data().attributeId;
        if (attribute) {
            await this.actor.rollAttribute(attribute, { event });
        }
    }

    /**
     * Handle interaction with a damage track title.
     * @param event
     */
    async _onRollCellInput(event) {
        event.preventDefault();
        const track = $(event.currentTarget).closest('.horizontal-cell-input').data().id;

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
        }
    }

    async _onShowHiddenSkills(event) {
        event.preventDefault();

        await this.actor.showHiddenSkills();
    }

    static async #openSource(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const iid = event.target.dataset.itemId;
        const item = await fromUuid(iid);
        console.log('openSource', this, event, item);
        if (item) {
            if (item instanceof SR5Item) {
                await item.openSource();
            } else if (item instanceof SR5ActiveEffect) {
                await item.renderSourceSheet();
            }
        }
    }
    /**
     * Augment each item of the ListItem template partial with drag support.
     * @param i
     * @param item
     */
    _addDragSupportToListItemTemplatePartial(i, item) {
        if (item.dataset?.itemId) {
            item.setAttribute('draggable', true);
            item.addEventListener('dragstart', this._onDragStart.bind(this), false);
        }
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

    /**
     * Change the rating on an item shown within a sheet item list.
     */
    async _onListItemChangeRating(event) {
        const iid = Helpers.listItemId(event);
        const item = this.actor.items.get(iid);
        const rtg = parseInt(event.currentTarget.value);
        if (item && rtg) {
            await item.update({ system: { technology: { rating: rtg } } });
        }
    }

    /**
     * Change the equipped status of an item shown within a sheet item list.
     */
    static async #onToggleEquippedItem(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const iid = event.target.dataset.itemId;
        const item = await fromUuid(iid);
        if (!item || !(item instanceof SR5Item) || item.actorOwner !== this.actor) return;

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

        const iid = event.target.dataset.itemId;
        const item = await fromUuid(iid);
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
     * Create an inventory place on the actor for gear organization.
     */
    async _onInventoryCreate(event) {
        event.preventDefault();

        // Overwrite currently selected inventory.
        $('#input-inventory').val('');
        await this._onInplaceInventoryEdit(event, 'create');
    }

    /**
     * Remove the currently selected inventory.
     * @param event
     */
    async _onInventoryRemove(event) {
        event.preventDefault();

        // TODO: Allow for options overwriting title/message and so forth.
        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.actor.inventory.remove(this.selectedInventory);

        // Preselect default instead of none.
        this.selectedInventory = this.actor.defaultInventory.name;
        this.render();
    }

    /**
     * Hide inventory selection and show inline editing instead.
     *
     * @param event
     * @param action What action to take during later saving event.
     */
    async _onInplaceInventoryEdit(event, action: 'edit' | 'create' = 'edit') {
        event.preventDefault();

        // Disallow editing of default inventory.
        if (action === 'edit' && this.actor.inventory.disallowRename(this.selectedInventory)) {
            ui.notifications?.warn(game.i18n.localize('SR5.Warnings.CantEditDefaultInventory'));
            return;
        }

        $('.selection-inventory').hide();
        $('.inline-input-inventory').show();

        // Mark action and pre-select.
        $('#input-inventory').data('action', action).select();
    }

    /**
     * Hide inline inventory editing and show inventory selection instead.
     *
     * Cancel edit workflow and do nothing.
     *
     * @param event Can be an event of type click or keydown.
     */
    async _onInplaceInventoryEditCancel(event) {
        if (event.type === 'keydown' && event.code !== 'Escape') return;

        event.preventDefault();

        $('.selection-inventory').show();
        $('.inline-input-inventory').hide();

        // Reset to selected inventory for next try.
        $('#input-inventory')
            .data('action', undefined)
            .val(this.selectedInventory);
    }

    /**
     * Complete inline editing and either save changes or create a missing inventory.
     *
     * @param event Either a click or keydown event.
     */
    async _onInplaceInventoryEditSave(event) {
        if (event.type === 'keydown' && event.code !== 'Enter') return;

        event.preventDefault();

        const inputElement = $('#input-inventory');
        const action = inputElement.data('action');
        let inventory: string | void = String(inputElement.val());
        if (!inventory) return;

        switch (action) {
            case 'edit':
                inventory = await this.actor.inventory.rename(this.selectedInventory, inventory);
                break;
            case 'create':
                inventory = await this.actor.inventory.create(inventory);
                break;
        }

        await this._onInplaceInventoryEditCancel(event);

        if (!inventory) return;

        // Preselect the new or previous inventory.
        this.selectedInventory = inventory;
        this.render();
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

    /**
     * Move an item between two inventories.
     * @param event
     */
    async _onItemMoveToInventory(event) {
        event.preventDefault();

        const itemId = Helpers.listItemId(event);
        const item = this.actor.items.get(itemId);
        if (!item) return;

        // Ask user about what inventory to move the item to.
        const dialog = new MoveInventoryDialog(this.actor, item, this.selectedInventory);
        const inventory = await dialog.select();
        if (dialog.canceled) return;

        await this.actor.inventory.addItems(inventory, item);
    }

    /**
     * When editing an existing or new inventory on a new actor for the frist time,
     * the initial change event (by leaving the element focus, i.e. leaving or clicking on submit)
     * will cause a general form submit (Foundry FormApplication onChangeSubmit), causing a render
     * and removing the inventory input box.
     *
     * Note: This ONLY happens on new actors and NOT on inventory changes on old actors. The root cause
     * is unclear.
     *
     * As the inventory inpunt box lives outside of Foundries default form handling, prevent
     * this by stopping propagation into Foundries onChange listeners.
     *
     * @param event Any event
     */
    _onInventoryChangePreventSheetSubmit(event: Event) {
        event.stopPropagation();
    }

    static async #reloadAmmo(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const iid = event.target.dataset.itemId;
        const item = await fromUuid(iid);
        if (item && item instanceof SR5Item) return item.reloadAmmo(false);
    }

    static async #partialReloadAmmo(this: SR5BaseActorSheet, event) {
        event.preventDefault();
        const iid = event.target.dataset.itemId;
        const item = await fromUuid(iid);
        if (item && item instanceof SR5Item) return item.reloadAmmo(true);
    }

    protected override _prepareTabs(group: string) {
        const retVal = super._prepareTabs(group);
        if (group === 'primary') {
            // remove actions tab if the actor does not have any
            if (!this._prepareHasActions()) {
                delete retVal['actions'];
            }
        }
        return retVal;
    }

    protected override _configureRenderParts(options) {
        const retVal = super._configureRenderParts(options);
        if (!this._prepareHasActions()) {
            // remove actions tab if the actor does not have any
            delete retVal['actions'];
        }
        return retVal;
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
    _onShowImportCharacter(event) {
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
    _onResetActorRunData(event) {
        this.actor.resetRunData()
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
}
