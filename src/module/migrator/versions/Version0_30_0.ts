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

    override migrateItem(item: any) {
        // CLeanup from legacy / broken template data to DataModel.
        if (item.type === 'sin' && item.system?.licenses)
            item.system.licenses = Object.values(item.system.licenses);

        if (item.type === 'modification' && typeof item.system?.mount_point === 'string') {
            item.system.mount_point = item.system.mount_point.toLowerCase();

            if (item.system?.mount_point === 'under_barrel')
                item.system.mount_point = 'under';
        }

        // Matrix 1.0 changes wireless from a checkbox to a choice.
        if (item.type === 'host') {
            migrateHostData(item);
        }
        if (item.type === 'device') {
            migrateDeviceData(item);
        }
        if (item.system.technology) {
            migrateMatrixDeviceData(item);
        }
    }

    override migrateActor(actor: any) {
        if (actor.isType('ic')) {
            migrateIcActor(actor);
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

function migrateHostData(item: any) {
    const marksData = item.system.marks;
    if (!marksData) return
    if (Array.isArray(marksData)) return

    // pre v30 hosts stored marks as an object. As functionality to add marks is long past disabled, we can just delete marks.
    item.system.marks = [];
}

function migrateDeviceData(item: any) {
    // TODO: remove system.networkDevices
    // TODO: remove system.slaves
    // TODO: if possible recreate slave relation
}

/**
 * pre v30 wirelss was a simple boolean
 */
function migrateMatrixDeviceData(item: any) {
    if (item.system.technology) {
        item.system.technology.wireless = item.system.technology.wireless ? 'online' : 'offline';
    }

    // TODO: remove system.technology.networkController
    // TODO: if possible recreate slave relation
    // const uuid = item.system?.technology?.networkController ?? '';
    // const controller = await fromUuid(uuid) as SR5Item;
    // if (!controller) return updateData;

    // await NetworkStorage.addSlave(controller, item);
}

function migrateIcActor(actor: any) {
    // TODO: See item for addSlave issues.
}