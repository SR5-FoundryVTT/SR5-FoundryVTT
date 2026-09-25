import type { SR5Item } from './SR5Item';

/**
 * The children of every item in one collection, keyed by the id their system.parentId points to.
 *
 * Built once per preparation pass, so looking up an item's children doesn't rescan the whole
 * collection for every item.
 */
export class LinkedItemIndex {
    private readonly children = new Map<string, SR5Item[]>();
    private readonly byId = new Map<string, SR5Item>();

    constructor(items: Iterable<SR5Item>) {
        for (const item of items) {
            if (!item.id) continue;
            this.byId.set(item.id, item);

            const parentId = item.system.parentId;
            if (!parentId) continue;

            const siblings = this.children.get(parentId);
            if (siblings) siblings.push(item);
            else this.children.set(parentId, [item]);
        }
    }

    childrenOf(id: string | null | undefined): SR5Item[] {
        return id ? this.children.get(id) ?? [] : [];
    }

    /**
     * All indexed items, deepest first.
     *
     * A parent's base preparation applies its mods and ammo, so each parent comes after every item
     * linked below it.
     */
    preparationOrder(maxDepth: number): SR5Item[] {
        const items = Array.from(this.byId.values());
        const depths = new Map(items.map(item => [item, this.depthOf(item, maxDepth)]));
        return items.sort((left, right) => depths.get(right)! - depths.get(left)!);
    }

    /**
     * Number of ancestors above an item within this collection, stopping on cycles and at maxDepth.
     */
    private depthOf(item: SR5Item, maxDepth: number): number {
        let depth = 0;
        let current: SR5Item | undefined = item;
        const visited = new Set<string>();

        while (current && depth < maxDepth) {
            const parentId = current.system.parentId;
            if (!parentId || visited.has(parentId)) break;

            const parent = this.byId.get(parentId);
            if (!parent) break;

            visited.add(parentId);
            current = parent;
            depth += 1;
        }

        return depth;
    }
}
