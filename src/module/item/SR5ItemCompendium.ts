import { AnyObject } from 'fvtt-types/utils';
import { SR5Item } from './SR5Item';

/**
 * A pack entry, either a document or an index entry, which only carries requested system fields.
 */
interface CompendiumItemEntry {
    _id?: string | null;
    system?: { parentId?: string | null };
}

/**
 * Compendium application with support for sibling item relationships.
 *
 * Mirrors dnd5e's approach: keep child items in the pack/index as real documents,
 * but remove them from the rendered top-level compendium list when their parent is
 * also present in the same pack.
 */
export class SR5ItemCompendium extends foundry.applications.sidebar.apps.Compendium<typeof SR5Item> {
    /**
     * Prepare Item documents loaded from any compendium against their linked children.
     *
     * Core constructs every CompendiumCollection itself, including packs created at runtime, so
     * there is no collection class to configure and loading is wrapped once on the prototype.
     */
    static registerLinkedDocumentLoading() {
        const prototype = foundry.documents.collections.CompendiumCollection.prototype as any;
        const getDocuments = prototype.getDocuments;
        prototype.getDocuments = async function (this: foundry.documents.collections.CompendiumCollection<any>, ...args: unknown[]) {
            const documents = await getDocuments.apply(this, args);
            if (this.documentName === 'Item') {
                await SR5Item.prepareLoadedPackItems(this as foundry.documents.collections.CompendiumCollection<'Item'>, documents);
            }
            return documents;
        };
    }

    /**
     * Dropping an item which already lives in this pack onto the directory takes it out of its
     * container. Core only routes drops through _createDroppedEntry for entries which don't exist
     * yet, so unlinking has to happen here, before the usual sorting runs.
     */
    protected override async _handleDroppedEntry(target: HTMLElement | null, data: AnyObject) {
        const entry = await this._getDroppedEntryFromData(data) as SR5Item | null;

        if (entry?.system.parentId && this._entryAlreadyExists(entry)) {
            await entry.update({ system: { parentId: null } });
        }

        return super._handleDroppedEntry(target, data);
    }

    protected override async _createDroppedEntry(entry: SR5Item, updates: Record<string, unknown> = {}) {
        const collection = (this as any).collection as foundry.documents.collections.CompendiumCollection<'Item'>;
        const root = entry.clone(updates, { keepId: true });
        root.updateSource({ system: { parentId: null } });
        const created = (await collection.importDocument(root, { dialog: true } as any))!;

        await SR5Item.createLinkedContents(created as SR5Item, entry, {
            pack: collection.collection,
            transform: item => item.toCompendium(collection, {
                clearSort: false,
                keepId: true,
            }),
        });

        return created;
    }

    override async _onRender(...args: Parameters<foundry.applications.sidebar.apps.Compendium['_onRender']>) {
        await super._onRender(...args);

        const collection = (this as any).collection as foundry.documents.collections.CompendiumCollection<'Item'>;
        let items: Iterable<CompendiumItemEntry> = collection;

        if (collection.index) {
            // Share a single reindex across renders; a request per render would be wasteful.
            const pack = collection as { _sr5Reindexing?: Promise<unknown> };
            pack._sr5Reindexing ??= collection.getIndex({ fields: ['system.parentId'] });
            await pack._sr5Reindexing;
            items = collection.index;
        }

        const hiddenIds = SR5ItemCompendium.linkedChildIds(items);
        for (const id of hiddenIds) {
            this.element?.querySelector(`[data-entry-id="${id}"]`)?.remove();
        }
    }

    static linkedChildIds(items: Iterable<CompendiumItemEntry>): string[] {
        const ids = new Set<string>();
        const entries = Array.from(items);

        for (const item of entries) {
            if (typeof item._id === 'string') ids.add(item._id);
        }

        return entries.flatMap(item => {
            const parentId = item.system?.parentId;
            return typeof item._id === 'string' && !!parentId && ids.has(parentId) ? [item._id] : [];
        });
    }
}
