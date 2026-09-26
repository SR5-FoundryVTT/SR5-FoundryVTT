import { SR5 } from '@/module/config';
import { parseVehicleSubCategory } from '@/module/apps/actorImport/itemImporter/vehicleImport/VehicleParser';
import { ItemAvailabilityFlow } from '@/module/item/flows/ItemAvailabilityFlow';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import { VersionMigration } from '../VersionMigration';

const { randomID } = foundry.utils;

/**
 * Helper to check how IconAssign evaluates a vehicle category to an icon path override.
 */
function evaluateVehicleIconCategory(category: string): string {
    if (!category || typeof category !== 'string') return '';
    const slug = category
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return (SR5.itemCategoryIconOverrides?.vehicle as Record<string, string> | undefined)?.[slug] ?? '';
}

/** Migrate data changes from every branch that ships in 0.38.0. */
export class Version0_38_0 extends VersionMigration {
    readonly TargetVersion = '0.38.0';

    override migrateActor(actor: any): void {
        if (actor.type !== 'vehicle') return;

        const system = actor.system;
        if (!system) return;

        // Populate subCategory if empty or if generic/default value needs refinement
        const isGenericSubCategory = !system.subCategory || (system.subCategory === 'medium_drone' && !system.isDrone);
        if (isGenericSubCategory) {
            const importFlags = system.importFlags ?? actor.flags?.shadowrun5e?.importFlags;
            const importCategory = typeof importFlags?.category === 'string' ? importFlags.category : '';
            const evaluatedImportIcon = evaluateVehicleIconCategory(importCategory);

            const fallbackDroneCategory = system.isDrone && typeof system.category === 'string'
                ? `drones-${system.category.trim()}`
                : '';
            const evaluatedDroneIcon = evaluateVehicleIconCategory(fallbackDroneCategory);

            const candidates = [
                evaluatedImportIcon,
                evaluatedDroneIcon,
                importCategory,
                actor.img,
                actor.prototypeToken?.texture?.src,
                importFlags?.name,
                actor.name,
                system.isDrone && system.category ? `${system.category}_drone` : '',
                system.vehicleType,
            ];

            let bestSubCategory = '';
            for (const candidate of candidates) {
                if (typeof candidate === 'string' && candidate) {
                    const parsed = parseVehicleSubCategory(candidate);
                    if (parsed) {
                        bestSubCategory = parsed;
                        break;
                    }
                }
            }

            if (bestSubCategory) {
                system.subCategory = bestSubCategory;
            }
        }

        // Migrate legacy swarm properties to system.swarm
        if (typeof system.isSwarm === 'boolean' || typeof system.swarmCount === 'number') {
            system.swarm = {
                active: typeof system.swarm?.active === 'boolean' ? system.swarm.active : !!system.isSwarm,
                count: typeof system.swarm?.count === 'number' ? system.swarm.count : (typeof system.swarmCount === 'number' ? system.swarmCount : 1),
                tiles: system.swarm?.tiles ?? { uuids: [], image: "" },
            };
            delete system.isSwarm;
            delete system.swarmCount;
        }
    }

    // Each branch contributing to 0.38.0 keeps its whole flow in its own migrate<Branch> method, called here.
    override migrateItem(item: any): void {
        this.migrateItemSheetRework(item);

        const system = item.system;
        if (!system) return;

        // Migrate biofeedback 'none' to '' in action damage or item damage
        if (system.action?.damage?.biofeedback === 'none') {
            system.action.damage.biofeedback = '';
        }
        if (system.damage?.biofeedback === 'none') {
            system.damage.biofeedback = '';
        }
    }

    /**
     * ItemSheetRework: ids for flag-stored nested items/effects, technology cost/availability/essence as
     * base/value fields, and legacy "adjusted" rating multipliers as item Active Effects.
     */
    private migrateItemSheetRework(item: any): void {
        Version0_38_0.assignNestedIds(item.flags?.shadowrun5e?.embeddedItems);

        const technology = item.system?.technology;
        if (!technology) return;

        // 0.37.0 stored cost as a number and availability as a '12R' string, read the same way its prep did.
        const calculated = technology.calculated;
        const cost = Number(technology.cost ?? 0) || 0;
        const availability = String(technology.availability ?? '');

        technology.cost = { base: cost, value: cost, changes: [] };
        technology.availability = { ...ItemAvailabilityFlow.parseAvailabilityString(availability), changes: [] };

        if (!calculated) return;

        // Essence moved out of the removed calculated block.
        const essence = Number(item.system.essence ?? calculated.essence?.value) || 0;
        technology.essence ??= { base: essence, value: essence, changes: [] };

        // "adjusted" multiplied cost/availability by rating; keep that as an item effect the user can see and remove.
        for (const field of ['cost', 'availability'] as const) {
            if (!calculated[field]?.adjusted) continue;
            // Availability was only multiplied by rating when it parsed as Number-Letter.
            if (field === 'availability' && !ItemAvailabilityFlow.parseAvailability(availability).isValid) continue;

            const fieldLabel = field === 'cost' ? 'SR5.Cost' : 'SR5.Availability';
            item.effects ??= [];
            item.effects.push({
                _id: randomID(),
                name: `${game.i18n.localize('SR5.Rating')} ${game.i18n.localize(fieldLabel)}`,
                type: 'base',
                flags: { shadowrun5e: { ratingMultiplier: field } },
                system: {
                    targets: [{ id: 'item', applyTo: 'item' }],
                    changes: [{
                        key: `system.technology.${field}`,
                        type: 'multiply',
                        value: '@system.technology.rating',
                        priority: ModifiableValue.Priority.RATING,
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
}
