/**
 * Version 0.8 comes with a complete rework of the original roller design in ShadowrunRoller.
 * instead rolls are handled within the SuccessTest class or subclasses of that using ActionRollData as their basis.
 *
 * What class is to be used is defined within each action (active, followed, opposed, resist). Migration needs to map
 * these classes to their item types.
 */
import {VersionMigration} from "../VersionMigration";
import { SR5Item } from "../../item/SR5Item";
import { SR5Actor } from "../../actor/SR5Actor";

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

    protected override async ShouldMigrateItemData(item: SR5Item) {
        return false;
    }

    protected override async ShouldMigrateSceneData(scene: Scene) {
        return false;
    }

    protected override async ShouldMigrateActorData(actor: SR5Actor) {
        return actor.type !== 'character' && actor.type !== 'critter' && actor.type !== 'vehicle';
    }

    protected override async MigrateActorData(actor: SR5Actor) {
        return {data: {'visibilityChecks.meat.hasHeat': false}};
    }
}