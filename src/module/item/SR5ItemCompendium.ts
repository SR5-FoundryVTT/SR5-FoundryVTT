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
    protected override async _createDroppedEntry(entry: SR5Item, updates: Record<string, unknown> = {}) {
        const collection = (this as any).collection as foundry.documents.collections.CompendiumCollection<'Item'>;
        const root = entry.clone(updates, { keepId: true });
        root.updateSource({ system: { parentId: null } });
        const created = (await collection.importDocument(root, { dialog: true } as any))!;

        const contents = await entry.loadContents();
        if (contents.size === 0) return created;

        const itemData = await SR5Item.createWithLinkedItems(Array.from(contents.values()), {
            parentId: created.id,
            transformAll: item => item.toCompendium(collection, {
                clearSort: false,
                keepId: true,
            }),
        });
        for (const data of itemData) data.folder = created.folder?.id ?? null;
        await Item.implementation.createDocuments(itemData, {
            pack: collection.collection,
            keepId: true,
        });

        return created;
    }

    override async _onRender(...args: Parameters<foundry.applications.sidebar.apps.Compendium['_onRender']>) {
        await super._onRender(...args);

        const collection = (this as any).collection as foundry.documents.collections.CompendiumCollection<'Item'>;
        let items: Iterable<CompendiumItemEntry> = collection;

        if (collection.index) {
            await collection.getIndex({ fields: ['system.parentId'] });
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
