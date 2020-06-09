import { VersionMigration } from '../VersionMigration';

/**
 * Migrates the data model from version 0 (undefined version) to 1.
 */
export class Version1 extends VersionMigration {
    get SourceVersion(): number {
        return 0;
    }
    get TargetVersion(): number {
        return 1;
    }

    protected async MigrateActorData(actor: ActorData): Promise<any> {
        return undefined;
    }

    protected async MigrateItemData(item: BaseEntityData): Promise<any> {
        return undefined;
    }

    protected async MigrateSceneData(scene: any): Promise<any> {
        return undefined;
    }

    protected async ShouldMigrateActorData(actor: ActorData): Promise<boolean> {
        return false;
    }

    protected async ShouldMigrateItemData(item: BaseEntityData): Promise<boolean> {
        return false;
    }

    protected async ShouldMigrateSceneData(scene: Scene): Promise<boolean> {
        return false;
    }
}