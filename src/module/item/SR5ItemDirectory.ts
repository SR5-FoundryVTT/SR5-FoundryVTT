import { AnyObject } from 'fvtt-types/utils';
import { SR5Item } from './SR5Item';

/**
 * World item sidebar with support for sibling item relationships.
 *
 * Mirrors SR5ItemCompendium for the world collection: dropped items bring the items linked below
 * them along, whether they come from an actor, another world folder or a compendium.
 */
export class SR5ItemDirectory extends foundry.applications.sidebar.tabs.ItemDirectory {
    /**
     * Dropping a world item which is linked below another item onto the directory takes it out of
     * its parent. Core only routes drops through _createDroppedEntry for entries which don't exist
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
        // fvtt-types doesn't declare importDocument on world collections.
        const collection = (this as any).collection;
        const root = entry.clone(updates, { keepId: true });
        root.updateSource({ system: { parentId: null } });
        const created = await collection.importDocument(root, { dialog: true } as any);
        if (!created) return created;

        await SR5Item.createLinkedContents(created as SR5Item, entry, {
            transform: item => item.inCompendium
                ? collection.fromCompendium(item, { clearSort: false })
                : item.toObject(),
        });

        return created;
    }
}
