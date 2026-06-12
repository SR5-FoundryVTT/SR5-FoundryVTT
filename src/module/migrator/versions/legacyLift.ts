import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import { SR5Item } from '@/module/item/SR5Item';

const { deepClone, getProperty, randomID, setProperty } = foundry.utils;

/**
 * Build a sibling item source for a legacy embedded child, linking it back to its parent via
 * system.parentId. For attachment children (ammo/modification on weapon/armor/vehicle/drone),
 * also fixes up the modification's system.type to match its new parent.
 */
export function buildLiftedChild(parent: any, child: any): any {
    const lifted = deepClone(child);
    lifted._id = randomID();
    setProperty(lifted, 'system.parentId', parent._id);

    if (parent.type !== 'container' && lifted.type === 'modification') {
        setProperty(lifted, 'system.type', parent.type);
    }

    return lifted;
}

export function normalizeEmbeddedItemsArray(data: any): any[] {
    if (data == null) return [];
    return Array.isArray(data) ? data : Object.values(data);
}

/**
 * Lift a parent item's legacy `flags.shadowrun5e.embeddedItems` children into sibling item
 * sources, linking them back via system.parentId.
 *
 * Mutates `parent` to remove (or shrink, for unsupported children) the legacy flag and returns
 * the lifted sibling sources.
 */
export function liftLegacyEmbeddedChildren(parent: any): any[] {
    const embeddedItems = normalizeEmbeddedItemsArray(getProperty(parent, `flags.${SYSTEM_NAME}.${FLAGS.EmbeddedItems}`));
    if (embeddedItems.length === 0 || !parent?._id) return [];

    if (parent.type === 'container') {
        const lifted = embeddedItems.map(child => buildLiftedChild(parent, child));
        delete parent.flags?.[SYSTEM_NAME]?.[FLAGS.EmbeddedItems];
        return lifted;
    }

    const lifted: any[] = [];
    const remaining: any[] = [];
    for (const child of embeddedItems) {
        if (!SR5Item.isAttachment(parent.type, child.type)) {
            remaining.push(child);
            continue;
        }

        lifted.push(buildLiftedChild(parent, child));
    }

    if (remaining.length > 0) {
        setProperty(parent, `flags.${SYSTEM_NAME}.${FLAGS.EmbeddedItems}`, remaining);
    } else if (lifted.length > 0) {
        delete parent.flags?.[SYSTEM_NAME]?.[FLAGS.EmbeddedItems];
    }

    return lifted;
}
