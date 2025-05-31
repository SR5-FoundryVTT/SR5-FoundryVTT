import { SR5Actor } from "../../actor/SR5Actor";
import {VersionMigration} from "../VersionMigration";

/**
 * Version 0.27.0
 * 
 * Fixing a few spirit type names to match the Chummer formatting.
 */

export class Version0_27_0 extends VersionMigration {
    get SourceVersion(): string {
        return '0.26.1';
    }

    get TargetVersion(): string {
        return Version0_27_0.TargetVersion;
    }

    static get TargetVersion(): string {
        return "0.27.0";
    }

    protected override async ShouldMigrateSceneData(scene: Scene) {
        return true;
    }

    protected override async ShouldMigrateActorData(actor: SR5Actor) {
        return true;
    }

    protected override async MigrateActorData(actor: SR5Actor) {
        const updateData = {data: {}};

        // Rename spirit types to match Chummer formatting
        if (actor.type === 'spirit') {
            const spiritSystem = actor.system as Shadowrun.SpiritData;
            if (spiritSystem.spiritType === 'nocnitasa')
                updateData.data['spiritType'] = 'nocnitsa';
            if (spiritSystem.spiritType === 'greenman')
                updateData.data['spiritType'] = 'green_man';
            if (spiritSystem.spiritType === 'vucub')
                updateData.data['spiritType'] = 'vucub_caquix';
        }

        return updateData;
    }
}
