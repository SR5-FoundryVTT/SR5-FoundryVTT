import { ItemAvailabilityFlow } from '@/module/item/flows/ItemAvailabilityFlow';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import { VersionMigration } from '../VersionMigration';
import { MigrationStorage } from '../MigrationStorage';
import { LegacyChildrenFlow } from '@/module/item/flows/LegacyChildrenFlow';

const { randomID } = foundry.utils;

/** Migrate data changes from every branch that ships in 0.38.0. */
export class Version0_38_0 extends VersionMigration {
    readonly TargetVersion = '0.38.0';

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
            embeddedItem._id ??= LegacyChildrenFlow.deterministicId(`${item._id}:#${index}`);

            if (Array.isArray(embeddedItem.effects)) {
                for (const [effectIndex, effect] of embeddedItem.effects.entries()) {
                    effect._id ??= LegacyChildrenFlow.deterministicId(`${embeddedItem._id}:effect#${effectIndex}`);
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
            if (!items.some(item => LegacyChildrenFlow.legacyChildren(item).length > 0)) continue;

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

        const lifted = parents.flatMap(item => LegacyChildrenFlow.liftDescendants(item));
        for (const child of lifted) {
            LegacyChildrenFlow.stampAsUnmigrated(child);
            this.consolidateParentId(child);
        }
        if (lifted.length > 0) items.push(...lifted);
    }

    private async liftLegacyChildrenFromItems(items: any[], pack: foundry.documents.collections.CompendiumCollection<'Item'> | null) {
        const lifted: any[] = [];
        const updatedParents: any[] = [];

        for (const item of items) {
            const liftedChildren = LegacyChildrenFlow.liftDescendants(item);
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
}
