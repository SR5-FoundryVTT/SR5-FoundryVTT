import { SR5 } from '@/module/config';
import { ItemAvailabilityFlow } from '@/module/item/flows/ItemAvailabilityFlow';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import { VersionMigration } from '../VersionMigration';
import { MigrationStorage } from '../MigrationStorage';
import { FLAGS, SYSTEM_NAME } from '@/module/constants';

const { deepClone, getProperty, randomID, setProperty } = foundry.utils;

/** Migrate data changes from every branch that ships in 0.38.0. */
export class Version0_38_0 extends VersionMigration {
    readonly TargetVersion = '0.38.0';

    /** Stamped on children lifted from raw actor source, so they run every migrator in turn. */
    private static readonly UNMIGRATED_VERSION = '0.0.0';

    private static readonly ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // Each branch contributing to 0.38.0 keeps its whole flow in its own migrate<Branch> method, called here.
    override migrateItem(item: any): void {
        this.migrateContainerItem(item);
        this.migrateItemSheetRework(item);
    }

    // =========================================================================
    //                              ITEM SHEET REWORK
    // =========================================================================

    /**
     * ItemSheetRework: ids for flag-stored nested items/effects, technology cost/availability/essence as
     * base/value fields, and legacy "adjusted" rating multipliers as item Active Effects.
     */
    private migrateItemSheetRework(item: any): void {
        Version0_38_0.ensureNestedDocumentIds(item);

        const technology = item.system?.technology;
        if (!technology) return;

        // 0.37.0 stored cost as a number and availability as a '12R' string, read the same way its prep did.
        const calculated = technology.calculated;
        const cost = Number(technology.cost ?? 0) || 0;
        const availability = String(technology.availability ?? '');

        technology.cost = { base: cost, value: cost, changes: [] };
        technology.availability = { ...ItemAvailabilityFlow.parseAvailabilityString(availability), changes: [] };

        if (!calculated) return;

        // Essence moved out of the removed calculated block.
        const essence = calculated.essence?.value ?? 0;
        technology.essence ??= { base: essence, value: essence };

        // "adjusted" multiplied cost/availability by rating; keep that as an item effect the user can see and remove.
        for (const field of ['cost', 'availability'] as const) {
            if (!calculated[field]?.adjusted) continue;
            // Availability was only multiplied by rating when it parsed as Number-Letter.
            if (field === 'availability' && !ItemAvailabilityFlow.parseAvailability(availability).isValid) continue;

            const fieldLabel = field === 'cost' ? 'SR5.Cost' : 'SR5.Availability';
            item.effects ??= [];
            item.effects.push({
                _id: randomID(),
                name: `${game.i18n.localize('SR5.Rating')} ${game.i18n.localize(fieldLabel)}`,
                type: 'base',
                flags: { shadowrun5e: { ratingMultiplier: field } },
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [{
                        key: `system.technology.${field}`,
                        type: 'multiply',
                        value: '@system.technology.rating',
                        priority: ModifiableValue.Priority.RATING,
                        target: 'item',
                    }],
                },
            });
        }

        delete technology.calculated;
    }

    /** Nested items and their effects are stored in flags and need ids to be addressable as documents. */
    private static ensureNestedDocumentIds(item: any): void {
        const embeddedItems = item.flags?.shadowrun5e?.embeddedItems;
        if (!Array.isArray(embeddedItems)) return;

        // Derived rather than random, so copies of the same legacy parent agree on their children's ids.
        for (const [index, embeddedItem] of embeddedItems.entries()) {
            embeddedItem._id ??= Version0_38_0.deterministicId(`${item._id}:#${index}`);

            if (Array.isArray(embeddedItem.effects)) {
                for (const [effectIndex, effect] of embeddedItem.effects.entries()) {
                    effect._id ??= Version0_38_0.deterministicId(`${embeddedItem._id}:effect#${effectIndex}`);
                }
            }

            Version0_38_0.ensureNestedDocumentIds(embeddedItem);
        }
    }

    // =========================================================================
    //                               CONTAINER ITEM
    // =========================================================================

    /** ContainerItem: the legacy container field becomes the parentId every item now carries. */
    private migrateContainerItem(item: any): void {
        this.consolidateParentId(item);
    }

    override migrateActor(actor: any): void {
        if (Array.isArray(actor.items)) this.liftActorItems(actor.items);
    }

    /**
     * Token deltas carry full item sources for items created or changed on an unlinked token,
     * including their legacy children. Deltas have no _stats, so this has to be idempotent.
     */
    override migrateActorDelta(delta: any): void {
        if (Array.isArray(delta.items)) this.liftActorItems(delta.items);
    }

    override async MigrateWorld(): Promise<void> {
        await this.liftLegacyChildrenFromItems(game.items.contents.map(item => item.toObject()), null);

        for await (const { pack, documents } of Version0_38_0.worldPacks('Item')) {
            const items = documents.map(document => document.toObject());
            if (!items.some(item => Version0_38_0.legacyChildren(item).length > 0)) continue;

            await MigrationStorage.withUnlockedPack(pack, () => this.liftLegacyChildrenFromItems(items, pack));
        }

        for (const scene of game.scenes) {
            const updates = Version0_38_0.deltaTombstoneUpdates(scene);
            if (updates.length > 0) await MigrationStorage.updateTokens(scene, updates);
        }

        for await (const { pack, documents } of Version0_38_0.worldPacks('Scene')) {
            const pending = documents
                .map(scene => ({ scene, updates: Version0_38_0.deltaTombstoneUpdates(scene) }))
                .filter(({ updates }) => updates.length > 0);
            if (pending.length === 0) continue;

            await MigrationStorage.withUnlockedPack(pack, async () => {
                for (const { scene, updates } of pending) await MigrationStorage.updateTokens(scene, updates);
            });
        }
    }

    /** World compendiums of one document type, with their documents loaded. */
    private static async *worldPacks<Name extends 'Item' | 'Scene'>(documentName: Name) {
        for (const collection of game.packs) {
            if (collection.documentName !== documentName || collection.metadata.packageType !== 'world') continue;

            const pack = collection as foundry.documents.collections.CompendiumCollection<Name>;
            yield { pack, documents: await pack.getDocuments() };
        }
    }

    /**
     * Lift legacy children of every item in an actor or delta item collection into that collection.
     */
    private liftActorItems(items: any[]) {
        const parents = [...items];
        for (const item of parents) this.consolidateParentId(item);

        const lifted = parents.flatMap(item => this.liftLegacyDescendants(item));
        for (const child of lifted) {
            Version0_38_0.stampAsUnmigrated(child);
            this.consolidateParentId(child);
        }
        if (lifted.length > 0) items.push(...lifted);
    }

    private async liftLegacyChildrenFromItems(items: any[], pack: foundry.documents.collections.CompendiumCollection<'Item'> | null) {
        const lifted: any[] = [];
        const updatedParents: any[] = [];

        for (const item of items) {
            const liftedChildren = this.liftLegacyDescendants(item);
            if (liftedChildren.length === 0) continue;

            // Keep the lifted tree next to its root parent, as importing linked items does.
            for (const child of liftedChildren) child.folder = item.folder ?? null;

            lifted.push(...liftedChildren);
            updatedParents.push({ _id: item._id, flags: item.flags });
        }

        if (lifted.length === 0) return;

        // Clear the parents' flags only once their children are safely stored. The world is marked
        // migrated either way, so on a failed create the legacy flag is all the data there is left.
        // keepId preserves the ids grandchildren already point at through system.parentId.
        try {
            await Item.implementation.createDocuments(lifted as Item.CreateData[], { pack: pack?.collection, keepId: true });
        } catch (error) {
            console.error(`Failed legacy attachment lift for ${pack ? pack.collection : 'world items'}.`, error);
            return;
        }

        try {
            await Item.implementation.updateDocuments(updatedParents as any, { pack: pack?.collection, diff: false, recursive: false });
        } catch (error) {
            console.error(`Failed clearing legacy attachment flags for ${pack ? pack.collection : 'world items'}.`, error);
        }
    }

    /**
     * Move a parent's legacy embedded children out into standalone item data.
     */
    private liftLegacyEmbeddedChildren(parent: any): any[] {
        const embeddedItems = Version0_38_0.legacyChildren(parent);
        if (embeddedItems.length === 0 || !parent?._id) return [];

        // Bioware and cyberware take 'ware' modifications rather than modifications named after
        // their own item type, so the parent type can't be used as the modification type directly.
        const modificationType = SR5.modificationTypeByParentType[parent.type];

        const lifted: any[] = [];
        const remaining: any[] = [];
        const usedIds = new Set<string>();
        for (const [index, child] of embeddedItems.entries()) {
            const canLift = parent.type === 'container' ||
                (parent.type === 'weapon' && child.type === 'ammo') ||
                (child.type === 'modification' && !!modificationType);
            if (!canLift) {
                remaining.push(child);
                continue;
            }

            const liftedChild = deepClone(child);
            liftedChild._id = Version0_38_0.liftedChildId(parent._id, child, index, usedIds);
            setProperty(liftedChild, 'system.parentId', parent._id);
            if (liftedChild.type === 'modification' && modificationType) setProperty(liftedChild, 'system.type', modificationType);
            lifted.push(liftedChild);
        }

        if (remaining.length > 0) setProperty(parent, `flags.${SYSTEM_NAME}.${FLAGS.EmbeddedItems}`, remaining);
        else if (lifted.length > 0) delete parent.flags?.[SYSTEM_NAME]?.[FLAGS.EmbeddedItems];
        return lifted;
    }

    /**
     * Lift all eligible legacy descendants, preserving each child's direct parent relationship.
     */
    private liftLegacyDescendants(parent: any): any[] {
        const lifted: any[] = [];
        const pending = [parent];

        while (pending.length > 0) {
            const current = pending.shift();
            const children = this.liftLegacyEmbeddedChildren(current);
            lifted.push(...children);
            pending.push(...children);
        }

        return lifted;
    }

    /**
     * A token which overrode a legacy parent replaced its whole embedded list, so base children
     * the token had removed must stay hidden now that they are separate base items.
     */
    private static deltaTombstoneUpdates(scene: Scene.Implementation): any[] {
        const updates: any[] = [];

        for (const token of scene.tokens) {
            const baseActor = token.baseActor;
            if (token.actorLink || !baseActor) continue;

            const data = token.toObject() as any;
            const deltaItems: any[] = data.delta?.items ?? [];
            const deltaIds = new Set(deltaItems.map(item => item._id));

            // The delta replaced these parents' whole embedded list, so their base children must stay hidden.
            const overridden = new Set(deltaItems
                .filter(item => !item._tombstone && baseActor.items.has(item._id))
                .map(item => item._id));

            const tombstones = baseActor.items
                .filter(child => overridden.has(child.system.parentId) && !deltaIds.has(child.id))
                .map(child => ({ _id: child.id, _tombstone: true }));
            if (tombstones.length === 0) continue;

            data.delta.items.push(...tombstones);
            data.delta._id ??= token.id;
            updates.push(data);
        }

        return updates;
    }

    private consolidateParentId(item: any) {
        if (!item?.system || typeof item.system !== 'object') return;

        // 0.37.0 named the link `container`; an item with neither is simply unparented.
        const { parentId, container } = item.system;
        item.system.parentId = parentId || (typeof container === 'string' && container ? container : null);
    }

    /**
     * Id for a lifted child, derived from its parent and its legacy entry.
     *
     * The parent is part of the seed because copies of one legacy entry keep the child's `_id`: two
     * items holding the same legacy children would otherwise lift them to a single id, which a
     * keepId create cannot store twice. See deterministicId for why the lifts must agree at all.
     */
    private static liftedChildId(parentId: string, child: any, index: number, usedIds: Set<string>): string {
        const key = typeof child?._id === 'string' && child._id ? child._id : `#${index}`;
        let id = Version0_38_0.deterministicId(`${parentId}:${key}`);
        for (let attempt = 1; usedIds.has(id); attempt++) {
            id = Version0_38_0.deterministicId(`${parentId}:${key}:${attempt}`);
        }
        usedIds.add(id);
        return id;
    }

    /**
     * A parent's legacy embedded children, which older worlds stored as an object rather than an array.
     */
    private static legacyChildren(parent: any): any[] {
        const embeddedItems = getProperty(parent, `flags.${SYSTEM_NAME}.${FLAGS.EmbeddedItems}`);
        if (embeddedItems == null) return [];
        return Array.isArray(embeddedItems) ? embeddedItems : Object.values(embeddedItems);
    }

    /**
     * Mark raw flag data lifted into an actor as owing the complete item migration chain.
     */
    private static stampAsUnmigrated(item: any) {
        setProperty(item, '_stats.systemVersion', Version0_38_0.UNMIGRATED_VERSION);
        if (!Array.isArray(item.effects)) return;

        for (const effect of item.effects) {
            effect.type ??= 'base';
            setProperty(effect, '_stats.systemVersion', Version0_38_0.UNMIGRATED_VERSION);
        }
    }

    // =========================================================================
    //                                   SHARED
    // =========================================================================

    /**
     * A 16 character document id hashed from a seed, built from two 53 bit cyrb53 hashes.
     *
     * One piece of legacy data is lifted in more than one place. A base actor and an unlinked token's
     * delta each migrate their own copy of the same parent, and the delta migration has no version
     * stamp to skip on, so it runs again on every load until a write persists the lifted form.
     *
     * Those lifts have to land on the same ids. Foundry merges a delta's items into the base actor's
     * by `_id`, keeping every base item the delta does not name, so a child lifted under a different
     * id stops overriding its base counterpart and shows up beside it instead.
     *
     * Hashing the source is what keeps them equal without carrying state between the lifts.
     */
    private static deterministicId(seed: string): string {
        const alphabet = Version0_38_0.ID_ALPHABET;
        let id = '';
        for (const salt of [0, 0x9e3779b9]) {
            let hash = Version0_38_0.cyrb53(seed, salt);
            for (let i = 0; i < 8; i++) {
                id += alphabet[hash % alphabet.length];
                hash = Math.floor(hash / alphabet.length);
            }
        }
        return id;
    }

    private static cyrb53(value: string, seed: number): number {
        let h1 = 0xdeadbeef ^ seed;
        let h2 = 0x41c6ce57 ^ seed;
        for (let i = 0; i < value.length; i++) {
            const char = value.charCodeAt(i);
            h1 = Math.imul(h1 ^ char, 2654435761);
            h2 = Math.imul(h2 ^ char, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return 4294967296 * (2097151 & h2) + (h1 >>> 0);
    }
}
