import { SR5Actor } from "../../actor/SR5Actor";
import { SR5Item } from "../../item/SR5Item";
import { VersionMigration } from "../VersionMigration";

/**
 * This Migration is necessary to allow Action items to define multiple action categories instead of only one.
 * 
 * Action categories used to be a string and are migrated to a list of strings. As this also necessitates a change
 * from singular to plural, the migration only removes the singular category. Newer versions will use the plural
 * categories.
 */
export class Version0_20_0 extends VersionMigration {
    get SourceVersion() {
        return '0.19.0';
    }
    get TargetVersion() {
        return Version0_20_0.TargetVersion;
    }
    static get TargetVersion() {
        return '0.20.0';
    }

    protected override async ShouldMigrateActorData(actor: SR5Actor) {
        return true;
    }
    
    protected override async ShouldMigrateSceneData(scene: Scene) {
        return true;
    }

    protected override async ShouldMigrateItemData(item: SR5Item) {
        return item.type === 'action';
    }

    protected override async MigrateActorData(actor: SR5Actor) {
        const updateData = {items: []}

        for (const item of actor.items) {
            if (await this.ShouldMigrateItemData(item)) {
                const {data} = await this.MigrateItemData(item);
                // @ts-expect-error - Don't care enough to resolve this local typing issue...
                updateData.items.push({_id: item.id, ...data});
            }
        }

        return updateData;
    }

    protected override async MigrateItemData(item: SR5Item) {
        const updateData = {data: {}}

        migrateActionData(updateData);

        return updateData;
    }
}


const migrateActionData = (data) => {
    data['system.action.-=category'] = null;
}