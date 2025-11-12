import { RangedWeaponRules } from './../rules/RangedWeaponRules';
import { Helpers } from '../helpers';
import { SR5Item } from './SR5Item';
import { SR5 } from '../config';
import { onManageActiveEffect, prepareSortedEffects, prepareSortedItemEffects } from '../effects';
import { SR5Actor } from '../actor/SR5Actor';
import { SR5ActiveEffect } from '../effect/SR5ActiveEffect';
import { ActionFlow } from './flows/ActionFlow';
import { AmmunitionType, RangeType } from '../types/item/Weapon';
import { ActorMarksFlow } from '../actor/flows/ActorMarksFlow';
import { MatrixRules } from '../rules/MatrixRules';
import { SINFlow } from './flows/SINFlow';
import { SR5ApplicationMixin } from '@/module/handlebars/SR5ApplicationMixin';
import { SheetFlow } from '@/module/flows/SheetFlow';

// eslint-disable-next-line @typescript-eslint/no-use-before-define
import RenderContext = foundry.applications.sheets.ItemSheet.RenderContext;

const { ItemSheet } = foundry.applications.sheets;
const { FilePicker } = foundry.applications.apps;
const { DragDrop } = foundry.applications.ux
const { fromUuid, fromUuidSync } = foundry.utils;

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
    readonly #dragDrop: DragDrop[];

    static override DEFAULT_OPTIONS = {
        classes: ['item', 'named-sheet'],
        position: {
            width: 600,
            height: 500,
        },
        actions: {
            addItem: SR5ItemSheet.#addItem,
            equipItem: SR5ItemSheet.#equipItem,
            editItem: SR5ItemSheet.#editItem,
            deleteItem: SR5ItemSheet.#deleteItem,
            addItemQty: SR5ItemSheet.#addItemQty,
            removeItemQty: SR5ItemSheet.#removeItemQty,

            addLicense: SR5ItemSheet.#addLicense,
            removeLicense: SR5ItemSheet.#removeLicense,
            removeNetwork: SR5ItemSheet.#removeNetwork,

            reload: SR5ItemSheet.#reloadAmmo,
            partialReload: SR5ItemSheet.#partialReloadAmmo,
            resetSpareReloads: SR5ItemSheet.#resetSpareReloads,

            addOneMark: SR5ItemSheet.#addOneMark,
            removeOneMark: SR5ItemSheet.#removeOneMark,
            clearMarks: SR5ItemSheet.#deleteMarks,
            clearAllMark: SR5ItemSheet.#deleteAllMarks,

            removeMaster: SR5ItemSheet.#removeMaster,
            removeLinkedActor: SR5ItemSheet.#removeLinkedActor,

            editImage: SR5ItemSheet.#editImage,

            toggleActionSpecialization: SR5ItemSheet.#toggleActionSpecialization,
            toggleFreshImport: SR5ItemSheet.#toggleFreshImportFlag,
            toggleEquipped: SR5ItemSheet.#toggleEquipped,
            toggleWireless: SR5ItemSheet.#toggleWirelessState,

            addOneQty: SR5ItemSheet.#addOneQty,
            removeOneQty: SR5ItemSheet.#removeOneQty,

            addEffect: SR5ItemSheet.#addEffect,
            editEffect: SR5ItemSheet.#editEffect,
            toggleEffect: SR5ItemSheet.#toggleEffect,
            deleteEffect: SR5ItemSheet.#deleteEffect,

            removeSlave: SR5ItemSheet.#removeSlave,
            removeAllSlaves: SR5ItemSheet.#removeAllSlaves,

            toggleActionArmor: SR5ItemSheet.#toggleActionArmor,
            toggleOpposedArmor: SR5ItemSheet.#toggleOpposedArmor,
            toggleResistArmor: SR5ItemSheet.#toggleResistArmor,

            modifyConditionMonitor: SR5ItemSheet.#modifyConditionMonitor,
            clearConditionMonitor: SR5ItemSheet.#clearConditionMonitor,
            rollConditionMonitor: SR5ItemSheet.#rollConditionMonitor,
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
        sinNetworks: {
            template: SheetFlow.templateBase('item/tabs/sin-networks'),
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
                { id: 'description', label: 'SR5.Tabs.Item.Description', cssClass: '' },
                { id: 'details', label: 'SR5.Tabs.Item.Details', cssClass: '' },
                { id: 'network', label: 'SR5.Tabs.Item.Network', cssClass: '' },
                { id: 'sinNetworks', label: 'SR5.Tabs.Item.SinNetworks', cssClass: '' },
                { id: 'weaponAmmo', label: 'SR5.Tabs.Item.WeaponAmmo', cssClass: '' },
                { id: 'weaponModifications', label: 'SR5.Tabs.Item.WeaponMods', cssClass: '' },
                { id: 'licenses', label: 'SR5.Tabs.Item.SinLicenses', cssClass: '' },
                { id: 'effects', label: 'SR5.Tabs.Item.Effects', cssClass: '' },
            ]
        }
    }

    constructor(...args: any) {
        super(...args);
        this.#dragDrop = this.#createDragDropHandlers();
    }

    /**
     * Prepare keybindings to be shown when hovering over a rolling icon
     * in any list item view that has rolls.
     */
    _prepareKeybindings() {
        return {
            qtySome: game.keybindings.get('shadowrun5e', 'add-remove-some-qty').map(binding => binding.key.replace('Key', '').toUpperCase()).join(', '),
            qtyMany: game.keybindings.get('shadowrun5e', 'add-remove-many-qty').map(binding => binding.key.replace('Key', '').toUpperCase()).join(', '),
        }
    }

    /**
     * Configure the Tabs that are actually used
     * @param group
     * @protected
     */
    protected override _prepareTabs(group: string) {
        const parts = super._prepareTabs(group);
        if (group === 'primary' && !game.user?.isGM && this.item.limited) {
            const description = parts.description;
            description.active = true;
            return { description };
        }
        if (group === 'primary') {
            this._cleanParts(this.item, parts);
        }
        return parts;
    }

    /**
     * Configure the parts that are actually used
     * @param options
     * @protected
     */
    protected override _configureRenderParts(options) {
        const retVal = super._configureRenderParts(options);
        if (!game.user?.isGM && this.item.limited) {
            return {
                header: retVal.header,
                tabs: retVal.tabs,
                description: retVal.description,
                footer: retVal.footer,
            }
        }
        this._cleanParts(this.item, retVal);
        return retVal;
    }

    /**
     * Clean Parts will remove PARTS from the static property and Primary TABS
     * - this removes parts that aren't used by types
     * @param item
     * @param parts
     * @protected
     */
    protected _cleanParts(item: SR5Item, parts: Record<string, any>) {
        if (item.isType('contact', 'lifestyle', 'sin', 'grid', 'program')) {
            delete parts.details;
        }
        if (!item.canBeMaster) {
            delete parts.network;
        }
        if (!item.isType('weapon')) {
            delete parts.weaponModifications;
            delete parts.weaponAmmo;
        }
        if (!item.isType('sin')) {
            delete parts.licenses;
            delete parts.sinNetworks;
        }
        return parts;
    }

    /* -------------------------------------------- */

    /**
     * Prepare data for rendering the Item sheet
     * The prepared data object contains both the actor data as well as additional sheet options
     */
    override async _prepareContext(options) {
        const data = await super._prepareContext(options);
        const itemData = this.item.toObject(false).system as SR5Item['system'];
        data.actor = this.item.actorOwner;

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
         * Groups nested items by their type for rendering on the item sheet.
         * - Ammo items are grouped under 'ammo'.
         * - Modification items are grouped by their specific system type (e.g., 'weapon', 'armor', etc.).
         * - All other items are grouped under 'other'.
         */
        const grouped = Object.groupBy(this.item.items, item => {
            if (item.isType('ammo')) return 'ammo';
            if (item.isType('modification')) return item.system.type;
            return 'other';
        });

        // Sort nested items by name before assigning to template data
        const sortByName = <T extends { name: string }>(arr: T[]) =>
            arr.toSorted((a, b) => a.name.localeCompare(b.name, game.i18n.lang));

        data['ammunition'] = sortByName((grouped.ammo ?? []) as SR5Item<'ammo'>[]);
        data['weaponMods'] = sortByName((grouped.weapon ?? []) as SR5Item<'modification'>[]);
        data['armorMods'] = sortByName((grouped.armor ?? []) as SR5Item<'modification'>[]);
        data['vehicleMods'] = sortByName((grouped.vehicle ?? []) as SR5Item<'modification'>[]);
        data['droneMods'] = sortByName((grouped.drone ?? []) as SR5Item<'modification'>[]);

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
        data.bindings = this._prepareKeybindings();

        return data;
    }

    /**
     * Help enriching editor field values to HTML used to display editor values as read-only HTML in sheets.
     *
     * @param editorValue A editor field value like Item.system.description.value
     * @param options TextEditor, enrichHTML.options passed through
     * @returns Enriched HTML result
     */
    async enrichEditorFieldToHTML(editorValue: string, options?: TextEditor.EnrichmentOptions): Promise<string> {
        return foundry.applications.ux.TextEditor.implementation.enrichHTML(editorValue, options);
    }

    /**
     * Action limits currently contain limits for all action types. Be it matrix, magic or physical.
     */
    _getSortedLimitsForSelect() {
        return Helpers.sortConfigValuesByTranslation(SR5.limits);
    }

    /**
     * Sorted (by translation) actor attributes.
     */
    _getSortedAttributesForSelect() {
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
    activateListeners_LEGACY(html: JQuery<HTMLElement>) {
        Helpers.setupCustomCheckbox(this, html);

        // Active Effect management
        html.find(".effect-control").on('click', event => { void onManageActiveEffect(event, this.item)});

        /**
         * General item handling
         */
        html.find('.hidden').hide();

        /**
         * Weapon item specific
         */
        html.find('select[name="change-ammo"]').on('change', this._onAmmoSelect.bind(this));
        html.find('select[name="change-clip-type"]').on('change', (event) => { void this._onClipSelect((event.target as HTMLSelectElement).value) });

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

    async _onSelectRangedRangeCategory(event: Event) {
        await this._onSelectRangeCategory("system.range.ranges", event);
    }

    async _onSelectThrownRangeCategory(event: Event) {
        await this._onSelectRangeCategory("system.thrown.ranges", event);
    }

    async _onSelectRangeCategory(key: string, event: Event) {
        event.stopPropagation();
        const selectedRangeCategory = (event.currentTarget as HTMLSelectElement).value as keyof typeof SR5.weaponRangeCategories;

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
    async _onMatrixAttributeSelected(event: Event) {
        if (!this.item.system.atts) return;

        const target = event.currentTarget as HTMLSelectElement;
        const attribute = target.value as Shadowrun.MatrixAttribute;
        const changedSlot = target.dataset.att;

        await this.item.changeMatrixAttributeSlot(changedSlot!, attribute);
    }

    async _onEntityRemove(event: Event) {
        event.preventDefault();

        // Grab the data position to remove the correct entity from the list.
        const entityRemove = $(event.currentTarget as HTMLElement).closest('.entity-remove');
        const list = entityRemove.data('list');
        const position = entityRemove.data('position');

        // Handle Host item lists...
        if (list === 'ic')
            await this.item.removeIC(position);
    }

    static async #addLicense(this: SR5ItemSheet, event: Event) {
        event.preventDefault();
        await this.item.addNewLicense();
    }

    static async #removeLicense(this: SR5ItemSheet, event: Event) {
        event.preventDefault();
        const index = parseInt(SheetFlow.closestAction(event.target)?.dataset.index ?? '-1');
        if (index >= 0) await this.item.removeLicense(index);
    }

    /**
     * User wants to remove a network from a SIN item.
     */
    static async #removeNetwork(this: SR5ItemSheet, event: Event) {
        event.preventDefault();
        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const uuid = SheetFlow.closestUuid(event.target);
        if (!uuid) return;

        await SINFlow.removeNetwork(this.item, uuid);
    }

    static async #removeAllNetworks(this: SR5ItemSheet, event: Event) {
        event.preventDefault();
        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await SINFlow.removeAllNetworks(this.item);
    }

    static async #addItemQty(this: SR5ItemSheet, event: Event) {
        event.preventDefault();
        const id = SheetFlow.closestItemId(event.target);
        const item = this.item.getOwnedItem(id);
        if (item) {
            await SheetFlow.addToQuantity(item, event);
        }
    }

    static async #removeItemQty(this: SR5ItemSheet, event: Event) {
        event.preventDefault();
        const id = SheetFlow.closestItemId(event.target);
        const item = this.item.getOwnedItem(id);
        if (item) {
            await SheetFlow.removeFromQuantity(item, event);
        }
    }

    static async #equipItem(this: SR5ItemSheet, event: Event) {
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

    static async #editItem(this: SR5ItemSheet, event: Event) {
        event.preventDefault();
        const id = SheetFlow.closestItemId(event.target);
        const item = this.item.getOwnedItem(id);
        if (item) {
            await item.sheet?.render(true);
        }
    }

    static async #deleteItem(this: SR5ItemSheet, event: Event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const id = SheetFlow.closestItemId(event.target);
        const item = this.item.getOwnedItem(id);
        if (id && item) {
            await this.item.deleteOwnedItem(id);
        }
    }

    static async #addItem(this: SR5ItemSheet, event: Event) {
        event.preventDefault();
        const type = SheetFlow.closestAction(event.target)?.dataset.itemType as Item.ConfiguredSubType;
        const itemData = {
            name: `${game.i18n.localize('SR5.New')} ${Helpers.label(game.i18n.localize(SR5.itemTypes[type]))}`,
            type,
        } satisfies Item.CreateData;
        if (type === 'modification') {
            // add system type to be a weapon when adding a weapon mod
            itemData['system'] = { type: 'weapon' }
        }
        const item = new SR5Item(itemData);
        await this.item.createNestedItem(item._source);
    }

    static async #reloadAmmo(this: SR5ItemSheet, event: Event) {
        event.preventDefault();
        await this.item.reloadAmmo(false);
    }

    static async #partialReloadAmmo(this: SR5ItemSheet, event: Event) {
        event.preventDefault();
        await this.item.reloadAmmo(true);
    }

    static async #resetSpareReloads(this: SR5ItemSheet, event: Event) {
        event.preventDefault();
        const spareClips = this.item.system.ammo?.spare_clips.max ?? 0;
        await this.item.update({ system: { ammo: { spare_clips: { value: spareClips }}}});
    }

    _onAmmoSelect(event: Event) {
        const id = SheetFlow.closestItemId(event.currentTarget);

        if (!id) return;
        void this.item.equipAmmo(id);
    }

    async _onClipSelect(clipType: string) {
        if (!clipType || !Object.keys(SR5.weaponCliptypes).includes(clipType)) return;
        const clip_type = clipType as AmmunitionType['clip_type'];

        const agilityValue = this.item.actor ? this.item.actor.getAttribute('agility').value : 0;
        await this.item.update({
            system: {
                ammo: {
                    clip_type,
                    partial_reload_value: RangedWeaponRules.partialReload(clip_type, agilityValue)
                }
            }
        }, { render: true });
    }

    static async #removeOwnedItem(this: SR5ItemSheet, event: Event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const id = SheetFlow.closestItemId(event.target);

        await this.item.deleteOwnedItem(id);
    }

    static async #removeAllSlaves(this: SR5ItemSheet, event: Event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.item.removeAllSlaves();
    }

    static async #removeSlave(this: SR5ItemSheet, event: Event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const uuid = SheetFlow.closestUuid(event.target);
        const document = fromUuidSync(uuid) as SR5Actor | SR5Item;
        if (!document) return;

        await this.item.removeSlave(document);
    }

    async _onMarksQuantityChange(event: Event) {
        event.stopPropagation();

        if (!this.item.isType('host')) return;

        const currentTarget = event.currentTarget as HTMLInputElement | null;
        const markId = currentTarget?.dataset.markId;
        if (!markId) return;

        const markedDocument = await ActorMarksFlow.getMarkedDocument(markId);
        if (!markedDocument) return;

        const marks = parseInt(currentTarget.value);
        await this.item.setMarks(markedDocument, marks, { overwrite: true });
    }

    static async #addOneQty(this: SR5ItemSheet, event: Event) {
        event.preventDefault();
        await SheetFlow.addToQuantity(this.item, event);
    }

    static async #removeOneQty(this: SR5ItemSheet, event: Event) {
        event.preventDefault();
        await SheetFlow.removeFromQuantity(this.item, event);
    }

    static async #addOneMark(this: SR5ItemSheet, event: Event) {
        await this._onMarksQuantityChangeBy(event, 1);
    }

    static async #removeOneMark(this: SR5ItemSheet, event: Event) {
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

    static async #deleteMarks(this: SR5ItemSheet, event: Event) {
        event.stopPropagation();

        if (!this.item.isType('host')) return;

        const markId = SheetFlow.closestAction(event.target)?.dataset.markId;
        if (!markId) return;

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.item.clearMark(markId);
    }

    static async #deleteAllMarks(this: SR5ItemSheet, event: Event) {
        event.stopPropagation();

        if (!this.item.isType('host')) return;

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.item.clearMarks();
    }

    static async #removeMaster(this: SR5ItemSheet, event: Event) {
        event.preventDefault();

        await this.item.disconnectFromNetwork();
        void this.render(false);
    }

    static async #removeLinkedActor(this: SR5ItemSheet, event: Event) {
        event.preventDefault();

        await this.item.update({ system: { linkedActor: '' }});
    }

    /**
     * Toggle to isFreshImport property of importFlags for an item
     *
     * @param event
     */
    static async #toggleFreshImportFlag(this: SR5ItemSheet, event: Event) {
        const onOff = !this.item.system.importFlags.isFreshImport;
        console.debug('Toggling isFreshImport on item to ->', onOff, event);
        const item = this.item;
        if (item.system.importFlags) {
            await item.update({ system: { importFlags: { isFreshImport: onOff } } });
        }
    }

    static async #toggleEquipped(this: SR5ItemSheet, event: Event) {
        if (this.item.isType('device') && this.item.parent instanceof SR5Actor) {
            await this.item.parent.equipOnlyOneItemOfType(this.item);
            void this.render();
        } else if (this.item.isType('ammo') && this.item.parent instanceof SR5Item) {
            await (this.item.parent as SR5Item).equipAmmo(this.item.id!);
            void this.render();
        } else if (this.item.isType('modification') && this.item.parent instanceof SR5Item) {
            await (this.item.parent as SR5Item).equipWeaponMod(this.item.id);
            void this.render();
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
     */
    static async #toggleWirelessState(this: SR5ItemSheet, event: MouseEvent) {
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
     * Review 123: unused function?
     * Clicking on equipped status should trigger unequipping all other devices of the same type.
     * @param event Click event on the equipped checkbox.
     */
    static async #toggleEquippedDisableOtherDevices(this: SR5ItemSheet, event: Event) {
        event.preventDefault();

        // Assure owned item device.
        if (!(this.document.parent instanceof SR5Actor)) return;
        if (!this.document.isType('device')) return;
        if (!this.document.isEquipped()) return;

        await this.document.parent.equipOnlyOneItemOfType(this.document);
    }

    static async #addEffect(this: SR5ItemSheet, event: Event) {
        // TODO handle nested items
        event.preventDefault();
        const effect = [{
            name: game.i18n.localize("SR5.ActiveEffect.New"),
        }];

        await this.item.createEmbeddedDocuments('ActiveEffect', effect);
    }

    static async #editEffect(this: SR5ItemSheet, event: MouseEvent) {
        const effectId = SheetFlow.closestEffectId(event.target);
        const effect = this.item.effects.get(effectId);
        if (effect instanceof SR5ActiveEffect) {
            await effect.sheet?.render(true);
        } else {
            const uuid = SheetFlow.closestUuid(event.target);
            const doc = fromUuidSync(uuid);
            if (doc instanceof SR5ActiveEffect) {
                await doc.sheet?.render(true);
            }
        }
    }

    static async #toggleEffect(this: SR5ItemSheet, event: MouseEvent) {
        const effectId = SheetFlow.closestEffectId(event.target);
        const effect = this.item.effects.get(effectId);
        if (effect instanceof SR5ActiveEffect) {
            await effect.update({ disabled: !effect.disabled })
        } else {
            const uuid = SheetFlow.closestUuid(event.target);
            const doc = await fromUuid(uuid);
            if (doc instanceof SR5ActiveEffect) {
                await doc.update({ disabled: !doc.disabled })
            }
        }
    }

    static async #deleteEffect(this: SR5ItemSheet, event: MouseEvent) {
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
                callback: async (target: HTMLElement) => {
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
                callback: async (target: HTMLElement) => {
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
                callback: async (target: HTMLElement) => {
                    const id = SheetFlow.closestEffectId(target);
                    const item = this.item.effects.get(id);
                    if (item) {
                        await item.sheet?.render(true)
                    } else {
                        const uuid = SheetFlow.closestUuid(target);
                        const effect = fromUuidSync(uuid);
                        if (effect && effect instanceof SR5ActiveEffect) {
                            await effect.sheet?.render(true);
                        }
                    }
                }
            },
            {
                name: "SR5.ContextOptions.DeleteEffect",
                icon: "<i class='fas fa-trash'></i>",
                condition: (target: HTMLElement) => {
                    const id = SheetFlow.closestEffectId(target);
                    const item = this.item.effects.get(id);
                    return item !== undefined;
                    // don't check for effects by uuid for deletion
                },
                callback: async (target: HTMLElement) => {
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

    // 123 Type it
    override async _processSubmitData(event, form, submitData, options) {
        if (this.item._isNestedItem) {
            await this.item.update(submitData, options);
        } else {
            await super._processSubmitData(event, form, submitData, options);
        }
    }

    static async #toggleActionSpecialization(this: SR5ItemSheet) {
        const action = this.item.getAction();
        if (action) {
            await this.item.update({system: { action: { spec: !action.spec }}});
        }
    }

    static async #toggleActionArmor(this: SR5ItemSheet) {
        const action = this.item.getAction();
        if (action) {
            await this.item.update({system: { action: { armor: !action.armor }}});
        }
    }

    static async #toggleOpposedArmor(this: SR5ItemSheet) {
        const action = this.item.getAction();
        if (action) {
            await this.item.update({system: { action: { opposed: { armor: !action.opposed.armor }}}});
        }
    }

    static async #toggleResistArmor(this: SR5ItemSheet) {
        const action = this.item.getAction();
        if (action) {
            await this.item.update({system: { action: { opposed: { resist: { armor: !action.opposed.resist.armor }}}}});
        }
    }

    static async #editImage(this: SR5ItemSheet, event: MouseEvent) {
        event.preventDefault();

        await new FilePicker({
            type: 'image',
            callback: (path) => {
                if (path) {
                    void this.item.update({ img : path });
                }
            }}).render(true);
    }

    /**
     * Create drag-and-drop workflow handlers for this Application
     * @returns {DragDrop[]}     An array of DragDrop handlers
     * @private
     */
    #createDragDropHandlers(): DragDrop[] {
        return this.options.dragDrop!.map((d) => {
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
     */
    protected _canDragStart(selector): boolean {
        return this.isEditable;
    }

    /**
     * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
     * @param {string} selector       The candidate HTML selector for the drop target
     * @returns {boolean}             Can the current user drop on this selector?
     */
    protected _canDragDrop(selector): boolean {
        return this.isEditable;
    }


    /**
     * Callback actions which occur when a dragged element is over a drop target.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    protected _onDragOver(event: DragEvent) {}

    /* -------------------------------------------- */

    /**
     * An event that occurs when data is dropped into a drop target.
     * @param {DragEvent} event
     * @returns {Promise<void>}
     * @protected
     */
    async _onDrop(event: DragEvent) {
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
    protected async _onDropDocument(event, document) {
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
    async _onDropActor(event: DragEvent, actor: SR5Actor) {
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
    protected async _onDropItem(event: DragEvent, item: SR5Item) {
        // dropped ammo and mods to weapons get added as a nested item
        if (this.item.isType('weapon') && item.isType('ammo', 'modification')) {
            return this.item.createNestedItem(item.toObject());
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
    _onDragStart(event: DragEvent) {
        const target = event.currentTarget as HTMLElement;
        if ( "link" in (event.target as HTMLElement)?.dataset ) return;
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
        event.dataTransfer?.setData("text/plain", JSON.stringify(dragData));
    }

    /**
     * Set any kind of condition monitor to a specific cell value.
     *
     * @event Most return a currentTarget with a value dataset
     */
    static async #modifyConditionMonitor(this: SR5ItemSheet, event: Event) {
        event.preventDefault();

        const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action="modifyConditionMonitor"]')!;

        const track = target.dataset.id;
        let value = Number(target.dataset.value);

        // if the clicked on cell is the current value for it's track, set the value to 0 to clear it
        if (track === 'matrix' && this.item.getConditionMonitor()?.value === value) {
            value = 0;
        }

        if (track === 'matrix') {
            await this.item.setMatrixDamage(value);
        }
    }

    /**
     * Reset all condition tracks to zero values.
     */
    static async #clearConditionMonitor(this: SR5ItemSheet, event: Event) {
        event.preventDefault();

        const track = (event.target as HTMLElement).closest<HTMLElement>('[data-id]')?.dataset.id;
        if (track === 'matrix') {
            await this.item.setMatrixDamage(0);
        }
    }

    /**
     * 123 Review: does it do anything?
     * Handle interaction with a damage track title.
     */
    static async #rollConditionMonitor(this: SR5ItemSheet, event: Event) {
        event.preventDefault();
        const track = (event.target as HTMLElement).closest<HTMLElement>('[data-id]')?.dataset.id;
    }
}
