import { VersionMigration } from "../VersionMigration";

/**
 * Version 0.29.0
 * 
 * - Migrate template data to DataModel.
 * - Migrate old matrix data to matrix 1.0
 */
export class Version0_30_0 extends VersionMigration {
    readonly TargetVersion = "0.30.0";

    // Handle Actor documents so they can be sanitized.
    override handlesActor(_actor: Readonly<any>) { return true; }

    override migrateActor(_actor: any): void {
        if (['character', 'critter', 'ic', 'vehicle', 'sprite'].includes(_actor.type)) {
            // Matrix 1.0 Running silent has been renamed.
            const runningSilent = _actor.system?.matrix?.silent;
            _actor.system.matrix.running_silent = runningSilent ?? false;
        }
    }

    override migrateItem(_item: any) {
        // Legacy items may still use `data` instead of `system`
        if (_item.data) {
            _item.system = _item.data;
            delete _item.data;
        }

        // Cleanup from legacy / broken template data to DataModel.
        if (_item.type === 'sin' && _item.system?.licenses)
            _item.system.licenses = Object.values(_item.system.licenses);

        if (_item.type === 'modification' && typeof _item.system?.mount_point === 'string') {
            _item.system.mount_point = _item.system.mount_point.toLowerCase();

            if (_item.system?.mount_point === 'under_barrel')
                _item.system.mount_point = 'under';
        }

        // Matrix 1.0 changes wireless from a checkbox to a choice.
        if (_item.system?.technology?.wireless) {
            _item.system.technology.wireless = _item.system.technology.wireless ? 'online' : 'offline';
        }
    }

    override migrateActiveEffect(effect: any) {
        effect.name ??= effect.label || "Unnamed Effect";
        delete effect.label;

        const flag = effect.flags?.shadowrun5e;
        if (!flag) return;

        effect.system ??= {};

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