import { VersionMigration } from "../VersionMigration";

/**
 * Version 0.29.0
 * 
 * Migrate Active Model to Data Model.
 */

export class Version0_30_0 extends VersionMigration {
    readonly TargetVersion = "0.30.0";

    // Handle Actor documents so they can be sanitized.
    override handlesActor(_actor: Readonly<any>) { return true; }

    override migrateItem(item: any) {
        if (item.type === 'sin' && item.system?.licenses)
            item.system.licenses = Object.values(item.system.licenses);

        if (item.type === 'modification' && typeof item.system?.mount_point === 'string') {
            item.system.mount_point = item.system.mount_point.toLowerCase();

            if (item.system?.mount_point === 'under_barrel')
                item.system.mount_point = 'under';
        }
    }

    override migrateActiveEffect(effect: any) {
        const flag = effect.flags?.shadowrun5e;

        if (!flag) return;

        if (flag.applyTo)
            effect.system.applyTo = flag.applyTo;

        if (flag.appliedByTest != null)
            effect.system.appliedByTest = flag.appliedByTest;

        if (flag.onlyForEquipped != null)
            effect.system.onlyForEquipped = flag.onlyForEquipped;

        if (flag.onlyForWireless != null)
            effect.system.onlyForWireless = flag.onlyForWireless;

        if (flag.onlyForItemTest != null)
            effect.system.onlyForItemTest = flag.onlyForItemTest;

        if (flag.selection_attributes)
            effect.system.selection_attributes = JSON.parse(flag.selection_attributes);

        if (flag.selection_categories)
            effect.system.selection_categories = JSON.parse(flag.selection_categories);

        if (flag.selection_limits)
            effect.system.selection_limits = JSON.parse(flag.selection_limits);

        if (flag.selection_skills)
            effect.system.selection_skills = JSON.parse(flag.selection_skills);
        
        if (flag.selection_tests)
            effect.system.selection_tests = JSON.parse(flag.selection_tests);

        delete effect.flags.shadowrun5e;
    }
}
