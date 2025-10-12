import { VersionMigration } from "../VersionMigration";

/**
 * Update all dataSchema to their correct values choices.
 */
export class Version0_30_7 extends VersionMigration {
    readonly TargetVersion = "0.30.7";

    override handlesActor(_actor: Readonly<any>) { return true; }

    override handlesItem(_item: Readonly<any>) { return true; }
}
