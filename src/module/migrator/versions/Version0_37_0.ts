import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import { VersionMigration } from '../VersionMigration';
import { ItemAvailabilityFlow } from '@/module/item/flows/ItemAvailabilityFlow';

const { deepClone, getProperty, hasProperty, randomID, setProperty } = foundry.utils;

// Old flat filter dimensions -> new condition type.
const flatDimensions = [
    { valueKey: 'selection_tests', modeKey: 'selection_tests_mode', type: 'tests' },
    { valueKey: 'selection_categories', modeKey: 'selection_categories_mode', type: 'categories' },
    { valueKey: 'selection_skills', modeKey: 'selection_skills_mode', type: 'skills' },
    { valueKey: 'selection_attributes', modeKey: 'selection_attributes_mode', type: 'attributes' },
    { valueKey: 'selection_limits', modeKey: 'selection_limits_mode', type: 'limits' },
] as const;

// Natural recovery intervals, SR5 CRB p. 207.
const recoveryIntervals: Record<string, { value: number, unit: string }> = {
    NaturalRecoveryStunTest: { value: 1, unit: 'hours' },
    NaturalRecoveryPhysicalTest: { value: 1, unit: 'days' },
};

export class Version0_37_0 extends VersionMigration {
    readonly TargetVersion = '0.37.0';

    override migrateItem(item: any): void {
        this.consolidateParentId(item);
        Version0_37_0.ensureNestedDocumentIds(item);
        Version0_37_0.migrateExtendedAction(item);

        const technology = item.system?.technology;
        if (!technology || typeof technology !== 'object') return;

        technology.cost = Version0_37_0.migrateCost(technology.cost);
        technology.availability = Version0_37_0.migrateAvailability(technology.availability);

        if (technology.calculated && typeof technology.calculated === 'object') {
            if (!technology.essence && technology.calculated.essence) {
                technology.essence = Version0_37_0.migrateEssence(technology.calculated.essence);
            }
            delete technology.calculated;
        }
    }

    override migrateActor(actor: any): void {
        const items = Array.isArray(actor.items) ? [...actor.items] : [];
        for (const item of items) {
            this.consolidateParentId(item);
        }

        const lifted: any[] = [];
        for (const item of items) {
            lifted.push(...this.liftLegacyEmbeddedChildren(item));
        }

        for (const child of lifted) {
            this.consolidateParentId(child);
        }

        if (lifted.length > 0) {
            actor.items.push(...lifted);
        }
    }

    /**
     * Migrate Active Effect filters/apply-to to the per-target model.
     *
     * New shape:
     * - effect.system.targets: [{ id, applyTo, conditions: [{ type, mode, values }], onlyForItemTest }]
     * - each effect.system.changes[i].target references the created target.
     *
     * The former effect-level `onlyForItemTest` flag is folded onto the created target (it only ever
     * gated 'modifier' application).
     */
    override migrateActiveEffect(effect: any): void {
        const system = effect.system;
        if (!system || typeof system !== 'object') return;

        // Build conditions cleanly, dropping empty ones
        const conditions = flatDimensions.flatMap(({ valueKey, modeKey, type }) => {
            const values = system[valueKey];
            return Array.isArray(values) && values.length > 0
                ? [{ type, mode: system[modeKey] ?? 'include', values }]
                : [];
        });

        // Generate a single ID and assign the target directly.
        const applyTo = system.applyTo ?? 'actor';
        const targetId = foundry.utils.randomID();
        system.targets = [{
            id: targetId,
            applyTo,
            conditions,
            onlyForItemTest: applyTo === 'modifier' ? !!system.onlyForItemTest : false,
        }];

        // Remove legacy per-effect routing/filter fields now represented by targets+conditions.
        delete system.applyTo;
        delete system.onlyForItemTest;
        for (const { valueKey, modeKey } of flatDimensions) {
            delete system[valueKey];
            delete system[modeKey];
        }

        // Assign the target to existing changes
        for (const change of system.changes ?? []) {
            change.target = targetId;
        }
    }

    override async MigrateWorld(): Promise<void> {
        await this.liftLegacyChildrenFromItems(game.items.contents.map(item => item.toObject()), null);

        for (const collection of game.packs) {
            if (collection.documentName !== 'Item') continue;
            if (collection.metadata.packageType !== 'world') continue;

            const pack = collection as foundry.documents.collections.CompendiumCollection<'Item'>;
            const wasLocked = pack.locked;
            if (wasLocked) {
                try {
                    await pack.configure({ locked: false });
                } catch (error) {
                    console.error(`Failed to unlock compendium ${pack.collection} for legacy attachment migration.`, error);
                    continue;
                }
            }

            try {
                const documents = await pack.getDocuments();
                await this.liftLegacyChildrenFromItems(documents.map(document => document.toObject()), pack);
            } finally {
                if (wasLocked) {
                    try {
                        await pack.configure({ locked: true });
                    } catch (error) {
                        console.error(`Failed to re-lock compendium ${pack.collection} after legacy attachment migration.`, error);
                    }
                }
            }
        }
    }

    /**
     * Fold the legacy system.container field into system.parentId (a child is either stored in a
     * container or attached to a parent, never both, so they share one field), and ensure
     * parentId is always present.
     */
    private consolidateParentId(item: any) {
        if (!item?.system || typeof item.system !== 'object') return;

        const parentId = getProperty(item.system, 'parentId');
        const container = getProperty(item.system, 'container');
        if ((parentId === null || parentId === undefined || parentId === '') && typeof container === 'string' && container) {
            setProperty(item.system, 'parentId', container);
        }
        if (!hasProperty(item.system, 'parentId')) setProperty(item.system, 'parentId', null);
    }

    /**
     * Lift legacy embedded children from the given item sources, creating the lifted siblings
     * and persisting the updated legacy flag on their parents within the same collection.
     */
    private async liftLegacyChildrenFromItems(items: any[], pack: foundry.documents.collections.CompendiumCollection<'Item'> | null) {
        const lifted: any[] = [];
        const updatedParents: any[] = [];

        for (const item of items) {
            const liftedChildren = this.liftLegacyEmbeddedChildren(item);
            if (liftedChildren.length === 0) continue;

            for (const child of liftedChildren) {
                setProperty(child, '_stats.systemVersion', game.system.version);
            }

            lifted.push(...liftedChildren);
            updatedParents.push({ _id: item._id, flags: item.flags });
        }

        if (lifted.length === 0) return;

        try {
            await Item.implementation.createDocuments(lifted as Item.CreateData[], { pack: pack?.collection });
            await Item.implementation.updateDocuments(updatedParents as any, { pack: pack?.collection, diff: false, recursive: false });
        } catch (error) {
            console.error(`Failed legacy attachment lift for ${pack ? pack.collection : 'world items'}.`, error);
        }
    }

    /**
     * Lift a parent item's legacy embedded children into sibling item sources linked by system.parentId.
     */
    private liftLegacyEmbeddedChildren(parent: any): any[] {
        const rawEmbeddedItems = getProperty(parent, `flags.${SYSTEM_NAME}.${FLAGS.EmbeddedItems}`);
        const embeddedItems = rawEmbeddedItems == null
            ? []
            : Array.isArray(rawEmbeddedItems)
                ? rawEmbeddedItems
                : Object.values(rawEmbeddedItems);
        if (embeddedItems.length === 0 || !parent?._id) return [];

        const lifted: any[] = [];
        const remaining: any[] = [];
        for (const child of embeddedItems) {
            const canLift =
                parent.type === 'container' ||
                (parent.type === 'weapon' && child.type === 'ammo') ||
                (
                    child.type === 'modification' &&
                    ['weapon', 'armor', 'vehicle', 'drone', 'bioware', 'cyberware'].includes(parent.type)
                );

            if (!canLift) {
                remaining.push(child);
                continue;
            }

            const liftedChild = deepClone(child);
            liftedChild._id = randomID();
            setProperty(liftedChild, 'system.parentId', parent._id);

            if (parent.type !== 'container' && liftedChild.type === 'modification') {
                setProperty(liftedChild, 'system.type', parent.type);
            }

            lifted.push(liftedChild);
        }

        if (remaining.length > 0) {
            setProperty(parent, `flags.${SYSTEM_NAME}.${FLAGS.EmbeddedItems}`, remaining);
        } else if (lifted.length > 0) {
            delete parent.flags?.[SYSTEM_NAME]?.[FLAGS.EmbeddedItems];
        }

        return lifted;
    }

    private static ensureNestedDocumentIds(item: any): void {
        const embeddedItems = item.flags?.shadowrun5e?.embeddedItems;
        if (!Array.isArray(embeddedItems)) return;

        for (const embeddedItem of embeddedItems) {
            embeddedItem._id ??= foundry.utils.randomID();

            if (Array.isArray(embeddedItem.effects)) {
                for (const effect of embeddedItem.effects) {
                    effect._id ??= foundry.utils.randomID();
                }
            }

            Version0_37_0.ensureNestedDocumentIds(embeddedItem);
        }
    }

    /**
     * Turn the action extended flag into the interval it always implied.
     *
     * Recovery gets its book interval, everything else the one minute TestCreator used to
     * apply to any extended action.
     */
    private static migrateExtendedAction(item: any): void {
        const action = item.system?.action;
        // Only a boolean is unmigrated. The migrator reruns until a document can persist.
        if (typeof action?.extended !== 'boolean') return;

        action.extended = action.extended
            ? recoveryIntervals[action.test] ?? { value: 1, unit: 'minutes' }
            : { value: 0, unit: 'minutes' };
    }

    private static migrateEssence(essence: unknown) {
        if (essence && typeof essence === 'object') {
            const data = essence as { base?: unknown; value?: unknown };
            const value = Version0_37_0.firstFiniteNumber(data.value, data.base, 0);
            return { base: value, value };
        }

        return { base: 0, value: 0 };
    }

    private static migrateCost(cost: unknown) {
        if (typeof cost === 'number') {
            return { base: cost, value: cost, changes: [] };
        }

        if (cost && typeof cost === 'object') {
            const data = cost as { base?: unknown; value?: unknown };
            const base = Version0_37_0.firstFiniteNumber(data.base, data.value, 0);
            return { base, value: base, changes: [] };
        }

        return { base: 0, value: 0, changes: [] };
    }

    private static migrateAvailability(availability: unknown) {
        if (typeof availability === 'string') {
            return Version0_37_0.createAvailabilityFromString(availability);
        }

        if (availability && typeof availability === 'object') {
            const data = availability as {
                base?: unknown;
                value?: unknown;
                restriction?: unknown;
                changes?: any[];
                label?: unknown;
            };

            const base = Version0_37_0.firstString(data.base, data.value, '');
            const migrated = Version0_37_0.createAvailabilityFromString(base);
            const changes = Array.isArray(data.changes) ? data.changes as any[] : [];

            if (typeof data.base === 'number') {
                migrated.base = Number.isFinite(data.base) ? data.base : 0;
                migrated.value = migrated.base;
            }

            migrated.restriction = Version0_37_0.migrateRestriction(data.restriction, migrated.restriction);

            for (const change of changes) {
                if (change?.type !== 'override') continue;
                const parsed = ItemAvailabilityFlow.parseAvailability(String(change.value ?? ''));
                if (!parsed.isValid || typeof parsed.availability !== 'number') continue;

                change.value = parsed.availability;
                migrated.restriction = parsed.restriction;
            }

            migrated.changes = changes;
            migrated.label = ItemAvailabilityFlow.composeValue(migrated.value, migrated.restriction);
            return migrated;
        }

        return Version0_37_0.createAvailabilityFromString('');
    }

    private static migrateRestriction(restriction: unknown, fallback: 'none' | 'restricted' | 'forbidden'): 'none' | 'restricted' | 'forbidden' {
        if (typeof restriction === 'string') {
            return Version0_37_0.normalizeRestriction(restriction);
        }

        if (restriction && typeof restriction === 'object') {
            const restrictionData = restriction as { base?: unknown; value?: unknown };
            const value = Version0_37_0.firstString(restrictionData.value, restrictionData.base, fallback);
            return Version0_37_0.normalizeRestriction(value);
        }

        return fallback;
    }

    private static firstFiniteNumber(...values: unknown[]) {
        for (const value of values) {
            const number = Number(value);
            if (Number.isFinite(number)) return number;
        }
        return 0;
    }

    private static firstString(...values: unknown[]) {
        for (const value of values) {
            if (typeof value === 'string') return value;
            if (typeof value === 'number') return String(value);
        }
        return '';
    }

    private static createAvailabilityFromString(value: string): {
        base: number;
        value: number;
        changes: any[];
        restriction: 'none' | 'restricted' | 'forbidden';
        label: string;
    } {
        const parsed = ItemAvailabilityFlow.parseAvailabilityString(value);
        return {
            base: parsed.base,
            value: parsed.value,
            changes: [],
            restriction: parsed.restriction,
            label: parsed.label,
        };
    }

    private static normalizeRestriction(value: string): 'none' | 'restricted' | 'forbidden' {
        return ['none', 'restricted', 'forbidden'].includes(value)
            ? value as 'none' | 'restricted' | 'forbidden'
            : ItemAvailabilityFlow.restrictionFromSuffix(value);
    }
}
