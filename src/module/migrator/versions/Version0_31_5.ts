import { VersionMigration } from "../VersionMigration";

/**
 * Make sure that readonly fields are set to their correct values.
 */
export class Version0_31_5 extends VersionMigration {
    readonly TargetVersion = "0.31.5";

    override handlesActor(_actor: Readonly<any>) {
        return _actor.type === 'spirit';
    }

    override migrateActor(_actor: any) {
        if (_actor.type === 'spirit' && _actor.system.attributes?.force !== _actor.system.force)
            _actor.system.attributes.force.base = _actor.system.force || 6;
    }
}
