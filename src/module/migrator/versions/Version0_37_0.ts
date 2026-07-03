import { VersionMigration } from '../VersionMigration';
import { ItemAvailabilityFlow } from '@/module/item/flows/ItemAvailabilityFlow';

// Old flat filter dimensions -> new condition type.
const flatDimensions = [
    { valueKey: 'selection_tests', modeKey: 'selection_tests_mode', type: 'tests' },
    { valueKey: 'selection_categories', modeKey: 'selection_categories_mode', type: 'categories' },
    { valueKey: 'selection_skills', modeKey: 'selection_skills_mode', type: 'skills' },
    { valueKey: 'selection_attributes', modeKey: 'selection_attributes_mode', type: 'attributes' },
    { valueKey: 'selection_limits', modeKey: 'selection_limits_mode', type: 'limits' },
] as const;

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
export class Version0_37_0 extends VersionMigration {
    readonly TargetVersion = '0.37.0';

    override migrateItem(item: any): void {
        Version0_37_0.ensureNestedDocumentIds(item);

        const technology = item.system?.technology;
        if (!technology || typeof technology !== 'object') return;

        technology.cost = Version0_37_0.migrateCost(technology.cost);
        technology.availability = Version0_37_0.migrateAvailability(technology.availability);

        if (technology.calculated && typeof technology.calculated === 'object') {
            delete technology.calculated.cost;
            delete technology.calculated.availability;
        }
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
