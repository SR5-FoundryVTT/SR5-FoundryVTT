import { Helpers } from '../helpers';
import { SR5Item } from './SR5Item';
import SR5ActorSheetData = Shadowrun.SR5ActorSheetData;
import {SR5Actor} from "../actor/SR5Actor";
import SR5ItemType = Shadowrun.SR5ItemType;
import {SR5} from "../config";

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
    async getData() {
        const data = await super.getData();
        // TODO: Foundry 0.8 will return data as an sheet data while Foundry 0.7 will return data as an item data. Therefore data is nested one deeper.
        data.data = data.data.data;
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
        if (!actor) return Helpers.sortConfigValuesByTranslation(SR5.activeSkills);

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

    /* -------------------------------------------- */

    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html -  The prepared HTML object ready to be rendered into the DOM
     */
    activateListeners(html) {
        super.activateListeners(html);
        if (this.item.type === 'weapon') {
            //@ts-ignore // TODO: Somehow Jquery doesn't have drag/drop in typing
            this.form.ondragover = (event) => this._onDragOver(event);
            //@ts-ignore // TODO: Somehow Jquery doesn't have drag/drop in typing
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
        html.find('.license-delete').on('click', this._onRemoveLicense.bind(this));

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
            if (this.item.isOwned && data.actorId === this.item.actor?._id && data.data._id === this.item._id) {
                console.log('Shadowrun5e | Cant drop item on itself');
                // @ts-ignore
                ui.notifications?.error('Are you trying to break the game??');
            }
            item = data;
        } else if (data.pack) {
            console.log(data);
            // Case 2 - From a Compendium Pack
            // TODO test
            item = await this._getItemFromCollection(data.pack, data.id);
        } else {
            // Case 3 - From a World Entity
            item = game.items?.get(data.id);
        }

        this.item.createOwnedItem(item.data);
    }

    _getItemFromCollection(collection, itemId) {
        const pack = game.packs?.find((p) => p.collection === collection);
        if (!pack) return;
        return pack.getEntity(itemId);
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
            data: duplicate(game.system.model.Item.modification),
        };
        // @ts-ignore
        itemData.data.type = 'weapon';
        // @ts-ignore
        const item = Item.createOwned(itemData, this.item);
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
            type: type,
            data: duplicate(game.system.model.Item.ammo),
        };
        // @ts-ignore
        const item = Item.createOwned(itemData, this.item);
        await this.item.createOwnedItem(item.data);
    }

    async _onOwnedItemRemove(event) {
         event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.item.deleteOwnedItem(this._eventId(event));
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
            console.warn(`SR5ItemSheet app for ${this.entity.name} is set as RENDERED but has no window registered. Fixing app internal render state. This is a known bug.`);
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
}
