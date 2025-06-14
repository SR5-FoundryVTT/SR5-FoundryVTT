/**
 * Version 0.8 comes with a complete rework of the original roller design in ShadowrunRoller.
 * instead rolls are handled within the SuccessTest class or subclasses of that using ActionRollData as their basis.
 *
 * What class is to be used is defined within each action (active, followed, opposed, resist). Migration needs to map
 * these classes to their item types.
 * 
 * 
 */
import {VersionMigration} from "../VersionMigration";
import {Helpers} from "../../helpers";
import { SR5Item } from "../../item/SR5Item";
import { SR5Actor } from "../../actor/SR5Actor";
import { UpdateActionFlow } from "../../item/flows/UpdateActionFlow";

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

    protected override async ShouldMigrateItemData(item: SR5Item) {
        return this._ShouldMigrateItemData(item);
    }

    protected _ShouldMigrateItemData(item: SR5Item): boolean {
        return ['weapon', 'spell'].includes(item.type);
    }

    protected override async ShouldMigrateSceneData(scene: Scene) {
        return scene.tokens.size > 0;
    }

    protected override async ShouldMigrateActorData(actor: SR5Actor) {
        return actor.items.contents.filter(item => this._ShouldMigrateItemData(item)).length > 0;
    }

    protected override async MigrateItemData(item: SR5Item) {
        const updateData: {
            data?: object
        } = {};

        UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item.toObject() as any, item.toObject());

        return updateData;
    }

    protected override async MigrateActorData(actor: SR5Actor) {
        let updateData: {
            data?: object,
            items?: object[]
        } = {
            items: []
        };

        updateData = await this.IterateActorItems(actor, updateData);

        if (updateData.data && foundry.utils.isEmpty(updateData.data)) delete updateData.data;
        if (updateData.items?.length === 0) delete updateData.items;

        return updateData;
    }
}