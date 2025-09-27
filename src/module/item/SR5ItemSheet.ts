import { RangedWeaponRules } from './../rules/RangedWeaponRules';
import { Helpers } from '../helpers';
import { SR5Item } from './SR5Item';
import { SR5 } from "../config";
import { onManageActiveEffect, prepareSortedEffects, prepareSortedItemEffects } from "../effects";
import { createTagify, parseDropData } from '../utils/sheets';
import { SR5Actor } from '../actor/SR5Actor';
import { SR5ActiveEffect } from '../effect/SR5ActiveEffect';
import { ActionFlow } from './flows/ActionFlow';
import { AmmunitionType, RangeType } from '../types/item/Weapon';
import { ActorMarksFlow } from '../actor/flows/ActorMarksFlow';
import { MatrixRules } from '../rules/MatrixRules';
import { SINFlow } from './flows/SINFlow';
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';

// eslint-disable-next-line @typescript-eslint/no-use-before-define
import RenderContext = foundry.applications.sheets.ItemSheet.RenderContext;
import SR5ApplicationMixin from '@/module/handlebars/SR5ApplicationMixin';
import { SheetFlow } from '@/module/flows/SheetFlow';

const { ItemSheet } = foundry.applications.sheets;

/**
 * Shadowrun 5e ItemSheetData typing shared across all item types
 */
export interface SR5BaseItemSheetData extends RenderContext {
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
    ammunition: SR5Item<'ammo'>[]
    weaponMods: SR5Item<'modification'>[]
    armorMods: SR5Item<'modification'>[]
    vehicleMods: SR5Item<'modification'>[]
    droneMods: SR5Item<'modification'>[]

    // Sorted lists for usage in select elements.
    activeSkills: Record<string, string> // skill id: label
    attributes: Record<string, string>  // key: label
    limits: Record<string, string> // key: label

    // Host Item.
    markedDocuments: Shadowrun.MarkedDocument[]
    slaves: (SR5Item | SR5Actor)[]
    master: SR5Item | null

    // Contact Item
    linkedActor: SR5Actor | undefined

    // Action Items. (not only type = action)
    tests: typeof game.shadowrun5e.tests
    opposedTests: typeof game.shadowrun5e.opposedTests
    activeTests: typeof game.shadowrun5e.activeTests
    resistTests: typeof game.shadowrun5e.resistTests

    // Rendered description field
    descriptionHTML: string

    // Can be used to check if the source field contains a URL.
    sourceIsURL: boolean
    sourceIsPDF: boolean
    sourceIsUuid: boolean

    isUsingRangeCategory: boolean

    // Define if the miscellaneous tab is shown or not.
    showMiscTab: boolean

    // Misc. Tab has different sections that can be shown or hidden.
    miscMatrixPart: boolean

    // Allow users to view what values is calculated and what isn´t
    calculatedEssence: boolean
    calculatedCost: boolean
    calculatedAvailability: boolean
    ratingForCalculation: boolean
}

/**
 * Extend the basic ItemSheet with some very simple modifications
 */
export class SR5ItemSheet<T extends SR5BaseItemSheetData = SR5ItemSheetData> extends SR5ApplicationMixin(ItemSheet)<T> {
    declare protected _isEditMode;

    static override DEFAULT_OPTIONS = {
        classes: [SR5_APPV2_CSS_CLASS, 'item'],
        position: {
            width: 500,
            height: 300,
        },
        actions: {
            openSource: SR5ItemSheet.#onOpenSource,
        }
    }

    static override PARTS = {
        header: {
            template: SheetFlow.templateBase('item/header'),
            scrollable: ['.scrollable']
        },
        tabs: {
            template: SheetFlow.templateBase('common/primary-tab-group'),
            scrollable: ['.scrollable']
        },
        description: {
            template: SheetFlow.templateBase('item/tabs/description'),
            scrollable: ['.scrollable']
        },
        armor: {
            template: SheetFlow.templateBase('item/tabs/armor'),
            scrollable: ['.scrollable']
        },
        compilation: {
            template: SheetFlow.templateBase('item/tabs/compilation'),
            scrollable: ['.scrollable']
        },
        summoning: {
            template: SheetFlow.templateBase('item/tabs/summoning'),
            scrollable: ['.scrollable']
        },
        modification: {
            template: SheetFlow.templateBase('item/tabs/modification'),
            scrollable: ['.scrollable']
        },
        licenses: {
            template: SheetFlow.templateBase('item/tabs/licenses'),
            templates: SheetFlow.templateListItem('license'),
            scrollable: ['.scrollable']
        },
        spell: {
            template: SheetFlow.templateBase('item/tabs/spell'),
            scrollable: ['.scrollable']
        },
        weapon: {
            template: SheetFlow.templateBase('item/tabs/weapon'),
            scrollable: ['.scrollable']
        },
        weaponAmmo: {
            template: SheetFlow.templateBase('item/tabs/weapon-ammo'),
            templates: SheetFlow.templateListItem('weapon-ammo'),
            scrollable: ['.scrollable']
        },
        weaponModifications: {
            template: SheetFlow.templateBase('item/tabs/weapon-modifications'),
            templates: SheetFlow.templateListItem('weapon-modification'),
            scrollable: ['.scrollable']
        },
        action: {
            template: SheetFlow.templateBase('item/tabs/action'),
            scrollable: ['.scrollable']
        },
        ammo: {
            template: SheetFlow.templateBase('item/tabs/ammo'),
            scrollable: ['.scrollable']
        },
        device: {
            template: SheetFlow.templateBase('item/tabs/device'),
            scrollable: ['.scrollable']
        },
        effects: {
            template: SheetFlow.templateBase('item/tabs/effects'),
            templates: SheetFlow.templateListItem('effect'),
            scrollable: ['.scrollable']
        },
        footer: {
            template: SheetFlow.templateBase('item/footer'),
            scrollable: ['.scrollable']
        },
    }

    static override TABS = {
        primary: {
            initial: 'description',
            tabs: [
                { id: 'description', label: 'Description', cssClass: '' },
                { id: 'device', label: 'Matrix', cssClass: '' },
                { id: 'weapon', label: 'Details', cssClass: '' },
                { id: 'weaponAmmo', label: 'Ammo', cssClass: '' },
                { id: 'weaponModifications', label: 'Mods', cssClass: '' },
                { id: 'licenses', label: 'Licenses', cssClass: '' },
                { id: 'spell', label: 'Details', cssClass: '' },
                { id: 'armor', label: 'Armor', cssClass: '' },
                { id: 'compilation', label: 'Details', cssClass: '' },
                { id: 'modification', label: 'Details', cssClass: '' },
                { id: 'summoning', label: 'Details', cssClass: '' },
                { id: 'ammo', label: 'Details', cssClass: '' },
                { id: 'action', label: 'Action', cssClass: '' },
                { id: 'effects', label: 'Effects', cssClass: '' }
            ]
        }
    }

    protected override _prepareTabs(group: string) {
        const parts = super._prepareTabs(group);
        if (group === 'primary') {
            this._cleanParts(this.item, parts);
        }
        return parts;
    }

    protected override _configureRenderParts(options) {
        const retVal = super._configureRenderParts(options);
        this._cleanParts(this.item, retVal);
        return retVal;
    }

    protected _cleanParts(item: SR5Item, parts: Record<string, any>) {
        if (!item.getAction()) {
            delete parts['action'];
        }
        if (!item.isType('armor', 'critter_power', 'cyberware', 'bioware', 'adept_power')) {
            delete parts['armor'];
        }
        if (!item.isType('ammo')) {
            delete parts['ammo'];
        }
        if (!item.isCompilation) {
            delete parts['compilation'];
        }
        if (!item.isSummoning) {
            delete parts['summoning'];
        }
        if (!item.isType('modification')) {
            delete parts['modification'];
        }
        if (!item.isType('device')) {
            delete parts['device'];
        }
        if (!item.isType('spell')) {
            delete parts['spell'];
        }
        if (!item.isType('weapon')) {
            delete parts['weapon'];
            delete parts['weaponModifications'];
            delete parts['weaponAmmo'];
        }
        if (!item.isType('sin')) {
            delete parts['licenses'];
        }
        return parts;
    }

    /* -------------------------------------------- */

    /**
     * Prepare data for rendering the Item sheet
     * The prepared data object contains both the actor data as well as additional sheet options
     */
    override async _prepareContext(options) {
        const data = await super._prepareContext(options) as any;
        const itemData = this.item.toObject(false).system as SR5Item['system'];

        const linkedActor = await this.item.getLinkedActor();
        
        // Calculated values for derived data.
        data.calculatedEssence = itemData.technology?.calculated.essence.adjusted ?? false;
        data.calculatedCost = data.calculatedEssence ? true : itemData.technology?.calculated.cost.adjusted ?? false;
        data.calculatedAvailability = data.calculatedEssence ? true : itemData.technology?.calculated.availability.adjusted ?? false;
        data.ratingForCalculation = data.calculatedEssence || data.calculatedCost || data.calculatedAvailability;

        if ('action' in itemData && itemData.action) {
            try {
                const action = itemData.action;
                if (itemData.action.mod === 0)
                    //@ts-expect-error fvtt-types doesn't know about non-required field.
                    action.mod = undefined;
                if (action.limit.base === 0)
                    //@ts-expect-error fvtt-types doesn't know about non-required field.
                    action.limit = undefined;
                if (action.damage) {
                    if (action.damage.mod.length === 0) 
                        //@ts-expect-error fvtt-types doesn't know about non-required field.
                        action.damage.mod = undefined;
                    if (action.damage.ap.mod.length === 0)
                        //@ts-expect-error fvtt-types doesn't know about non-required field.
                        action.damage.ap.mod = undefined;
                }
                if (action.limit) {
                    if (action.limit.mod.length === 0)
                        //@ts-expect-error fvtt-types doesn't know about non-required field.
                        action.limit.mod = undefined;
                }
            } catch (e) {
                console.error(e);
            }
        }

        if ('technology' in itemData && itemData.technology) {
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
        const [ammunition, weaponMods, armorMods, vehicleMods, droneMods] = this.item.items.reduce<[
                SR5Item<'ammo'>[],
                SR5Item<'modification'>[],
                SR5Item<'modification'>[],
                SR5Item<'modification'>[],
                SR5Item<'modification'>[]
            ]>(
            (acc, item: SR5Item) => {
                const data = item as unknown as SR5Item;
                if (item.type === 'ammo') acc[0].push(data as SR5Item<'ammo'>);
                else if (item.type === 'modification') {
                    const type = item.system?.type;
                    if (type === 'weapon') acc[1].push(data as SR5Item<'modification'>);
                    else if (type === 'armor') acc[2].push(data as SR5Item<'modification'>);
                    else if (type === 'vehicle') acc[3].push(data as SR5Item<'modification'>);
                    else if (type === 'drone') acc[4].push(data as SR5Item<'modification'>);
                }
                return acc;
            },
            [[], [], [], [], []]
        );

        // Enrich descriptions
        await Promise.all(
            [ammunition, weaponMods, armorMods, vehicleMods, droneMods].flat().map(
                async item => {
                    const html = await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description.value);
                    item.descriptionHTML = html;
                }
            )
        );

        // Assign to template data
        data['ammunition'] = ammunition;
        data['weaponMods'] = weaponMods;
        data['armorMods'] = armorMods;
        data['vehicleMods'] = vehicleMods;
        data['droneMods'] = droneMods;

        data['activeSkills'] = this._getSortedActiveSkillsForSelect();
        data['attributes'] = this._getSortedAttributesForSelect();
        data['limits'] = this._getSortedLimitsForSelect();

        data['effects'] = prepareSortedEffects(this.item.effects.contents);
        data['itemEffects'] = prepareSortedItemEffects(this.item);

        if (this.item.isType('host')) {
            data['markedDocuments'] = await this.item.getAllMarkedDocuments();
        }

        if (this.item.isType('sin')) {
            data['networks'] = await SINFlow.getNetworks(this.item);
        }

        if (this.item.canBeMaster) {
            data.slaves = this.item.slaves;
            // Prepare PAN counter (1/3) for simple use in handlebar
            data['pan_counter'] = `(${data.slaves.length}/${MatrixRules.maxPANSlaves(this.item.getRating())})`;
        }

        if (this.item.canBeSlave) {
            data['master'] = this.item.master;
        }

        if (this.item.isType('contact')) {
            data['linkedActor'] = await this.item.getLinkedActor();
        }

        // Provide action parts with all test variants.
        data.tests = game.shadowrun5e.tests;
        data.opposedTests = game.shadowrun5e.opposedTests;
        data.activeTests = game.shadowrun5e.activeTests;
        data.resistTests = game.shadowrun5e.resistTests;

        if (this.item.system.description)
            data.descriptionHTML = await this.enrichEditorFieldToHTML(this.item.system.description.value);

        data.sourceIsURL = this.item.sourceIsUrl;
        data.sourceIsPDF = this.item.sourceIsPDF;
        data.sourceIsUuid = this.item.sourceIsUuid
        
        data.isUsingRangeCategory = false;
        if (this.item.isType('weapon')) {
            if (this.item.isRangedWeapon()) {
                const category = this.item.system.range.ranges.category;
                data.isUsingRangeCategory = !!category && category !== 'manual';
            } else if (this.item.isThrownWeapon()) {
                const category = this.item.system.thrown.ranges.category;
                data.isUsingRangeCategory = !!category && category !== 'manual';
            }
        }

        data.rollModes = CONFIG.Dice.rollModes;

        // What tabs should be shown on this sheet?
        data.showMiscTab = this._prepareShowMiscTab();

        // What sections should be shown on the misc. tab?
        data.miscMatrixPart = this.item.hasActionCategory('matrix');

        data.primaryTabs = this._prepareTabs('primary');
        data.item = this.item;

        return {
            ...data,
            linkedActor
        }
    }

    /**
     * Help enriching editor field values to HTML used to display editor values as read-only HTML in sheets.
     *
     * @param editorValue A editor field value like Item.system.description.value
     * @param options TextEditor, enrichHTML.options passed through
     * @returns Enriched HTML result
     */
    async enrichEditorFieldToHTML(editorValue: string, options: any = { async: false }): Promise<string> {
        return foundry.applications.ux.TextEditor.implementation.enrichHTML(editorValue, options);
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
        // In case of custom skill used, inject it into the skill list.
        const skill = this.document.system.action?.skill;
        const skills = skill ? [skill] : undefined;
        // Instead of item.parent, use the actorOwner as NestedItems have an actor grand parent.
        return ActionFlow.sortedActiveSkills(this.item.actorOwner, skills);
    }

    /* -------------------------------------------- */

    override async _onRender(context, options) {
        this.activateListeners_LEGACY($(this.element));
        return super._onRender(context, options);
    }

    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html -  The prepared HTML object ready to be rendered into the DOM
     */
    activateListeners_LEGACY(html) {
        Helpers.setupCustomCheckbox(this, html);

        // Active Effect management
        html.find(".effect-control").click(event => onManageActiveEffect(event, this.item));

        /**
         * General item handling
         */
        html.find('.hidden').hide();

        /**
         * Contact item specific
         */
        html.find('.actor-remove').click(this.handleLinkedActorRemove.bind(this));

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
        html.find('.sin-remove-network').on('click', this._onRemoveNetwork.bind(this));

        html.find('.network-clear').on('click', this._onRemoveAllSlaves.bind(this));
        html.find('.network-device-remove').on('click', this._onRemoveSlave.bind(this));

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
        html.find('.open-matrix-slave').on('click', this._onOpenSlave.bind(this));

        html.find('.power-optional-input').on('change', this._onPowerOptionalInputChanged.bind(this));

        // this._activateTagifyListeners(html);
    }

    /**
     * User requested removal of the linked actor.
     */
    async handleLinkedActorRemove(event: any) {
        await this.item.update({ system: { linkedActor: '' } });
    }

    /**
     * Updating the contacts linked actor.
     * 
     * @param actor The prepared actor
     */
    async updateLinkedActor(actor: SR5Actor) {
        await this.item.update({ system: { linkedActor: actor.uuid } });
    }

    _addDragSupportToListItemTemplatePartial(i, item) {
        if (item.dataset?.itemId) {
            item.setAttribute('draggable', true);
            item.addEventListener('dragstart', this._onDragStart.bind(this), false);
        }
    }

    // TODO fix
    async _onDragStart(event) {
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
    }


    // TODO fix
    async _onDrop(event) {
        if (!game.items || !game.actors || !game.scenes) return;

        event.preventDefault();
        event.stopPropagation();

        // Parse drop data.
        const data = parseDropData(event);
        if (!data) return;

        // CASE - Handle dropping of documents directly into the source field like urls and pdfs.
        const targetElement = event.toElement || event.target;
        if (targetElement?.name === 'system.description.source')
            return this.item.setSource(data.uuid);

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
        if (this.item.isType('weapon') && data.type === 'Item') {
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

            // if it's a master device, add ourself as a slave to it
            if (item.canBeMaster) {
                await item.addSlave(this.item);
                return;
            }
            return this.item.createNestedItem(item._source);
        }

        // Add actors to WAN, both GRID and HOST
        if (this.item.isNetwork() && ['Item', 'Actor'].includes(data.type)) {
            const document = await fromUuid(data.uuid) as SR5Actor;
            if (!document) return console.error('Shadowrun 5e | Document could not be retrieved from DropData', data);
            await this.item.addSlave(document);
            return;
        }

        // Add document to a PAN.
        if (this.item.isType('device') && ['Item', 'Actor'].includes(data.type)) {
            const document = await fromUuid(data.uuid) as SR5Item | SR5Actor;
            if (!document) return console.error('Shadowrun 5e | Document could not be retrieved from DropData', data);
            await this.item.addSlave(document);
            return;
        }

        // Link actors to existing contacts.
        if (this.item.isType('contact') && data.type === 'Actor') {
            const actor = await fromUuid(data.uuid) as SR5Actor;

            if (!actor?.id) return console.error('Shadowrun 5e | Actor could not be retrieved from DropData', data);

            return this.updateLinkedActor(actor);
        }

        // Add networks to SINs.
        if (this.item.isType('sin') && data.type === 'Item') {
            const item = await fromUuid(data.uuid) as SR5Item;
            if (!item) return;
            if (!item.isNetwork()) return;

            await this.item.addNewNetwork(item);
        }
    }

    _eventId(event) {
        event.preventDefault();
        return event.currentTarget.closest('.list-item').dataset.itemId;
    }

    static async #onOpenSource(this: SR5ItemSheet, event) {
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
            type RangesType = Omit<RangeType, 'category' | 'attribute'> & { attribute?: string };
            const ranges: RangesType = SR5.weaponRangeCategories[selectedRangeCategory].ranges;

            await this.item.update({
                [key]: {
                    ...ranges,
                    attribute: ranges.attribute || null,
                    category: selectedRangeCategory,
                },
            });
        }
    }

    /**
     * User selected a new matrix attribute on a specific matrix attribute slot (att1, att2,)
     * Switch out slots for the old and selected matrix attribute.
     */
    async _onMatrixAttributeSelected(event) {
        if (!this.item.system.atts) return;

        const attribute = event.currentTarget.value;
        const changedSlot = event.currentTarget.dataset.att;

        await this.item.changeMatrixAttributeSlot(changedSlot, attribute);
    }

    async _onEditItem(event) {
        const item = this.item.getOwnedItem(this._eventId(event));
        return item?.sheet?.render(true);
    }

    async _onEntityRemove(event) {
        event.preventDefault();

        // Grab the data position to remove the correct entity from the list.
        const entityRemove = $(event.currentTarget).closest('.entity-remove');
        const list = entityRemove.data('list');
        const position = entityRemove.data('position');

        // Handle Host item lists...
        if (list === 'ic')
            await this.item.removeIC(position);
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

    /**
     * User wants to remove a network from a SIN item.
     */
    async _onRemoveNetwork(event) {
        event.preventDefault();
        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const uuid = Helpers.listItemUuid(event);
        if (!uuid) return;

        await SINFlow.removeNetwork(this.item, uuid);
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
        const name = `${game.i18n.localize('SR5.New')} ${Helpers.label(game.i18n.localize(SR5.itemTypes[type]))}`;
        const item = new SR5Item({
            name, type,
            system: { type: 'weapon' }
        });
        await this.item.createNestedItem(item.toObject());
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
            type: type as Item.SubType
        };
        const item = new SR5Item(itemData);
        await this.item.createNestedItem(item._source);
    }

    async _onClipEquip(clipType: AmmunitionType['clip_type']) {
        if (!clipType || !Object.keys(SR5.weaponCliptypes).includes(clipType)) return;

        const agilityValue = this.item.actor ? this.item.actor.getAttribute('agility').value : 0;
        await this.item.update({
            system: {
                ammo: {
                    clip_type: clipType,
                    partial_reload_value: RangedWeaponRules.partialReload(clipType, agilityValue)
                }
            }
        }, { render: true });
    }

    async _onOwnedItemRemove(event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.item.deleteOwnedItem(this._eventId(event));
    }

    async _onRemoveAllSlaves(event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.item.removeAllSlaves();
    }

    async _onRemoveSlave(event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const uuid = Helpers.listItemUuid(event);
        const document = await fromUuid(uuid) as SR5Actor | SR5Item;
        if (!document) return;

        await this.item.removeSlave(document);
    }

    /**
     * Open a document from a DOM node containing a dataset uuid.
     *
     * This is intended to let deckers open marked documents they're FoundryVTT user has permissions for.
     *
     * @param event Any interaction event
     */
    async _onOpenSlave(event) {
        event.stopPropagation();

        const uuid = Helpers.listItemUuid(event);
        if (!uuid) return;

        // Marked documents can´t live in packs.
        const document = fromUuidSync(uuid) as SR5Item|SR5Actor;
        if (!document) return;

        await document.sheet?.render(true);
    }

    /**
     * @private
     */
    _findActiveList() {
        return $(this.element).find('.tab.active .scroll-area');
    }


    async _onMarksQuantityChange(event) {
        event.stopPropagation();

        if (!this.item.isType('host')) return;

        const markId = event.currentTarget.dataset.markId;
        if (!markId) return;

        const markedDocument = await ActorMarksFlow.getMarkedDocument(markId);
        if (!markedDocument) return;

        const marks = parseInt(event.currentTarget.value);
        await this.item.setMarks(markedDocument, marks, { overwrite: true });
    }

    async _onMarksQuantityChangeBy(event, by: number) {
        event.stopPropagation();

        if (!this.item.isType('host')) return;

        const markId = event.currentTarget.dataset.markId;
        if (!markId) return;

        const markedDocument = await ActorMarksFlow.getMarkedDocument(markId);
        if (!markedDocument) return;

        await this.item.setMarks(markedDocument, by);
    }

    async _onMarksDelete(event) {
        event.stopPropagation();

        if (!this.item.isType('host')) return;

        const markId = event.currentTarget.dataset.markId;
        if (!markId) return;

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.item.clearMark(markId);
    }

    async _onMarksClearAll(event) {
        event.stopPropagation();

        if (!this.item.isType('host')) return;

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

        if (device instanceof SR5Item || device instanceof SR5Actor)
            await device?.sheet?.render(true);
    }

    async _onControllerRemove(event) {
        event.preventDefault();

        await this.item.disconnectFromNetwork();
        this.render(false);
    }

    /**
     * Show / hide the items description within a sheet item l ist.
     */
    async _onListItemToggleDescriptionVisibility(event) {
        event.preventDefault();
        const item = $(event.currentTarget).parents('.list-item');
        const field = item.find('.list-item-description');
        field.toggle();
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
            await item.update({ system: { importFlags: { isFreshImport: onOff } } });
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
        if (!this.document.isType('device')) return;
        if (!this.document.isEquipped()) return;

        await this.document.parent.equipOnlyOneItemOfType(this.document);
    }

    /**
     * Change the enabled status of an item shown within a sheet item list.
     */
    async _onPowerOptionalInputChanged(event) {
        event.preventDefault();
        const power = this.item.asType('critter_power') || this.item.asType('sprite_power') || undefined;
        if (!power) return;

        let selectedRangeCategory;

        if (this.item.isType('critter_power')) {
            selectedRangeCategory = event.currentTarget.value as keyof typeof SR5.critterPower.optional;
        } else {
            selectedRangeCategory = event.currentTarget.value as keyof typeof SR5.spritePower.optional;
        }

        power.system.optional = selectedRangeCategory;

        switch (power.system.optional) {
            case 'standard':
            case 'enabled_option':
                power.system.enabled = true;
                break;
            case 'disabled_option':
                power.system.enabled = false;
                break;
        }

        this.item.render(false);
    }

    /**
     * Go through an action item action categories and if at least one is found that needs additional
     * configuration, let the sheet show the misc. tab.
     *
     * @returns true, when the tab is to be shown.
     */
    _prepareShowMiscTab() {
        // Currently, only action items use this tab.
        const action = this.item.asType('action');
        if (!action) return false;

        const relevantCategories: Shadowrun.ActionCategories[] = ['matrix'];
        for (const category of relevantCategories) {
            if (this.document.hasActionCategory(category)) return true;
        }

        return false;
    }

    override async _onFirstRender(context, options) {
        await super._onFirstRender(context, options);

        this._createContextMenu(this._getDocumentListContextOptions.bind(this), ".new-list-item[data-item-id]", {
            hookName: "getDocumentListContextOptions",
            parentClassHooks: false,
            fixed: true,
            jQuery: false,
        });
    }

    _getDocumentListContextOptions() {
        return [
            {
                name: "SR5.ActorSheet.ContextOptions.Source",
                icon: "<i class='fas fa-page'></i>",
                condition: (target) => {
                    const id = SheetFlow.listItemId(target);
                    const item = this.item.getOwnedItem(id);
                    if (!item) return false;
                    if (item instanceof SR5Item) {
                        return item.hasSource;
                    }
                    return false;
                },
                callback: async (target) => {
                    const id = SheetFlow.listItemId(target);
                    const item = this.item.getOwnedItem(id);
                    if (!item) return;
                    await item.openSource();
                }
            },
            {
                name: "SR5.ActorSheet.ContextOptions.Edit",
                icon: "<i class='fas fa-pen-to-square'></i>",
                callback: async (target) => {
                    const id = SheetFlow.listItemId(target);
                    const item = this.item.getOwnedItem(id);
                    if (!item) return;
                    await item.sheet?.render(true)
                }
            },
            {
                name: "SR5.ActorSheet.ContextOptions.Delete",
                icon: "<i class='fas fa-trash'></i>",
                callback: async (target) => {
                    const userConsented = await Helpers.confirmDeletion();
                    if (!userConsented) return;

                    const id = SheetFlow.listItemId(target);
                    await this.item.deleteOwnedItem(id);
                }
            }
        ]
    }
}
