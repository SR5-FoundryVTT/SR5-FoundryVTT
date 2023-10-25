import {Helpers} from '../helpers';
import {SR5Item} from './SR5Item';
import {SR5} from "../config";
import {onManageActiveEffect, prepareActiveEffectCategories} from "../effects";
import { createTagify } from '../utils/sheets';
import { SR5Actor } from '../actor/SR5Actor';

/**
 * FoundryVTT ItemSheetData typing
 */
interface FoundryItemSheetData {
    // Item type
    type: string
    // Legacy Item Document Data
    data: Shadowrun.ShadowrunItemData
    // Item Document System Data
    system: Shadowrun.ShadowrunItemDataData
    // A descriptive document  reference
    item: SR5Item
    document: SR5Item
    
    cssClass: string
    editable: boolean
    limited: boolean
    owner: boolean
    title: string
}

/**
 * Shadowrun 5e ItemSheetData typing shared across all item types
 */
export interface SR5BaseItemSheetData extends FoundryItemSheetData {
    // SR5-FoundryVTT configuration
    config: typeof SR5
    effects: Shadowrun.EffectsSheetData
    // FoundryVTT rollmodes
    rollModes: CONFIG.Dice.RollModes
}

/**
 * Template fields for item sheet
 */
interface SR5ItemSheetData extends SR5BaseItemSheetData {
    // Nested item typing for different sheets
    ammunition: Shadowrun.AmmoItemData[]
    weaponMods: Shadowrun.ModificationItemData[]
    armorMods: Shadowrun.ModificationItemData[]
    
    // Sorted lists for usage in select elements.
    activeSkills: Record<string, string> // skill id: label
    attributes: Record<string, string>  // key: label
    limits: Record<string, string> // key: label

    // Host Item.
    markedDocuments: Shadowrun.MarkedDocument[]
    networkDevices: (SR5Item|SR5Actor)[]
    networkController: SR5Item | undefined

    // Action Items. (not only type = action)
    //@ts-ignore
    tests: typeof game.shadowrun5e.tests
    // @ts-ignore
    opposedTests: typeof game.shadowrun5e.opposedTests
    // @ts-ignore
    activeTests: typeof game.shadowrun5e.activeTests
    // @ts-ignore
    resistTests: typeof game.shadowrun5e.resistTests

    // Rendered description field
    descriptionHTML: string
}

/**
 * Extend the basic ItemSheet with some very simple modifications
 */
export class SR5ItemSheet extends ItemSheet {
    private _shownDesc: any[] = [];
    private _scroll: string;

    /**
     * Extend and override the default options used by the Simple Item Sheet
     * @returns {Object}
     */
    static override get defaultOptions() {
        // @ts-ignore // mergeObject breaks TypeScript typing. Should be fine.
        return mergeObject(super.defaultOptions, {
            classes: ['sr5', 'sheet', 'item'],
            width: 735,
            height: 450,
            tabs: [{ navSelector: '.tabs', contentSelector: '.sheetbody' }],
        });
    }

    override get template() {
        return `systems/shadowrun5e/dist/templates/item/${this.item.type}.html`;
    }

    /* -------------------------------------------- */

    /**
     * Prepare data for rendering the Item sheet
     * The prepared data object contains both the actor data as well as additional sheet options
     */
    override async getData(options): Promise<any> {
        const data = super.getData(options) as unknown as SR5ItemSheetData;

        // Rework v9 style data mapping to v10 style, while waiting for foundry-vtt-types to be update to v10.
        //@ts-ignore
        data.type = data.data.type;
        // data.data = data.system = data.data;
        //@ts-ignore
        data.system = data.item.system;
        //@ts-ignore // TODO: remove TODO: foundry-vtt-types v10
        data.data = data.item.system;
        const itemData = this.item.system;

        if (itemData.action) {
            try {
                const action = itemData.action as any;
                if (itemData.action.mod === 0) delete action.mod;
                if (action.limit === 0) delete action.limit;
                if (action.damage) {
                    if (action.damage.mod === 0) delete action.damage.mod;
                    if (action.damage.ap.mod === 0) delete action.damage.ap.mod;
                }
                if (action.limit) {
                    if (action.limit.mod === 0) delete action.limit.mod;
                }
            } catch (e) {
                console.error(e);
            }
        }

        if (itemData.technology) {
            try {
                const technology = itemData.technology as any;
                if (technology.rating === 0) delete technology.rating;
                if (technology.quantity === 0) delete technology.quantity;
                if (technology.cost === 0) delete technology.cost;
            } catch (e) {
                console.log(e);
            }
        }

        data['config'] = SR5;

        /**
         * Reduce nested items into typed lists.
         */
        const [ammunition, weaponMods, armorMods] = this.item.items.reduce(
            (sheetItemData: [Shadowrun.AmmoItemData[], Shadowrun.ModificationItemData[], Shadowrun.ModificationItemData[]], nestedItem: SR5Item) => {
                const itemData = nestedItem.toObject();
                //@ts-ignore
                itemData.descriptionHTML = this.enrichEditorFieldToHTML(itemData.system.description.value);

                //@ts-ignore
                if (nestedItem.type === 'ammo') sheetItemData[0].push(itemData); // TODO: foundry-vtt-types v10
                //@ts-ignore TODO: foundry-vtt-types v10
                if (nestedItem.type === 'modification' && "type" in nestedItem.system && nestedItem.system.type === 'weapon') sheetItemData[1].push(itemData);
                //@ts-ignore TODO: foundry-vtt-types v10
                if (nestedItem.type === 'modification' && "type" in nestedItem.system && nestedItem.system.type === 'armor') sheetItemData[2].push(itemData);
                
                return sheetItemData;
            },
            [[], [], []],
        );
        data['ammunition'] = ammunition;
        data['weaponMods'] = weaponMods;
        data['armorMods'] = armorMods;
        data['activeSkills'] = this._getSortedActiveSkillsForSelect();
        data['attributes'] = this._getSortedAttributesForSelect();
        data['limits'] = this._getSortedLimitsForSelect();

        // Active Effects data.
        data['effects'] = prepareActiveEffectCategories(this.item.effects);

        if (this.item.isHost) {
            data['markedDocuments'] = this.item.getAllMarkedDocuments();
        }

        if (this.item.canBeNetworkController) {
            data['networkDevices'] = this.item.networkDevices;
        }

        if (this.item.canBeNetworkDevice) {
            data['networkController'] = this.item.networkController;
        }

        // Provide action parts with all test variantes.
        // @ts-ignore // TODO: put 'opposed test types' into config (see data.config)
        data.tests = game.shadowrun5e.tests;
        // @ts-ignore
        data.opposedTests = game.shadowrun5e.opposedTests;
        // @ts-ignore
        data.activeTests = game.shadowrun5e.activeTests;
        // @ts-ignore
        data.resistTests = game.shadowrun5e.resistTests;

        // @ts-ignore TODO: foundry-vtt-types v10
        data.descriptionHTML = this.enrichEditorFieldToHTML(this.item.system.description.value);

        data.rollModes = CONFIG.Dice.rollModes;

        return data;
    }

    /**
     * Help enriching editor field values to HTML used to display editor values as read-only HTML in sheets.
     * 
     * @param editorValue A editor field value like Item.system.description.value
     * @param options TextEditor, enrichHTML.options passed through
     * @returns Enriched HTML result
     */
    enrichEditorFieldToHTML(editorValue: string, options:any={async: false}): string {
        return TextEditor.enrichHTML(editorValue, options);
    }

    /**
     * Action limits currently contain limits for all action types. Be it matrix, magic or physical.
     */
    _getSortedLimitsForSelect(): Record<string, string> {
        return Helpers.sortConfigValuesByTranslation(SR5.limits);
    }

    /**
     * Sorted (by translation) actor attributes.
     */
    _getSortedAttributesForSelect(): Record<string, string> {
        return Helpers.sortConfigValuesByTranslation(SR5.attributes);
    }

    /**
     * Sorted (by translation) active skills either from the owning actor or general configuration.
     */
    _getSortedActiveSkillsForSelect() {
        // We need the actor owner, instead of the item owner. See actorOwner jsdoc for details.
        const actor = this.item.actorOwner;
        // Fallback for actors without skills.
        if (!actor || actor.isIC()) return Helpers.sortConfigValuesByTranslation(SR5.activeSkills);

        const activeSkills = Helpers.sortSkills(actor.getActiveSkills());

        const activeSkillsForSelect: Record<string, string> = {};
        for (const [id, skill] of Object.entries(activeSkills)) {
            // Legacy skills have no name, but their name is their id!
            // Custom skills have a name and their id is random.
            const key = skill.name || id;
            const label = skill.label || skill.name;
            activeSkillsForSelect[key] = label;
        }

        return activeSkillsForSelect;
    }

    _getNetworkDevices(): SR5Item[] {
        // return NetworkDeviceFlow.getNetworkDevices(this.item);
        return [];
    }

    /* -------------------------------------------- */

    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html -  The prepared HTML object ready to be rendered into the DOM
     */
    override activateListeners(html) {
        super.activateListeners(html);

        Helpers.setupCustomCheckbox(this, html);

        /**
         * Drag and Drop Handling
         */
        //@ts-ignore
        this.form.ondragover = (event) => this._onDragOver(event);
        //@ts-ignore
        this.form.ondrop = (event) => this._onDrop(event);

        // Active Effect management
        html.find(".effect-control").click(event => onManageActiveEffect(event, this.item));

        /**
         * General item handling
         */
        html.find('.edit-item').click(this._onEditItem.bind(this));
        html.find('.open-source').on('click', this._onOpenSource.bind(this));
        // html.find('.has-desc').click((event) => {
        //     event.preventDefault();
        //     const item = $(event.currentTarget).parents('.list-item');
        //     const iid = $(item).data().item;
        //     const field = item.next();
        //     field.toggle();
        //     if (iid) {
        //         if (field.is(':visible')) this._shownDesc.push(iid);
        //         else this._shownDesc = this._shownDesc.filter((val) => val !== iid);
        //     }
        // });
        html.find('.has-desc').click(this._onListItemToggleDescriptionVisibility.bind(this));
        html.find('.hidden').hide();
        html.find('.entity-remove').on('click', this._onEntityRemove.bind(this));

        /**
         * Weapon item specific
         */
        html.find('.add-new-ammo').click(this._onAddNewAmmo.bind(this));
        html.find('.ammo-equip').click(this._onAmmoEquip.bind(this));
        html.find('.ammo-delete').click(this._onAmmoRemove.bind(this));
        html.find('.ammo-reload').click(this._onAmmoReload.bind(this));

        html.find('.add-new-mod').click(this._onAddWeaponMod.bind(this));
        html.find('.mod-equip').click(this._onWeaponModEquip.bind(this));
        html.find('.mod-delete').click(this._onWeaponModRemove.bind(this));
        /**
         * SIN item specific
         */
        html.find('.add-new-license').click(this._onAddLicense.bind(this));
        html.find('.license-delete').on('click', this._onRemoveLicense.bind(this));

        html.find('.network-clear').on('click', this._onRemoveAllNetworkDevices.bind(this));
        html.find('.network-device-remove').on('click', this._onRemoveNetworkDevice.bind(this));

        // Marks handling
        html.find('.marks-qty').on('change', this._onMarksQuantityChange.bind(this));
        html.find('.marks-add-one').on('click', async (event) => this._onMarksQuantityChangeBy(event, 1));
        html.find('.marks-remove-one').on('click', async (event) => this._onMarksQuantityChangeBy(event, -1));
        html.find('.marks-delete').on('click', this._onMarksDelete.bind(this));
        html.find('.marks-clear-all').on('click', this._onMarksClearAll.bind(this));

        // Origin Link handling
        html.find('.origin-link').on('click', this._onOpenOriginLink.bind(this));
        html.find('.controller-remove').on('click', this._onControllerRemove.bind(this));

        html.find('.matrix-att-selector').on('change', this._onMatrixAttributeSelected.bind(this));

        this._activateTagifyListeners(html);        
    }

    override async _onDrop(event) {
        if (!game.items || !game.actors || !game.scenes) return;

        event.preventDefault();
        event.stopPropagation();

        // Parse drop data.
        const data = this.parseDropData(event);
        if (!data) return;

        // Add items to a weapons modification / ammo
        if (this.item.isWeapon && data.type === 'Item') {
            let item;
            // Case 1 - Data explicitly provided
            if (data.data) {
                if (this.item.isOwned && data.actorId === this.item.actor?.id && data.data._id === this.item.id) {
                    return console.warn('Shadowrun 5e | Cant drop items onto themself');
                }
                item = data;
            // Case 2 - From a Compendium Pack
            } else if (data.pack) {
                item = await Helpers.getEntityFromCollection(data.pack, data.id);
            // Case 3 - From a World Entity
            } else {
                item = await fromUuid(data.uuid);
            }

            // Provide readable error for failing item retrieval assumptions.
            if (!item) return console.error('Shadowrun 5e | Item could not be created from DropData', data);

            return await this.item.createNestedItem(item._source);
        }

        // Add items to hosts WAN.
        if (this.item.isHost && data.type === 'Actor') {
            const actor = await fromUuid(data.uuid);
            if (!actor || !actor.id) return console.error('Shadowrun 5e | Actor could not be retrieved from DropData', data);
            return await this.item.addIC(actor.id , data.pack);
        }

        // Add items to a network (PAN/WAN).
        if (this.item.canBeNetworkController && data.type === 'Item') {
            const item = await fromUuid(data.uuid) as SR5Item;

            if (!item || !item.id) return console.error('Shadowrun 5e | Item could not be retrieved from DropData', data);
            
            return await this.item.addNetworkDevice(item);
        }

        // Add vehicles to a network (PAN/WAN).
        if (this.item.canBeNetworkController && data.type === 'Actor') {
            const actor = await fromUuid(data.uuid) as SR5Actor;

            if (!actor || !actor.id) return console.error('Shadowrun 5e | Actor could not be retrieved from DropData', data);

            if(!actor.isVehicle()) {
                return ui.notifications?.error(game.i18n.localize('SR5.Errors.CanOnlyAddTechnologyItemsToANetwork'));
            }

            return await this.item.addNetworkDevice(actor);
        }
    }

    _eventId(event) {
        event.preventDefault();
        return event.currentTarget.closest('.list-item').dataset.itemId;
    }

    _onOpenSource(event) {
        event.preventDefault();
        this.item.openSource();
    }

    //Swap slots (att1, att2, etc.) for ASDF matrix attributes
    async _onMatrixAttributeSelected(event) {
        if (!this.item.system.atts) return;

        // sleaze, attack, etc.
        const selectedAtt = event.currentTarget.value;
        // att1, att2, etc..
        const changedSlot = event.currentTarget.dataset.att;

        const oldValue = this.item.system.atts[changedSlot].att;

        let data = {}

        Object.entries(this.item.system.atts).forEach(([slot, { att }]) => {
            if(slot === changedSlot) {
                data[`system.atts.${slot}.att`] = selectedAtt;
            } else if (att === selectedAtt) {
                data[`system.atts.${slot}.att`] = oldValue;
            }
        });

        await this.item.update(data);
    }

    async _onEditItem(event) {
        const item = this.item.getOwnedItem(this._eventId(event));
        if (item) {
            item.sheet?.render(true);
        }
    }

    async _onEntityRemove(event) {
        event.preventDefault();

        // Grab the data position to remove the correct entity from the list.
        const entityRemove = $(event.currentTarget).closest('.entity-remove');
        const list = entityRemove.data('list');
        const position = entityRemove.data('position');

        if (!list) return;

        switch (list) {
            // Handle Host item lists...
            case 'ic':
                await this.item.removeIC(position);
                break;
        }
    }

    async _onAddLicense(event) {
        event.preventDefault();
        await this.item.addNewLicense();
    }

    async _onRemoveLicense(event) {
        event.preventDefault();
        const index = event.currentTarget.dataset.index;
        if (index >= 0) await this.item.removeLicense(index);
    }

    async _onWeaponModRemove(event) {
        await this._onOwnedItemRemove(event);
    }

    async _onWeaponModEquip(event) {
        await this.item.equipWeaponMod(this._eventId(event));
    }

    async _onAddWeaponMod(event) {
        event.preventDefault();
        const type = 'modification';
        // TODO: Move this into DataDefaults...
        const itemData = {
            name: `New ${Helpers.label(type)}`,
            type: type,
            system: {type: 'weapon'}
        };
        // @ts-ignore
        // itemData.data.type = 'weapon';
        // @ts-ignore
        const item = new SR5Item(itemData, {parent: this.item});
        //@ts-ignore TODO: foundry-vtt-types v10
        await this.item.createNestedItem(item._source);
    }

    async _onAmmoReload(event) {
        event.preventDefault();
        await this.item.reloadAmmo();
    }

    async _onAmmoRemove(event) {
        await this._onOwnedItemRemove(event);
    }

    async _onAmmoEquip(event) {
        await this.item.equipAmmo(this._eventId(event));
    }

    async _onAddNewAmmo(event) {
        event.preventDefault();
        const type = 'ammo';
        const itemData = {
            name: `New ${Helpers.label(type)}`,
            type: type
        };
        // @ts-ignore
        const item = new SR5Item(itemData, {parent: this.item});
        // @ts-ignore TODO: foundry-vtt-types v10
        await this.item.createNestedItem(item._source);
    }

    async _onOwnedItemRemove(event) {
        event.preventDefault();1

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.item.deleteOwnedItem(this._eventId(event));
    }

    async _onRemoveAllNetworkDevices(event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.item.removeAllNetworkDevices();
    }

    async _onRemoveNetworkDevice(event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const networkDeviceIndex = Helpers.parseInputToNumber(event.currentTarget.closest('.list-item').dataset.listItemIndex);

        await this.item.removeNetworkDevice(networkDeviceIndex);
    }

    /**
     * @private
     */
    _findActiveList() {
        return $(this.element).find('.tab.active .scroll-area');
    }

    /**
     * Add a tagify element for an action-modifier dom element.
     * 
     * Usage: Call method after render with a singular item's html sub-dom-tree.
     * 
     * @param html see DocumentSheet.activateListeners#html param for documentation.
     */
    _createActionModifierTagify(html) {
        var inputElement = html.find('input#action-modifier').get(0);

        // Tagify expects this format for localized tags.
        const whitelist = Object.keys(SR5.modifierTypes).map(modifier => ({
            value: game.i18n.localize(SR5.modifierTypes[modifier]),
            id: modifier
        }));

        // Tagify dropdown should show all whitelist tags. 
        const maxItems = Object.keys(SR5.modifierTypes).length;

        // Use localized label as value, and modifier as the later to be extracted value 
        const modifiers = this.item.system.action?.modifiers ?? []; 
        const tags = modifiers.map(modifier => ({
            value: game.i18n.localize(SR5.modifierTypes[modifier]),
            id: modifier
        }));

        const tagify = createTagify(inputElement, {whitelist, maxItems, tags});

        html.find('input#action-modifier').on('change', async (event) => {
            const modifiers = tagify.value.map(tag => tag.id);
            // render would loose tagify input focus. submit on close will save.
            await this.item.update({'system.action.modifiers': modifiers}, {render:false});
        });
    }

    /** This is needed to circumvent Application.close setting closed state early, due to it's async animation
     * - The length of the closing animation can't be longer then any await time in the closing cycle
     * - FormApplication._onSubmit will otherwise set ._state to RENDERED even if the Application window has closed already
     * - Subsequent render calls then will show the window again, due to it's state
     *
     * @private
     */
    private fixStaleRenderedState() {
        if (this._state === Application.RENDER_STATES.RENDERED && ui.windows[this.appId] === undefined) {
            console.warn(`SR5ItemSheet app for ${this.item.name} is set as RENDERED but has no window registered. Fixing app internal render state. This is a known bug.`);
            // Hotfixing instead of this.close() since FormApplication.close() expects form elements, which don't exist anymore.
            this._state = Application.RENDER_STATES.CLOSED;
        }
    }

    /**
     * @private
     */
    override async _render(force = false, options = {}) {
        // NOTE: This is for a timing bug. See function doc for code removal. Good luck, there be dragons here. - taM
        // this.fixStaleRenderedState();

        this._saveScrollPositions();
        await super._render(force, options);
        this._restoreScrollPositions();
    }

    /**
     * @private
     */
    override _restoreScrollPositions() {
        const activeList = this._findActiveList();
        if (activeList.length && this._scroll != null) {
            activeList.prop('scrollTop', this._scroll);
        }
    }

    /**
     * @private
     */
    override _saveScrollPositions() {
        const activeList = this._findActiveList();
        if (activeList.length) {
            this._scroll = activeList.prop('scrollTop');
        }
    }

    async _onMarksQuantityChange(event) {
        event.stopPropagation();

        if (!this.item.isHost) return;

        const markId = event.currentTarget.dataset.markId;
        if (!markId) return;

        const markedIdDocuments = Helpers.getMarkIdDocuments(markId);
        if (!markedIdDocuments) return;
        const {scene, target, item} = markedIdDocuments;
        if (!scene || !target) return; // item can be undefined.

        const marks = parseInt(event.currentTarget.value);
        await this.item.setMarks(target, marks, {scene, item, overwrite: true});
    }

    async _onMarksQuantityChangeBy(event, by: number) {
        event.stopPropagation();

        if (!this.item.isHost) return;

        const markId = event.currentTarget.dataset.markId;
        if (!markId) return;

        const markedIdDocuments = Helpers.getMarkIdDocuments(markId);
        if (!markedIdDocuments) return;
        const {scene, target, item} = markedIdDocuments;
        if (!scene || !target) return; // item can be undefined.

        await this.item.setMarks(target, by, {scene, item});
    }

    async _onMarksDelete(event) {
        event.stopPropagation();

        if (!this.item.isHost) return;

        const markId = event.currentTarget.dataset.markId;
        if (!markId) return;

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.item.clearMark(markId);
    }

    async _onMarksClearAll(event) {
        event.stopPropagation();

        if (!this.item.isHost) return;

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.item.clearMarks();
    }

    async _onOpenOriginLink(event) {
        event.preventDefault();

        console.log('Shadowrun 5e | Opening PAN/WAN network controller');

        const originLink = event.currentTarget.dataset.originLink;
        const device = await fromUuid(originLink);
        if (!device) return;

        // @ts-ignore
        device.sheet.render(true);
    }

    async _onControllerRemove(event) {
        event.preventDefault();

        await this.item.disconnectFromNetwork();
    }

    /**
     * Activate listeners for tagify elements for item types that allow changing action
     * modifiers.
     * 
     * @param html The JQuery HTML as given by the activateListeners method.
     */
    _activateTagifyListeners(html) {        
        if (!['action', 'equipment'].includes(this.document.type)) return;

        this._createActionModifierTagify(html);
    }

    /**
     * Helper to parse FoundryVTT DropData directly from it's source event
     * 
     * This is a legacy handler for earlier FoundryVTT versions, however it's good
     * practice to not trust faulty input and inform about.
     * 
     * @param event 
     * @returns undefined when an DropData couldn't be parsed from it's JSON.
     */
    parseDropData(event): any|undefined {
        try {
            return JSON.parse(event.dataTransfer.getData('text/plain'));
        } catch (error) {
            return console.log('Shadowrun 5e | Dropping a document onto an item sheet caused this error', error);
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
}
