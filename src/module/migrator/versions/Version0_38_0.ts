import { ItemAvailabilityFlow } from '@/module/item/flows/ItemAvailabilityFlow';
import { ModifiableValuePriority } from '@/module/mods/ModifiableValue';
import { VersionMigration } from '../VersionMigration';

const { randomID } = foundry.utils;

/** Migrate data changes from every branch that ships in 0.38.0. */
export class Version0_38_0 extends VersionMigration {
    readonly TargetVersion = '0.38.0';

    // Each branch contributing to 0.38.0 keeps its whole flow in its own migrate<Branch> method, called here.
    override migrateItem(item: any): void {
        this.migrateItemSheetRework(item);
    }

    /**
     * ItemSheetRework: ids for flag-stored nested items/effects, technology cost/availability/essence as
     * base/value fields, and legacy "adjusted" rating multipliers as item Active Effects.
     */
    private migrateItemSheetRework(item: any): void {
        Version0_38_0.assignNestedIds(item.flags?.shadowrun5e?.embeddedItems);

        const technology = item.system?.technology;
        if (!technology || typeof technology !== 'object') return;

        // 0.37.0 stored cost as a number and availability as a '12R' string.
        const calculated = technology.calculated;
        const cost = typeof technology.cost === 'number' ? technology.cost : 0;
        const availability = typeof technology.availability === 'string' ? technology.availability : '';

        technology.cost = { base: cost, value: cost, changes: [] };
        technology.availability = { ...ItemAvailabilityFlow.parseAvailabilityString(availability), changes: [] };

        if (!calculated || typeof calculated !== 'object') return;

        // Essence moved out of the removed calculated block.
        if (!technology.essence && calculated.essence) {
            const essence = calculated.essence;
            const value = typeof essence === 'object' ? Version0_38_0.firstFiniteNumber(essence.value, essence.base, 0) : 0;
            technology.essence = { base: value, value };
        }

        // "adjusted" multiplied cost/availability by rating; keep that as an item effect the user can see and remove.
        const ratingEffectFlag = 'ratingMultiplier';
        for (const field of ['cost', 'availability'] as const) {
            if (!calculated[field]?.adjusted) continue;
            // Availability was only multiplied by rating when it parsed as Number-Letter.
            if (field === 'availability' && !ItemAvailabilityFlow.parseAvailability(availability).isValid) continue;

            item.effects ??= [];
            if (item.effects.some((effect: any) => effect.flags?.shadowrun5e?.[ratingEffectFlag] === field)) continue;

            const fieldLabel = field === 'cost' ? 'SR5.Cost' : 'SR5.Availability';
            item.effects.push({
                _id: randomID(),
                name: `${game.i18n.localize('SR5.Rating')} ${game.i18n.localize(fieldLabel)}`,
                type: 'base',
                flags: { shadowrun5e: { [ratingEffectFlag]: field } },
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

        delete technology.calculated;
    }

    /** Nested items and their effects are stored in flags and need ids to be addressable as documents. */
    private static assignNestedIds(items: unknown): void {
        if (!Array.isArray(items)) return;

        for (const nested of items) {
            nested._id ??= randomID();

            if (Array.isArray(nested.effects)) {
                for (const effect of nested.effects) effect._id ??= randomID();
            }

            Version0_38_0.assignNestedIds(nested.flags?.shadowrun5e?.embeddedItems);
        }
    }

    private static firstFiniteNumber(...values: unknown[]): number {
        for (const value of values) {
            const number = Number(value);
            if (Number.isFinite(number)) return number;
        }
        return 0;
    }
}
