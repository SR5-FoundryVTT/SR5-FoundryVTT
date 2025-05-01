/**
 * Version 0.8 comes with a complete rework of the original roller design in ShadowrunRoller.
 * instead rolls are handled within the SuccessTest class or subclasses of that using ActionRollData as their basis.
 *
 * What class is to be used is defined within each action (active, followed, opposed, resist). Migration needs to map
 * these classes to their item types.
 */
import { VersionMigration } from "../VersionMigration";
import { SR5Item } from "../../item/SR5Item";
import { SR5Actor } from "../../actor/SR5Actor";
import { debug } from "console";

export class Version0_26_0 extends VersionMigration {
    get SourceVersion(): string {
        return '0.25.1';
    }

    get TargetVersion(): string {
        return Version0_26_0.TargetVersion;
    }

    static get TargetVersion(): string {
        return "0.26.0";
    }

    protected override async ShouldMigrateItemData(item: SR5Item) {
        return true;
    }

    protected override async ShouldMigrateSceneData(scene: Scene) {
        return false;
    }

    protected override async ShouldMigrateActorData(actor: SR5Actor) {
        return false;
    }

    protected override async MigrateItemData(item: SR5Item) {
        const updateData = { data: {} };

        if (item.system.technology) {
            const { cost, availability } = item.system.technology;

            if (typeof cost !== "object") {
                updateData.data["system.technology.cost.adjusted"] = false;
                updateData.data["system.technology.cost.base"] = cost;
                updateData.data["system.technology.cost.value"] = 0;
            }

            if (typeof availability !== "object") {
                updateData.data["system.technology.availability.adjusted"] = false;
                updateData.data["system.technology.availability.base"] = availability;
                updateData.data["system.technology.availability.base"] = 0;
            }
        }

        return updateData;
    }
}