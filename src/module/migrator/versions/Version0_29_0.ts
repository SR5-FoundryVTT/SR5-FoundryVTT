import { VersionMigration } from "../VersionMigration";

/**
 * Version 0.29.0
 * 
 * Migrate Active Model to Data Model.
 */

export class Version0_29_0 extends VersionMigration {
    readonly TargetVersion = "0.29.0";

    override migrateActor(actor: any): void {
        console.log(actor);
    }

    override migrateActiveEffect(effect: any) {
        const flag = effect.flags?.shadowrun5e;
        if (!flag) return;

        if (flag.applyTo) effect.system.applyTo = flag.applyTo;
        if (flag.appliedByTest) effect.system.appliedByTest = flag.appliedByTest;
        if (flag.onlyForEquipped) effect.system.onlyForEquipped = flag.onlyForEquipped;
        if (flag.onlyForWireless) effect.system.onlyForWireless = flag.onlyForWireless;
        if (flag.onlyForItemTest) effect.system.onlyForItemTest = flag.onlyForItemTest;

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
