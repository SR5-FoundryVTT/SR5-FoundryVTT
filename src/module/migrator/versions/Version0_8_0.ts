/**
 * Version 0.8 comes with a complete rework of the original roller design in ShadowrunRoller.
 * instead rolls are handled within the SuccessTest class or subclasses of that using ActionRollData as their basis.
 *
 * What class is to be used is defined within each action (active, followed, opposed, resist). Migration needs to map
 * these classes to their item types.
 */
import {VersionMigration} from "../VersionMigration";
import ShadowrunItemData = Shadowrun.ShadowrunItemData;
import ShadowrunActorData = Shadowrun.ShadowrunActorData;
import {Helpers} from "../../helpers";

export class Version0_8_0 extends VersionMigration {
    get SourceVersion(): string {
        return '0.7.6';
    }

    get TargetVersion(): string {
        return Version0_8_0.TargetVersion;
    }

    static get TargetVersion(): string {
        return "0.8.0";
    }

    protected override async ShouldMigrateItemData(data: ShadowrunItemData) {
        return this._ShouldMigrateItemData(data);
    }

    protected _ShouldMigrateItemData(data: ShadowrunItemData): boolean {
        return ['weapon', 'spell'].includes(data.type);
    }

    protected override async ShouldMigrateSceneData(scene: Scene) {
        return scene.tokens.size > 0;
    }

    protected override async ShouldMigrateActorData(data: ShadowrunActorData) {
        // @ts-expect-error
        return data.items.contents.filter(i => this._ShouldMigrateItemData(i.data)).length > 0;
    }

    protected override async MigrateItemData(data: ShadowrunItemData) {
        const updateData: {
            data?: object
        } = {};

        Helpers.injectActionTestsIntoChangeData(data.type, data, data);

        return updateData;
    }

    protected override async MigrateActorData(data: ShadowrunActorData) {
        let updateData: {
            data?: object,
            items?: object[]
        } = {
            items: []
        };

        updateData = await this.IterateActorItems(data, updateData);

        // @ts-expect-error//@ts-expect-error // TODO: foundry-vtt-types v10
        if (updateData.data && foundry.utils.isEmpty(updateData.data)) delete updateData.data;
        if (updateData.items?.length === 0) delete updateData.items;

        return updateData;
    }
}