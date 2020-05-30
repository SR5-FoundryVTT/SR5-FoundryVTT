import { Helpers } from '../helpers.js';

/**
 * Extend the basic ItemSheet with some very simple modifications
 */
export class SR5ItemSheet extends ItemSheet {
    constructor(...args) {
        super(...args);
    }

    /**
     * Extend and override the default options used by the Simple Item Sheet
     * @returns {Object}
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['sr5', 'sheet', 'item'],
            width: 650,
            height: 450,
            tabs: [{ navSelector: '.tabs', contentSelector: '.sheetbody' }],
        });
    }

    get template() {
        const path = 'systems/shadowrun5e/templates/item/';
        return `${path}${this.item.data.type}.html`;
    }

    /* -------------------------------------------- */

    /**
     * Prepare data for rendering the Item sheet
     * The prepared data object contains both the actor data as well as additional sheet options
     */
    getData() {
        const data = super.getData();
        const itemData = data.data;

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

        data.config = CONFIG.SR5;
        const items = this.item.items || [];
        const [ammunition, weaponMods, armorMods] = items.reduce((parts, item) => {
            console.log(item);
            if (item.type === 'ammo') parts[0].push(item);
            if (item.type === 'modification' && item.data.data.type === 'weapon') parts[1].push(item);
            if (item.type === 'modification' && item.data.data.type === 'armor') parts[2].push(item);
            return parts;
        }, [[], [], []])
        console.log(ammunition);
        console.log(weaponMods);
        data.ammunition = ammunition;
        data.weaponMods = weaponMods;
        data.armorMods = armorMods;

        return data;
    }

    /* -------------------------------------------- */

    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
     */
    activateListeners(html) {
        super.activateListeners(html);
        if (this.item.type === 'weapon') {
            this.form.ondragover = (event) => this._onDragOver(event);
            this.form.ondrop = (event) => this._onDrop(event);
        }
        html.find('.add-new-ammo').click(this._onAddNewAmmo.bind(this));
        html.find('.ammo-equip').click(this._onAmmoEquip.bind(this));
        html.find('.ammo-delete').click(this._onAmmoRemove.bind(this));
        html.find('.ammo-reload').click(this._onAmmoReload.bind(this));

        html.find('.edit-item').click(this._onEditItem.bind(this));

        html.find('.add-new-mod').click(this._onAddWeaponMod.bind(this));
        html.find('.mod-equip').click(this._onWeaponModEquip.bind(this));
        html.find('.mod-delete').click(this._onWeaponModRemove.bind(this));

        html.find('.add-new-license').click(this._onAddLicense.bind(this));
    }

    _onDragOver(event) {
        event.preventDefault();
        return false;
    }

    async _onDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        let data;
        try {
            data = JSON.parse(event.dataTransfer.getData('text/plain'));
            if (data.type !== 'Item') {
                console.log('Shadowrun5e | Can only drop Items');
            }
        } catch (err) {
            console.log('Shadowrun5e | drop error');
        }
        let item;
        // Case 1 - Data explicitly provided
        if (data.data) {
            // TODO test
            if (
                this.item.isOwned &&
                data.actorId === this.item.actor._id &&
                data.data._id === this.item.data._id
            ) {
                console.log('Shadowrun5e | Cant drop item on itself');
                ui.notifications.error('Are you trying to break the game??');
            }
            item = data;
        } else if (data.pack) {
            console.log(data);
            // Case 2 - From a Compendium Pack
            // TODO test
            item = await this._getItemFromCollection(data.pack, data.id);
        } else {
            // Case 3 - From a World Entity
            item = game.items.get(data.id);
        }

        this.item.createOwnedItem(item.data);
    }

    _getItemFromCollection(collection, itemId) {
        const pack = game.packs.find((p) => (p.collection === collection));
        return pack.getEntity(itemId);
    }

    async _onEditItem(event) {
        event.preventDefault();
        const iid = event.currentTarget.closest('.item').dataset.itemId;
        this.item.editItem(iid);
    }

    async _onAddLicense(event) {
        event.preventDefault();
        this.item.addNewLicense();
    }

    async _onWeaponModRemove(event) {
        event.preventDefault();
        const iid = event.currentTarget.closest('.item').dataset.itemId;
        this.item.deleteOwnedItem(iid);
    }

    async _onWeaponModEquip(event) {
        event.preventDefault();
        const iid = event.currentTarget.closest('.item').dataset.itemId;
        this.item.equipWeaponMod(iid);
    }

    async _onAddWeaponMod(event) {
        event.preventDefault();
        const type = 'modification';
        const itemData = {
            name: `New ${Helpers.label(type)}`,
            type: type,
            data: duplicate(game.system.model.Item.modification),
        };
        itemData.data.type = 'weapon';
        const item = Item.createOwned(itemData, this.item);
        this.item.createOwnedItem(item.data);
    }

    async _onAmmoReload(event) {
        event.preventDefault();
        this.item.reloadAmmo();
    }

    async _onAmmoRemove(event) {
        event.preventDefault();
        const iid = event.currentTarget.closest('.item').dataset.itemId;
        this.item.deleteOwnedItem(iid);
    }

    async _onAmmoEquip(event) {
        event.preventDefault();
        const iid = event.currentTarget.closest('.item').dataset.itemId;
        this.item.equipAmmo(iid);
    }

    _onAddNewAmmo(event) {
        event.preventDefault();
        const type = 'ammo';
        const itemData = {
            name: `New ${Helpers.label(type)}`,
            type: type,
            data: duplicate(game.system.model.Item.ammo),
        };
        const item = Item.createOwned(itemData, this.item);
        this.item.createOwnedItem(item.data);
    }

    /**
     * @private
     */
    _findActiveList() {
        return this.element.find('.tab.active .scroll-area');
    }

    /**
     * @private
     */
    async _render(force = false, options = {}) {
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
}
