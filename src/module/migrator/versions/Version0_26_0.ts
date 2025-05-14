/**
 * Version 0.8 comes with a complete rework of the original roller design in ShadowrunRoller.
 * instead rolls are handled within the SuccessTest class or subclasses of that using ActionRollData as their basis.
 *
 * What class is to be used is defined within each action (active, followed, opposed, resist). Migration needs to map
 * these classes to their item types.
 */
import { SR5Item } from "../../item/SR5Item";
import { SR5Actor } from "../../actor/SR5Actor";
import {VersionMigration} from "../VersionMigration";

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
