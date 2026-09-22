import { ItemAvailabilityFlow } from '@/module/item/flows/ItemAvailabilityFlow';
import { ModifiableValuePriority } from '@/module/mods/ModifiableValue';
import { VersionMigration } from '../VersionMigration';

/** Migrate item-sheet data introduced for 0.38.0. */
export class Version0_38_0 extends VersionMigration {
    readonly TargetVersion = '0.38.0';
    private static readonly RATING_EFFECT_FLAG = 'ratingMultiplier';

    override migrateItem(item: any): void {
        Version0_38_0.ensureNestedDocumentIds(item);

        const technology = item.system?.technology;
        if (!technology || typeof technology !== 'object') return;

        const calculated = technology.calculated;
        const availabilityParsable = Version0_38_0.isAvailabilityParsable(technology.availability);
        technology.cost = Version0_38_0.migrateCost(technology.cost);
        technology.availability = Version0_38_0.migrateAvailability(technology.availability);

        if (calculated && typeof calculated === 'object') {
            if (calculated.cost?.adjusted) Version0_38_0.addRatingEffect(item, 'cost');
            if (calculated.availability?.adjusted && availabilityParsable) Version0_38_0.addRatingEffect(item, 'availability');
            if (!technology.essence && calculated.essence) {
                technology.essence = Version0_38_0.migrateEssence(calculated.essence);
            }
            delete technology.calculated;
        }
    }

    /**
     * Legacy string availability was only multiplied by rating when it parsed as Number-Letter.
     */
    private static isAvailabilityParsable(availability: unknown): boolean {
        if (typeof availability !== 'string') return true;
        return ItemAvailabilityFlow.parseAvailability(availability).isValid;
    }

    private static addRatingEffect(item: any, field: 'cost' | 'availability'): void {
        item.effects ??= [];
        if (item.effects.some((effect: any) => effect.flags?.shadowrun5e?.[Version0_38_0.RATING_EFFECT_FLAG] === field)) return;

        const fieldLabel = field === 'cost' ? 'SR5.Cost' : 'SR5.Availability';
        item.effects.push({
            _id: foundry.utils.randomID(),
            name: `${game.i18n.localize('SR5.Rating')} ${game.i18n.localize(fieldLabel)}`,
            type: 'base',
            flags: { shadowrun5e: { [Version0_38_0.RATING_EFFECT_FLAG]: field } },
            system: {
                targets: [{ id: 'item', applyTo: 'item' }],
                changes: [{
                    key: `system.technology.${field}`,
                    type: 'multiply',
                    value: '@system.technology.rating',
                    priority: ModifiableValuePriority.RATING,
                    target: 'item',
                }],
            },
        });
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
            return { base, value: base, changes: Array.isArray((cost as any).changes) ? (cost as any).changes : [] };
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
            migrated.changes = Array.isArray((availability as any).changes) ? (availability as any).changes : [];
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
