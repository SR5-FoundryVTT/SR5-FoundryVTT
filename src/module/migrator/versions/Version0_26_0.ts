/**

 */
import { VersionMigration } from "../VersionMigration";
import { SR5Item } from "../../item/SR5Item";
import { SR5Actor } from "../../actor/SR5Actor";

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
        return item.system.technology ? true : false; 
    }

    protected override async ShouldMigrateSceneData(scene: Scene) {
        return true;
    }

    protected override async ShouldMigrateActorData(actor: SR5Actor) {
        return true;
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
                updateData.data["system.technology.availability.value"] = 0;
            }

            if (['bioware', 'cyberware'].includes(item.type)) {
                updateData.data["system.essence.base"] = item.system.essence;
                updateData.data["system.essence.value"] = 0;
            }
        }

        return updateData;
    }

    /**
     * Migrate items on Actors and Token Actors.
     * @param actor 
     * @returns 
     */
    protected override async MigrateActorData(actor: SR5Actor) {
        const updateData: {
            data?: object,
            items?: object[]
        } = {
            items: []
        };

        return await this.IterateActorItems(actor, updateData);
    }
}