import { SR5 } from '@/module/config';
import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import { deterministicId, derivedChildId } from '@/module/utils/ids';

const { deepClone, getProperty, randomID, setProperty } = foundry.utils;

/**
 * Children which items stored inside their own flags, before children became linked sibling documents.
 *
 * The 0.38.0 migration lifts them out of world data. Items arriving later from anywhere the
 * migration never reaches, like module compendiums or older exports, are lifted as they are created.
 *
 * Kept free of Migrator imports, as the version migrations use it too.
 */
export const LegacyChildrenFlow = {
    /** Stamped on lifted children, so they run every migrator in turn. */
    UNMIGRATED_VERSION: '0.0.0',

    /**
     * A parent's legacy embedded children, which older worlds stored as an object rather than an array.
     */
    legacyChildren(parent: any): any[] {
        const embeddedItems = getProperty(parent, `flags.${SYSTEM_NAME}.${FLAGS.EmbeddedItems}`);
        if (embeddedItems == null) return [];
        return Array.isArray(embeddedItems) ? embeddedItems : Object.values(embeddedItems);
    },

    /**
     * Lift all eligible legacy descendants, preserving each child's direct parent relationship.
     */
    liftDescendants(parent: any): any[] {
        const lifted: any[] = [];
        const pending = [parent];

        while (pending.length > 0) {
            const current = pending.shift();
            const children = LegacyChildrenFlow.liftChildren(current);
            lifted.push(...children);
            pending.push(...children);
        }

        return lifted;
    },

    /**
     * Move a parent's legacy embedded children out into standalone item data.
     */
    liftChildren(parent: any): any[] {
        const embeddedItems = LegacyChildrenFlow.legacyChildren(parent);
        if (embeddedItems.length === 0 || !parent?._id) return [];

        // Bioware and cyberware take 'ware' modifications rather than modifications named after
        // their own item type, so the parent type can't be used as the modification type directly.
        const modificationType = SR5.modificationTypeByParentType[parent.type];

        const lifted: any[] = [];
        const remaining: any[] = [];
        const usedIds = new Set<string>();
        for (const [index, child] of embeddedItems.entries()) {
            const canLift = parent.type === 'container' ||
                (parent.type === 'weapon' && child.type === 'ammo') ||
                (child.type === 'modification' && !!modificationType);
            if (!canLift) {
                remaining.push(child);
                continue;
            }

            const liftedChild = deepClone(child);
            liftedChild._id = LegacyChildrenFlow.liftedChildId(parent._id, child, index, usedIds);
            setProperty(liftedChild, 'system.parentId', parent._id);
            if (liftedChild.type === 'modification' && modificationType) setProperty(liftedChild, 'system.type', modificationType);
            lifted.push(liftedChild);
        }

        if (remaining.length > 0) setProperty(parent, `flags.${SYSTEM_NAME}.${FLAGS.EmbeddedItems}`, remaining);
        else if (lifted.length > 0) delete parent.flags?.[SYSTEM_NAME]?.[FLAGS.EmbeddedItems];
        return lifted;
    },

    /**
     * Mark raw flag data as owing the complete item migration chain.
     */
    stampAsUnmigrated(item: any) {
        setProperty(item, '_stats.systemVersion', LegacyChildrenFlow.UNMIGRATED_VERSION);
        if (!Array.isArray(item.effects)) return;

        for (const effect of item.effects) {
            effect.type ??= 'base';
            setProperty(effect, '_stats.systemVersion', LegacyChildrenFlow.UNMIGRATED_VERSION);
        }
    },

    /**
     * Expand item creation data, adding the legacy children of any item as linked items beside it.
     *
     * Lifted children point at their parent's id, so when any child is lifted every item gets its
     * final id here and the batch has to be created with keepId. Without keepId the caller wanted
     * fresh ids, which is what every item then receives.
     *
     * @returns The data to create and whether to create it with keepId.
     */
    expandCreateData<Data extends object>(data: readonly Data[], keepId: boolean): { data: Data[]; keepId: boolean } {
        if (!data.some(item => LegacyChildrenFlow.legacyChildren(item).length > 0)) return { data: [...data], keepId };

        const expanded: Data[] = [];
        for (const item of data) {
            // The caller's data must not lose its flags because it was created once.
            const source = deepClone(item) as any;
            if (!keepId || !source._id) source._id = randomID();
            expanded.push(source);

            const lifted = LegacyChildrenFlow.liftDescendants(source);
            for (const child of lifted) {
                LegacyChildrenFlow.stampAsUnmigrated(child);
                if ('folder' in source) child.folder = source.folder ?? null;
            }
            expanded.push(...lifted);
        }

        return { data: expanded, keepId: true };
    },

    /**
     * Id for a lifted child, derived from its parent and its legacy entry.
     *
     * The parent is part of the seed because copies of one legacy entry keep the child's `_id`: two
     * items holding the same legacy children would otherwise lift them to a single id, which a
     * keepId create cannot store twice.
     *
     * One piece of legacy data is lifted in more than one place. A base actor and an unlinked token's
     * delta each migrate their own copy of the same parent, and the delta migration has no version
     * stamp to skip on, so it runs again on every load until a write persists the lifted form.
     *
     * Those lifts have to land on the same ids. Foundry merges a delta's items into the base actor's
     * by `_id`, keeping every base item the delta does not name, so a child lifted under a different
     * id stops overriding its base counterpart and shows up beside it instead. Hashing the source is
     * what keeps them equal without carrying state between the lifts.
     */
    liftedChildId(parentId: string, child: any, index: number, usedIds: Set<string>): string {
        const key = typeof child?._id === 'string' && child._id ? child._id : `#${index}`;
        return derivedChildId(parentId, key, usedIds);
    },

    deterministicId,
};
