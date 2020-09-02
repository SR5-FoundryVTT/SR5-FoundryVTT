import { VersionMigration } from '../VersionMigration';
import SR5ActorData = Shadowrun.SR5ActorData;

/**
 * Add default value of willpower to the full_defense_attribute field
 */
export class Version0_6_10 extends VersionMigration {
    get SourceVersion(): string {
        return '0.6.9';
    }
    get TargetVersion(): string {
        return Version0_6_10.TargetVersion;
    }
    static get TargetVersion(): string {
        return '0.6.10';
    }

    protected async MigrateActorData(actorData: SR5ActorData): Promise<any> {
        if (actorData.data?.attributes?.edge === undefined) return {};
        return {
            data: {
                attributes: {
                    edge: {
                        base: actorData.data.attributes.edge.max,
                        value: actorData.data.attributes.edge.max,
                        uses: actorData.data.attributes.edge.value,
                    },
                },
            },
        };
    }

    protected async ShouldMigrateActorData(actorData: SR5ActorData): Promise<boolean> {
        return actorData.data.attributes.edge?.uses === undefined;
    }

    protected async ShouldMigrateSceneData(scene: Scene): Promise<boolean> {
        // @ts-ignore
        return scene.data.tokens?.length > 0;
    }
}
