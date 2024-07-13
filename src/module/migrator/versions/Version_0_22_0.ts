import { SR5Actor } from "../../actor/SR5Actor";
import { VersionMigration } from "../VersionMigration";

/**
 * Migration for new matrix system:
 * - Migrate actor.system.matrix.marks from key-value to list storage
 * - TODO: Migrate ic.system.host.id to uuid
 * - TODO: Check if 
 * - TODO: Check if VersionMigrator needs data in updateData instead of system
 */
export class Version_0_22_0 extends VersionMigration {
    get SourceVersion(): string {
        return '0.22.0';
    }

    get TargetVersion(): string {
        return Version_0_22_0.TargetVersion;
    }

    static get TargetVersion(): string {
        return "0.22.0";
    }
    
    protected override async ShouldMigrateActorData(actor: SR5Actor) {
        return actor.isMatrixActor;
    }

    protected override async MigrateActorData(actor: SR5Actor) {
        const updateData = {data: {}};

        const matrixData = actor.system['matrix'];
        if (!matrixData) return updateData;

        updateData.data['matrix.marks'] = migrateMarksData(matrixData.marks);

        return updateData;
    }
}

/**
 * Migrate key-value store to list storage
 * 
 * Retrieve the target name based on sidebar documents. Should a document not be found, just use an empty name. This would have caused display issues already.
 * 
 * @param oldMarksData A key-value with uuid as key and marks as value.
 */
function migrateMarksData(oldMarksData: Record<string, number>) {
    const newMarksData: Shadowrun.MatrixMarks = [];

    for (const [markUuid, marks] of Object.entries(oldMarksData)) {
        const uuid = markUuid.replace(/\|/g, '.');
        const name = fromUuidSync(uuid)?.name ?? '';
        newMarksData.push({
            uuid,
            marks,
            name
        });
    }

    return newMarksData;
}