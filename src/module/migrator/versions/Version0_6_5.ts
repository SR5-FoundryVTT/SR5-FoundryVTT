import { VersionMigration } from '../VersionMigration';

/**
 * Add default value of willpower to the full_defense_attribute field
 */
export class Version0_6_5 extends VersionMigration {
    get SourceVersion(): string {
        return '0.6.4';
    }
    get TargetVersion(): string {
        return Version0_6_5.TargetVersion;
    }
    static get TargetVersion(): string {
        return '0.6.5';
    }

    protected async MigrateActorData(actorData: Actor.Data): Promise<any> {
        let updateData: any = {};
        if (updateData.data === undefined) updateData.data = {};
        updateData.data.full_defense_attribute = 'willpower';
        return updateData;
    }

    protected async ShouldMigrateActorData(actorData: any): Promise<boolean> {
        return actorData.data.full_defense_attribute === undefined;
    }

    protected async ShouldMigrateSceneData(scene: Scene): Promise<boolean> {
        // @ts-ignore
        return scene.data.tokens?.length > 0;
    }
}
