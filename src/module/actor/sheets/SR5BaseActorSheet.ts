import { SituationModifier } from '../../rules/modifiers/SituationModifier';
import { SituationModifiersApplication } from '../../apps/SituationModifiersApplication';
import {Helpers} from "../../helpers";
import {SR5Item} from "../../item/SR5Item";
import {onManageActiveEffect, onManageItemActiveEffect, prepareSortedItemEffects, prepareSortedEffects} from "../../effects";
import {SR5} from "../../config";
import {SkillEditSheet} from "../../apps/skills/SkillEditSheet";
import {SR5Actor} from "../SR5Actor";
import {KnowledgeSkillEditSheet} from "../../apps/skills/KnowledgeSkillEditSheet";
import {LanguageSkillEditSheet} from "../../apps/skills/LanguageSkillEditSheet";
import {MoveInventoryDialog} from "../../apps/dialogs/MoveInventoryDialog";
import {ChummerImportForm} from '../../apps/chummer-import-form';
import SR5SheetFilters = Shadowrun.SR5SheetFilters;
import SR5ActorSheetData = Shadowrun.SR5ActorSheetData;
import SkillField = Shadowrun.SkillField;
import Skills = Shadowrun.Skills;
import MatrixAttribute = Shadowrun.MatrixAttribute;
import DeviceData = Shadowrun.DeviceData;
import KnowledgeSkills = Shadowrun.KnowledgeSkills;
import { LinksHelpers } from '../../utils/links';


/**
 * Designed to work with Item.toObject() but it's not fully implementing all ItemData fields.
 */
export interface SheetItemData {
    type: string,
    name: string,
    data: Shadowrun.ShadowrunItemDataData
    properties: any,
    description: any
}

export interface InventorySheetDataByType {
    type: string;
    label: string;
    isOpen: boolean;
    items: SheetItemData[];
}

export interface InventorySheetData {
    name: string,
    label: string,
    types: {
        [type: string]: InventorySheetDataByType
    }
}

export type InventoriesSheetData = Record<string, InventorySheetData>;

// Use SR5ActorSheet._showSkillEditForm to only ever render one SkillEditSheet instance.
// Should multiple instances be open, Foundry will cause cross talk between skills and actors,
// when opened in succession, causing SkillEditSheet to wrongfully overwrite the wrong system.
let globalSkillAppId: number = -1;


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
    skills: ReturnType<typeof setTimeout>|null;
}



/**
 * This class should not be used directly but be extended for each actor type.
 *
 */
export class SR5BaseActorSheet extends ActorSheet {
    // What document description is shown on sheet. Allow displaying multiple descriptions at the same time.
    _shownDesc: string[] = [];
    // If something needs filtering, store those filters here.
    _filters: SR5SheetFilters = {
            skills: '', // filter based on user input and skill name/label.
            showUntrainedSkills: true, // filter based on pool size.
        };
    // Used together with _filters to delay textinput
    _delays: SR5BaseSheetDelays = {
        skills: null
    }
    // Used to store the scroll position on rerender. Needed as Foundry fully re-renders on Document update.
    _scroll: string;
    _inventoryOpenClose:Record<string, boolean> = {};

    // Store the currently selected inventory.
    selectedInventory: string;

    constructor(...args) {
        // @ts-expect-error // Since we don't need any actual data, don't define args to avoid breaking changes.
        super(...args);

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
    static override get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['sr5', 'sheet', 'actor'],
            width: 930,
            height: 690,
            tabs: [
                {
                    navSelector: '.tabs',
                    contentSelector: '.sheetbody',
                    initial: 'skills',
                },
            ],
        });
    }

    /**
     * Decide which template to render both for actor types and user permissions.
     *
     *
     * This could also be done within individual ActorType sheets, however, for ease of use, it's
     * centralized here.
     *
     * @override
     */
    override get template() {
        const path = 'systems/shadowrun5e/dist/templates';

        // v10 actor.limited doesn't take GM into account, so we have to do it ourselves.
        if (!game.user?.isGM && this.actor.limited) {
            return `${path}/actor-limited/${this.actor.type}.html`;
        }

        return `${path}/actor/${this.actor.type}.html`;
    }

    /** SheetData used by _all_ actor types! */
    override async getData(options) {
        // Remap Foundry default v8/v10 mappings to better match systems legacy foundry versions mapping accross it's templates.
        // NOTE: If this is changed, you'll have to match changes on all actor sheets.
        let data = super.getData() as any;
        const actorData = this.actor.toObject(false);

        data = {
            ...data,
            // @ts-expect-error TODO: foundry-vtt-types v10
            data: actorData.system,
            // @ts-expect-error TODO: foundry-vtt-types v10
            system: actorData.system
        }

        // Sheet related general purpose fields. These aren't persistent.
        data.config = SR5;
        data.filters = this._filters;

        this._prepareActorAttributes(data);
        this._prepareActorModifiers(data);

        // Valid data fields for all actor types.
        this._prepareActorTypeFields(data);
        this._prepareSpecialFields(data);
        this._prepareSkillsWithFilters(data);

        data.itemType = this._prepareItemTypes(data);
        data.effects = prepareSortedEffects(this.actor.effects.contents);
        data.itemEffects = prepareSortedItemEffects(this.actor);
        data.inventories = this._prepareItemsInventory();
        data.inventory = this._prepareSelectedInventory(data.inventories);
        data.hasInventory = this._prepareHasInventory(data.inventories);
        data.selectedInventory = this.selectedInventory;

        data.situationModifiers = this._prepareSituationModifiers();

        // @ts-expect-error TODO: foundry-vtt-types v10
        data.biographyHTML = await TextEditor.enrichHTML(actorData.system.description.value, {
            // secrets: this.actor.isOwner,
            // rollData: this.actor.getRollData.bind(this.actor),
            // @ts-expect-error TODO: foundry-vtt-types v10
            async: true,
            relativeTo: this.actor
        });

        data.bindings = this._prepareKeybindings();

        return data;
    }

    /** Listeners used by _all_ actor types! */
    override activateListeners(html) {
        super.activateListeners(html);

        Helpers.setupCustomCheckbox(this, html)

        // Active Effect management
        html.find(".effect-control").on('click', event => onManageActiveEffect(event, this.actor));
        html.find(".item-effect-control").on('click', event => onManageItemActiveEffect(event));

        // Inventory visibility switch
        html.find('.item-toggle').on('click', this._onInventorySectionVisiblitySwitch.bind(this));

        // General item CRUD management...
        html.find('.item-create').on('click', this._onItemCreate.bind(this));
        html.find('.item-edit').on('click', this._onItemEdit.bind(this));
        html.find('.item-delete').on('click', this._onItemDelete.bind(this));

        // General item header/list actions...
        html.find('.item-qty').on('change', this._onListItemChangeQuantity.bind(this));
        html.find('.item-rtg').on('change', this._onListItemChangeRating.bind(this));
        html.find('.item-equip-toggle').on('click', this._onListItemToggleEquipped.bind(this));

        // Item list description display handling...
        html.find('.hidden').hide();
        html.find('.has-desc').on('click', this._onListItemToggleDescriptionVisibility.bind(this));

        // General item test rolling...
        html.find('.item-roll').on('click', this._onItemRoll.bind(this));
        html.find('.Roll').on('click', this._onRoll.bind(this));

        // Actor inventory handling....
        html.find('.inventory-inline-create').on('click', this._onInventoryCreate.bind(this));
        html.find('.inventory-collapse').on('click', this._onInventorySectionVisibilityChange.bind(this, false));
        html.find('.inventory-expand').on('click', this._onInventorySectionVisibilityChange.bind(this, true));
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

        // Matrix data handling...
        html.find('.marks-qty').on('change', this._onMarksQuantityChange.bind(this));
        html.find('.marks-add-one').on('click', async (event) => this._onMarksQuantityChangeBy(event, 1));
        html.find('.marks-remove-one').on('click', async (event) => this._onMarksQuantityChangeBy(event, -1));
        html.find('.marks-delete').on('click', this._onMarksDelete.bind(this));
        html.find('.marks-clear-all').on('click', this._onMarksClearAll.bind(this));

        // Skill Filter handling...
        html.find('.skill-header').find('.item-name').on('click', this._onFilterUntrainedSkills.bind(this));
        html.find('.skill-header').find('.skill-spec-item').on('click', this._onFilterUntrainedSkills.bind(this));
        html.find('.skill-header').find('.rtg').on('click', this._onFilterUntrainedSkills.bind(this));
        html.find('#filter-skills').on('input', this._onFilterSkills.bind(this));

        // Skill CRUD handling...
        html.find('.skill-opensource').on('click', this._onOpenSourceSkill.bind(this));
        html.find('.knowledge-skill-opensource').on('click', this._onOpenSourceSkill.bind(this));
        html.find('.language-skill-opensource').on('click', this._onOpenSourceSkill.bind(this));
        html.find('.skill-edit').on('click', this._onShowEditSkill.bind(this));
        html.find('.knowledge-skill-edit').on('click', this._onShowEditKnowledgeSkill.bind(this));
        html.find('.language-skill-edit').on('click', this._onShowEditLanguageSkill.bind(this));
        html.find('.add-knowledge').on('click', this._onAddKnowledgeSkill.bind(this));
        html.find('.add-language').on('click', this._onAddLanguageSkill.bind(this));
        html.find('.add-active').on('click', this._onAddActiveSkill.bind(this));
        html.find('.remove-knowledge').on('click', this._onRemoveKnowledgeSkill.bind(this));
        html.find('.remove-language').on('click', this._onRemoveLanguageSkill.bind(this));
        html.find('.remove-active').on('click', this._onRemoveActiveSkill.bind(this));

        // Attribute test rolling...
        html.find('.attribute-roll').on('click', this._onRollAttribute.bind(this));

        // Conditon monitor test rolling...
        html.find('.cell-input-roll').on('click', this._onRollCellInput.bind(this));

        // Skill test rolling...
        html.find('.skill-roll').on('click', this._onRollSkill.bind(this));
        html.find('.knowledge-skill').on('click', this._onRollSkill.bind(this));
        html.find('.language-skill').on('click', this._onRollSkill.bind(this));
        html.find('.skill-spec-roll').on('click', this._onRollSkillSpec.bind(this));

        // Misc. actor actions...
        html.find('.show-hidden-skills').on('click', this._onShowHiddenSkills.bind(this));
        html.find('.open-source').on('click', this._onOpenSource.bind(this));
        html.find('.list-item').each(this._addDragSupportToListItemTemplatePartial.bind(this));
        html.find('.import-character').on('click', this._onShowImportCharacter.bind(this));

        // Misc. item type actions...
        html.find('.reload-ammo').on('click', this._onReloadAmmo.bind(this));
        html.find('.matrix-att-selector').on('change', this._onMatrixAttributeSelected.bind(this));

        // Situation modifiers application
        html.find('.show-situation-modifiers-application').on('click', this._onShowSituationModifiersApplication.bind(this));

        // Freshly imported item toggle
        html.find('.toggle-fresh-import-all-off').on('click', async (event) => this._toggleAllFreshImportFlags(event, false));
        html.find('.toggle-fresh-import-all-on').on('click', async (event) => this._toggleAllFreshImportFlags(event, true));

        // Reset Actor Run Data
        html.find('.reset-actor-run-data').on('click', this._onResetActorRunData.bind(this));
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
                type: type,
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
    override async _onDragStart(event) {
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
            case 'knowledgeskill':
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

            // All default Foundry data transfer.
            default:
                // Let default Foundry handler deal with default drag cases.
                return super._onDragStart(event);
        }
    }

    /** Handle all document drops onto all actor sheet types.
     *
     * @param event
     */
    // @ts-expect-error
    async _onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();

        if (!event.dataTransfer) return;
        // Keep upstream document created for actions base on it.
        const documents = await super._onDrop(event);

        // Handle specific system drop events.
        // const dropData = JSON.parse(event.dataTransfer.getData('text/plain'));

        // Add any created items to the selected inventory.
        if (Array.isArray(documents)) {
            const items = documents.filter(document => document instanceof SR5Item);
            await this.actor.inventory.addItems(this.selectedInventory, items);
        }

        return documents;
    }

    /**
     * Enhance Foundry state restore on rerender by more user interaction state.
     * @override
     */
    override async _render(...args) {
        const focus = this._saveInputCursorPosition();
        this._saveScrollPositions();

        await super._render(...args);

        this._restoreScrollPositions();
        this._restoreInputCursorPosition(focus);
    }

    /**
     * Use together with _restoreInputCursorPosition during render calls.
     * Without this the cursor will always be on the first character, causing writing in reverse.
     */
    _saveInputCursorPosition(): any|null {
        const focusList = $(this.element).find('input:focus');
        return focusList.length ? focusList[0] : null;
    }

    /**
     * Use together with _restoreInputCursorPosition during render calls.
     */
    _restoreInputCursorPosition(focus) {
        if (focus && focus.name) {
            if (!this.form) return;

            const element = this.form[focus.name];
            if (element) {
                // Set general focus for allem input types.
                element.focus();

                // Set selection range for supported input types.
                if (['checkbox', 'radio'].includes(element.type)) return;
                // set the selection range on the focus formed from before (keeps track of cursor in input)
                element.setSelectionRange && element.setSelectionRange(focus.selectionStart, focus.selectionEnd);
            }
        }

    }

    /**
     * Used together with _restoreScrollPositions during render calls.
     * @private
     */
    override _saveScrollPositions() {
        const activeList = this._findActiveList();
        if (activeList.length) {
            this._scroll = activeList.prop('scrollTop');
        }
    }

    /**
     * Used together with _storeScrollPositions during render calls.
     * @private
     */
    override _restoreScrollPositions() {
        const activeList = this._findActiveList();
        if (activeList.length && this._scroll != null) {
            activeList.prop('scrollTop', this._scroll);
        }
    }

    /**
     * Return scroll area of the currently opened tab.
     * @private
     */
    _findActiveList() {
        return $(this.element).find('.tab.active .scroll-area');
    }

    async _onInventorySectionVisibilityChange(isOpen: boolean, event) {
        event.preventDefault();
        this._setInventoryVisibility(isOpen);
        this.render();
    }

    async _onInventorySectionVisiblitySwitch(event) {
        event.preventDefault();
        const type = Helpers.listHeaderId(event);

        this._setInventoryTypeVisibility(type, !this._inventoryOpenClose[type]);
        this.render();
    }

    _setInventoryVisibility(isOpen: boolean) {
        Object.keys(CONFIG.Item.typeLabels)
            .forEach(type => this._setInventoryTypeVisibility(type, isOpen));
    }

    _setInventoryTypeVisibility(type: string, isOpen: boolean) {
        this._inventoryOpenClose[type] = isOpen
    }

    async _onItemCreate(event) {
        event.preventDefault();
        const type = event.currentTarget.closest('.list-header').dataset.itemId;

        // Unhide section it it was
        this._setInventoryTypeVisibility(type, true);

        // TODO: Add translation for item names...
        const itemData = {
            name: `New ${type}`,
            type: type,
        };
        const items = await this.actor.createEmbeddedDocuments('Item',  [itemData], {renderSheet: true}) as SR5Item[];
        if (!items) return;

        // Add the item to the selected inventory.
        if (this.selectedInventory !== this.actor.defaultInventory.name)
            await this.actor.inventory.addItems(this.selectedInventory, items);
    }

    async _onItemEdit(event) {
        event.preventDefault();
        const iid = Helpers.listItemId(event);
        const item = this.actor.items.get(iid);
        if (item) await item.sheet?.render(true);
    }

    async _onItemDelete(event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const iid = Helpers.listItemId(event);
        const item = this.actor.items.get(iid);
        if (!item) return;
        await this.actor.inventory.removeItem(item);

        return await this.actor.deleteEmbeddedDocuments('Item', [iid]);
    }

    async _onItemRoll(event) {
        event.preventDefault();
        const iid = Helpers.listItemId(event);
        const item = this.actor.items.get(iid);
        if (item) {
            await item.castAction(event);
        }
    }

    /**
     * Setup all general system rolls after clicking on their roll on the sheet.
     *
     * @param event Must contain a currentTarget with a rollId dataset
     */
    async _onRoll(event) {
        event.preventDefault();

        // look for roll id data in the current line
        let rollId = $(event.currentTarget).data()?.rollId;
        // if that doesn't exist, look for a prent with RollId name
        rollId = rollId ?? $(event.currentTarget).parent('.RollId').data().rollId;

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

            case 'drone':
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
            // end drone

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

            case 'matrix':
                const matrixRoll = split[1];
                switch (matrixRoll) {
                    case 'attribute':
                        const attr = split[2];
                        await this.actor.rollAttribute(attr, options);
                        break;
                    case 'device-rating':
                        await this.actor.rollDeviceRating(options);
                        break;
                }

                break;
            // end matrix
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
        const data = {};

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
        for (let [key, value] of Object.entries(modifiers)) {
            if (value === 0) modifiers[key] = '';
        }

        sheetData.woundTolerance = 3 + (Number(modifiers['wound_tolerance']) || 0);
    }

    _prepareActorAttributes(sheetData: SR5ActorSheetData) {
        // Clear visible, zero value attributes temporary modifiers so they appear blank.
        const attributes = sheetData.system.attributes;
        for (let [, attribute] of Object.entries(attributes)) {
            if (!attribute.hidden) {
                if (attribute.temp === 0) delete attribute.temp;
            }
        }
    }

    _prepareMatrixAttributes(sheetData: SR5ActorSheetData) {
        //@ts-expect-error Since we're field checking, we can ignore typing...
        const { matrix } = sheetData.system;
        if (matrix) {
            const cleanupAttribute = (attribute: MatrixAttribute) => {
                const att = matrix[attribute];
                if (att) {
                    if (!att.mod) att.mod = [];
                    if (att.temp === 0) delete att.temp;
                }
            };

            ['firewall', 'data_processing', 'sleaze', 'attack'].forEach((att: MatrixAttribute) => cleanupAttribute(att));
        }
    }

    /**
     * Prepare Actor Sheet Inventory display.
     *
     * Each item can  be in one custom inventory or the default inventory.
     */
    _prepareItemsInventory() {
        // All custom and default actor inventories.
        const inventoriesSheet: InventoriesSheetData = {};
        // Simple item to inventory mapping.
        const itemIdInventory: Record<string, Shadowrun.InventoryData> = {};

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
            const {name, label, itemIds} = inventory

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
        this.actor.items.forEach((item) => {
            if (!item.id) return;

            // Handled types are on the sheet outside the inventory.
            if (handledTypes.includes(item.type)) return;

            const sheetItem = this._prepareSheetItem(item);

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

                inventorySheet.types[item.type].items.push(sheetItem);
            })
        });

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
     * Show if any items are in the inventory or if the actor is supposed to have an inventory.
     *
     * A sheet is supposed to show an inventory if there are item types defined or an item of some
     * type exists in any of its inventories.
     *
     * @param inventories
     */
    _prepareHasInventory(inventories: InventoriesSheetData) {
        if(this.getInventoryItemTypes().length > 0) return true;

        for (const inventory of Object.values(inventories)) {
            if (Object.keys(inventory.types).length > 0) return true;
        }

        return false;
    }

    /**
     * Enhance SR5Item data for display on actors sheets.
     *
     * @param item: The item to transform into a 'sheet item'
     */
    _prepareSheetItem(item: SR5Item): SheetItemData {
        const sheetItem = item.toObject() as unknown as SheetItemData;

        const chatData = item.getChatData();
        sheetItem.description = chatData.description;
        // @ts-expect-error
        sheetItem.properties = chatData.properties;

        return sheetItem as unknown as SheetItemData;
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
    _prepareItemTypes(data): Record<string, SheetItemData[]> {
        const itemsByType: Record<string, SheetItemData[]> = {};

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
        this.actor.items.forEach((item: SR5Item) => {
            const sheetItem = this._prepareSheetItem(item);
            itemsByType[sheetItem.type].push(sheetItem);

            if (item.isSummoning) itemsByType['summoning'].push(sheetItem);
            if (item.isCompilation) itemsByType['compilation'].push(sheetItem);
        });

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
        sheetData.isCharacter = this.actor.isCharacter();
        sheetData.isSpirit = this.actor.isSpirit();
        sheetData.isCritter = this.actor.isCritter();
        sheetData.hasSkills = this.actor.hasSkills;
        sheetData.canAlterSpecial = this.actor.canAlterSpecial;
        sheetData.hasFullDefense = this.actor.hasFullDefense;
    }

    async _onMarksQuantityChange(event) {
        event.stopPropagation();

        if (this.actor.isIC() && this.actor.hasHost()) {
            return ui.notifications?.info(game.i18n.localize('SR5.Infos.CantModifyHostContent'));
        }

        const markId = event.currentTarget.dataset.markId;
        if (!markId) return;

        const markedDocuments = Helpers.getMarkIdDocuments(markId);
        if (!markedDocuments) return;
        const {scene, target, item} = markedDocuments;
        if (!scene || !target) return; // item can be undefined.

        const marks = parseInt(event.currentTarget.value);
        await this.actor.setMarks(target, marks, {scene, item, overwrite: true});
    }

    async _onMarksQuantityChangeBy(event, by: number) {
        event.stopPropagation();

        if (this.actor.isIC() && this.actor.hasHost()) {
            return ui.notifications?.info(game.i18n.localize('SR5.Infos.CantModifyHostContent'));
        }

        const markId = event.currentTarget.dataset.markId;
        if (!markId) return;

        const markedDocuments = Helpers.getMarkIdDocuments(markId);
        if (!markedDocuments) return;
        const {scene, target, item} = markedDocuments;
        if (!scene || !target) return; // item can be undefined.

        await this.actor.setMarks(target, by, {scene, item});
    }

    async _onMarksDelete(event) {
        event.stopPropagation();

        if (this.actor.isIC() && this.actor.hasHost()) {
            return ui.notifications?.info(game.i18n.localize('SR5.Infos.CantModifyHostContent'));
        }

        const markId = event.currentTarget.dataset.markId;
        if (!markId) return;

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.actor.clearMark(markId);
    }

    async _onMarksClearAll(event) {
        event.stopPropagation();

        if (this.actor.isIC() && this.actor.hasHost()) {
            return ui.notifications?.info(game.i18n.localize('SR5.Infos.CantModifyHostContent'));
        }

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.actor.clearMarks();
    }

    /**
     * Prepare skills with sorting and filtering given by this sheet.
     * 
     * @param sheetData What is to be displayed on sheet.
     */
    _prepareSkillsWithFilters(sheetData: SR5ActorSheetData) {
        this._filterActiveSkills(sheetData);
    }

    _filterSkills(data: SR5ActorSheetData, skills: Skills = {}) {
        const filteredSkills = {};
        for (let [key, skill] of Object.entries(skills)) {
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

    _showGeneralSkill(skillId, skill: SkillField) {
        return !this._isSkillMagic(skillId, skill) && !this._isSkillResonance(skill) && this._isSkillFiltered(skillId, skill);
    }

    _showMagicSkills(skillId, skill: SkillField, sheetData: SR5ActorSheetData) {
        return this._isSkillMagic(skillId, skill) && sheetData.system.special === 'magic' && this._isSkillFiltered(skillId, skill);
    }

    _showResonanceSkills(skillId, skill: SkillField, sheetData: SR5ActorSheetData) {
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
        let searchString = `${searchKey} ${name} ${specs}`;

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
    async _onFilterUntrainedSkills(event) {
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
            //@ts-expect-error TODO: foundry-vtt-types v10. Add to typing.
        }, game.shadowrun5e.inputDelay);
    }

    async _onRollSkill(event) {
        event.preventDefault();
        const itemId = Helpers.listItemId(event);
        // NOTE: Knowledge skills still use a combined id in order for the legacy skill editing dialog to work.
        const skillId = itemId.includes('.') ? itemId.split('.')[0] : itemId;
        if (!skillId) return console.error(`Shadowrun 5e | Rolling skill with item id (${itemId}). But (${skillId}) doesn't seem to be an id`);
        return this.actor.rollSkill(skillId, {event});
    }

    async _onRollSkillSpec(event) {
        event.preventDefault();
        const itemId = Helpers.listItemId(event);
        // NOTE: Knowledge skills still use a combined id in order for the legacy skill editing dialog to work.
        const skillId = itemId.includes('.') ? itemId.split('.')[0] : itemId;
        return this.actor.rollSkill(skillId, {event, specialization: true});
    }

    async _onOpenSourceSkill(event) {
        event.preventDefault();
        const [skillId, ] = Helpers.listItemId(event).split('.');

        const skill = this.actor.getSkill(skillId);
        if (!skill) {
            return console.error(`Shadowrun 5e | Editing skill failed due to missing skill ${skillId}`);
        }

        LinksHelpers.openSource(skill.link);
    }

    async _onShowEditSkill(event) {
        event.preventDefault();
        const skill = Helpers.listItemId(event);

        if (!skill) {
            return console.error(`Shadowrun 5e | Editing knowledge skill failed due to missing skill ${skill} id`);
        }

        // new SkillEditSheet(this.actor, skill, { event: event }).render(true);
        await this._showSkillEditForm(SkillEditSheet, this.actor, { event: event }, skill);
    }

    /** Keep track of each SkillEditSheet instance and close before opening another.
     *
     * @param skillEditFormImplementation Any extending class! of SkillEditSheet
     * @param actor
     * @param options
     * @param args Collect arguments of the different renderWithSkill implementations.
     */
    async _showSkillEditForm(skillEditFormImplementation, actor: SR5Actor, options: object, ...args) {
        await this._closeOpenSkillApp();

        const skillEditForm = new skillEditFormImplementation(actor, options, ...args);
        globalSkillAppId = skillEditForm.appId;
        await skillEditForm.render(true);
    }

    _onShowEditKnowledgeSkill(event) {
        event.preventDefault();
        const [skill, category] = Helpers.listItemId(event).split('.');

        if (!skill || !category) {
            return console.error(`Shadowrun 5e | Editing knowledge skill failed due to missing skill ${skill} or category id ${category}`);
        }

        this._showSkillEditForm(
            KnowledgeSkillEditSheet,
            this.actor,
            {
                event: event,
            },
            skill,
            category,
        );
    }

    async _onShowEditLanguageSkill(event) {
        event.preventDefault();
        const skill = Helpers.listItemId(event);

        if (!skill) {
            return console.error(`Shadowrun 5e | Editing knowledge skill failed due to missing skill ${skill} id`);
        }

        // new LanguageSkillEditSheet(this.actor, skill, { event: event }).render(true);
        await this._showSkillEditForm(LanguageSkillEditSheet, this.actor, { event: event }, skill);
    }

    async _closeOpenSkillApp() {
        if (globalSkillAppId !== -1) {
            if (ui.windows[globalSkillAppId]) {
                await ui.windows[globalSkillAppId].close();
            }
            globalSkillAppId = -1;
        }
    }

    async _onAddLanguageSkill(event) {
        event.preventDefault();
        const skillId = await this.actor.addLanguageSkill({ name: '' });
        if (!skillId) return;

        await this._showSkillEditForm(LanguageSkillEditSheet, this.actor, {event}, skillId);
    }

    async _onRemoveLanguageSkill(event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const skillId = Helpers.listItemId(event);
        await this.actor.removeLanguageSkill(skillId);
    }

    async _onAddKnowledgeSkill(event) {
        event.preventDefault();
        const category = Helpers.listHeaderId(event) as keyof KnowledgeSkills;
        const skillId = await this.actor.addKnowledgeSkill(category);
        if (!skillId) return;

        await this._showSkillEditForm(KnowledgeSkillEditSheet, this.actor, {event}, skillId, category);
    }

    async _onRemoveKnowledgeSkill(event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const [skillId, category] = Helpers.listItemId(event).split('.') as [string, keyof KnowledgeSkills];
        await this.actor.removeKnowledgeSkill(skillId, category);
    }

    /** Add an active skill and show the matching edit application afterwards.
     *
     * @param event The HTML event from which the action resulted.
     */
     async _onAddActiveSkill(event: Event) {
        event.preventDefault();
        const skillId = await this.actor.addActiveSkill();
        if (!skillId) return;

        await this._showSkillEditForm(SkillEditSheet, this.actor, { event: event }, skillId);
    }

    async _onRemoveActiveSkill(event: Event) {
         event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const skillId = Helpers.listItemId(event);
        await this.actor.removeActiveSkill(skillId);
    }

    async _onRollAttribute(event) {
        event.preventDefault();
        const attribute = event.currentTarget.closest('.attribute').dataset.attribute;
        return this.actor.rollAttribute(attribute, {event: event});
    }

    /**
     * Handle interaction with a damage track title.
     * @param event
     */
    async _onRollCellInput(event) {
        event.preventDefault();
        let track = $(event.currentTarget).closest('.horizontal-cell-input').data().id;

        switch (track) {
            case 'stun':
                await this.actor.rollGeneralAction('natural_recovery_stun', {event});
                break;
            case 'physical':
                await this.actor.rollGeneralAction('natural_recovery_physical', {event});
                break;
            case 'edge':
                await this.actor.rollAttribute('edge', {event});
                break;
        }
    }

    async _onShowHiddenSkills(event) {
        event.preventDefault();

        await this.actor.showHiddenSkills();
    }

    _onOpenSource(event) {
        event.preventDefault();
        const field = $(event.currentTarget).parents('.list-item');
        const iid = $(field).data().itemId;
        const item = this.actor.items.get(iid);
        if (item) {
            item.openSource();
        }
    }
    /**
     * Augment each item of the ListItem template partial with drag support.
     * @param i
     * @param item
     */
    _addDragSupportToListItemTemplatePartial(i, item) {
        if (item.dataset && item.dataset.itemId) {
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
        if (item?.system.technology === undefined || !(item && quantity && item.system.technology)) {
            return console.error(`Shadowrun 5e | Tried alterting technology quantity on an item without technology data: ${item?.id}`, item);
        }

        await item.update({ 'system.technology.quantity': quantity });
    }

    /**
     * Change the rating on an item shown within a sheet item list.
     */
    async _onListItemChangeRating(event) {
        const iid = Helpers.listItemId(event);
        const item = this.actor.items.get(iid);
        const rtg = parseInt(event.currentTarget.value);
        if (item && rtg) {
            await item.update({ 'system.technology.rating': rtg });
        }
    }

    /**
     * Change the equipped status of an item shown within a sheet item list.
     */
    async _onListItemToggleEquipped(event) {
        event.preventDefault();
        const iid = Helpers.listItemId(event);
        const item = this.actor.items.get(iid);
        if (item) {
            const newItems = [] as any[];

            // Handle the equipped state.
            if (item.isDevice) {
                // Only allow one equipped device item. Unequip all other.
                for (const item of this.actor.items.filter(actorItem => actorItem.isDevice)) {
                    newItems.push({
                        '_id': item.id,
                        'system.technology.equipped': item.id === iid,
                    });
                }

            } else {
                // Toggle equip status.
                newItems.push({
                    '_id': iid,
                    'system.technology.equipped': !item.isEquipped(),
                });
            }

            // Handle active effects based on equipped status.
            // NOTE: This is commented out for later ease of enabling effects based on equip status AND if they are
            //       meant to enable on eqiup or not.
            // this.actor.effects.forEach(effect => {
            //     if (effect.system.origin !== item.uuid) return;
            //
            //     // @ts-expect-error
            //     effect.disable(item.isEquipped());
            // })

            await this.actor.updateEmbeddedDocuments('Item', newItems);

            this.actor.render(false);
        }
    }

    /**
     * Show / hide the items description within a sheet item l ist.
     */
    async _onListItemToggleDescriptionVisibility(event) {
        event.preventDefault();
        const item = $(event.currentTarget).parents('.list-item');
        const iid = $(item).data().item;
        const field = item.find('.list-item-description');
        field.toggle();
        if (iid) {
            if (field.is(':visible')) this._shownDesc.push(iid);
            else this._shownDesc = this._shownDesc.filter((val) => val !== iid);
        }
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
    async _onInplaceInventoryEdit(event, action:'edit'|'create'='edit') {
        event.preventDefault();

        // Disallow editing of default inventory.
        if (action === 'edit' && this.actor.inventory.disallowRename(this.selectedInventory))
            return ui.notifications?.warn(game.i18n.localize('SR5.Warnings.CantEditDefaultInventory'));


        $('.selection-inventory').hide();
        $('.inline-input-inventory').show();

        // Mark action and pre-select.
        $('#input-inventory')
            .data('action', action)
            .select();
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
        let inventory: string|void = String(inputElement.val());
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
        const dialog = new MoveInventoryDialog(this.actor, this.selectedInventory);
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

    /**
     * Initiative a reload from a sheet event.
     *
     * @param event
     */
     async _onReloadAmmo(event) {
        event.preventDefault();
        const iid = Helpers.listItemId(event);
        const item = this.actor.items.get(iid);
        if (item) return item.reloadAmmo();
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

        let iid = this.actor.system.matrix.device;
        let item = this.actor.items.get(iid);
        if (!item) {
            console.error('could not find item');
            return;
        }
        // grab matrix attribute (sleaze, attack, etc.)
        let att = event.currentTarget.dataset.att;
        // grab device attribute (att1, att2, ...)
        let deviceAtt = event.currentTarget.value;

        // get current matrix attribute on the device
        const deviceData = item.system as DeviceData;
        let oldVal = deviceData.atts[deviceAtt].att;
        let data = {
            _id: iid,
        };

        // go through atts on device, setup matrix attributes on it
        // This logic swaps the two slots when a new one is selected
        for (let i = 1; i <= 4; i++) {
            let tmp = `att${i}`;
            let key = `system.atts.att${i}.att`;
            if (tmp === deviceAtt) {
                data[key] = att;
            } else if (deviceData.atts[`att${i}`].att === att) {
                data[key] = oldVal;
            }
        }
        await this.actor.updateEmbeddedDocuments('Item', [data]);
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

    _setupCustomCheckbox(html) {
        const setContent = (el) => {
            const checkbox = $(el).children('input[type=checkbox]');
            const checkmark = $(el).children('.checkmark');
            if ($(checkbox).prop('checked')) {
                $(checkmark).addClass('fa-check-circle');
                $(checkmark).removeClass('fa-circle');
            } else {
                $(checkmark).addClass('fa-circle');
                $(checkmark).removeClass('fa-check-circle');
            }
        };
        html.find('label.checkbox').each(function () {
            setContent(this);
        });
        html.find('label.checkbox').click((event) => setContent(event.currentTarget));
        html.find('.submit-checkbox').change((event) => this._onSubmit(event));
    }

    /**
     * Prepare applied Situation Modifiers for display (read-only) on any actor sheet.
     *
     * Some modifiers might be hidden, when the document doesn't fullfill criterea for it.
     *
     * @returns List of prepare sit. mod data
     */
    _prepareSituationModifiers(): {category: string, label: string, value: number, hidden: boolean}[] {
        const modifiers = this.actor.getSituationModifiers();
        if (!modifiers) return [];

        return Object.entries(modifiers._modifiers).map(([category, modifier]: [Shadowrun.SituationModifierType, SituationModifier]) => {
            const hidden = this._hideSituationModifier(category);

            const label = SR5.modifierTypes[category];
            return {category, value: modifier.total, hidden, label};
        });
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
                return !this.actor.isAwakened;
            case 'environmental':
                return this.actor.isSprite();
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
                await item.update({ 'system.importFlags.isFreshImport': onOff });
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
            skip: game.keybindings.get('shadowrun5e', 'hide-test-dialog').map(binding => `${binding.key.replace('Key', '')}`).join(', '),
            card: game.keybindings.get('shadowrun5e', 'show-item-card').map(binding => `${binding.key.replace('Key', '')}`).join(', '),
        }
    }
}