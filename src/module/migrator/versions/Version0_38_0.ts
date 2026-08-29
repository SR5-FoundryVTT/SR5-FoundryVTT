import { ItemAvailabilityFlow } from '@/module/item/flows/ItemAvailabilityFlow';
import { VersionMigration } from '../VersionMigration';

/** Migrate item-sheet data introduced for 0.38.0. */
export class Version0_38_0 extends VersionMigration {
    readonly TargetVersion = '0.38.0';

    override migrateItem(item: any): void {
        Version0_38_0.ensureNestedDocumentIds(item);

        const technology = item.system?.technology;
        if (!technology || typeof technology !== 'object') return;

        technology.cost = Version0_38_0.migrateCost(technology.cost);
        technology.availability = Version0_38_0.migrateAvailability(technology.availability);

        if (technology.calculated && typeof technology.calculated === 'object') {
            if (!technology.essence && technology.calculated.essence) {
                technology.essence = Version0_38_0.migrateEssence(technology.calculated.essence);
            }
            delete technology.calculated;
        }
    }

    private static migrateEssence(essence: unknown) {
        if (essence && typeof essence === 'object') {
            const data = essence as { base?: unknown; value?: unknown };
            const value = Version0_38_0.firstFiniteNumber(data.value, data.base, 0);
            return { base: value, value };
        }

        return { base: 0, value: 0 };
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

            Version0_38_0.ensureNestedDocumentIds(embeddedItem);
        }
    }

    private static migrateCost(cost: unknown) {
        if (typeof cost === 'number') {
            return { base: cost, value: cost, changes: [] };
        }

        if (cost && typeof cost === 'object') {
            const data = cost as { base?: unknown; value?: unknown };
            const base = Version0_38_0.firstFiniteNumber(data.base, data.value, 0);
            return { base, value: base, changes: [] };
        }

        return { base: 0, value: 0, changes: [] };
    }

    private static migrateAvailability(availability: unknown) {
        if (typeof availability === 'string') {
            return Version0_38_0.createAvailabilityFromString(availability);
        }

        if (availability && typeof availability === 'object') {
            const data = availability as {
                base?: unknown;
                value?: unknown;
                restriction?: unknown;
            };

            const base = Version0_38_0.firstString(data.base, data.value, '');
            const migrated = Version0_38_0.createAvailabilityFromString(base);

            if (typeof data.base === 'number') {
                migrated.base = Number.isFinite(data.base) ? data.base : 0;
                migrated.value = migrated.base;
            }

            migrated.restriction = Version0_38_0.migrateRestriction(data.restriction, migrated.restriction);
            migrated.label = ItemAvailabilityFlow.composeValue(migrated.value, migrated.restriction);
            return migrated;
        }

        return Version0_38_0.createAvailabilityFromString('');
    }

    private static migrateRestriction(restriction: unknown, fallback: 'none' | 'restricted' | 'forbidden'): 'none' | 'restricted' | 'forbidden' {
        if (typeof restriction === 'string') return Version0_38_0.normalizeRestriction(restriction);

        if (restriction && typeof restriction === 'object') {
            const data = restriction as { base?: unknown; value?: unknown };
            return Version0_38_0.normalizeRestriction(Version0_38_0.firstString(data.value, data.base, fallback));
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
        return { base: parsed.base, value: parsed.value, changes: [], restriction: parsed.restriction, label: parsed.label };
    }

    private static normalizeRestriction(value: string): 'none' | 'restricted' | 'forbidden' {
        return ['none', 'restricted', 'forbidden'].includes(value)
            ? value as 'none' | 'restricted' | 'forbidden'
            : ItemAvailabilityFlow.restrictionFromSuffix(value);
    }
}
