/**
 * World Item collection with support for dnd5e-style container references.
 */
export class SR5Items extends foundry.documents.collections.Items {
    protected override _getVisibleTreeContents(): this["contents"] {
        return this.contents.filter(item => {
            const parentId = foundry.utils.getProperty(item, 'system.parentId');
            const hiddenByParent = typeof parentId === 'string' && this.has(parentId);
            return item.visible && !hiddenByParent;
        }) as this["contents"];
    }
}
