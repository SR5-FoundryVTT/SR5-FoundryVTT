import { VersionMigration } from '../VersionMigration';

/** Route existing indirect combat spells through physical defense. */
export class Version0_37_4 extends VersionMigration {
    readonly TargetVersion = '0.37.4';

    override migrateItem(item: any): void {
        if (item?.type !== 'spell'
            || item.system?.category !== 'combat'
            || item.system.combat?.type !== 'indirect') return;

        const opposed = item.system.action?.opposed;
        if (opposed?.test === 'CombatSpellDefenseTest') {
            opposed.test = 'PhysicalDefenseTest';
        }
    }
}
