import { RangedWeaponRules } from './../rules/RangedWeaponRules';
import { Helpers } from '../helpers';
import { SR5Item } from './SR5Item';
import { SR5 } from "../config";
import { onManageActiveEffect, prepareSortedEffects, prepareSortedItemEffects } from "../effects";
import { SR5Actor } from '../actor/SR5Actor';
import { SR5ActiveEffect } from '../effect/SR5ActiveEffect';
import { ActionFlow } from './flows/ActionFlow';
import { AmmunitionType, RangeType } from '../types/item/Weapon';
import { ActorMarksFlow } from '../actor/flows/ActorMarksFlow';
import { MatrixRules } from '../rules/MatrixRules';
import { SINFlow } from './flows/SINFlow';

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
    declare isEditMode: boolean;
    #dragDrop: any;

    static override DEFAULT_OPTIONS = {
        classes: ['item', 'named-sheet'],
        position: {
            width: 600,
            height: 500,
        },
        actions: {
            addItem: SR5ItemSheet.#addItem,
            equipItem: SR5ItemSheet.#equipItem,
            addItemQty: SR5ItemSheet.#addItemQty,
            removeItemQty: SR5ItemSheet.#removeItemQty,
            addLicense: SR5ItemSheet.#addLicense,
            removeLicense: SR5ItemSheet.#removeLicense,
            removeNetwork: SR5ItemSheet.#removeNetwork,
            reload: SR5ItemSheet.#reloadAmmo,
            partialReload: SR5ItemSheet.#partialReloadAmmo,

            addOneMark: SR5ItemSheet.#addOneMark,
            removeOneMark: SR5ItemSheet.#removeOneMark,
            clearMarks: SR5ItemSheet.#deleteMarks,
            clearAllMark: SR5ItemSheet.#deleteAllMarks,

            removeController: SR5ItemSheet.#removeController,

            toggleFreshImport: SR5ItemSheet.#toggleFreshImportFlag,
            toggleEquipped: SR5ItemSheet.#toggleEquipped,
            toggleWireless: SR5ItemSheet.#toggleWirelessState,

            addOneQty: SR5ItemSheet.#addOneQty,
            removeOneQty: SR5ItemSheet.#removeOneQty,

            addEffect: SR5ItemSheet.#addEffect,
            toggleEffect: SR5ItemSheet.#toggleEffect,
            deleteEffect: SR5ItemSheet.#deleteEffect,

            removeSlave: SR5ItemSheet.#removeSlave,
            removeAllSlaves: SR5ItemSheet.#removeAllSlaves
        },
        dragDrop: [{ dragSelector: '.draggable', dropSelector: null }],
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
        details: {
            template: SheetFlow.templateBase('item/tabs/details'),
            scrollable: ['.scrollable']
        },
        network: {
            template: SheetFlow.templateBase('item/tabs/network'),
            templates: SheetFlow.templateListItem('slaved_icon'),
            scrollable: ['.scrollable']
        },
        licenses: {
            template: SheetFlow.templateBase('item/tabs/licenses'),
            templates: SheetFlow.templateListItem('license'),
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
                { id: 'details', label: 'Details', cssClass: '' },
                { id: 'action', label: 'Action', cssClass: '' },
                { id: 'network', label: 'Network', cssClass: '' },
                { id: 'weaponAmmo', label: 'Ammo', cssClass: '' },
                { id: 'weaponModifications', label: 'Mods', cssClass: '' },
                { id: 'licenses', label: 'Licenses', cssClass: '' },
                { id: 'effects', label: 'Effects', cssClass: '' }
            ]
        }
    }

    constructor(options) {
        super(options);
        this.#dragDrop = this.#createDragDropHandlers();
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
        if (item.isType('action')) {
            delete parts['details'];
        }
        if (!item.getAction()) {
            delete parts['action'];
        }
        if (!item.canBeMaster) {
            delete parts['network'];
        }
        if (!item.isType('weapon')) {
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

        data.primaryTabs = this._prepareTabs('primary');
        data.item = this.item;

        data.isNestedItem = this.item._isNestedItem;

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
        this.#dragDrop.forEach(d => d.bind(this.element));
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
         * Weapon item specific
         */
        html.find('select[name="change-ammo"]').on('change', async (event) => this._onAmmoSelect(event.target.value));
        html.find('select[name="change-clip-type"]').on('change', async (event) => this._onClipSelect(event.target.value));

        // Marks handling
        html.find('.marks-qty').on('change', this._onMarksQuantityChange.bind(this));

        html.find('.matrix-att-selector').on('change', this._onMatrixAttributeSelected.bind(this));

        html.find('select[name="system.range.ranges.category"]').on('change', this._onSelectRangedRangeCategory.bind(this));
        html.find('select[name="system.thrown.ranges.category"]').on('change', this._onSelectThrownRangeCategory.bind(this));
    }

    /**
     * Updating the contacts linked actor.
     *
     * @param actor The prepared actor
     */
    async updateLinkedActor(actor: SR5Actor) {
        await this.item.update({ system: { linkedActor: actor.uuid } });
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

    static async #addLicense(this: SR5ItemSheet, event) {
        event.preventDefault();
        await this.item.addNewLicense();
    }

    static async #removeLicense(this: SR5ItemSheet, event) {
        event.preventDefault();
        const index = SheetFlow.closestAction(event.target)?.dataset.index;
        if (index >= 0) await this.item.removeLicense(index);
    }

    /**
     * User wants to remove a network from a SIN item.
     */
    static async #removeNetwork(this: SR5ItemSheet, event) {
        event.preventDefault();
        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const uuid = SheetFlow.closestUuid(event.target);
        if (!uuid) return;

        await SINFlow.removeNetwork(this.item, uuid);
    }

    static async #addItemQty(this: SR5ItemSheet, event) {
        event.preventDefault();
        const id = SheetFlow.closestItemId(event.target);
        const item = this.item.getOwnedItem(id);
        if (item) {
            const qty = item.getTechnologyData()?.quantity ?? 0;
            const newQty = event.shiftKey ? qty + 20 : event.ctrlKey ? qty + 50 : qty + 1;
            await item.update({system: {technology: {quantity: newQty}}})
        }
    }

    static async #removeItemQty(this: SR5ItemSheet, event) {
        event.preventDefault();
        const id = SheetFlow.closestItemId(event.target);
        const item = this.item.getOwnedItem(id);
        if (item) {
            const qty = item.getTechnologyData()?.quantity ?? 0;
            const newQty = event.shiftKey ? qty - 20 : event.ctrlKey ? qty - 50 : qty - 1;
            await item.update({system: { technology: { quantity: newQty}}})
        }
    }

    static async #equipItem(this: SR5ItemSheet, event) {
        event.preventDefault();
        const id = SheetFlow.closestItemId(event.target);
        const item = this.item.getOwnedItem(id);
        if (id && item) {
            if (item.type === 'modification') {
                await this.item.equipWeaponMod(id);
            } else if (item.type === 'ammo') {
                await this.item.equipAmmo(id);
            }
        }
    }

    static async #addItem(this: SR5ItemSheet, event) {
        event.preventDefault();
        const type = SheetFlow.closestAction(event.target)?.dataset.itemType;
        const itemData = {
            name: `${game.i18n.localize('SR5.New')} ${Helpers.label(game.i18n.localize(SR5.itemTypes[type]))}`,
            type,
        };
        if (type === 'modification') {
            // add system type to be a weapon when adding a weapon mod
            itemData['system'] = { type: 'weapon' }
        }
        const item = new SR5Item(itemData);
        await this.item.createNestedItem(item._source);
    }

    static async #reloadAmmo(this: SR5ItemSheet, event) {
        event.preventDefault();
        await this.item.reloadAmmo(false);
    }

    static async #partialReloadAmmo(this: SR5ItemSheet, event) {
        event.preventDefault();
        await this.item.reloadAmmo(true);
    }

    async _onAmmoSelect(input) {
        let id;

        if (input.currentTarget) {
            id = SheetFlow.closestItemId(input);
        } else {
            id = input;
        }

        await this.item.equipAmmo(id);
    }

    async _onClipSelect(clipType: AmmunitionType['clip_type']) {
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

    static async #removeOwnedItem(this: SR5ItemSheet, event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const id = SheetFlow.closestItemId(event.target);

        await this.item.deleteOwnedItem(id);
    }

    static async #removeAllSlaves(this: SR5ItemSheet, event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.item.removeAllSlaves();
    }

    static async #removeSlave(this: SR5ItemSheet, event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const uuid = SheetFlow.closestUuid(event.target);
        const document = fromUuidSync(uuid) as SR5Actor | SR5Item;
        if (!document) return;

        await this.item.removeSlave(document);
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

    static async #addOneQty(this: SR5ItemSheet, event) {
        event.preventDefault();
        const qty = this.item.getTechnologyData()?.quantity ?? 0;
        const newQty = event.shiftKey ? qty + 20 : event.ctrlKey ? qty + 50 : qty + 1;
        await this.item.update({system: { technology: { quantity: newQty}}})
    }

    static async #removeOneQty(this: SR5ItemSheet, event) {
        event.preventDefault();
        const qty = this.item.getTechnologyData()?.quantity ?? 0;
        const newQty = event.shiftKey ? qty - 20 : event.ctrlKey ? qty - 50 : qty - 1;
        await this.item.update({system: { technology: { quantity: newQty}}})
    }

    static async #addOneMark(this: SR5ItemSheet, event) {
        await this._onMarksQuantityChangeBy(event, 1);
    }

    static async #removeOneMark(this: SR5ItemSheet, event) {
        await this._onMarksQuantityChangeBy(event, -1);
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

    static async #deleteMarks(this: SR5ItemSheet, event) {
        event.stopPropagation();

        if (!this.item.isType('host')) return;

        const markId = SheetFlow.closestAction(event.target).dataset.markId;
        if (!markId) return;

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.item.clearMark(markId);
    }

    static async #deleteAllMarks(this: SR5ItemSheet, event) {
        event.stopPropagation();

        if (!this.item.isType('host')) return;

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.item.clearMarks();
    }

    static async #removeController(this: SR5ItemSheet, event) {
        event.preventDefault();

        await this.item.disconnectFromNetwork();
        this.render(false);
    }

    /**
     * Toggle to isFreshImport property of importFlags for an item
     *
     * @param event
     */
    static async #toggleFreshImportFlag(this: SR5ItemSheet, event) {
        const onOff = !this.item.system.importFlags.isFreshImport;
        console.debug('Toggling isFreshImport on item to ->', onOff, event);
        const item = this.item;
        if (item.system.importFlags) {
            await item.update({ system: { importFlags: { isFreshImport: onOff } } });
        }
    }

    static async #toggleEquipped(this: SR5ItemSheet, event) {
        if (this.item.isType('device') && this.item.parent instanceof SR5Actor) {
            await this.item.parent.equipOnlyOneItemOfType(this.item);
            this.render();
        } else if (this.item.isType('ammo') && this.item.parent instanceof SR5Item) {
            await (this.item.parent as SR5Item).equipAmmo(this.item.id);
            this.render();
        } else if (this.item.isType('modification') && this.item.parent instanceof SR5Item) {
            await (this.item.parent as SR5Item).equipWeaponMod(this.item.id);
            this.render();
        } else {
            const equipped = this.item.isEquipped();
            if (this.item.isType('critter_power', 'sprite_power')) {
                await this.item.update({system: { optional : equipped ? 'disabled_option' : 'enabled_option'}});
            } else {
                await this.item.update({system: { technology: { equipped: !equipped }}});
            }
        }
    }

    /**
     * Toggle the Wireless state of an item, iterating through the different states
     * @param event
     */
    static async #toggleWirelessState(this: SR5ItemSheet, event) {
        event.preventDefault();
        event.stopPropagation();

        // iterate through the states of online -> silent -> offline
        const newState = event.shiftKey ? 'none'
            : this.item.isWireless()
                ? this.item.isRunningSilent()
                    ? 'offline'
                    : 'silent'
                : 'online';

        // update the embedded item with the new wireless state
        await this.item.update({ system: { technology: { wireless: newState } } });
    }

    /**
     * Clicking on equipped status should trigger unequipping all other devices of the same type.
     * @param event Click event on the equipped checkbox.
     */
    static async #toggleEquippedDisableOtherDevices(this: SR5ItemSheet, event) {
        event.preventDefault();

        // Assure owned item device.
        if (!(this.document.parent instanceof SR5Actor)) return;
        if (!this.document.isType('device')) return;
        if (!this.document.isEquipped()) return;

        await this.document.parent.equipOnlyOneItemOfType(this.document);
    }

    static async #addEffect(this: SR5ItemSheet, event) {
        // TODO handle nested items
        event.preventDefault();
        const effect = [{
            name: game.i18n.localize("SR5.ActiveEffect.New"),
        }];

        await this.item.createEmbeddedDocuments('ActiveEffect', effect);
    }

    static async #toggleEffect(this: SR5ItemSheet, event) {
        const effectId = SheetFlow.closestEffectId(event.target);
        const effect = this.item.effects.get(effectId);
        if (effect && effect instanceof SR5ActiveEffect) {
            await effect.update({ disabled: !effect.disabled })
        }
    }

    static async #deleteEffect(this: SR5ItemSheet, event) {
        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const effectId = SheetFlow.closestEffectId(event.target);
        const effect = this.item.effects.get(effectId);
        if (effect?.id) {
            await this.item.deleteEmbeddedDocuments('ActiveEffect', [effect.id]);
        }
    }

    override async _onFirstRender(context, options) {
        await super._onFirstRender(context, options);

        this._createContextMenu(this._getNestedItemContextOptions.bind(this), "[data-item-id]", {
            hookName: "getNestedItemContextOptions",
            jQuery: false,
            fixed: true,
        });
        this._createContextMenu(this._getEffectContextOptions.bind(this), "[data-effect-id]", {
            hookName: "getEffectContextOptions",
            jQuery: false,
            fixed: true,
        });
    }

    _getNestedItemContextOptions() {
        return [
            SheetFlow._getSourceContextOption(),
            {
                name: "SR5.ContextOptions.EditItem",
                icon: "<i class='fas fa-pen-to-square'></i>",
                callback: async (target) => {
                    const id = SheetFlow.closestItemId(target);
                    const item = this.item.getOwnedItem(id);
                    if (item) {
                        await item.sheet?.render(true)
                    }
                }
            },
            {
                name: "SR5.ContextOptions.DeleteItem",
                icon: "<i class='fas fa-trash'></i>",
                callback: async (target) => {
                    const userConsented = await Helpers.confirmDeletion();
                    if (!userConsented) return;
                    const id = SheetFlow.closestItemId(target);
                    const item = this.item.getOwnedItem(id);
                    if (item) {
                        await this.item.deleteOwnedItem(item.id);
                    }
                }
            }
        ]
    }

    _getEffectContextOptions() {
        return [
            SheetFlow._getSourceContextOption(),
            {
                name: "SR5.ContextOptions.EditEffect",
                icon: "<i class='fas fa-pen-to-square'></i>",
                callback: async (target) => {
                    const id = SheetFlow.closestEffectId(target);
                    const item = this.item.effects.get(id);
                    if (item) {
                        await item.sheet?.render(true)
                    }
                }
            },
            {
                name: "SR5.ContextOptions.DeleteEffect",
                icon: "<i class='fas fa-trash'></i>",
                callback: async (target) => {
                    const userConsented = await Helpers.confirmDeletion();
                    if (!userConsented) return;
                    const id = SheetFlow.closestEffectId(target);
                    if (id) {
                        await this.item.deleteEmbeddedDocuments('ActiveEffect', [id]);
                    }
                }
            }
        ]
    }

    override async _processSubmitData(event, form, submitData, options) {
        if (this.item._isNestedItem) {
            await this.item.update(submitData, options);
        } else {
            await super._processSubmitData(event, form, submitData, options);
        }
    }

    /**
     * Create drag-and-drop workflow handlers for this Application
     * @returns {DragDrop[]}     An array of DragDrop handlers
     * @private
     */
    #createDragDropHandlers() {
        return (this.options as any).dragDrop.map((d) => {
            d.permissions = {
                dragstart: this._canDragStart.bind(this),
                drop: this._canDragDrop.bind(this),
            };
            d.callbacks = {
                dragstart: this._onDragStart.bind(this),
                dragover: this._onDragOver.bind(this),
                drop: this._onDrop.bind(this),
            };
            return new DragDrop(d);
        });
    }

    /**
     * Define whether a user is able to begin a dragstart workflow for a given drag selector
     * @param {string} selector       The candidate HTML selector for dragging
     * @returns {boolean}             Can the current user drag this selector?
     * @protected
     */
    _canDragStart(selector) {
        return this.isEditable;
    }


    /**
     * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
     * @param {string} selector       The candidate HTML selector for the drop target
     * @returns {boolean}             Can the current user drop on this selector?
     * @protected
     */
    _canDragDrop(selector) {
        return this.isEditable;
    }


    /**
     * Callback actions which occur when a dragged element is over a drop target.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    _onDragOver(event) {}

    /* -------------------------------------------- */

    /**
     * An event that occurs when data is dropped into a drop target.
     * @param {DragEvent} event
     * @returns {Promise<void>}
     * @protected
     */
    async _onDrop(event) {
        const data = TextEditor.getDragEventData(event) as any;
        if (!data) return;
        const item = this.item;
        const allowed = Hooks.call("dropItemSheetData", item, this, data);
        if (allowed === false) return;

        // Dropped Documents
        const documentClass = foundry.utils.getDocumentClass(data.type);
        if (documentClass) {
            const document = await documentClass.fromDropData(data);
            await this._onDropDocument(event, document);
        }
    }

    /* -------------------------------------------- */

    /**
     * Handle a dropped document on the ActorSheet
     * @template {Document} TDocument
     * @param {DragEvent} event         The initiating drop event
     * @param {TDocument} document       The resolved Document class
     * @returns {Promise<TDocument|null>} A Document of the same type as the dropped one in case of a successful result,
     *                                    or null in case of failure or no action being taken
     * @protected
     */
    async _onDropDocument(event, document) {
        switch (document.documentName) {
            case "ActiveEffect":
                return (await this._onDropActiveEffect(event, document)) ?? null;
            case "Actor":
                return (await this._onDropActor(event, document)) ?? null;
            case "Item":
                return (await this._onDropItem(event, document)) ?? null;
            case "Folder":
                return (await this._onDropFolder(event, document)) ?? null;
            default:
                return null;
        }
    }

    /* -------------------------------------------- */

    /**
     * Handle a dropped Active Effect on the Actor Sheet.
     * The default implementation creates an Active Effect embedded document on the Actor.
     * @param {DragEvent} event       The initiating drop event
     * @param {ActiveEffect} effect   The dropped ActiveEffect document
     * @returns {Promise<ActiveEffect|null|undefined>} A Promise resolving to a newly created ActiveEffect, if one was
     *                                                 created, or otherwise a nullish value
     * @protected
     */
    async _onDropActiveEffect(event, effect) {
        if ( !this.item.isOwner ) return null;
        const keepId = !this.item.effects.has(effect.id);
        const result = await SR5ActiveEffect.create(effect.toObject(), {parent: this.item, keepId});
        return result ?? null;
    }

    /* -------------------------------------------- */

    /**
     * Handle a dropped Actor on the Actor Sheet.
     * @param {DragEvent} event     The initiating drop event
     * @param {Actor} actor         The dropped Actor document
     * @returns {Promise<Actor|null|undefined>} A Promise resolving to an Actor identical or related to the dropped Actor
     *                                          to indicate success, or a nullish value to indicate failure or no action
     *                                          being taken
     * @protected
     */
    async _onDropActor(event, actor) {
        if (this.item.isNetwork()) {
            return this.item.addSlave(actor);
        }
        if (this.item.isType('contact')) {
            return this.updateLinkedActor(actor);
        }
    }

    /* -------------------------------------------- */

    /**
     * Handle a dropped Item on the Item Sheet.
     * @param {DragEvent} event     The initiating drop event
     * @param {Item} item           The dropped Item document
     * @returns {Promise<Item|null|undefined>} A Promise resolving to the dropped Item (if sorting), a newly created Item,
     *                                         or a nullish value in case of failure or no action being taken
     * @protected
     */
    async _onDropItem(event, item) {
        // dropped ammo and mods to weapons get added as a nested item
        if (this.item.isType('weapon') && item.isType('ammo', 'modification')) {
            return this.item.createNestedItem(item);
        }
        // dropped Grid and Hosts on SIN allows for adding the SIN as a network option
        if (this.item.isType('sin') && item.isNetwork()) {
            return this.item.addNewNetwork(item);
        }
        // dropped Network on any other type should result in connecting to that network
        if (this.item.isNetwork() && item.canBeSlave) {
            return this.item.addSlave(item);
        }
        if (this.item.canBeMaster && item.canBeSlave) {
            return this.item.addSlave(item);
        }
        // if this item can be slaved and the dropped item can be a master, add ourselves as a slave to it
        if (this.item.canBeSlave && item.canBeMaster) {
            return item.addSlave(this.item);
        }
    }

    /* -------------------------------------------- */

    /**
     * Handle a dropped Folder on the Item Sheet.
     * @param {DragEvent} event     The initiating drop event
     * @param {Folder} folder       The dropped Folder document
     * @returns {Promise<Folder|null|undefined>} A Promise resolving to the dropped Folder indicate success, or a nullish
     *                                           value to indicate failure or no action being taken
     * @protected
     */
    async _onDropFolder(event, folder) {
        return null;
    }

    /**
     * An event that occurs when a drag workflow begins for a draggable item on the sheet.
     * @param {DragEvent} event       The initiating drag start event
     * @returns {Promise<void>}
     * @protected
     */
    async _onDragStart(event) {
        const target = event.currentTarget;
        if ( "link" in event.target.dataset ) return;
        let dragData;

        // Owned Items
        if (target.dataset.itemId) {
            const item = this.item.getOwnedItem(target.dataset.itemId);
            if (item) {
                dragData = item.toDragData();
            }
        }

        // Active Effect
        if (target.dataset.effectId) {
            const effect = this.item.effects.get(target.dataset.effectId);
            if (effect) {
                dragData = effect.toDragData();
            }
        }

        // Set data transfer
        if (!dragData) return;
        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }
}
