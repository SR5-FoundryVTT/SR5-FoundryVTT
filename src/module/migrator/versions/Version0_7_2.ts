// TODO: How to trigger test migration.
// TODO: How to test migration results?


import {VersionMigration} from "../VersionMigration";
import {SR5} from "../../config";
import ShadowrunActorData = Shadowrun.ShadowrunActorData;

/** NPC / Grunt feature set
 * - Add npc character data.
 * - Add track disabled feature
 */
export class Version0_7_2 extends VersionMigration {
    get SourceVersion(): string {
        return '0.7.1';
    }

    get TargetVersion(): string {
        return Version0_7_2.TargetVersion;
    }

    static get TargetVersion(): string {
        return '0.7.2';
    }

    static NoNPCDataForCharacter(actorData: ShadowrunActorData): boolean {
        // Use in operator since TypeScript can handle that for union types instead of property usage.
        return actorData.type === 'character' && (
            !("is_npc" in actorData?.data) ||
            !("npc" in actorData?.data)
        );
    }

    static UnsupportedMetatype(actorData: ShadowrunActorData): boolean {
        // TODO: Check on CharacterData.metatype typing (see ts-ignore)
        //@ts-ignore // in-operator doesn't work here, as the underlying typing for metatype will result in string | number | undefined
        const type = actorData.data.metatype?.toLowerCase() ?? '';
        return actorData.type === 'character' &&
            SR5.character.types.hasOwnProperty(type);
    }

    protected async MigrateActorData(actorData: ShadowrunActorData): Promise<any> {
        const updateData: {
            data?: object,
            attributes?: object
        } = {};

        if (Version0_7_2.UnsupportedMetatype(actorData)) {
            // TODO: Check on CharacterData.metatype typing (see ts-ignore)
            //@ts-ignore // in-operator doesn't work here, as the underlying typing for metatype will result in string | number | undefined
            const type = actorData.data.metatype?.toLowerCase() ?? '';
            // TODO: What to do with custom metatypes?
            const metatypeData = {metatype: SR5.character.types.hasOwnProperty(type) ? type : 'human'};
            updateData.data = {...updateData.data, ...metatypeData};
        }

        if (Version0_7_2.NoNPCDataForCharacter(actorData)) {
            updateData.data = updateData.data ? updateData.data : {};
            const npcData = {
                is_npc: false,
                npc: {
                    is_grunt: false,
                    professional_rating: 0
                }
            }
            updateData.data = {...updateData.data, ...npcData};
        }

        return updateData;
    }

    protected async ShouldMigrateActorData(actorData: ShadowrunActorData): Promise<boolean> {
        return Version0_7_2.UnsupportedMetatype(actorData) || Version0_7_2.NoNPCDataForCharacter(actorData);
    }
}