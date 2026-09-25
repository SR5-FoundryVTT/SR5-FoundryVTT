import { SR5Item } from './SR5Item';
import { LinkedItemIndex } from './LinkedItemIndex';

/**
 * World Item collection with support for dnd5e-style container references.
 */
export class SR5Items extends foundry.documents.collections.Items {
    // Built on first use after a change, so bulk additions during world load never build it.
    private _linkedItems?: LinkedItemIndex;

    /**
     * Children of every world item, shared by all world items until items are added, removed or relinked.
     */
    get linkedItems(): LinkedItemIndex {
        return this._linkedItems ??= new LinkedItemIndex(this.contents as SR5Item[]);
    }

    /**
     * Drop the index after an item's system.parentId changed.
     */
    invalidateLinkedItems() {
        this._linkedItems = undefined;
    }

    override set(...args: Parameters<foundry.documents.collections.Items['set']>) {
        this._linkedItems = undefined;
        return super.set(...args);
    }

    override delete(...args: Parameters<foundry.documents.collections.Items['delete']>) {
        this._linkedItems = undefined;
        return super.delete(...args);
    }

    protected override _getVisibleTreeContents(): this["contents"] {
        return this.contents.filter(item => {
            const parentId = item.system.parentId;
            const hiddenByParent = !!parentId && this.has(parentId);
            return item.visible && !hiddenByParent;
        });
    }

    override async importFromCompendium(
        pack: foundry.documents.collections.CompendiumCollection<'Item'>,
        id: string,
        updateData: Item.UpdateData = {},
        options: foundry.documents.abstract.WorldCollection.ImportDocumentOptions<'Item'> = {}
    ): Promise<Item.Stored | undefined> {
        const created = await super.importFromCompendium(pack, id, updateData, options);
        if (!created) return created;

        const source = await pack.getDocument(id) as SR5Item | undefined;
        if (!source) return created;

        const fromOptions = foundry.utils.mergeObject({ clearSort: false }, options);
        await SR5Item.createLinkedContents(created as SR5Item, source, {
            transform: item => this.fromCompendium(item, fromOptions),
        });
        return created;
    }
}
