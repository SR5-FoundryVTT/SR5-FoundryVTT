import { VersionMigration } from "../VersionMigration";

/**
 * Make sure that readonly fields are set to their correct values.
 */
export class Version0_30_6 extends VersionMigration {
    readonly TargetVersion = "0.30.6";

    override handlesActor(_actor: Readonly<any>) {
        return ['ic', 'vehicle', 'spirit', 'sprite'].includes(_actor.type);
    }

    override handlesItem(_item: Readonly<any>) {
        return _item.type === 'host';
    }
}