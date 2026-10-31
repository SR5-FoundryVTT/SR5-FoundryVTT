import { UpdateActionFlow } from '../../item/flows/UpdateActionFlow';
import { VersionMigration } from '../VersionMigration';

/** Repair items embedded in new actors, which held schema default action tests. */
export class Version0_37_9 extends VersionMigration {
    readonly TargetVersion = '0.37.9';

    override migrateItem(item: any): void {
        const opposed = item?.system?.action?.opposed;
        if (item?.type === 'weapon' && opposed?.resist?.test === 'PhysicalDefenseTest') {
            opposed.resist.test = 'PhysicalResistTest';
        }

        UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
    }
}
