/**
 * Version 0.8 comes with a complete rework of the original roller design in ShadowrunRoller.
 * instead rolls are handled within the SuccessTest class or subclasses of that using ActionRollData as their basis.
 *
 * What class is to be used is defined within each action (active, followed, opposed, resist). Migration needs to map
 * these classes to their item types.
 */
import {VersionMigration} from "../VersionMigration";
import ShadowrunItemData = Shadowrun.ShadowrunItemData;
import ShadowrunActorData = Shadowrun.ShadowrunActorData;

export class Version0_16_0 extends VersionMigration {
    get SourceVersion(): string {
        return '0.15.0';
    }

    get TargetVersion(): string {
        return Version0_16_0.TargetVersion;
    }

    static get TargetVersion(): string {
        return "0.16.0";
    }

    protected override async ShouldMigrateItemData(data: ShadowrunItemData) {
        return false;
    }

    protected _ShouldMigrateItemData(data: ShadowrunItemData): boolean {
        return false;
    }

    protected override async ShouldMigrateSceneData(scene: Scene) {
        return false;
    }

    protected override async ShouldMigrateActorData(data: ShadowrunActorData) {
        return true;
    }

    protected override async MigrateActorData(data: ShadowrunActorData) {
        const updateData = {data: {}};       

        // Some actors did have heat, when they shouldn't.
        if (data.type !== 'character' && data.type !== 'critter' && data.type !== 'vehicle') {
            updateData.data['visibilityChecks.meat.hasHeat'] = false;
        }

        // Migrate magic character actors with wrong templates for initiation (initiation = {})
        // @ts-expect-error magic is not on all actor types.
        if (data.system.magic && data.system.magic.hasOwnProperty('initiation') && isNaN(data.system.magic.initiation)) {
            updateData.data['magic.initiation'] = 0;
        }
        return updateData;
    }
}