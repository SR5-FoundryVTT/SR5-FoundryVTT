import { VersionMigration } from "../VersionMigration";

/**
  * Migration: Update spirit actor to use 'system.attributes.force' with 'base' and 'hidden' properties.
  * Moves 'system.force' to 'system.attributes.force.base' and sets 'system.attributes.force.hidden' to false.
  * Also updates active effect keys from 'system.force' to 'system.attributes.force'.
  */
export class Version0_31_5 extends VersionMigration {
    readonly TargetVersion = "0.31.5";

    override handlesActor(_actor: Readonly<any>) {
        return _actor.type === 'spirit';
    }

    override migrateActor(_actor: any) {
        const force = _actor.system.attributes?.force;

        if (_actor.type === 'spirit' && force) {
            force.base = _actor.system.force || 0;
            force.hidden = false;

            delete _actor.system.force;
        }
    }

    override handlesActiveEffect(effect: Readonly<any>) {
        const changes = effect.system?.changes ?? effect.changes ?? [];
        return changes.filter(change => change.key === 'system.force').length > 0;
    }

    override migrateActiveEffect(effect: any) {
        const changes = effect.system?.changes ?? effect.changes ?? [];

        for (const change of changes) {
            if (change.key === 'system.force') {
                change.key = 'system.attributes.force';
            }
        }

        if (effect.system?.changes === undefined && changes.length > 0) {
            effect.system ??= {};
            effect.system.changes = changes;
            delete effect.changes;
        }
    }
}
