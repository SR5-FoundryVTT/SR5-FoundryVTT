import { SR5Actor } from "../../actor/SR5Actor";
import { SR5Item } from "../../item/SR5Item";
import { VersionMigration } from "../VersionMigration";

/**
 * Migration for new matrix system:
 * - Migrate actor.system.matrix.marks from key-value to list storage
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

    protected override async ShouldMigrateItemData(item: SR5Item) {
        return item.isHost;
    }
    
    protected override async ShouldMigrateActorData(actor: SR5Actor) {
        return actor.isMatrixActor;
    }

    protected override async MigrateItemData(item: SR5Item) {
        const updateData = {data: {}};

        const marksData = item.system['marks'];
        if (!marksData) return updateData;
        if (Array.isArray(marksData)) return updateData;

        updateData.data['marks'] = migrateMarksData(marksData);

        return updateData;
    }

    protected override async MigrateActorData(actor: SR5Actor) {
        const updateData = {data: {}};

        const matrixData = actor.system['matrix'];
        if (!matrixData) return updateData;
        if (Array.isArray(matrixData.marks)) return updateData;

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