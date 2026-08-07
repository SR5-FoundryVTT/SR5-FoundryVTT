import { ItemAvailabilityFlow } from '@/module/item/flows/ItemAvailabilityFlow';
import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import { VersionMigration } from '../VersionMigration';

const { deepClone, getProperty, hasProperty, randomID, setProperty } = foundry.utils;

/** Migrate item-sheet data introduced for 0.38.0. */
export class Version0_38_0 extends VersionMigration {
    readonly TargetVersion = '0.38.0';

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
        const items = Array.isArray(actor.items) ? [...actor.items] : [];
        for (const item of items) this.consolidateParentId(item);

        const lifted = items.flatMap(item => this.liftLegacyEmbeddedChildren(item));
        for (const child of lifted) this.consolidateParentId(child);
        if (lifted.length > 0) actor.items.push(...lifted);
    }

    override async MigrateWorld(): Promise<void> {
        await this.liftLegacyChildrenFromItems(game.items.contents.map(item => item.toObject()), null);

        for (const collection of game.packs) {
            if (collection.documentName !== 'Item' || collection.metadata.packageType !== 'world') continue;

            const pack = collection as foundry.documents.collections.CompendiumCollection<'Item'>;
            const wasLocked = pack.locked;
            if (wasLocked) {
                try {
                    await pack.configure({ locked: false });
                } catch (error) {
                    console.error(`Failed to unlock compendium ${pack.collection} for legacy attachment migration.`, error);
                    continue;
                }
            }

            try {
                const documents = await pack.getDocuments();
                await this.liftLegacyChildrenFromItems(documents.map(document => document.toObject()), pack);
            } finally {
                if (wasLocked) {
                    try {
                        await pack.configure({ locked: true });
                    } catch (error) {
                        console.error(`Failed to re-lock compendium ${pack.collection} after legacy attachment migration.`, error);
                    }
                }
            }
        }
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
            const liftedChildren = this.liftLegacyEmbeddedChildren(item);
            if (liftedChildren.length === 0) continue;

            for (const child of liftedChildren) setProperty(child, '_stats.systemVersion', game.system.version);
            lifted.push(...liftedChildren);
            updatedParents.push({ _id: item._id, flags: item.flags });
        }

        if (lifted.length === 0) return;

        try {
            await Item.implementation.createDocuments(lifted as Item.CreateData[], { pack: pack?.collection });
            await Item.implementation.updateDocuments(updatedParents as any, { pack: pack?.collection, diff: false, recursive: false });
        } catch (error) {
            console.error(`Failed legacy attachment lift for ${pack ? pack.collection : 'world items'}.`, error);
        }
    }

    private liftLegacyEmbeddedChildren(parent: any): any[] {
        const rawEmbeddedItems = getProperty(parent, `flags.${SYSTEM_NAME}.${FLAGS.EmbeddedItems}`);
        const embeddedItems = rawEmbeddedItems == null ? [] : Array.isArray(rawEmbeddedItems) ? rawEmbeddedItems : Object.values(rawEmbeddedItems);
        if (embeddedItems.length === 0 || !parent?._id) return [];

        const lifted: any[] = [];
        const remaining: any[] = [];
        for (const child of embeddedItems) {
            const canLift = parent.type === 'container' ||
                (parent.type === 'weapon' && child.type === 'ammo') ||
                (child.type === 'modification' && ['weapon', 'armor', 'vehicle', 'drone', 'bioware', 'cyberware'].includes(parent.type));
            if (!canLift) {
                remaining.push(child);
                continue;
            }

            const liftedChild = deepClone(child);
            liftedChild._id = randomID();
            setProperty(liftedChild, 'system.parentId', parent._id);
            if (parent.type !== 'container' && liftedChild.type === 'modification') setProperty(liftedChild, 'system.type', parent.type);
            lifted.push(liftedChild);
        }

        if (remaining.length > 0) setProperty(parent, `flags.${SYSTEM_NAME}.${FLAGS.EmbeddedItems}`, remaining);
        else if (lifted.length > 0) delete parent.flags?.[SYSTEM_NAME]?.[FLAGS.EmbeddedItems];
        return lifted;
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

        for (const embeddedItem of embeddedItems) {
            embeddedItem._id ??= foundry.utils.randomID();

            if (Array.isArray(embeddedItem.effects)) {
                for (const effect of embeddedItem.effects) {
                    effect._id ??= foundry.utils.randomID();
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
                changes?: any[];
            };

            const base = Version0_38_0.firstString(data.base, data.value, '');
            const migrated = Version0_38_0.createAvailabilityFromString(base);
            const changes = Array.isArray(data.changes) ? data.changes as any[] : [];

            if (typeof data.base === 'number') {
                migrated.base = Number.isFinite(data.base) ? data.base : 0;
                migrated.value = migrated.base;
            }

            migrated.restriction = Version0_38_0.migrateRestriction(data.restriction, migrated.restriction);

            for (const change of changes) {
                if (change?.type !== 'override') continue;
                const parsed = ItemAvailabilityFlow.parseAvailability(String(change.value ?? ''));
                if (!parsed.isValid || typeof parsed.availability !== 'number') continue;

                change.value = parsed.availability;
                migrated.restriction = parsed.restriction;
            }

            migrated.changes = changes;
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
