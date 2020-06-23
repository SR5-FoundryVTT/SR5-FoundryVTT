import { VersionMigration } from '../VersionMigration';

/**
 * Migrates the data model for Legacy migrations prior to 0.6.4
 */
export class InitFullDefenseAttributeMigration extends VersionMigration {
    get SourceVersion(): string {
        return '0.6.4';
    }
    get TargetVersion(): string {
        return InitFullDefenseAttributeMigration.TargetVersion;
    }
    static get TargetVersion(): string {
        return '0.6.5';
    }

    protected async MigrateActorData(actorData: ActorData): Promise<any> {
        let updateData: any = {};
        if (updateData.data === undefined) updateData.data = {};
        updateData.data.full_defense_attribute = 'willpower';
        updateData = await this.IterateActorItems(actorData, updateData);
        return updateData;
    }

    protected async MigrateItemData(itemData: any): Promise<any> {
        return {};
    }

    protected async MigrateSceneData(scene: any): Promise<any> {
        return {};
    }

    protected async ShouldMigrateActorData(actorData: any): Promise<boolean> {
        return actorData.data.full_defense_attribute === undefined;
    }

    protected async ShouldMigrateItemData(item: BaseEntityData): Promise<boolean> {
        return true;
    }

    protected async ShouldMigrateSceneData(scene: Scene): Promise<boolean> {
        // @ts-ignore
        return scene.data.tokens?.length > 0;
    }
}
