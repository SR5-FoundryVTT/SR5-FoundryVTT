/**
 * Compendium application with support for sibling item relationships.
 *
 * Mirrors dnd5e's approach: keep child items in the pack/index as real documents,
 * but remove them from the rendered top-level compendium list when their parent is
 * also present in the same pack.
 */
export class SR5ItemCompendium extends foundry.applications.sidebar.apps.Compendium {
    override async _onRender(...args: Parameters<foundry.applications.sidebar.apps.Compendium['_onRender']>) {
        await super._onRender(...args);

        const collection = (this as any).collection as foundry.documents.collections.CompendiumCollection<'Item'>;
        let items: Iterable<any> = collection;

        if (collection.index) {
            await collection.getIndex({ fields: ['system.parentId'] });
            items = collection.index;
        }

        const hiddenIds = SR5ItemCompendium.linkedChildIds(items);
        for (const id of hiddenIds) {
            this.element?.querySelector(`[data-entry-id="${id}"]`)?.remove();
        }
    }

    static linkedChildIds(items: Iterable<any>): string[] {
        const ids = new Set<string>();
        const entries = Array.from(items);

        for (const item of entries) {
            if (typeof item?._id === 'string') ids.add(item._id);
        }

        return entries.flatMap(item => {
            const parentId = foundry.utils.getProperty(item, 'system.parentId');
            return typeof item?._id === 'string' && typeof parentId === 'string' && ids.has(parentId) ? [item._id] : [];
        });
    }
}
