import { SR5Item } from './SR5Item';

/**
 * World Item collection with support for dnd5e-style container references.
 */
export class SR5Items extends foundry.documents.collections.Items {
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
