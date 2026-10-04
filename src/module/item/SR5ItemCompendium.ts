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
     * Keep linked items with their parents as items move into and out of any compendium.
     *
     * - Loaded items are prepared against their linked children.
     * - Importing an item into a pack copies the items linked below it.
     * - Importing a whole pack into the world relinks children to their imported parents.
     *
     * Core constructs every CompendiumCollection itself, including packs created at runtime, so
     * there is no collection class to configure and these are wrapped once on the prototype.
     */
    static registerLinkedDocumentHandling() {
        const prototype = foundry.documents.collections.CompendiumCollection.prototype as any;
        type AnyPack = foundry.documents.collections.CompendiumCollection<any>;

        const getDocuments = prototype.getDocuments;
        prototype.getDocuments = async function (this: AnyPack, ...args: unknown[]) {
            const documents = await getDocuments.apply(this, args);
            if (this.documentName === 'Item') {
                await SR5Item.prepareLoadedPackItems(this as foundry.documents.collections.CompendiumCollection<'Item'>, documents);
            }
            return documents;
        };

        const importDocument = prototype.importDocument;
        prototype.importDocument = async function (this: AnyPack, document: unknown, ...args: unknown[]) {
            const created = await importDocument.call(this, document, ...args);
            if (this.documentName !== 'Item' || !created || !(document instanceof SR5Item)) return created;

            await SR5Item.createLinkedContents(created as SR5Item, document, {
                pack: this.collection,
                transform: item => item.toCompendium(this as any, { clearSort: false, keepId: true }),
            });
            return created;
        };

        const importAll = prototype.importAll;
        prototype.importAll = async function (this: AnyPack, ...args: unknown[]) {
            const created = await importAll.apply(this, args);
            if (this.documentName === 'Item') await SR5Item.relinkImportedItems(created);
            return created;
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
        // The clone keeps the entry's id and collection, so importDocument finds and copies its children.
        return (await collection.importDocument(root, { dialog: true } as any))!;
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
