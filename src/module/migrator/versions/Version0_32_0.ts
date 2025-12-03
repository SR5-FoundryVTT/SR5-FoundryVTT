import { VersionMigration } from "../VersionMigration";

/**
 * Migrate critter actors to character actors.
 */
export class Version0_32_0 extends VersionMigration {
    readonly TargetVersion = "0.32.0";

    override handlesActor(_actor: Readonly<any>) {
        return _actor.type === 'critter';
    }

    override migrateActor(_actor: any): void {
        if (_actor.type === 'critter')
            _actor.type = 'character';
    }
}
