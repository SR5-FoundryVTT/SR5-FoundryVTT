import { SR5 } from '@/module/config';
import { VersionMigration } from '../VersionMigration';
import { parseVehicleSubCategory } from '@/module/apps/actorImport/itemImporter/vehicleImport/VehicleParser';

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

/**
 * Migration 0.38.0:
 * - Migrate vehicle subCategory from Chummer importFlags category, evaluated icon override, img, or name.
 * - Migrate legacy isSwarm / swarmCount properties to system.swarm schema object.
 */
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

    override migrateItem(item: any): void {
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
}
