import { RangedWeaponRules } from './../rules/RangedWeaponRules';
import { SR5Actor } from '../actor/SR5Actor';
import { createItemChatMessage } from '../chat';
import { DEFAULT_ROLL_NAME, FLAGS, SYSTEM_NAME } from '../constants';
import { DataDefaults } from '../data/DataDefaults';
import { Helpers } from '../helpers';
import { ModifiableValue } from '../mods/ModifiableValue';
import { TestCreator } from '../tests/TestCreator';
import { HostPrep } from './prep/HostPrep';
import { LinksHelpers } from '../utils/links';
import { TechnologyPrep } from './prep/functions/TechnologyPrep';
import { SinPrep } from './prep/SinPrep';
import { ActionPrep } from './prep/functions/ActionPrep';
import { RangePrep } from './prep/functions/RangePrep';
import { AdeptPowerPrep } from './prep/AdeptPowerPrep';
import { ArmorPrep } from './prep/functions/ArmorPrep';

import { UpdateActionFlow } from './flows/UpdateActionFlow';
import { UpdateSkillFlow } from './flows/UpdateSkillFlow';
import { ActionResultType, ActionRollType, DamageType } from '../types/item/Action';
import { ItemAvailabilityFlow } from './flows/ItemAvailabilityFlow';
import { WarePrep } from './prep/WarePrep';
import { ConditionType } from '../types/template/Condition';
import { ComplexFormLevelType, FireModeType, FireRangeType, SpellForceType } from '../types/flags/ItemFlags';
import { Migrator } from '../migrator/Migrator';
import { MatrixNetworkFlow } from './flows/MatrixNetworkFlow';
import { ItemRollDataFlow } from './flows/ItemRollDataFlow';
import { ItemMarksFlow } from './flows/ItemMarksFlow';
import { ActorMarksFlow } from '../actor/flows/ActorMarksFlow';
import { AttributeFieldType } from '../types/template/Attributes';
import { RollDataOptions } from './Types';
import { SetMarksOptions } from '../storage/MarksStorage';
import { MatrixDeviceFlow } from './flows/MatrixDeviceFlow';
import { StorageFlow } from '@/module/flows/StorageFlow';
import { ModifiableValueType } from '../types/template/Base';
import { IconAssign } from 'src/module/apps/iconAssigner/IconAssign';
import { allApplicableDocumentEffects } from '../effects';
import { SR5ActiveEffect } from '../effect/SR5ActiveEffect';

type OneOrMany<T> = T | T[];
type LinkedItemTransformer = (item: SR5Item, depth: number) => Item.CreateData | Promise<Item.CreateData>;
interface CreateWithLinkedItemsOptions {
    parentId?: string | null;
    transformAll?: LinkedItemTransformer;
}
const { fromUuid, getProperty, setProperty } = foundry.utils;

/**
 * Implementation of Shadowrun5e items, including dnd5e-style sibling item relationships.
 */
export class SR5Item<SubType extends Item.ConfiguredSubType = Item.ConfiguredSubType> extends Item<SubType> {
    static readonly MAX_CONTAINER_DEPTH = 5;
    static readonly MAX_ATTACHMENT_DEPTH = 5;
    private static readonly MOD_PARENT_TYPES = ['weapon', 'armor', 'vehicle', 'drone', 'bioware', 'cyberware'];

    /**
     * Whether a child item type can be attached to (linked via system.parentId to) a given parent item type.
     */
    static isAttachment(parentType: string, childType: string): boolean {
        if (parentType === 'weapon' && childType === 'ammo') return true;
        return childType === 'modification' && SR5Item.MOD_PARENT_TYPES.includes(parentType);
    }

    /**
     * Prepare creation data for items and all sibling documents linked beneath them.
     * New IDs are assigned up-front so every copied parentId points at the new graph.
     */
    static async createWithLinkedItems(
        items: SR5Item[],
        { parentId = null, transformAll }: CreateWithLinkedItemsOptions = {}
    ): Promise<Item.CreateData[]> {
        const created: Item.CreateData[] = [];
        const visited = new Set<string>();

        const createItemData = async (item: SR5Item, linkedParentId: string | null, depth: number) => {
            if (item.id && visited.has(item.uuid ?? item.id)) return;
            if (item.id) visited.add(item.uuid ?? item.id);

            const transformed = transformAll ? await transformAll(item, depth) : item.toObject();
            const itemData = foundry.utils.deepClone(transformed);
            itemData._id = foundry.utils.randomID();
            setProperty(itemData, 'system.parentId', linkedParentId);
            created.push(itemData);

            const contents = await item.loadContents();
            for (const child of contents) {
                await createItemData(child, itemData._id, depth + 1);
            }
        };

        for (const item of items) await createItemData(item, parentId, 0);
        return created;
    }

    /**
     * Deleting an item deletes everything linked below it via system.parentId — ammo, mods and
     * container contents, at any depth.
     *
     * Every deletion path funnels through here (Document#delete, Actor#deleteEmbeddedDocuments, the
     * sidebar and compendium context menus), so expanding the id list is enough to cover them all.
     * Expanding before the deletion workflow starts also gives each descendant a regular _preDelete.
     */
    static override async deleteDocuments(
        ids: readonly string[] = [],
        operation: Parameters<typeof Item.deleteDocuments>[1] = {}
    ) {
        return super.deleteDocuments(await SR5Item._withDescendantIds(ids, operation), operation);
    }

    /**
     * Expand a list of item ids with every item linked below them via system.parentId.
     *
     * The result is deduplicated: Foundry resolves each id with a strict get and would otherwise run
     * _preDelete twice for a repeat. That also terminates the walk on cyclic parentId data.
     */
    private static async _withDescendantIds(
        ids: readonly string[],
        operation: Parameters<typeof Item.deleteDocuments>[1] = {}
    ): Promise<string[]> {
        // A deleteAll operation removes the whole collection anyway and must pass no ids.
        if (operation.deleteAll) return Array.from(ids);

        const childIdsByParent = new Map<string, string[]>();
        for (const item of await SR5Item._deletionSource(operation)) {
            const parentId = getProperty(item, 'system.parentId');
            if (typeof item._id !== 'string' || typeof parentId !== 'string' || !parentId) continue;

            const siblings = childIdsByParent.get(parentId);
            if (siblings) siblings.push(item._id);
            else childIdsByParent.set(parentId, [item._id]);
        }

        const deleted = new Set(ids);
        const pending = Array.from(deleted);
        while (pending.length > 0) {
            const id = pending.shift()!;
            for (const childId of childIdsByParent.get(id) ?? []) {
                if (deleted.has(childId)) continue;
                deleted.add(childId);
                pending.push(childId);
            }
        }

        return Array.from(deleted);
    }

    /**
     * The collection a deletion operation targets, as sources carrying _id and system.parentId.
     *
     * For compendiums this is the index rather than the documents, so the whole tree is available
     * without loading it. system.parentId is a registered compendium index field, but the index
     * shipped at world load only carries the core fields until it's requested.
     */
    private static async _deletionSource(
        operation: Parameters<typeof Item.deleteDocuments>[1] = {}
    ): Promise<Iterable<{ _id?: string | null }>> {
        if (operation.parent) return operation.parent.items as Iterable<{ _id?: string | null }>;
        if (!operation.pack) return (game.items ?? []) as Iterable<{ _id?: string | null }>;

        const pack = game.packs.get(operation.pack);
        return (await pack?.getIndex() ?? []) as Iterable<{ _id?: string | null }>;
    }

    //Those declarations must be initialized on prepareData, otherwise they will be undefined

    // Compendium children can only be resolved asynchronously, so they're cached by loadPackChildItems.
    declare private _packChildItems?: foundry.utils.Collection<SR5Item>;
    declare descriptionHTML: string | undefined;
    // Item Sheet labels for quick info on an item dropdown.
    declare labels: { roll?: string; opposedRoll?: string };

    static override getDefaultArtwork(itemData?: Item.CreateData): Item.GetDefaultArtworkReturn {
        const fallback = super.getDefaultArtwork(itemData);
        if (!itemData || itemData.img) return fallback;

        const assignedImage = IconAssign.iconAssign(itemData);
        if (!assignedImage) return fallback;

        return { img: assignedImage };
    }


    // Flag Functions
    getLastFireMode(): FireModeType {
        return this.getFlag(SYSTEM_NAME, FLAGS.LastFireMode) || DataDefaults.createData('fire_mode');
    }

    async setLastFireMode(fireMode: FireModeType) {
        return this.setFlag(SYSTEM_NAME, FLAGS.LastFireMode, fireMode);
    }

    getLastSpellForce(): SpellForceType {
        return this.getFlag(SYSTEM_NAME, FLAGS.LastSpellForce) || { value: 0 };
    }

    async setLastSpellForce(force: SpellForceType) {
        return this.setFlag(SYSTEM_NAME, FLAGS.LastSpellForce, force);
    }

    getLastComplexFormLevel(): ComplexFormLevelType {
        return this.getFlag(SYSTEM_NAME, FLAGS.LastComplexFormLevel) || { value: 0 };
    }

    async setLastComplexFormLevel(level: ComplexFormLevelType) {
        return this.setFlag(SYSTEM_NAME, FLAGS.LastComplexFormLevel, level);
    }

    getLastFireRangeMod(): FireRangeType {
        return this.getFlag(SYSTEM_NAME, FLAGS.LastFireRange) || { value: 0 };
    }

    async setLastFireRangeMod(environmentalMod: FireRangeType) {
        return this.setFlag(SYSTEM_NAME, FLAGS.LastFireRange, environmentalMod);
    }

    static override migrateData(source: any) {
        Migrator.migrate('Item', source);
        return super.migrateData(source);
    }

    get parentItem() {
        const parentId = getProperty(this.system, 'parentId') as string | null | undefined;
        if (!parentId) return;

        if (this.isEmbedded) return this.actor?.items.get(parentId) as SR5Item | undefined;
        if (this.pack) return game.packs.get(this.pack)?.getDocument(parentId) as Promise<SR5Item | undefined> | undefined;
        return game.items?.get(parentId) as SR5Item | undefined;
    }

    /**
     * Items linked to this item as children via system.parentId, covering weapon ammo and mods,
     * armor mods and container contents.
     *
     * Compendium children can't be resolved synchronously, so for those this serves the cache filled
     * by loadPackChildItems. Use loadContents() when they must be fetched from the pack instead.
     */
    get childItems(): foundry.utils.Collection<SR5Item> {
        if (this.pack && !this.isEmbedded) return this._packChildItems ?? new foundry.utils.Collection<SR5Item>();
        if (!this.id) return new foundry.utils.Collection<SR5Item>();

        const collection = this.isEmbedded ? this.actor?.items : game.items;
        if (!collection) return new foundry.utils.Collection<SR5Item>();

        return new foundry.utils.Collection<SR5Item>(
            collection.contents.flatMap(item =>
                item.id && item.system.parentId === this.id ? [[item.id, item] as [string, SR5Item]] : []
            )
        );
    }

    /**
     * The storage container this item belongs to, if any.
     */
    get container(): SR5Item | Promise<SR5Item | undefined> | undefined {
        const parentId = getProperty(this.system, 'parentId') as string | null | undefined;
        if (!parentId) return undefined;

        if (this.isEmbedded) {
            const parent = this.actor?.items.get(parentId) as SR5Item | undefined;
            return parent?.isType('container') ? parent : undefined;
        }
        if (this.pack) {
            const pack = game.packs.get(this.pack) as foundry.documents.collections.CompendiumCollection<'Item'> | undefined;
            if (pack?.index.get(parentId)?.type !== 'container') return undefined;
            return pack.getDocument(parentId) as Promise<SR5Item | undefined>;
        }
        const parent = game.items?.get(parentId) as SR5Item | undefined;
        return parent?.isType('container') ? parent : undefined;
    }

    /**
     * Direct storage contents of this container.
     *
     * Unlike childItems this queries the pack for compendium items instead of serving the cache, so
     * it can walk compendium trees which have never been loaded.
     */
    async loadContents(): Promise<foundry.utils.Collection<SR5Item>> {
        if (!this.id) return new foundry.utils.Collection<SR5Item>();
        if (!this.pack || this.isEmbedded) return this.childItems;

        const pack = game.packs.get(this.pack);
        if (!pack) return new foundry.utils.Collection<SR5Item>();

        const documents = await pack.getDocuments({ system: { parentId: this.id } });
        return new foundry.utils.Collection<SR5Item>(
            documents.flatMap(document => document.id ? [[document.id, document as SR5Item] as [string, SR5Item]] : [])
        );
    }

    getContainedItem(id: string) {
        if (this.isEmbedded) return this.actor?.items.get(id);
        if (this.pack) return game.packs.get(this.pack)?.getDocument(id);
        return game.items?.get(id);
    }

    async allContainers(): Promise<SR5Item[]> {
        let item: SR5Item = this;
        const containers: SR5Item[] = [];
        const visited = new Set<string>(this.id ? [this.id] : []);

        while (true) {
            const container = await item.container as SR5Item | null | undefined;
            if (!container?.id || visited.has(container.id)) break;

            containers.push(container);
            visited.add(container.id);
            item = container;
        }

        return containers;
    }

    async canContainItem(item: SR5Item): Promise<boolean> {
        if (!this.isType('container')) return false;
        if (!this.id || !item.id) return false;
        if (this.id === item.id) return false;

        const containers = await this.allContainers();
        if (containers.some(container => container.id === item.id)) return false;
        if (!item.isType('container')) return true;

        const subtreeDepth = await SR5Item._containerSubtreeDepth(item);
        return containers.length + 1 + subtreeDepth <= SR5Item.MAX_CONTAINER_DEPTH;
    }

    private static async _containerSubtreeDepth(item: SR5Item, visited = new Set<string>()): Promise<number> {
        if (!item.id || visited.has(item.id)) return SR5Item.MAX_CONTAINER_DEPTH + 1;
        visited.add(item.id);

        let childDepth = 0;
        const contents = await item.loadContents();
        for (const child of contents) {
            if (!child.isType('container')) continue;
            childDepth = Math.max(childDepth, await SR5Item._containerSubtreeDepth(child, new Set(visited)));
        }

        return childDepth + 1;
    }

    get hasOpposedRoll(): boolean {
        const action = this.getAction();
        if (!action) return false;
        return !!action.opposed.test;
    }

    get hasRoll(): boolean {
        const action = this.getAction();
        return !!(action && action.type !== '' && (action.skill || action.attribute || action.attribute2 || action.dice_pool_mod));
    }

    /**
     * Determine if this action item has a specific action category configured.
     */
    hasActionCategory(category: Shadowrun.ActionCategories) {
        const action = this.asType('action');
        if (!action) return false;
        return action.system.action.categories.includes(category);
    }

    /**
     * Determine if a blast area should be placed using FoundryVTT area templates.
     */
    get hasBlastTemplate(): boolean {
        return this.isAreaOfEffect();
    }

    override prepareBaseData(): void {
        super.prepareBaseData();

        // Description labels might have changed since last data prep.
        // NOTE: this here is likely unused and heavily legacy.
        this.labels = {};

        // Prepare technology data for all item types sharing it.
        const technology = this.getTechnologyData();
        if (technology) {
            TechnologyPrep.prepareConditionMonitor(technology);
            TechnologyPrep.prepareMatrixAttributes(this.system);
            TechnologyPrep.prepareMentalAttributes(this.system);
        }

        if (this.isType('host'))
            HostPrep.prepareBaseData(this.system);
        else if (this.isType('adept_power'))
            AdeptPowerPrep.prepareBaseData(this.system);
        else if (this.isType('sin'))
            SinPrep.prepareBaseData(this.system);
        else if (this.isType('bioware', 'cyberware'))
            WarePrep.prepareBaseData(this.system, this.getEquippedMods());

        if (!this.isEmbedded) {
            this.prepareRelationshipData();
        }
    }

    override prepareDerivedData(this: SR5Item): void {
        super.prepareDerivedData();
        this.applyItemActiveEffects();

        const technology = this.getTechnologyData();
        if (technology) {
            TechnologyPrep.prepareCost(technology);
            TechnologyPrep.prepareAvailability(technology);
            TechnologyPrep.calculateAttributes(this.system.attributes!);
        }

        if (this.isType('host'))
            HostPrep.prepareDerivedData(this.system);
    }

    prepareRelationshipData(): void {
        const equippedMods = this.getEquippedMods();
        const equippedAmmo = this.getEquippedAmmo();
        const technology = this.getTechnologyData();

        if (technology) {
            TechnologyPrep.prepareConceal(technology, equippedMods);
        }

        const action = this.getAction();
        if (action) {
            ActionPrep.prepareData(action, this, equippedMods, equippedAmmo);
        }

        if (this.isRangedWeapon() && this.system.range.rc) {
            RangePrep.prepareData(this.system.range, equippedMods);
        }

        if ('armor' in this.system) {
            ArmorPrep.prepareData(this, equippedMods);
        }
    }

    private applyItemActiveEffects() {
        for (const effect of allApplicableDocumentEffects(this, { applyTo: ['item'] })) {
            if (effect.disabled || effect.isSuppressed) continue;

            const changes = effect.changesForApplyTo('item');

            // prepareData can run more than once without a reset() in between, and ModifiableField.applyChange
            // only pushes entries. Clear this effect's prior contributions from each targeted ModifiableValue
            // before re-applying, so repeated passes don't double them.
            const source = effect.uuid ?? effect.id ?? effect.name;
            for (const change of changes) {
                const altered = { ...change } as unknown as ActiveEffect.ChangeData;
                SR5ActiveEffect.alterChange(this, altered);
                const value = SR5ActiveEffect.getModifiableValue(this, altered.key);
                if (value) ModifiableValue.removeFromSource(value, source);
            }

            for (const change of changes) {
                try {
                    SR5ActiveEffect.applyChange(this, { ...change, effect } as unknown as ActiveEffect.ChangeData);
                } catch (error) {
                    console.error(`Shadowrun5e | Some effect changes could not be applied and might cause issues. Check effects of item (${this.name}) / id (${this.id})`);
                    console.error(error);
                    ui.notifications?.error(`See browser console (F12): Some effect changes could not be applied and might cause issues. Check effects of item (${this.name}) / id (${this.id})`);
                }
            }
        }
    }

    async postItemCard() {
        const options = {
            actor: this.actor,
            description: await this.getChatData(),
            item: this,
            previewTemplate: this.hasBlastTemplate,
            tests: this.getActionTests(),
        };
        return createItemChatMessage(options);
    }

    /**
     * Cast the action of this item as a Test.
     *
     * @param event A PointerEvent by user interaction.
     * @param actor
     */
    async castAction(event?: Event, actor?: SR5Actor) {

        // Only show the item's description by user intention or by lack of testability.
        let dontRollTest = TestCreator.shouldPostItemDescription(event);
        if (dontRollTest) return this.postItemCard();

        // Should be right here so that TestCreator.shouldPostItemDescription(event); can prevent execution beforehand. 
        if (!Hooks.call('SR5_CastItemAction', this)) return;

        dontRollTest = !this.hasRoll;

        if (dontRollTest) return this.postItemCard();

        if (!actor) {
            actor = this.actor ?? undefined;
        }

        if (!actor) return;

        const showDialog = !TestCreator.shouldHideDialog(event);
        const test = await TestCreator.fromItem(this, actor, { showDialog });
        await test?.execute();
        return undefined;
    }

    /**
     * Create display only information for this item. Used on sheets, chat messages and more.
     * Both actor and item sheets.
     *
     * The original naming leans on the dnd5e systems use of it for chat messages.
     * NOTE: This is very legacy, difficult to read and should be improved upon.
     */
    async getChatData(htmlOptions: TextEditor.EnrichmentOptions = {}) {
        const system = foundry.utils.duplicate(this.system) as SR5Item['system'];

        system.description.value = await foundry.applications.ux.TextEditor.implementation.enrichHTML(system.description.value, htmlOptions);

        return system;
    }

    getActionTestName(): string {
        const testName = this.getRollName();
        return testName || game.i18n.localize('SR5.ItemType.Action');
    }

    /**
     * Any item implementation can define a set of modifiers to be applied when used within an opposed test.
     *
     * NOTE: This is a legacy method of applied modifiers to opposed tests but works fine for now.
     */
    getOpposedTestMod(mod: ModifiableValueType): ModifiableValue {
        const parts = new ModifiableValue(mod);

        if (this.hasOpposedTest()) {
            if (this.isAreaOfEffect()) {
                parts.addUnique('SR5.Aoe', -2);
            }
        }

        return parts;
    }

    getBlastData(): { radius: number, dropoff: number } | undefined {
        if (this.isType('spell') && this.isAreaOfEffect()) {
            // By default spell distance is equal to it's Force.
            let distance = this.getLastSpellForce().value;

            // Extended spells have a longer range.
            if (this.system.extended) distance *= 10;

            return {
                radius: distance,
                dropoff: 0,
            };

        } else if (this.isGrenade()) {
            return {
                radius: this.system.thrown.blast.radius,
                dropoff: this.system.thrown.blast.dropoff,
            };
        } else if (this.hasExplosiveAmmo) {
            const item = this.getEquippedAmmo();
            const ammo = item?.asType('ammo');

            if (!ammo) return { radius: 0, dropoff: 0 };

            const distance = ammo.system.blast.radius;
            const dropoff = ammo.system.blast.dropoff;

            return {
                radius: distance,
                dropoff,
            };
        }
        return undefined;
    }

    getEquippedAmmo(): SR5Item<'ammo'> | undefined {
        const equippedAmmos = this.childItems
            .filter((item) => item.isType('ammo') && item.isEquipped()) as SR5Item<'ammo'>[];
        return equippedAmmos[0];
    }

    getEquippedMods(): SR5Item<'modification'>[] {
        const type = this.modificationType();
        if (!type) return [];
        return this.childItems.filter((item) =>
            item.isType('modification') &&
            item.system.type === type &&
            item.isEquipped()
        ) as SR5Item<'modification'>[];
    }

    get hasExplosiveAmmo(): boolean {
        const ammo = this.getEquippedAmmo();
        if (!ammo) return false;
        return ammo.system.blast.radius > 0;
    }

    /**
     * Toggle equipment state of a single Modification item.
     * @param id Modification item id to be equip toggled
     */
    async equipModification(id: string | null, expectedType: Item.SystemOfType<'modification'>['type'] | null = null) {
        if (!id) return;

        const type = expectedType ?? this.modificationType();
        if (!type) return;

        const childItem = this.getChildItem(id);
        if (!childItem?.isType('modification')) return;
        if (childItem.system.type !== type) return;

        await this.equipChildItem(id, 'modification', { unequipOthers: false, toggle: true });
    }

    /**
     * Check if weapon has enough ammunition.
     *
     * @param rounds The amount of rounds to be fired
     * @returns Either the weapon has no ammo at all or not enough.
     */
    hasAmmo(rounds = 0): boolean {
        return this.ammoLeft() >= rounds;
    }

    /**
     * Amount of ammunition this weapon has currently available
     */
    ammoLeft(this: SR5Item): number {
        return this.system.ammo?.current.value || 0;
    }

    /**
     * Use the weapons ammunition with the amount of bullets fired.
     * @param fired Amount of bullets fired.
     */
    async useAmmo(fired) {
        if (!this.isType('weapon')) return;

        const value = Math.max(0, this.system.ammo.current.value - fired);
        return this.update({ system: { ammo: { current: { value } } } });
    }

    /**
     * Can this item (weapon, melee, ranged, whatever) use ammunition?
     *
     * @returns true, for weapons with ammunition.
     */
    usesAmmo(): boolean {
        if (this.isType('weapon'))
            return Boolean(this.system.ammo.current.max);
        return false;
    }

    /**
     * Unload the ammo within a weapon
     * - this removes all the ammo within the weapon and loads it back into the equipped ammo
     */
    async unloadAmmo() {
        const weapon = this.asType('weapon');
        if (!weapon) return;

        const current = weapon.system.ammo.current.value;

        // don't bother unloading ammo that doesn't exist
        if (current === 0) return;

        const ammo = this.getEquippedAmmo();

        if (ammo) {
            const ammoQty = ammo.system.technology.quantity;

            const newQty = ammoQty + current;

            // update the ammo quantity to its previous value
            await ammo.update({ system: { technology: { quantity: Math.max(0, newQty) } } });
        }

        await this.update({
            system: {
                ammo: {
                    // update our ammo count to 0 on the weapon
                    current: { value: 0 },
                },
            },
        });
    }

    /**
     * Reload this weapon according to information in:
     * - its current clips
     * - its available spare clips (when given)
     * - its equipped ammo
     *
     * This method will only reload the weapon to the max amount of ammo available.
     *
     * TODO: Currently only the minimal amount of bullets is reloaded. For weapons using ejectable clips, this should be full clip capacity.
     */
    async reloadAmmo(isPartial: boolean) {
        const weapon = this.asType('weapon');
        if (!weapon) return;

        // Determine how many bullets can be reloaded based on clip type and agility.
        const maxPartial = RangedWeaponRules.partialReload(
            weapon.system.ammo.clip_type,
            this.actor?.getAttribute('agility').value,
        );

        // Fallback to full reload if there is no partial reload.
        if (maxPartial === -1) isPartial = false;

        const ammo = this.getEquippedAmmo();
        const current = weapon.system.ammo.current.value;
        const max = weapon.system.ammo.current.max;

        // Number of bullets missing from the weapon.
        const missing = Math.max(0, max - current);
        // How many bullets would be reloaded in a partial reload.
        const partialAmount = Math.min(missing, maxPartial);
        // Use available ammo quantity, or fallback to max if ammo isn't enforced.
        const available = ammo?.system.technology.quantity ?? max;

        // Validate ammunition and clip availability.
        if (weapon.system.ammo.spare_clips.value === 0 && weapon.system.ammo.spare_clips.max > 0) {
            // Should this ever be enforced, change info to warn.
            ui.notifications?.info('SR5.Warnings.CantReloadWithoutSpareClip', { localize: true });
        }

        const ammoQty = ammo?.system.technology.quantity ?? 0;
        if (ammo && ammoQty === 0) {
            ui.notifications?.warn('SR5.Warnings.CantReloadAtAllDueToAmmo', { localize: true });
            return;
        }
        if (ammo && ammoQty < missing) {
            if (isPartial && partialAmount !== -1 && ammoQty < partialAmount)
                ui.notifications.info('SR5.Warnings.CantReloadPartialDueToAmmo', { localize: true });
            else
                ui.notifications.info('SR5.Warnings.CantReloadFullyDueToAmmo', { localize: true });
        }

        // Prepare what can be reloaded.
        const reloaded = Math.min(
            missing,
            available,
            isPartial ? partialAmount : Infinity,
        );

        await this.update({
            system: {
                ammo: {
                    current: { value: current + reloaded },
                    ...(weapon.system.ammo.spare_clips.max > 0 && {
                        spare_clips: { value: Math.max(0, weapon.system.ammo.spare_clips.value - 1) },
                    }),
                },
            },
        });

        await ammo?.update({ system: { technology: { quantity: Math.max(0, ammoQty - reloaded) } } });
    }

    async equipChildItem(id: string | null, type: string, options: { unequipOthers?: boolean, toggle?: boolean } = {}) {
        const unequipOthers = options.unequipOthers || false;
        const toggle = options.toggle || false;

        // Collect all item data and update at once.
        const updateData: Item.UpdateData[] = [];
        const ammoItems = this.childItems.filter(item => item.type === type);

        for (const item of ammoItems) {
            if (!unequipOthers && item.id !== id) continue;
            const equip = toggle ? !item.system.technology?.equipped : id === item.id;

            updateData.push({ _id: item.id, system: { technology: { equipped: equip } } });
        }

        if (updateData) await this.updateChildItems(updateData);
    }

    /**
     * Equip one ammo item exclusively.
     *
     * @param id Item id of the to be exclusively equipped ammo item.
     */
    async equipAmmo(id: string) {
        // first unload the current ammo
        await this.unloadAmmo();
        const equippedAmmo = this.getEquippedAmmo();
        if (id === equippedAmmo?.id) {
            await equippedAmmo.update({ system: { technology: { equipped: false } } });
        } else {
            // then equip the new ammo
            await this.equipChildItem(id, 'ammo', { unequipOthers: true });
        }
    }

    async addNewLicense() {
        if (!this.isType('sin')) return;

        // NOTE: This might be related to Foundry data serialization sometimes returning arrays as ordered HashMaps...
        const licenses = foundry.utils.getType(this.system.licenses) === 'Object' ?
            Object.values(this.system.licenses) :
            [...this.system.licenses];

        if (!licenses) return;

        // Add the new license to the list
        licenses.push(DataDefaults.createData('license'));

        await this.update({ system: { licenses } });
    }

    /**
     * This method is used to add a new network to a SIN item.
     *
     * @param item The network item to add to this SIN.
     */
    async addNewNetwork(item: SR5Item) {
        const sin = this.asType('sin');
        if (!sin) return;
        if (!item.uuid) return;
        if (!item.isNetwork()) return;

        sin.system.networks.push(item.uuid);
        await this.update({ system: { networks: sin.system.networks } });
    }

    modificationType(): Item.SystemOfType<'modification'>['type'] | null {
        if (this.isType('weapon')) return 'weapon';
        if (this.isType('armor')) return 'armor';
        if (this.isType('bioware', 'cyberware')) return 'ware';
        return null;
    }

    /**
     * SIN Item - remove a single license within this SIN
     *
     * @param index The license list index
     */
    async removeLicense(index: number) {
        if (this.isType('sin')) {
            const licenses = [...this.system.licenses];
            licenses.splice(index, 1);
            await this.update({ system: { licenses } });
        }
    }

    /**
     * The item can be stored on a token on the current or another, given, scene.
     *
     * The chat message must contain a data attribute containing a 'SceneId.TokenId' mapping.
     * See chat.ts#getTokenSceneId for further context.
     */
    static getItemFromMessage(html: JQuery): SR5Item | undefined {
        if (!game?.scenes || !game.ready || !canvas || !canvas.ready || !canvas.scene) return;

        const card = html.find('.chat-card');
        let actor: Actor.Implementation | undefined | null;
        const sceneTokenId = card.data('tokenId');
        if (sceneTokenId) actor = Helpers.getSceneTokenActor(sceneTokenId);
        else actor = game.actors?.get(card.data('actorId'));

        if (!actor) return;
        const itemId = card.data('itemId');
        return actor.items.get(itemId);
    }

    static getTargets() {
        if (!game.ready || !game.user) return;
        const { character } = game.user;
        const { controlled } = canvas.tokens!;
        const targets = controlled.reduce<SR5Actor[]>((arr, t) => t.actor ? [...arr, t.actor] : arr, []);
        if (character instanceof SR5Actor && controlled.length === 0) targets.push(character);
        if (!targets.length) throw new Error(`You must designate a specific Token as the roll target`);
        return targets;
    }

    getActionTests() {
        if (!this.hasRoll) return [];

        return [{
            label: this.getActionTestName(),
            uuid: this.uuid,
        }];
    }

    /**
     * Retrieve the action result for this item if it is of type 'action'.
     * @returns The action result, or undefined if not applicable.
     */
    getActionResult(): ActionResultType | undefined {
        return this.isType('action') ? this.system.result : undefined;
    }

    /**
     * Create child items linked to this item via system.parentId
     * @param itemData
     */
    async createChildItems(itemData: Item.Source | Item.Source[]) {
        if (!Array.isArray(itemData)) itemData = [itemData];
        if (!this.id) return false;

        const toCreate = itemData
            .map(data => this._prepareChildItemData(foundry.utils.duplicate(data) as Item.Source))
            .filter((data): data is Item.Source => data !== null);

        if (toCreate.length === 0) return false;

        if (this.isEmbedded && this.actor) {
            await this.actor.createEmbeddedDocuments('Item', toCreate as Item.CreateData[]);
        } else if (this.pack) {
            await Item.implementation.createDocuments(toCreate as Item.CreateData[], { pack: this.pack });
        } else {
            await Item.implementation.createDocuments(toCreate as Item.CreateData[]);
        }

        await this.refreshLinkedData();

        return true;
    }

    /**
     * Load children which cannot be resolved synchronously, meaning compendium items only.
     *
     * The resulting cache is preserved across reset() so data preparation can use those documents.
     */
    async loadPackChildItems(): Promise<foundry.utils.Collection<SR5Item>> {
        if (!this.pack || this.isEmbedded) return this.childItems;

        this._packChildItems = await this.loadContents();
        return this._packChildItems;
    }

    /**
     * Reinitialize this item after its linked sibling documents change.
     */
    async refreshLinkedData({ render = true } = {}) {
        if (this.pack && !this.isEmbedded) await this.loadPackChildItems();
        this.reset();
        if (this.isEmbedded) this.prepareRelationshipData();
        if (render) this.render(false);
    }

    private _prepareChildItemData(item: Item.Source): Item.Source | null {
        if (!SR5Item.isAttachment(this.type, item.type) || !this.id) return null;

        delete (item as Partial<Item.Source>)._id;
        setProperty(item, 'system.parentId', this.id);
        setProperty(item, '_stats.systemVersion', game.system.version);

        const modificationType = this.modificationType();
        if (item.type === 'modification' && modificationType) setProperty(item, 'system.type', modificationType);

        return item;
    }

    getChildItem(itemId: string): SR5Item | undefined {
        return this.childItems.get(itemId);
    }

    async updateChildItems(changes: OneOrMany<Item.UpdateInput>) {
        const changesArray = Array.isArray(changes) ? changes : [changes];
        const updates = changesArray.filter(change => typeof change._id === 'string' && this.getChildItem(change._id) !== undefined);
        if (updates.length === 0) return;

        if (this.isEmbedded && this.actor) {
            await this.actor.updateEmbeddedDocuments('Item', updates);
        } else if (this.pack) {
            await Item.implementation.updateDocuments(updates, { pack: this.pack });
        } else {
            await Item.implementation.updateDocuments(updates);
        }
        await this.refreshLinkedData();
    }

    /**
     * Remove a child item
     * @param deleted
     * @returns {Promise<boolean>}
     */
    async deleteChildItem(deleted: string): Promise<boolean> {
        const item = this.getChildItem(deleted);
        if (!item) throw new Error(`Shadowrun5e | Couldn't find child item ${deleted}`);

        if (this.isEmbedded && this.actor) {
            await this.actor.deleteEmbeddedDocuments('Item', [deleted]);
        } else if (this.pack) {
            await Item.implementation.deleteDocuments([deleted], { pack: this.pack });
        } else {
            await Item.implementation.deleteDocuments([deleted]);
        }

        await this.refreshLinkedData();
        return true;
    }

    /**
     * Use the items source field and try different means of opening it.
     */
    async openSource() {
        const source = this.getSource();
        await LinksHelpers.openSource(source);
    }

    get sourceIsUrl(): boolean {
        const source = this.getSource();
        return LinksHelpers.isURL(source);
    }

    get sourceIsPDF(): boolean {
        const source = this.getSource();
        return LinksHelpers.isPDF(source);
    }

    get sourceIsUuid(): boolean {
        const source = this.getSource();
        return LinksHelpers.isUuid(source);
    }

    get hasSource(): boolean {
        const source = this.getSource();
        return !!source;
    }

    _canDealDamage(): boolean {
        // NOTE: Double negation to force boolean comparison casting.
        const action = this.getAction();
        if (!action) return false;
        return !!action.damage.type.base;
    }

    /**
     * Apply damage to any type of technology item.
     *
     * @param damage Damage to be applied.
     */
    async addDamage(damage: DamageType) {
        if (damage.type.value === 'matrix')
            return this.addMatrixDamage(damage);
    }

    /**
     * Apply matrix damage to a technology item.
     *
     * @param damage The matrix damage to be applied.
     */
    async addMatrixDamage(damage: DamageType) {
        if (damage.type.value !== 'matrix') return;

        const track = this.getConditionMonitor();
        if (!track) return;

        const toApply = Math.min(track.value + damage.value, track.max);

        await this.update({ system: { technology: { condition_monitor: { value: toApply } } } });
    }

    /**
     * Set the matrix damage on a technology item
     *
     * @param value the matrix damage to set the condition monitor to
     */
    async setMatrixDamage(value: number) {
        const track = this.getConditionMonitor();
        if (!track) return;

        const toApply = Math.min(value, track.max);

        await this.update({ system: { technology: { condition_monitor: { value: toApply } } } });
    }

    getAction(this: SR5Item): ActionRollType | undefined {
        return this.system.action;
    }

    getTechnologyData(this: SR5Item) {
        return this.system.technology;
    }

    getMasterUuid() {
        return this.getTechnologyData()?.master;
    }

    parseAvailibility(avail: string) {
        return ItemAvailabilityFlow.parseAvailability(avail);
    }

    async setMasterUuid(masterUuid: string | undefined): Promise<void> {
        await this.update({ system: { technology: { master: masterUuid } } });
    }

    getRollName(): string {
        if (this.isRangedWeapon()) {
            return game.i18n.localize('SR5.RangeWeaponAttack');
        }
        if (this.isMeleeWeapon()) {
            return game.i18n.localize('SR5.MeleeWeaponAttack');
        }
        if (this.isCombatSpell()) {
            return game.i18n.localize('SR5.Spell.Attack');
        }
        if (this.isType('spell')) {
            return game.i18n.localize('SR5.Spell.Cast');
        }
        if (this.hasRoll) {
            return this.name;
        }

        return DEFAULT_ROLL_NAME;
    }

    isType<ST extends readonly Item.ConfiguredSubType[]>(this: SR5Item, ...types: ST): this is SR5Item<ST[number]> {
        return types.includes(this.type as ST[number]);
    }

    asType<ST extends readonly Item.ConfiguredSubType[]>(this: SR5Item, ...types: ST): SR5Item<ST[number]> | undefined {
        return types.some((t) => this.isType(t)) ? this : undefined;
    }

    /**
     * An attack with this weapon will create an area of effect / blast.
     *
     * There is a multitude of possibilities as to HOW an item can create an AoE,
     * both directly connected to the item and / or some of it's nested items.
     *
     */
    isAreaOfEffect(): boolean {
        return (this.isType('weapon') && this.system.category === 'thrown' && this.system.thrown.blast.radius > 0)
            || (this.isType('weapon') && (this.getEquippedAmmo()?.system.blast?.radius ?? 0) > 0)
            || (this.isType('spell') && this.system.range === 'los_a')
            || (this.isType('ammo') && this.system.blast.radius > 0);
    }

    isGrenade(): this is SR5Item<'weapon'> & { system: { category: 'thrown' } } {
        return this.isThrownWeapon() && (this.system.thrown?.blast.radius ?? 0) > 0;
    }

    isThrownWeapon(): this is SR5Item<'weapon'> & { system: { category: 'thrown' } } {
        return this.isType('weapon') && this.system.category === 'thrown';
    }

    isRangedWeapon(): this is SR5Item<'weapon'> & { system: { category: 'range' } } {
        return this.isType('weapon') && this.system.category === 'range';
    }

    isMeleeWeapon(): this is SR5Item<'weapon'> & { system: { category: 'melee' } } {
        return this.isType('weapon') && this.system.category === 'melee';
    }

    isCombatSpell(): this is SR5Item<'spell'> & { system: { category: 'combat' } } {
        return this.isType('spell') && this.system.category === 'combat';
    }

    get isSummoning(): boolean {
        return this.isType('call_in_action') && this.system.actor_type === 'spirit';
    }

    get isCompilation(): boolean {
        return this.isType('call_in_action') && this.system.actor_type === 'sprite';
    }

    /**
     * Retrieve the actor document linked to this item.
     * e.g.: Contact items provide linked actors
     */
    async getLinkedActor(this: SR5Item): Promise<SR5Actor | undefined> {
        const uuid = this.system.linkedActor;

        if (uuid && this.isType('contact') && foundry.utils.parseUuid(uuid).documentType === 'Actor')
            return fromUuid(uuid) as Promise<SR5Actor>;

        return undefined;
    }

    /**
     * Calculate the total essence loss for bioware or cyberware items.
     * Uses the adjusted essence value if available, otherwise falls back to the base essence.
     * Multiplies by the quantity of the item.
     *
     * @returns The total essence loss as a number.
     */
    getEssenceLoss(this: SR5Item<'bioware' | 'cyberware' | 'modification'>): number {
        const tech = this.system.technology;
        const quantity = Number(tech?.quantity) || 1;

        let essenceLoss = 0;
        if (this.isType('bioware', 'cyberware')) {
            essenceLoss = tech.essence.value;
        } else if (this.isType('modification') && this.system.type === 'ware') {
            essenceLoss = this.system.essence;
        }

        if (isNaN(essenceLoss)) essenceLoss = 0;
        return essenceLoss * quantity;
    }

    get ASDF() {
        const device = this.asType('device');
        if (device) {
            const asdf = device.getASDF();
            return Object.values(asdf).map(x => new Handlebars.SafeString(`${x.value || '-'}`));
        }
        return [];
    }

    getASDF(this: SR5Item<'device'>) {
        // matrix attributes are set up as an object
        const matrix = {
            attack: {
                value: 0,
                device_att: '',
            },
            sleaze: {
                value: 0,
                device_att: '',
            },
            data_processing: {
                value: this.getRating(),
                device_att: '',
            },
            firewall: {
                value: this.getRating(),
                device_att: '',
            },
        } as Record<Shadowrun.MatrixAttribute, {value: number; device_att: '' | 'att1' | 'att2' | 'att3' | 'att4'}>;

        // This if statement should cover all types of devices, meaning the "getRating" calls above are always overwritten
        if (['cyberdeck', 'rcc', 'commlink'].includes(this.system.category)) {
            const atts = this.system.atts;
            if (atts) {
                for (const [key, att] of Object.entries(atts)) {
                    // only apply the atts if the value is over zero
                    // this was causing the previous values to always be overwritten
                    if (att.value <= 0 || !att.att) continue;
                    matrix[att.att].value = att.value;
                    matrix[att.att].device_att = key;
                }
            }
        }

        return matrix;
    }

    canBeEquipped(this: SR5Item): boolean {
        // currently only technology items with technology can be equipped
        return !!this.getTechnologyData();
    }

    isEquipped(this: SR5Item): boolean {
        if (this.isType('critter_power', 'sprite_power')) {
            return this.system.optional !== 'disabled_option';
        }
        return this.system.technology?.equipped ?? false;
    }

    getSource(this: SR5Item): string {
        return this.system.description?.source ?? '';
    }

    async setSource(this: SR5Item, source: string) {
        await this.update({ system: { description: { source } } });
        this.render(true);
    }

    getConditionMonitor(this: SR5Item): ConditionType {
        return this.system.technology?.condition_monitor || DataDefaults.createData('condition_monitor');
    }

    getRating(this: SR5Item): number {
        return this.system.technology?.rating || 0;
    }

    /**
     * Determine if this item can contain armor.
     * This can happen both for actual armor and items containing armor data.
     * @returns true, if this item can provide armor values.
     */
    hasArmor(this: SR5Item) {
        const armor = this.system.armor;
        return this.isType('armor') || !!armor;
    }

    /**
     * Amount of current recoil left after recoil compensation.
     */
    get unhandledRecoil(): number {
        if (!this.isRangedWeapon() || !this.actor) return 0;
        return Math.max(this.actor.recoil() - this.totalRecoilCompensation, 0);
    }

    /**
     * Amount of recoil compensation totally available when using weapon
     *
     * This includes both actor and item recoil compensation.
     */
    get totalRecoilCompensation(): number {
        if (!this.isRangedWeapon()) return 0;
        return RangedWeaponRules.recoilCompensation(this);
    }

    /**
     * Current TOTAL recoil compensation with current recoil included.
     *
     * This includes both the items and it's parent actors recoil compensation and total progressive recoil.
     *
     * @returns A positive number or zero.
     */
    get currentRecoilCompensation(): number {
        if (!this.actor || !this.isRangedWeapon()) return 0;
        return Math.max(this.totalRecoilCompensation - this.actor.recoil(), 0);
    }

    getReach(this: SR5Item): number {
        if (this.isMeleeWeapon())
            return this.system.melee.reach ?? 0;
        return 0;
    }

    getCondition(): NonNullable<SR5Item['system']['technology']>['condition_monitor'] | undefined {
        return this.getTechnologyData()?.condition_monitor;
    }

    hasOpposedTest(): boolean {
        if (!this.hasOpposedRoll) return false;
        const action = this.getAction();
        if (!action) return false;
        return action.opposed.test !== '';
    }

    /**
     * A host type item can store IC actors to spawn in order, use this method to add into that.
     * @param ic: The IC actor to add to this host item.
     */
    async addIC(ic: SR5Actor) {
        const host = this.asType('host');
        if (!host) return;
        const icData = ic.asType('ic');
        if (!icData) return;

        await MatrixNetworkFlow.addSlave(this, ic);
    }

    /**
     * A host type item can contain IC in an order. Use this function remove IC at the said position
     * @param index The position in the IC order to be removed
     */
    async removeIC(ic: SR5Actor) {
        const host = this.asType('host');
        if (!host) return;
        const icData = ic.asType('ic');
        if (!icData) return;

        await MatrixNetworkFlow.removeSlave(this, ic);
    }

    /**
     * Get all active IC actors of a host
     */
    getIC() {
        const host = this.asType('host');
        if (!host) return [];

        // return host.system.ic.map(uuid => fromUuidSync(uuid)) as SR5Actor[];
        const slaves = MatrixNetworkFlow.getSlaves(this);
        // We can´t use isIC as both devices and actors might be returned
        return slaves.filter(slave => slave.type === 'ic');
    }

    /**
     * Retrieve slaved devices but not slaved personas.
     *
     * @returns A list of slaved devices.
     */
    async getDevices() {
        const host = this.asType('host');
        if (!host) return [];

        const slaves = MatrixNetworkFlow.getSlaves(this);
        // TODO: There are more than only devices that can be matrix devices.
        return slaves.filter(slave => slave.type === 'device') as SR5Item[];
    }

    override async update(data: Item.UpdateInput, options?: Item.Database.UpdateOneDocumentOperation) {
        await Migrator.updateMigratedDocument(this);
        // Actor.item => Directly owned item by an actor!
        return super.update(data, options);
    }

    isWireless(this: SR5Item): boolean {
        return this.isMatrixDevice &&
            (this.system.technology?.wireless === 'online' || this.isRunningSilent());
    }

    isRunningSilent(): boolean {
        return this.isMatrixDevice && (this as SR5Item).system.technology?.wireless === 'silent';
    }

    isLivingPersona(this: SR5Item) {
        return this.isType('device') && this.system.category === 'living_persona';
    }

    canBeWireless(this: SR5Item): boolean {
        return this.isMatrixDevice && this.system.technology?.wireless !== 'none';
    }

    isPublicGrid(this: SR5Item) {
        return this.isType('grid') && this.system.category === 'public';
    }

    isNetwork(this: SR5Item): this is SR5Item<'grid' | 'host'> {
        return this.isType('host', 'grid');
    }

    isOfflineIcon(): boolean {
        const technologyData = this.getTechnologyData();
        if (!technologyData) return false;
        return technologyData.wireless === 'none' || technologyData.wireless === 'offline';
    }

    /**
     * Determine if an item has taken Matrix Damage
     */
    get isDamaged(): boolean {
        const monitor = this.getConditionMonitor();
        // if the monitor max isn't greater than 0, assume it isn't damaged
        return monitor.max > 0 && monitor.value > 0;
    }

    /**
     * Determine if an item's Matrix Condition Monitor is filled
     */
    get isBroken(): boolean {
        const monitor = this.getConditionMonitor();
        // if the monitor max isn't greater than 0, assume it isn't broken
        return monitor.max > 0 && monitor.value >= monitor.max;
    }

    /**
     * Determine if this item is part of a WAN / PAN network.
     *
     * @returns true, when item is part of any network, false if not.
     */
    get isSlave(): boolean {
        if (!this.isMatrixDevice) return false;
        return !!this.master;
    }

    /**
     * Should this matrix item be visible to a player?
     */
    matrixIconVisibleToPlayer(this: SR5Item): boolean {
        return this.system.matrix?.visible === true;
    }

    /**
     * Place a Matrix Mark for this Item.
     *
     * @param target The Document the marks are placed on. This can be an actor (character, technomancer, IC) OR an item (Host)
     * @param marks Amount of marks to be placed.
     * @param options Additional options that may be needed.
     *
     */
    async setMarks(target: SR5Actor | SR5Item | undefined, marks: number, options?: SetMarksOptions) {
        await ItemMarksFlow.setMarks(this, target, marks, options);
    }

    /**
     * Get the marks placed for a single target
     * @param uuid The id of that target
     * @returns Amount of marks
     */
    getMarksPlaced(uuid: string): number {
        return ItemMarksFlow.getMarksPlaced(this, uuid);
    }

    /**
     * Get all marks placed by this item.
     * @returns The set of marks
     */
    get marksData() {
        return ItemMarksFlow.getMarksData(this);
    }

    /**
     * Remove ALL marks placed by this item.
     * TODO: Use MarksFlow global storage
     */
    async clearMarks() {
        await ItemMarksFlow.clearMarks(this);
    }

    /**
     * Remove marks placed on one target document.
     * @param uuid Of the target document.
     */
    async clearMark(uuid: string) {
        await ItemMarksFlow.clearMark(this, uuid);
    }

    /**
     * Configure the given matrix item to be controlled by this item in a PAN/WAN.
     * @param slave The matrix item to be connected.
     * @param options.triggerUpdates - trigger updates to the documents to rerender the sheets
     */
    async addSlave(slave: SR5Actor | SR5Item, options?: { triggerUpdate?: boolean }) {
        await MatrixNetworkFlow.addSlave(this, slave, options);
    }

    /**
     * In case this item is a network master, remove the slave from the network.
     * @param slave The matrix item to be disconnected.
     */
    async removeSlave(slave: SR5Actor | SR5Item) {
        await MatrixNetworkFlow.removeSlave(this, slave);
    }

    async removeAllSlaves() {
        await MatrixNetworkFlow.removeAllSlaves(this);
    }

    /**
     * Return all documents marked by this host and it's IC.
     *
     * For other items, fall back to no documents.
     *
     * @returns Foundry Documents with marks placed.
     */
    getAllMarkedDocuments(): Shadowrun.MarkedDocument[] {
        if (!this.isType('host')) return [];

        const marksData = this.marksData;
        if (!marksData) return [];

        return ActorMarksFlow.getMarkedDocuments(marksData);
    }

    /**
     * Return the network master item when connected to a PAN or WAN.
     *
     * @returns The master item or undefined if not connected to a network.
     */
    get master() {
        return MatrixNetworkFlow.getMaster(this);
    }

    /**
     * Return the persona document for this matrix device.
     *
     * @returns
     */
    get persona() {
        const technologyData = this.getTechnologyData();
        if (!technologyData) return;

        return this.actor ?? undefined;
    }

    /**
     * Return all network device items within a possible PAN or WAN.
     */
    get slaves() {
        return MatrixNetworkFlow.getSlaves(this);
    }

    /**
     * Only devices can control a network.
     */
    get canBeMaster(): boolean {
        return this.isType('device', 'host', 'grid');
    }

    /**
     * Assume all items with that are technology (therefore have a rating) are active matrix devices.
     */
    get canBeSlave(): boolean {
        return this.isMatrixDevice;
    }

    /**
     * Determine if this icon can be used as a matrix icon.
     */
    get canBeMatrixIcon(): boolean {
        return this.isMatrixDevice;
    }

    get isMatrixDevice(): boolean {
        const technologyData = this.getTechnologyData();
        return !!technologyData;
    }

    /**
     * Determine if this device is used as the owning actors active persona device to connect to the matrix.
     * @returns true, if this device is used as the active persona device.
     */
    isActivePersonaDevice() {
        const actor = this.actor;
        if (!actor) return false;
        const personaDevice = actor.getMatrixDevice() as SR5Item | undefined;
        if (!personaDevice) return false;
        return personaDevice.id === this.id;
    }

    /**
     * Is this matrix device part of an active network?
     */
    get hasMaster(): boolean {
        const technologyData = this.getTechnologyData();
        if (!technologyData) return false;

        return !!technologyData.master;
    }

    /**
     * Disconnect any kind of item from a PAN or WAN.
     */
    async disconnectFromNetwork() {
        if (this.canBeMaster) await MatrixNetworkFlow.removeAllSlaves(this);
        if (this.canBeSlave) await MatrixNetworkFlow.removeSlaveFromMaster(this);
    }

    /**
     * Return the given attribute, no matter its source.
     *
     * This might be an actual attribute or another value type used as one during testing.
     *
     * @param name An attribute or other stats name.
     * @returns Either an AttributeField or undefined, if the attribute doesn't exist on this document.
     */
    getAttribute(name: string, options: { rollData?: SR5Item['system'] } = {}): AttributeFieldType | undefined {
        const rollData = options.rollData || this.getRollData();
        // Attributes for hosts work only within their own attributes.
        if (this.isType('host')) {
            const rollData = this.getRollData();
            return rollData.attributes?.[name];
        }

        return rollData.attributes?.[name];
    }

    /**
     * Change a matrix attribute to a new slot and switch it's place with the previous attribute residing there.
     *
     * @param changedSlot 'att1', ... 'att4'
     * @param changedAttribute 'attack'
     */
    async changeMatrixAttributeSlot(this: SR5Item, changedSlot: string, changedAttribute: Shadowrun.MatrixAttribute) {
        if (!this.system.atts) return;
        const updateData = MatrixDeviceFlow.changeMatrixAttribute(this.system.atts, changedSlot, changedAttribute);
        return this.update(updateData);
    }

    /**
     * Transparently build a set of roll data based on this items type and network status.
     *
     * Values for testing can depend on other actors and items.
     *
     * NOTE: Since getRollData is sync by default, we can't retrieve compendium documents here, resulting in fromUuidSync calls down
     *       the line.
     */
    override getRollData(options: RollDataOptions = {}) {
        // Create a system data copy to avoid cross-contamination
        const rollData = options.copySystem ? this.system.toObject(false) : super.getRollData();
        return ItemRollDataFlow.getRollData(this, rollData, options);
    }

    override async _preCreate(...args: Parameters<Item['_preCreate']>) {
        const [data] = args;
        const result = await super._preCreate(...args);
        if (result === false) return false;

        UpdateActionFlow.injectActionTestsIntoChangeData(this.type, data, data, this);
        return result;
    }

    /**
     * Reset everything that needs to be reset between two runs.
     */
    async resetRunData() {
        if (this.isNetwork()) {
            await this.removeImprovisedDevices();
        }

        return this.clearMarks();
    }

    /**
     * Delete all improvised devices connected to this host or grid.
     */
    async removeImprovisedDevices() {
        if (!this.isNetwork()) return 0;
        return MatrixNetworkFlow.removeImprovisedDevices(this);
    }

    /**
     * Make sure all item data is in a persistent and valid status.
     *
     * This is preferred to altering data on the fly in the prepareData methods flow.
     */
    override async _preUpdate(...args: Parameters<Item['_preUpdate']>) {
        const [changed, options] = args;
        const id = this.id;
        if (id && foundry.utils.hasProperty(changed, 'system.parentId')) {
            const formerParentIds = ((options as any).sr5FormerParentIds ??= {});
            formerParentIds[id] = getProperty(this.system, 'parentId');
        }

        // Some Foundry core updates will no diff and just replace everything. This doesn't match with the
        // differential approach of action test injection. (NOTE: Changing ownership of a document)
        if (options.diff && options.recursive) {
            // Change used action test implementation when necessary.
            UpdateActionFlow.injectActionTestsIntoChangeData(this.type, changed, changed, this);
            await UpdateActionFlow.onUpdateAlterActionData(changed, this);
            UpdateSkillFlow.injectSkillCategoryDefaults(changed, this);
        }

        return super._preUpdate(...args);
    }

    /**
     * Handle system specific things before this item is deleted
     * @param args
     */
    override async _preDelete(...args: Parameters<Item['_preDelete']>) {
        await StorageFlow.deleteStorageReferences(this);
        return super._preDelete(...args);
    }

    override _onCreate(...args: Parameters<Item['_onCreate']>) {
        super._onCreate(...args);
        const [, options] = args;
        if (options.render === false) return;
        void this._refreshLinkedParents([getProperty(this.system, 'parentId')]);
    }

    override _onUpdate(...args: Parameters<Item['_onUpdate']>) {
        super._onUpdate(...args);
        const [, options] = args;
        if (options.render === false) return;

        void this._refreshLinkedParents([
            this.id ? (options as any).sr5FormerParentIds?.[this.id] : undefined,
            getProperty(this.system, 'parentId'),
        ]);
    }

    override _onDelete(...args: Parameters<Item['_onDelete']>) {
        super._onDelete(...args);
        const [options] = args;
        if (options.render === false) return;
        void this._refreshLinkedParents([getProperty(this.system, 'parentId')]);
    }

    /**
     * Re-prepare and rerender documents whose derived data depends on this linked item.
     */
    private async _refreshLinkedParents(parentIds: unknown[]) {
        const ids = new Set(parentIds.filter((id): id is string => typeof id === 'string' && id.length > 0));
        for (const parentId of ids) {
            let parent: SR5Item | undefined;
            if (this.isEmbedded) {
                parent = this.actor?.items.get(parentId);
            } else if (this.pack) {
                parent = await game.packs.get(this.pack)?.getDocument(parentId) as SR5Item | undefined;
            } else {
                parent = game.items?.get(parentId);
            }
            if (!parent) continue;

            await parent.refreshLinkedData();
        }
    }
}
