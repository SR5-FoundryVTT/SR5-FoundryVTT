import { VersionMigration } from '../VersionMigration';
import { parseVehicleSubCategory } from '@/module/apps/actorImport/itemImporter/vehicleImport/VehicleParser';

/**
 * Migration 0.38.0:
 * - Migrate vehicle subCategory from Chummer importFlags category, category, img, or name.
 * - Migrate legacy isSwarm / swarmCount properties to system.swarm schema object.
 */
export class Version0_38_0 extends VersionMigration {
    readonly TargetVersion = '0.38.0';

    override migrateActor(actor: any): void {
        if (actor.type !== 'vehicle') return;

        const system = actor.system;
        if (!system) return;

        // Populate subCategory if empty or if generic/default value needs refinement
        const isGenericSubCategory = !system.subCategory || system.subCategory === 'aircraft' || (system.subCategory === 'medium_drone' && !system.isDrone);
        if (isGenericSubCategory) {
            const candidates = [
                actor.img,
                actor.prototypeToken?.texture?.src,
                actor.name,
                system.importFlags?.category,
                system.isDrone ? system.category : '',
            ];

            let bestSubCategory = '';
            for (const candidate of candidates) {
                if (typeof candidate === 'string' && candidate) {
                    const parsed = parseVehicleSubCategory(candidate);
                    if (parsed) {
                        if (parsed !== 'aircraft' || !bestSubCategory) {
                            bestSubCategory = parsed;
                        }
                        if (bestSubCategory && bestSubCategory !== 'aircraft') {
                            break;
                        }
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
