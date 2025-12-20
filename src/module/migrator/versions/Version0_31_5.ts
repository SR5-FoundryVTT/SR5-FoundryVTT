import { VersionMigration } from "../VersionMigration";

/**
 * Migration to update spirit actor attributes to use 'attributes.force' with 'base' and 'hidden' properties,
 * moving the old 'system.force' value to 'attributes.force.base' and setting 'hidden' to false.
 */
export class Version0_31_5 extends VersionMigration {
    readonly TargetVersion = "0.31.5";

    override handlesActor(_actor: Readonly<any>) {
        return _actor.type === 'spirit';
    }

    override migrateActor(_actor: any) {
        const force = _actor.system.attributes.force;

        if (_actor.type === 'spirit' && force) {
            force.base = _actor.system.force;
            force.hidden = false;
        }

        delete _actor.system.force;
    }
}
