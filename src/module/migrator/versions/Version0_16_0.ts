/**
 * Version 0.8 comes with a complete rework of the original roller design in ShadowrunRoller.
 * instead rolls are handled within the SuccessTest class or subclasses of that using ActionRollData as their basis.
 *
 * What class is to be used is defined within each action (active, followed, opposed, resist). Migration needs to map
 * these classes to their item types.
 */
import { VersionMigration } from "../VersionMigration";

export class Version0_16_0 extends VersionMigration {
    readonly TargetVersion = "0.16.0";

    override migrateActor(actor: any) {
        // Some actors did have heat, when they shouldn't.
        if (actor.type !== 'character' && actor.type !== 'critter' && actor.type !== 'vehicle')
            foundry.utils.setProperty(actor, 'system.visibilityChecks.meat.hasHeat', false);

        // Migrate magic character actors with wrong templates for initiation (initiation = {})
        if ('initiation' in actor.system.magic && isNaN(actor.system.magic.initiation))
            foundry.utils.setProperty(actor, 'system.magic.initiation', 0);
    }
}
