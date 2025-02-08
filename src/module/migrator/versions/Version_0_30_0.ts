import { SR5Actor } from "../../actor/SR5Actor";
import { SR5Item } from "../../item/SR5Item";
import { VersionMigration } from "../VersionMigration";

/**
 * Migration for new matrix system:
 * - Migrate actor.system.matrix.marks by removing it for an empty array. Legacy marks from 2 years ago shouldn't matter today.
 */
export class Version_0_30_0 extends VersionMigration {
    get SourceVersion(): string {
        return '0.22.0';
    }

    get TargetVersion(): string {
        return Version_0_30_0.TargetVersion;
    }

    static get TargetVersion(): string {
        return "0.30.0";
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

        updateData.data['marks'] = [];

        return updateData;
    }

    protected override async MigrateActorData(actor: SR5Actor) {
        const updateData = {data: {}};

        const matrixData = actor.system['matrix'];
        if (!matrixData) return updateData;
        if (Array.isArray(matrixData.marks)) return updateData;

        updateData.data['matrix.marks'] = [];

        return updateData;
    }
}
