import {Helpers} from '../helpers';
import {SR5Item} from './SR5Item';
import {SR5} from "../config";
import {onManageActiveEffect, prepareActiveEffectCategories} from "../effects";
import {ItemData} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs";

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
    static get defaultOptions() {
        // @ts-ignore // mergeObject breaks TypeScript typing. Should be fine.
        return mergeObject(super.defaultOptions, {
            classes: ['sr5', 'sheet', 'item'],
            width: 650,
            height: 450,
            tabs: [{ navSelector: '.tabs', contentSelector: '.sheetbody' }],
        });
    }

    get template() {
        const path = 'systems/shadowrun5e/dist/templates/item/';
        return `${path}${this.item.data.type}.html`;
    }

    /* -------------------------------------------- */

    /**
     * Prepare data for rendering the Item sheet
     * The prepared data object contains both the actor data as well as additional sheet options
     */
    async getData(options) {
        let data = super.getData(options);

        // Foundry 0.8 will return data as an sheet data while Foundry 0.7 will return data as an item data.
        // Therefore data is nested one deeper. The alternative would be to rework all references with one more data...
        //@ts-ignore
        data.type = data.data.type;
        // data.data = data.system = data.data;
        //@ts-ignore
        data.system = data.item.system;
        //@ts-ignore // TODO: remove TODO: foundry-vtt-types v10
        data.data = data.item.system;
        //@ts-ignore
        const itemData = this.item.system;
        //@ts-ignore
        // data.system.description.value = this.document.getChatData();

        if (itemData.action) {
            try {
                const { action } = itemData;
                if (action.mod === 0) delete action.mod;
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
                const tech = itemData.technology;
                if (tech.rating === 0) delete tech.rating;
                if (tech.quantity === 0) delete tech.quantity;
                if (tech.cost === 0) delete tech.cost;
            } catch (e) {
                console.log(e);
            }
        }

        data['config'] = SR5;
        const items = this.item.items;
        const [ammunition, weaponMods, armorMods] = items.reduce(
            (parts: [ItemData[], ItemData[], ItemData[]], item: SR5Item) => {
                if (item.type === 'ammo') parts[0].push(item.data);
                //@ts-ignore TODO: foundry-vtt-types v10
                if (item.type === 'modification' && "type" in item.system && item.system.type === 'weapon') parts[1].push(item._source);
                //@ts-ignore TODO: foundry-vtt-types v10
                if (item.type === 'modification' && "type" in item.system && item.system.type === 'armor') parts[2].push(item._source);
                return parts;
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
        data['effects'] = prepareActiveEffectCategories(this.document.effects);

        if (this.object.isHost()) {
            data['markedDocuments'] = this.object.getAllMarkedDocuments();
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
        data.descriptionHTML = await TextEditor.enrichHTML(this.item.system.description.value, {
            // secrets: this.item.isOwner,
            // rollData: this.actor.getRollData.bind(this.actor),
            // @ts-ignore TODO: foundry-vtt-types v10
            async: true,
            // relativeTo: this.item
          });

        return data;
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

        const activeSkillsForSelect = {};
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
        // return NetworkDeviceFlow.getNetworkDevices(this.document);
        return [];
    }

    /* -------------------------------------------- */

    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html -  The prepared HTML object ready to be rendered into the DOM
     */
    activateListeners(html) {
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
        html.find(".effect-control").click(event => onManageActiveEffect(event, this.document));

        /**
         * General item handling
         */
        html.find('.edit-item').click(this._onEditItem.bind(this));
        html.find('.open-source-pdf').on('click', this._onOpenSourcePdf.bind(this));
        html.find('.has-desc').click((event) => {
            event.preventDefault();
            const item = $(event.currentTarget).parents('.list-item');
            const iid = $(item).data().item;
            const field = item.next();
            field.toggle();
            if (iid) {
                if (field.is(':visible')) this._shownDesc.push(iid);
                else this._shownDesc = this._shownDesc.filter((val) => val !== iid);
            }
        });
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
    }

    async _onDrop(event) {
        if (!game.items || !game.actors || !game.scenes) return;

        event.preventDefault();
        event.stopPropagation();

        // Parse drop data.
        let data;
        try {
            data = JSON.parse(event.dataTransfer.getData('text/plain'));
        } catch (err) {
            return console.log('Shadowrun 5e | drop error');
        }

        if (!data) return;

        // Add items to a weapons modification / ammo
        if (this.item.isWeapon() && data.type === 'Item') {
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
        if (this.item.isHost() && data.type === 'Actor') {
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
    }

    _eventId(event) {
        event.preventDefault();
        return event.currentTarget.closest('.list-item').dataset.itemId;
    }

    async _onOpenSourcePdf(event) {
        event.preventDefault();
        await this.item.openPdfSource();
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
        // TODO: Move this into DefaultValues...
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

    /** This is needed to circumvent Application.close setting closed state early, due to it's async animation
     * - The length of the closing animation can't be longer then any await time in the closing cycle
     * - FormApplication._onSubmit will otherwise set ._state to RENDERED even if the Application window has closed already
     * - Subsequent render calls then will show the window again, due to it's state
     *
     * @private
     */
    private fixStaleRenderedState() {
        if (this._state === Application.RENDER_STATES.RENDERED && ui.windows[this.appId] === undefined) {
            console.warn(`SR5ItemSheet app for ${this.document.name} is set as RENDERED but has no window registered. Fixing app internal render state. This is a known bug.`);
            // Hotfixing instead of this.close() since FormApplication.close() expects form elements, which don't exist anymore.
            this._state = Application.RENDER_STATES.CLOSED;
        }
    }

    /**
     * @private
     */
    async _render(force = false, options = {}) {
        // NOTE: This is for a timing bug. See function doc for code removal. Good luck, there be dragons here. - taM
        // this.fixStaleRenderedState();

        this._saveScrollPositions();
        await super._render(force, options);
        this._restoreScrollPositions();
    }

    /**
     * @private
     */
    _restoreScrollPositions() {
        const activeList = this._findActiveList();
        if (activeList.length && this._scroll != null) {
            activeList.prop('scrollTop', this._scroll);
        }
    }

    /**
     * @private
     */
    _saveScrollPositions() {
        const activeList = this._findActiveList();
        if (activeList.length) {
            this._scroll = activeList.prop('scrollTop');
        }
    }

    async _onMarksQuantityChange(event) {
        event.stopPropagation();

        if (!this.object.isHost()) return;

        const markId = event.currentTarget.dataset.markId;
        if (!markId) return;

        const markedIdDocuments = Helpers.getMarkIdDocuments(markId);
        if (!markedIdDocuments) return;
        const {scene, target, item} = markedIdDocuments;
        if (!scene || !target) return; // item can be undefined.

        const marks = parseInt(event.currentTarget.value);
        await this.object.setMarks(target, marks, {scene, item, overwrite: true});
    }

    async _onMarksQuantityChangeBy(event, by: number) {
        event.stopPropagation();

        if (!this.object.isHost()) return;

        const markId = event.currentTarget.dataset.markId;
        if (!markId) return;

        const markedIdDocuments = Helpers.getMarkIdDocuments(markId);
        if (!markedIdDocuments) return;
        const {scene, target, item} = markedIdDocuments;
        if (!scene || !target) return; // item can be undefined.

        await this.object.setMarks(target, by, {scene, item});
    }

    async _onMarksDelete(event) {
        event.stopPropagation();

        if (!this.object.isHost()) return;

        const markId = event.currentTarget.dataset.markId;
        if (!markId) return;

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.object.clearMark(markId);
    }

    async _onMarksClearAll(event) {
        event.stopPropagation();

        if (!this.object.isHost()) return;

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.object.clearMarks();
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
}
