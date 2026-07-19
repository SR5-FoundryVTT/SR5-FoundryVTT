import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import { VersionMigration } from '../VersionMigration';

const { deepClone, getProperty, hasProperty, randomID, setProperty } = foundry.utils;

export class Version0_37_0 extends VersionMigration {
    readonly TargetVersion = '0.37.0';

    override migrateItem(item: any): void {
        this.consolidateParentId(item);
    }

    override migrateActor(actor: any): void {
        const items = Array.isArray(actor.items) ? [...actor.items] : [];
        for (const item of items) {
            this.consolidateParentId(item);
        }

        const lifted: any[] = [];
        for (const item of items) {
            lifted.push(...this.liftLegacyEmbeddedChildren(item));
        }

        for (const child of lifted) {
            this.consolidateParentId(child);
        }

        if (lifted.length > 0) {
            actor.items.push(...lifted);
        }
    }

    override async MigrateWorld(): Promise<void> {
        await this.liftLegacyChildrenFromItems(game.items.contents.map(item => item.toObject()), null);

        for (const collection of game.packs) {
            if (collection.documentName !== 'Item') continue;
            if (collection.metadata.packageType !== 'world') continue;

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

    /**
     * Fold the legacy system.container field into system.parentId (a child is either stored in a
     * container or attached to a parent, never both, so they share one field), and ensure
     * parentId is always present.
     */
    private consolidateParentId(item: any) {
        if (!item?.system || typeof item.system !== 'object') return;

        const parentId = getProperty(item.system, 'parentId');
        const container = getProperty(item.system, 'container');
        if ((parentId === null || parentId === undefined || parentId === '') && typeof container === 'string' && container) {
            setProperty(item.system, 'parentId', container);
        }
        if (!hasProperty(item.system, 'parentId')) setProperty(item.system, 'parentId', null);
    }

    /**
     * Lift legacy embedded children from the given item sources, creating the lifted siblings
     * and persisting the updated legacy flag on their parents within the same collection.
     */
    private async liftLegacyChildrenFromItems(items: any[], pack: foundry.documents.collections.CompendiumCollection<'Item'> | null) {
        const lifted: any[] = [];
        const updatedParents: any[] = [];

        for (const item of items) {
            const liftedChildren = this.liftLegacyEmbeddedChildren(item);
            if (liftedChildren.length === 0) continue;

            for (const child of liftedChildren) {
                setProperty(child, '_stats.systemVersion', game.system.version);
            }

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

    /**
     * Lift a parent item's legacy embedded children into sibling item sources linked by system.parentId.
     */
    private liftLegacyEmbeddedChildren(parent: any): any[] {
        const rawEmbeddedItems = getProperty(parent, `flags.${SYSTEM_NAME}.${FLAGS.EmbeddedItems}`);
        const embeddedItems = rawEmbeddedItems == null
            ? []
            : Array.isArray(rawEmbeddedItems)
                ? rawEmbeddedItems
                : Object.values(rawEmbeddedItems);
        if (embeddedItems.length === 0 || !parent?._id) return [];

        const lifted: any[] = [];
        const remaining: any[] = [];
        for (const child of embeddedItems) {
            const canLift =
                parent.type === 'container' ||
                (parent.type === 'weapon' && child.type === 'ammo') ||
                (
                    child.type === 'modification' &&
                    ['weapon', 'armor', 'vehicle', 'drone', 'bioware', 'cyberware'].includes(parent.type)
                );

            if (!canLift) {
                remaining.push(child);
                continue;
            }

            const liftedChild = deepClone(child);
            liftedChild._id = randomID();
            setProperty(liftedChild, 'system.parentId', parent._id);

            if (parent.type !== 'container' && liftedChild.type === 'modification') {
                setProperty(liftedChild, 'system.type', parent.type);
            }

            lifted.push(liftedChild);
        }

        if (remaining.length > 0) {
            setProperty(parent, `flags.${SYSTEM_NAME}.${FLAGS.EmbeddedItems}`, remaining);
        } else if (lifted.length > 0) {
            delete parent.flags?.[SYSTEM_NAME]?.[FLAGS.EmbeddedItems];
        }

        return lifted;
    }
}
