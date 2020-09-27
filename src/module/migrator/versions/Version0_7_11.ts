// TODO: How to trigger test migration.
// TODO: How to test migration results?


import {VersionMigration} from "../VersionMigration";
import SR5ActorData = Shadowrun.SR5ActorData;
import SR5CharacterType = Shadowrun.SR5CharacterType;
import SR5ActorBase = Shadowrun.SR5ActorBase;
import {SR5} from "../../config";

// TODO: A lot of ts-ignores only needed for 0.7.11, even though older migrations used the same type signatures...
/** NPC / Grunt feature set
 * - Add npc character data.
 * - Add track disabled feature
 */
export class Version0_7_11 extends VersionMigration {
    get SourceVersion(): string {
        return '0.7.10';
    }

    get TargetVersion(): string {
        return Version0_7_11.TargetVersion;
    }

    static get TargetVersion(): string {
        return '0.7.11';
    }

    static MigrateCustomMetatype(metatype: string): string {
        const type = metatype.toLowerCase();
        // TODO: What to do with custom metatypes?
        return SR5.character.types.hasOwnProperty(type) ? type : 'human';
    }

    protected async MigrateActorData(actorData: SR5ActorBase): Promise<any> {
        // By default, no one is an npc.
        return {
            data: {
                is_npc: false,
                npc: {
                    is_grunt: false,
                    professional_rating: 0
                },
                metatype: Version0_7_11.MigrateCustomMetatype(actorData.data.metatype)
            }
        }
    }

    protected async ShouldMigrateActorData(actorData: SR5ActorBase): Promise<boolean> {
        if (actorData.type !== 'character') {
            return false;
        }


        console.error('Should', actorData, actorData?.data?.is_npc === undefined || actorData?.data?.npc === undefined);
        return actorData?.data?.is_npc === undefined || actorData?.data?.npc === undefined;
    }
}