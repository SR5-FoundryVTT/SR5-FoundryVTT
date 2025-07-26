/**
 * Version 0.8 comes with a complete rework of the original roller design in ShadowrunRoller.
 * instead rolls are handled within the SuccessTest class or subclasses of that using ActionRollData as their basis.
 *
 * What class is to be used is defined within each action (active, followed, opposed, resist). Migration needs to map
 * these classes to their item types.
 * 
 */
import { VersionMigration } from "../VersionMigration";
import { UpdateActionFlow } from "../../item/flows/UpdateActionFlow";

export class Version0_8_0 extends VersionMigration {
    readonly TargetVersion = "0.8.0";

    override migrateItem(item: any) {
        UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
    }
}
