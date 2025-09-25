import { VersionMigration } from "../VersionMigration";
import { SR5 } from "@/module/config";

/**
 * Migration class for version 0.30.3 of the SR5-FoundryVTT system.
 * 
 * This migration addresses issues related to inventory data, specifically the incorrect default setting of `showAll` to `true`
 * for newly created inventories and the default 'carried' inventory since version 0.30.0. This could break the display of which
 * inventory an item belongs to.
 * 
 * The migration also ensures that selection values for attributes, categories, limits, skills, and tests in active effects
 * are properly set if missing, using the SR5 system data.
 */
export class Version0_30_3 extends VersionMigration {
    readonly TargetVersion = "0.30.3";

    override handlesActor(_actor: Readonly<any>) {
        // Inventory should exist on all actors, but we're being cautious.
        if (_actor.system.inventories) return true;
        return false;
    }

    override migrateActor(_actor: any): void {
        this._migrateNonAllInventories(_actor);
    }

    /**
     * Due to an issue with default inventory data setting showAll to true, newly created inventories, 
     * as well as default 'carried', since 0.30.0 would break display of which inventory an item belongs to.
     */
    _migrateNonAllInventories(_actor: any) {
        for (const inventory of Object.values<any>(_actor.system.inventories)) {
            if (inventory.name === 'All') continue;

            _actor.system.inventories[inventory.name].showAll = false;
        }
    }
}