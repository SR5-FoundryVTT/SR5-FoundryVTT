import { RangedWeaponRules } from './../rules/RangedWeaponRules';
import { Helpers } from '../helpers';
import { SR5Item } from './SR5Item';
import { SR5 } from "../config";
import { onManageActiveEffect, prepareSortedEffects, prepareSortedItemEffects } from "../effects";
import { createTagify, parseDropData } from '../utils/sheets';
import { SR5Actor } from '../actor/SR5Actor';
import { SR5ActiveEffect } from '../effect/SR5ActiveEffect';
import { ActionFlow } from './flows/ActionFlow';
import RangeData = Shadowrun.RangeData;

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
    effects: SR5ActiveEffect[]
    itemEffects: SR5ActiveEffect[]
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
    vehicleMods: Shadowrun.ModificationItemData[]
    droneMods: Shadowrun.ModificationItemData[]

    // Sorted lists for usage in select elements.
    activeSkills: Record<string, string> // skill id: label
    attributes: Record<string, string>  // key: label
    limits: Record<string, string> // key: label

    // Host Item.
    markedDocuments: Shadowrun.MarkedDocument[]
    networkDevices: (SR5Item | SR5Actor)[]
    networkController: SR5Item | undefined

    // Action Items. (not only type = action)
    //@ts-expect-error
    tests: typeof game.shadowrun5e.tests
    // @ts-expect-error
    opposedTests: typeof game.shadowrun5e.opposedTests
    // @ts-expect-error
    activeTests: typeof game.shadowrun5e.activeTests
    // @ts-expect-error
    resistTests: typeof game.shadowrun5e.resistTests

    // Rendered description field
    descriptionHTML: string

    // Can be used to check if the source field contains a URL.
    sourceIsURL: boolean
    sourceIsPDF: boolean
    sourceIsUuid: boolean

    isUsingRangeCategory: boolean
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
        return foundry.utils.mergeObject(super.defaultOptions, {
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
        data.type = data.data.type;
        data.system = data.item.system;
        //@ts-expect-error // TODO: remove TODO: foundry-vtt-types v10
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
        const itemTypes = this.item.items.reduce(
            (sheetItemData: [Shadowrun.AmmoItemData[], Shadowrun.ModificationItemData[], Shadowrun.ModificationItemData[], Shadowrun.ModificationItemData[], Shadowrun.ModificationItemData[]], nestedItem: SR5Item) => {
                const itemData = nestedItem.toObject();
                // itemData.descriptionHTML = await TextEditor.enrichHTML(itemData.system.description.value);

                //@ts-expect-error
                if (nestedItem.type === 'ammo') sheetItemData[0].push(itemData); // TODO: foundry-vtt-types v10
                //@ts-expect-error TODO: foundry-vtt-types v10
                if (nestedItem.type === 'modification' && "type" in nestedItem.system && nestedItem.system.type === 'weapon') sheetItemData[1].push(itemData);
                //@ts-expect-error TODO: foundry-vtt-types v10
                if (nestedItem.type === 'modification' && "type" in nestedItem.system && nestedItem.system.type === 'armor') sheetItemData[2].push(itemData);
                //@ts-expect-error TODO: foundry-vtt-types v10
                if (nestedItem.type === 'modification' && "type" in nestedItem.system && nestedItem.system.type === 'vehicle') sheetItemData[3].push(itemData);
                //@ts-expect-error TODO: foundry-vtt-types v10
                if (nestedItem.type === 'modification' && "type" in nestedItem.system && nestedItem.system.type === 'drone') sheetItemData[4].push(itemData);

                return sheetItemData;
            },
            [[], [], [], [], []],
        );

        for (const itemType of itemTypes) {
            for (const item of itemType) {
                // @ts-expect-error
                item.descriptionHTML = await TextEditor.enrichHTML(item.system.description.value);
            }
        }

        const [ammunition, weaponMods, armorMods, vehicleMods, droneMods] = itemTypes;
        data['ammunition'] = ammunition;
        data['weaponMods'] = weaponMods;
        data['armorMods'] = armorMods;
        data['vehicleMods'] = vehicleMods;
        data['droneMods'] = droneMods;
        data['activeSkills'] = this._getSortedActiveSkillsForSelect();
        data['attributes'] = this._getSortedAttributesForSelect();
        data['limits'] = this._getSortedLimitsForSelect();

        data['effects'] = prepareSortedEffects(this.item.effects.contents);
        data['itemEffects'] = prepareSortedItemEffects(this.object);

        if (this.item.isHost) {
            data['markedDocuments'] = this.item.getAllMarkedDocuments();
        }

        if (this.item.canBeNetworkController) {
            data['networkDevices'] = await this.item.networkDevices();
        }

        if (this.item.canBeNetworkDevice) {
            data['networkController'] = await this.item.networkController();
        }

        // Provide action parts with all test variants.
        // @ts-expect-error // TODO: put 'opposed test types' into config (see data.config)
        data.tests = game.shadowrun5e.tests;
        // @ts-expect-error
        data.opposedTests = game.shadowrun5e.opposedTests;
        // @ts-expect-error
        data.activeTests = game.shadowrun5e.activeTests;
        // @ts-expect-error
        data.resistTests = game.shadowrun5e.resistTests;

        // @ts-expect-error TODO: foundry-vtt-types v10
        data.descriptionHTML = await this.enrichEditorFieldToHTML(this.item.system.description.value);
        data.sourceIsURL = this.item.sourceIsUrl;
        data.sourceIsPDF = this.item.sourceIsPDF;
        data.sourceIsUuid = this.item.sourceIsUuid

        data.isUsingRangeCategory = this.item.isUsingRangeCategory;

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
    async enrichEditorFieldToHTML(editorValue: string, options: any = { async: false }): Promise<string> {
        return await TextEditor.enrichHTML(editorValue, options);
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
        // Instead of item.parent, use the actorOwner as NestedItems have an actor grand parent.
        return ActionFlow.sortedActiveSkills(this.item.actorOwner, this.document.system.action?.skill);
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
        //@ts-expect-error
        this.form.ondragover = (event) => {
            this._onDragOver(event);
        }
        //@ts-expect-error
        this.form.ondrop = (event) => this._onDrop(event);

        // Active Effect management
        html.find(".effect-control").click(event => onManageActiveEffect(event, this.item));

        /**
         * General item handling
         */
        html.find('.edit-item').click(this._onEditItem.bind(this));
        html.find('.open-source').on('click', this._onOpenSource.bind(this));
        html.find('.has-desc').click(this._onListItemToggleDescriptionVisibility.bind(this));
        html.find('.hidden').hide();
        html.find('.entity-remove').on('click', this._onEntityRemove.bind(this));

        /**
         * Weapon item specific
         */
        html.find('.add-new-ammo').click(this._onAddNewAmmo.bind(this));
        html.find('.ammo-equip').click(this._onAmmoEquip.bind(this));
        html.find('select[name="change-ammo"]').on('change', async (event) => this._onAmmoEquip(event.target.value));
        html.find('.ammo-delete').click(this._onAmmoRemove.bind(this));
        html.find('.ammo-reload').on('click', async (event) => this._onAmmoReload(event, false));
        html.find('select[name="change-clip-type"]').on('change', async (event) => this._onClipEquip(event.target.value));

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

        // Freshly imported item toggle
        html.find('.toggle-fresh-import-off').on('click', async (event) => this._toggleFreshImportFlag(event, false));

        html.find('.select-ranged-range-category').on('change', this._onSelectRangedRangeCategory.bind(this));
        html.find('.select-thrown-range-category').on('change', this._onSelectThrownRangeCategory.bind(this));

        html.find('input[name="system.technology.equipped"').on('change', this._onToggleEquippedDisableOtherDevices.bind(this))

        html.find('.list-item').each(this._addDragSupportToListItemTemplatePartial.bind(this));

        this._activateTagifyListeners(html);
    }

    _addDragSupportToListItemTemplatePartial(i, item) {
        if (item.dataset && item.dataset.itemId) {
            item.setAttribute('draggable', true);
            item.addEventListener('dragstart', this._onDragStart.bind(this), false);
        }
    }

    override async _onDragStart(event) {
        const element = event.currentTarget;
        if (element) {
            // Create drag data object to use
            const dragData = {
                actor: this.item.actor,
                actorId: this.item.actor?.id,
                itemId: this.item.id,
                type: '',
                data: {}
            };

            switch (element.dataset.itemType) {
                // if we are dragging an active effect, get the effect from our list of effects and set it in the data transfer
                case 'ActiveEffect':
                {
                    const effectId = element.dataset.itemId;
                    const effect = this.item.effects.get(effectId);
                    if (effect) {
                        // Prepare data transfer
                        dragData.type = 'ActiveEffect';
                        dragData.data = effect; // this may blow up

                        // Set data transfer
                        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
                        return;
                    }
                }
            }
        }
        return super._onDragStart(event);
    }


    override async _onDrop(event) {
        if (!game.items || !game.actors || !game.scenes) return;

        event.preventDefault();
        event.stopPropagation();

        // Parse drop data.
        const data = parseDropData(event);
        if (!data) return;


        // CASE - Handle dropping of documents directly into the source field like urls and pdfs.
        if (event.toElement.name === 'system.description.source') {
            this.item.setSource(data.uuid);
            return;
        }
        
        // CASE - Handle ActiveEffects
        if (data.type === 'ActiveEffect') {
            if (data.itemId === this.item.id) {
                return; // don't add effects to ourselves
            }
            // the effect should be just the data itself
            const effect = data.data;
            // delete the id on it so a new one is generated
            delete effect._id;
            // add this to the embedded ActiveEffect documents
            await this.item.createEmbeddedDocuments('ActiveEffect', [effect]);

            return;
        }

        // CASE - Add items to a weapons modification / ammo
        if (this.item.isWeapon && data.type === 'Item') {
            let item;
            // Case 1 - Data explicitly provided
            if (data.data) {
                if (this.item.isOwned && data.actorId === this.item.actor?.id && data.data._id === this.item.id) {
                    return console.warn('Shadowrun 5e | Cant drop items onto themselves');
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
            return await this.item.addIC(actor.id, data.pack);
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

            if (!actor.isVehicle()) {
                return ui.notifications?.error(game.i18n.localize('SR5.Errors.CanOnlyAddTechnologyItemsToANetwork'));
            }

            return await this.item.addNetworkDevice(actor);
        }
    }

    _eventId(event) {
        event.preventDefault();
        return event.currentTarget.closest('.list-item').dataset.itemId;
    }

    async _onOpenSource(event) {
        event.preventDefault();
        await this.item.openSource();
    }

    async _onSelectRangedRangeCategory(event) {
        await this._onSelectRangeCategory("system.range.ranges", event);
    }

    async _onSelectThrownRangeCategory(event) {
        await this._onSelectRangeCategory("system.thrown.ranges", event);
    }

    async _onSelectRangeCategory(key: string, event) {
        event.stopPropagation();
        const selectedRangeCategory = event.currentTarget.value as keyof typeof SR5.weaponRangeCategories;

        if (selectedRangeCategory === "manual") {
            await this.item.update({
                [key]: {
                    category: selectedRangeCategory,
                },
            });
        } else {
            const ranges: Omit<RangeData, 'category'> = SR5.weaponRangeCategories[selectedRangeCategory].ranges;

            await this.item.update({
                [key]: {
                    ...ranges,
                    attribute: ranges.attribute || null, //Clear attribute if necessary
                    category: selectedRangeCategory,
                },
            });
        }
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
            if (slot === changedSlot) {
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
            name: `${game.i18n.localize('SR5.New')} ${Helpers.label(game.i18n.localize(SR5.itemTypes[type]))}`,
            type: type,
            system: { type: 'weapon' }
        };
        // @ts-expect-error
        const item = new SR5Item(itemData, { parent: this.item });
        //@ts-expect-error TODO: foundry-vtt-types v10
        await this.item.createNestedItem(item._source);
    }

    async _onAmmoReload(event, partialReload: boolean) {
        event.preventDefault();
        await this.item.reloadAmmo(partialReload);
    }

    async _onAmmoRemove(event) {
        await this._onOwnedItemRemove(event);
    }

    async _onAmmoEquip(input) {
        let id;

        if (input.currentTarget) {
            id = this._eventId(input);
        } else {
            id = input;
        }

        await this.item.equipAmmo(id);
    }

    async _onAddNewAmmo(event) {
        event.preventDefault();
        const type = 'ammo';
        const itemData = {
            name: `${game.i18n.localize('SR5.New')} ${Helpers.label(game.i18n.localize(SR5.itemTypes[type]))}`,
            type: type
        };
        // @ts-expect-error
        const item = new SR5Item(itemData, { parent: this.item });
        // @ts-expect-error TODO: foundry-vtt-types v10
        await this.item.createNestedItem(item._source);
    }

    async _onClipEquip(clipType: string) {
        if (!clipType || !Object.keys(SR5.weaponCliptypes).includes(clipType)) return;
        
        const agilityValue = this.item.actor ? this.item.actor.getAttribute('agility').value : 0;
        await this.item.update({
            'system.ammo.clip_type': clipType,
            'system.ammo.partial_reload_value': RangedWeaponRules.partialReload(clipType, agilityValue)
        }, { render: true });
    }

    async _onOwnedItemRemove(event) {
        event.preventDefault();

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
     * Only action items will trigger the creation of a tagify element.
     *
     * @param html see DocumentSheet.activateListeners#html param for documentation.
     */
    _createActionModifierTagify(html) {
        const inputElement = html.find('input#action-modifier').get(0);

        if (!inputElement) {
            console.error('Shadowrun 5e | Action item sheet does not contain an action-modifier input element');
            return;
        }

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

        const tagify = createTagify(inputElement, { whitelist, maxItems, tags });

        html.find('input#action-modifier').on('change', async (event) => {
            const modifiers = tagify.value.map(tag => tag.id);
            // render would loose tagify input focus. submit on close will save.
            await this.item.update({ 'system.action.modifiers': modifiers }, { render: false });
        });
    }

    /**
     * Add a tagify element for an action-categories dom element.
     * 
     * Usage: Call method after render with a singular item's html sub-dom-tree.
     * 
     * Only action items will trigger the creation of a tagify element.
     * @param html 
     */
    _createActionCategoriesTagify(html) {
        const inputElement = html.find('input#action-categories').get(0) as HTMLInputElement;

        if (!inputElement) {
            console.error('Shadowrun 5e | Action item sheet does not contain an action-categories input element');
            return;
        }

        // Tagify expects this format for localized tags.
        const whitelist = Object.keys(SR5.actionCategories).map(category => ({
            value: game.i18n.localize(SR5.actionCategories[category]),
            id: category
        }));

        // Tagify dropdown should show all whitelist tags.
        const maxItems = Object.keys(SR5.actionCategories).length;

        // Use localized label as value, and category as the later to be extracted value
        const categories = this.item.system.action?.categories ?? [];
        const tags = categories.map(category => ({
            value: game.i18n.localize(SR5.actionCategories[category]) ?? category,
            id: category
        }));

        const tagify = createTagify(inputElement, { whitelist, maxItems, tags });

        html.find('input#action-categories').on('change', async (event) => {
            // Custom tags will not have an id, so use value as id.
            const categories = tagify.value.map(tag => tag.id ?? tag.value);
            // render would loose tagify input focus. submit on close will save.
            await this.item.update({ 'system.action.categories': categories }, { render: false });
        });
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
        const { scene, target, item } = markedIdDocuments;
        if (!scene || !target) return; // item can be undefined.

        const marks = parseInt(event.currentTarget.value);
        await this.item.setMarks(target, marks, { scene, item, overwrite: true });
    }

    async _onMarksQuantityChangeBy(event, by: number) {
        event.stopPropagation();

        if (!this.item.isHost) return;

        const markId = event.currentTarget.dataset.markId;
        if (!markId) return;

        const markedIdDocuments = Helpers.getMarkIdDocuments(markId);
        if (!markedIdDocuments) return;
        const { scene, target, item } = markedIdDocuments;
        if (!scene || !target) return; // item can be undefined.

        await this.item.setMarks(target, by, { scene, item });
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

        // @ts-expect-error
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
        if (!['action', 'metamagic', 'bioware', 'cyberware', 'equipment', 'quality', 'ritual', 'call_in_action', 'sprite_power', 'critter_power', 'adept_power'].includes(this.document.type)) return;

        this._createActionModifierTagify(html);
        this._createActionCategoriesTagify(html);
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
     * Toggle to isFreshImport property of importFlags for an item
     *
     * @param event
     */
    async _toggleFreshImportFlag(event, onOff: boolean) {
        console.debug('Toggling isFreshImport on item to ->', onOff, event);
        const item = this.item;
        if (item.system.importFlags) {
            await item.update({ 'system.importFlags.isFreshImport': onOff });
        }
    }

    /**
     * Clicking on equipped status should trigger unequipping all other devices of the same type.
     * @param event Click event on the equipped checkbox.
     */
    async _onToggleEquippedDisableOtherDevices(event: PointerEvent) {
        event.preventDefault();

        // Assure owned item device.
        if (!(this.document.parent instanceof SR5Actor)) return;
        if (!this.document.isDevice) return;
        if (!this.document.isEquipped()) return;

        await this.document.parent.equipOnlyOneItemOfType(this.document);
    }
}
