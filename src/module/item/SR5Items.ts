/**
 * World Item collection with support for dnd5e-style container references.
 */
export class SR5Items extends foundry.documents.collections.Items {
    protected override _getVisibleTreeContents(): this["contents"] {
        return this.contents.filter(item => {
            const containerId = foundry.utils.getProperty(item, 'system.container');
            return item.visible && !(typeof containerId === 'string' && this.has(containerId));
        }) as this["contents"];
    }
}
