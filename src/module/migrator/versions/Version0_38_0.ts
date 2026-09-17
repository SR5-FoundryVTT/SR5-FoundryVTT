import { SR5 } from '@/module/config';
import { VersionMigration } from '../VersionMigration';
import { MigrationStorage } from '../MigrationStorage';
import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import { ItemAvailabilityFlow } from '@/module/item/flows/ItemAvailabilityFlow';

const { deepClone, getProperty, hasProperty, setProperty } = foundry.utils;

/** Migrate item-sheet data introduced for 0.38.0. */
export class Version0_38_0 extends VersionMigration {
    readonly TargetVersion = '0.38.0';

    /** Stamped on children lifted from raw actor source, so they run every migrator in turn. */
    private static readonly UNMIGRATED_VERSION = '0.0.0';

    private static readonly ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    override migrateItem(item: any): void {
        this.consolidateParentId(item);
        Version0_38_0.ensureNestedDocumentIds(item);

        const technology = item.system?.technology;
        if (!technology || typeof technology !== 'object') return;

        technology.cost = Version0_38_0.migrateCost(technology.cost);
        technology.availability = Version0_38_0.migrateAvailability(technology.availability);

        if (technology.calculated && typeof technology.calculated === 'object') {
            if (!technology.essence && technology.calculated.essence) {
                technology.essence = Version0_38_0.migrateEssence(technology.calculated.essence);
            }
            delete technology.calculated;
        }
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

        for (const collection of game.packs) {
            if (collection.documentName !== 'Item' || collection.metadata.packageType !== 'world') continue;

            const pack = collection as foundry.documents.collections.CompendiumCollection<'Item'>;
            const documents = await pack.getDocuments();
            const items = documents.map(document => document.toObject());
            if (!items.some(item => Version0_38_0.legacyChildren(item).length > 0)) continue;

            await MigrationStorage.withUnlockedPack(pack, () => this.liftLegacyChildrenFromItems(items, pack));
        }

        for (const scene of game.scenes) {
            const updates = Version0_38_0.deltaTombstoneUpdates(scene);
            if (updates.length > 0) await MigrationStorage.updateTokens(scene, updates);
        }

        for (const collection of game.packs) {
            if (collection.documentName !== 'Scene' || collection.metadata.packageType !== 'world') continue;

            const pack = collection as foundry.documents.collections.CompendiumCollection<'Scene'>;
            const pending = (await pack.getDocuments())
                .map(scene => ({ scene, updates: Version0_38_0.deltaTombstoneUpdates(scene) }))
                .filter(({ updates }) => updates.length > 0);
            if (pending.length === 0) continue;

            await MigrationStorage.withUnlockedPack(pack, async () => {
                for (const { scene, updates } of pending) await MigrationStorage.updateTokens(scene, updates);
            });
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

            const tombstones: any[] = [];
            for (const deltaItem of deltaItems) {
                if (deltaItem._tombstone || !baseActor.items.has(deltaItem._id)) continue;

                for (const baseChild of baseActor.items) {
                    if (baseChild.system.parentId !== deltaItem._id || deltaIds.has(baseChild.id)) continue;
                    tombstones.push({ _id: baseChild.id, _tombstone: true });
                    deltaIds.add(baseChild.id);
                }
            }
            if (tombstones.length === 0) continue;

            data.delta.items.push(...tombstones);
            data.delta._id ??= token.id;
            updates.push(data);
        }

        return updates;
    }

    private consolidateParentId(item: any) {
        if (!item?.system || typeof item.system !== 'object') return;

        const parentId = getProperty(item.system, 'parentId');
        const container = getProperty(item.system, 'container');
        if ((parentId === null || parentId === undefined || parentId === '') && typeof container === 'string' && container) {
            setProperty(item.system, 'parentId', container);
        }
        if (!hasProperty(item.system, 'parentId')) setProperty(item.system, 'parentId', null);
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
     * Id for a lifted child, derived from its parent and its legacy entry.
     *
     * The same legacy data can be lifted more than once: in memory on every load of an unsaved
     * compendium document, and separately for a base actor and a token delta holding a copy of the
     * same parent. Deriving the id keeps those lifts identical, so delta children override the base
     * children they came from and repeated lifts never produce duplicates.
     */
    static liftedChildId(parentId: string, child: any, index: number, usedIds: Set<string>): string {
        const key = typeof child?._id === 'string' && child._id ? child._id : `#${index}`;
        let id = Version0_38_0.deterministicId(`${parentId}:${key}`);
        for (let attempt = 1; usedIds.has(id); attempt++) {
            id = Version0_38_0.deterministicId(`${parentId}:${key}:${attempt}`);
        }
        usedIds.add(id);
        return id;
    }

    /**
     * A 16 character document id hashed from a seed, built from two 53 bit cyrb53 hashes.
     */
    static deterministicId(seed: string): string {
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

    private static migrateEssence(essence: unknown) {
        if (essence && typeof essence === 'object') {
            const data = essence as { base?: unknown; value?: unknown };
            const value = Version0_38_0.firstFiniteNumber(data.value, data.base, 0);
            return { base: value, value };
        }

        return { base: 0, value: 0 };
    }

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

    private static migrateCost(cost: unknown) {
        if (typeof cost === 'number') {
            return { base: cost, value: cost, changes: [] };
        }

        if (cost && typeof cost === 'object') {
            const data = cost as { base?: unknown; value?: unknown };
            const base = Version0_38_0.firstFiniteNumber(data.base, data.value, 0);
            return { base, value: base, changes: [] };
        }

        return { base: 0, value: 0, changes: [] };
    }

    private static migrateAvailability(availability: unknown) {
        if (typeof availability === 'string') {
            return Version0_38_0.createAvailabilityFromString(availability);
        }

        if (availability && typeof availability === 'object') {
            const data = availability as {
                base?: unknown;
                value?: unknown;
                restriction?: unknown;
            };

            const base = Version0_38_0.firstString(data.base, data.value, '');
            const migrated = Version0_38_0.createAvailabilityFromString(base);

            if (typeof data.base === 'number') {
                migrated.base = Number.isFinite(data.base) ? data.base : 0;
                migrated.value = migrated.base;
            }

            migrated.restriction = Version0_38_0.migrateRestriction(data.restriction, migrated.restriction);
            migrated.label = ItemAvailabilityFlow.composeValue(migrated.value, migrated.restriction);
            return migrated;
        }

        return Version0_38_0.createAvailabilityFromString('');
    }

    private static migrateRestriction(restriction: unknown, fallback: 'none' | 'restricted' | 'forbidden'): 'none' | 'restricted' | 'forbidden' {
        if (typeof restriction === 'string') return Version0_38_0.normalizeRestriction(restriction);

        if (restriction && typeof restriction === 'object') {
            const data = restriction as { base?: unknown; value?: unknown };
            return Version0_38_0.normalizeRestriction(Version0_38_0.firstString(data.value, data.base, fallback));
        }

        return fallback;
    }

    private static firstFiniteNumber(...values: unknown[]) {
        for (const value of values) {
            const number = Number(value);
            if (Number.isFinite(number)) return number;
        }
        return 0;
    }

    private static firstString(...values: unknown[]) {
        for (const value of values) {
            if (typeof value === 'string') return value;
            if (typeof value === 'number') return String(value);
        }
        return '';
    }

    private static createAvailabilityFromString(value: string): {
        base: number;
        value: number;
        changes: any[];
        restriction: 'none' | 'restricted' | 'forbidden';
        label: string;
    } {
        const parsed = ItemAvailabilityFlow.parseAvailabilityString(value);
        return { base: parsed.base, value: parsed.value, changes: [], restriction: parsed.restriction, label: parsed.label };
    }

    private static normalizeRestriction(value: string): 'none' | 'restricted' | 'forbidden' {
        return ['none', 'restricted', 'forbidden'].includes(value)
            ? value as 'none' | 'restricted' | 'forbidden'
            : ItemAvailabilityFlow.restrictionFromSuffix(value);
    }
}
