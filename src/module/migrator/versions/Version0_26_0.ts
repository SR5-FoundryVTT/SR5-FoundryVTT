/**
 * Version 0.8 comes with a complete rework of the original roller design in ShadowrunRoller.
 * instead rolls are handled within the SuccessTest class or subclasses of that using ActionRollData as their basis.
 *
 * What class is to be used is defined within each action (active, followed, opposed, resist). Migration needs to map
 * these classes to their item types.
 */
import {VersionMigration} from "../VersionMigration";
import { SR5Item } from "../../item/SR5Item";
import { SR5Actor } from "../../actor/SR5Actor";
import { debug } from "console";

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
        return true;
    }

    protected override async ShouldMigrateSceneData(scene: Scene) {
        return false;
    }

    protected override async ShouldMigrateActorData(actor: SR5Actor) {
        return true;
    }

    protected override async MigrateItemData(item: SR5Item) {
        const updateData = {data: {}};

        if (item.type === 'modification') {
            // @ts-expect-error
            if (item.system.modification_category === 'power_train')
                updateData.data['modification_category'] = 'powertrain';
        }

        return updateData;
    }

    protected override async MigrateActorData(actor: SR5Actor) {
        const updateData = {data: {}};

        // Some actors did have heat, when they shouldn't.
        if (actor.type === 'spirit') {
            //@ts-expect-error
            if (actor.system.spiritType === 'nocnitasa')
                updateData.data['spiritType'] = 'nocnitsa';
            //@ts-expect-error
            if (actor.system.spiritType === 'greenman')
                updateData.data['spiritType'] = 'green_man';
            //@ts-expect-error
            if (actor.system.spiritType === 'vucub')
                updateData.data['spiritType'] = 'vucub_caquix';
        }

        if (actor.system.skills.active) {
            updateData.data["skills.active.pilot_watercraft"] = actor.system.skills.active.pilot_water_craft;
            updateData.data["skills.active.-=pilot_water_craft"] = null;

            updateData.data["skills.active.exotic_melee_weapon"] = actor.system.skills.active.exotic_melee;
            updateData.data["skills.active.-=exotic_melee"] = null;

            updateData.data["skills.active.exotic_ranged_weapon"] = actor.system.skills.active.exotic_range;
            updateData.data["skills.active.-=exotic_range"] = null;
        }

        return updateData;
    }
}
