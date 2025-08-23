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
        // Matrix 1.0 changes marks placed.
        if (['character', 'critter', 'ic', 'vehicle', 'sprite'].includes(_actor.type)) {
            migrateMarksActor(_actor);
            migrateActorRunningSilent(_actor);
        }
    }

    override migrateItem(_item: any) {
        // CLeanup from legacy / broken template data to DataModel.
        if (_item.type === 'sin' && _item.system?.licenses)
            _item.system.licenses = Object.values(_item.system.licenses);

        if (_item.type === 'modification' && typeof _item.system?.mount_point === 'string') {
            _item.system.mount_point = _item.system.mount_point.toLowerCase();

            if (_item.system?.mount_point === 'under_barrel')
                _item.system.mount_point = 'under';
        }

        // Matrix 1.0 changes marks placed.
        if (_item.type === 'host') {
            migrateHostData(_item);
        }
        // Matrix 1.0 changes wireless from a checkbox to a choice.
        if (_item.system.technology?.wireless) {
            migrateMatrixDeviceData(_item);
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

// pre v30 hosts stored marks as an object. As functionality to add marks is long past disabled, we can just delete marks.
function migrateHostData(item: any) {
    const marksData = item.system.marks;
    if (!marksData) return
    if (Array.isArray(marksData)) return

    item.system.marks = [];
}

// pre v30 characters stored marks as an object. As functionality to add marks is long past disabled, we can just delete marks.
function migrateMarksActor(actor: any) {
    const marksData = actor.system.matrix.marks;
    if (!marksData) return
    if (Array.isArray(marksData)) return

    actor.system.marks = [];
}


// pre v30 wirelss was a simple boolean
function migrateMatrixDeviceData(item: any) {
    item.system.technology.wireless = item.system.technology.wireless ? 'online' : 'offline';
}

// Matrix 1.0 changed naming of running silent
function migrateActorRunningSilent(actor: any) {
    const runningSilent = actor.system?.matrix?.silent;
    actor.system.matrix.running_silent = runningSilent ?? false;
}