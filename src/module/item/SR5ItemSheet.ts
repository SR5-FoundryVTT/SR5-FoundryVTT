import {Helpers} from '../helpers';
import {SR5Item} from './SR5Item';
import {SR5} from "../config";
import {onManageActiveEffect, prepareActiveEffectCategories} from "../effects";
import {SR5Actor} from "../actor/SR5Actor";
import {DeviceFlow} from "./flows/DeviceFlow";

/**
 * Extend the basic ItemSheet with some very simple modifications
 */
// TODO: Check foundry-vtt-types systems for how to do typing...
export class SR5ItemSheet extends ItemSheet<any, any> {
    private _shownDesc: any[] = [];
    private _scroll: string;

    getEmbeddedItems() {
        return this.item.items || [];
    }

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
    getData() {
        let data = super.getData();
        // Foundry 0.8 will return data as an sheet data while Foundry 0.7 will return data as an item data.
        // Therefore data is nested one deeper. The alternative would be to rework all references with one more data...
        data.type = data.data.type;
        data.data = data.data.data;
        const itemData = data.data;
        // data = {
        //     ...data,
        //     // @ts-ignore
        //     data: data.data.data
        // }


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
        const items = this.getEmbeddedItems();
        const [ammunition, weaponMods, armorMods] = items.reduce(
            (parts: [Item.Data[], Item.Data[], Item.Data[]], item: SR5Item) => {
                if (item.type === 'ammo') parts[0].push(item.data);
                if (item.type === 'modification' && "type" in item.data.data && item.data.data.type === 'weapon') parts[1].push(item.data);
                if (item.type === 'modification' && "type" in item.data.data && item.data.data.type === 'armor') parts[2].push(item.data);
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
        // @ts-ignore // TODO: foundry-vtt-types 0.8 missing document support
        data['effects'] = prepareActiveEffectCategories(this.document.effects);

        if (this.object.isHost()) {
            data['markedDocuments'] = this.object.getAllMarkedDocuments();
        }

        if (this.item.isHost() || this.item.isDevice()) {
            data['networkDevices'] = this._getNetworkDevices();
        }

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

    _getNetworkDevices(): SR5Item|SR5Actor[] {
        const controllerData = this.item.asControllerData();
        if (!controllerData) return [];

        return controllerData.data.networkDevices.map(deviceLink => DeviceFlow.documentByNetworkDeviceLink(deviceLink));
    }

    /* -------------------------------------------- */

    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html -  The prepared HTML object ready to be rendered into the DOM
     */
    activateListeners(html) {
        super.activateListeners(html);

        /**
         * Drag and Drop Handling
         */
        //@ts-ignore
        this.form.ondragover = (event) => this._onDragOver(event);
        //@ts-ignore
        this.form.ondrop = (event) => this._onDrop(event);

        // Active Effect management
        // @ts-ignore // foundry-vtt-types 0.8 document support missing.
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
    }

    _onDragOver(event) {
        event.preventDefault();
        return false;
    }

    async _onDrop(event) {
        event.preventDefault();
        event.stopPropagation();

        // Parse drop data.
        let data;
        try {
            data = JSON.parse(event.dataTransfer.getData('text/plain'));
        } catch (err) {
            console.log('Shadowrun5e | drop error');
            return;
        }

        if (!data) return;

        // Weapon parts...
        if (this.item.isWeapon() && data.type === 'Item') {
            let item;
            // Case 1 - Data explicitly provided
            if (data.data) {
                // TODO test
                if (this.item.isOwned && data.actorId === this.item.actor?._id && data.data._id === this.item._id) {
                    // @ts-ignore
                    ui.notifications.error('Are you trying to break the game??');
                    return;
                }
                item = data;
            // Case 2 - From a Compendium Pack
            } else if (data.pack) {
                item = await Helpers.getEntityFromCollection(data.pack, data.id);
            // Case 3 - From a World Entity
            } else {
                item = game.items.get(data.id);
            }

            await this.item.createOwnedItem(item.data);

            return;
        }

        // TODO: Handle WAN
        if (this.item.isHost() && data.type === 'Actor') {
            await this.item.addIC(data.id, data.pack);

            return;
        }

        // PAN Support...
        if (this.item.isDevice() && data.type === 'Item') {
            if (data.actorId && !data.sceneId && !data.tokenId) {
                console.log('Shadowrun5e | Adding linked actors item to the network', data);
                const actor = game.actors.get(data.actorId);
                const item = actor.items.get(data.data._id) as SR5Item;

                await this.item.addNetworkDevice(item);
            }

            else if (data.actorId && data.sceneId && data.tokenId) {
                console.log('Shadowrun5e | Adding unlinked token actors item to the network', data);
                const scene = game.scenes.get(data.sceneId);
                // @ts-ignore // TODO: foundry-vtt-types 0.8
                const token = scene.tokens.get(data.tokenId);
                const item = token.actor.items.get(data.data._id) as SR5Item;

                await this.item.addNetworkDevice(item);
            }

            else if (data.id && !data.actorId && !data.sceneId && !data.tokenId) {
                console.log('Shadowrun5e | Adding collection item without actor to the network', data);
            }

            return;
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
            item.sheet.render(true);
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
            data: {type: 'weapon'}
        };
        // @ts-ignore
        // itemData.data.type = 'weapon';
        // @ts-ignore
        const item = new SR5Item(itemData, {parent: this.item});
        await this.item.createOwnedItem(item.data);
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
        await this.item.createOwnedItem(item.data);
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
        if (!canvas.ready) return;
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        // const tokenId = event.currentTarget.closest('.list-item').dataset.tokenId;
        // const actorId = event.currentTarget.closest('.list-item').dataset.actorId;
        // const itemId = event.currentTarget.closest('.list-item').dataset.itemId;
        //
        // // Get the item from the token actor OR the collection actor.
        // // A collection actor will not have a token on it's token property.
        // const item = tokenId ?
        //     // @ts-ignore // TODO: foundry-vtt-types 0.8
        //     canvas.scene.tokens.get(tokenId).actor.items.get(itemId) :
        //     game.actors.get(actorId).items.get(itemId);
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
            // @ts-ignore // TODO: 0.8 foundry-vtt-types doesn't know of DocumentSheet.document yet.
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

        const {scene, target, item} = Helpers.getMarkIdDocuments(markId);
        if (!scene || !target) return; // item can be undefined.

        const marks = parseInt(event.currentTarget.value);
        await this.object.setMarks(target, marks, {scene, item, overwrite: true});
    }

    async _onMarksQuantityChangeBy(event, by: number) {
        event.stopPropagation();

        if (!this.object.isHost()) return;

        const markId = event.currentTarget.dataset.markId;
        if (!markId) return;

        const {scene, target, item} = Helpers.getMarkIdDocuments(markId);
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
}
