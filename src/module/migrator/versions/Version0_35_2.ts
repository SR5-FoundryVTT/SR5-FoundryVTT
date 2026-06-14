import { VersionMigration } from '../VersionMigration';

const { getProperty, setProperty } = foundry.utils;

/**
 * Migration for version 0.35.2:
 *
 * Direct combat spells should not configure an opposed resist test.
 */
export class Version0_35_2 extends VersionMigration {
    readonly TargetVersion = '0.35.2';

    override handlesItem(item: Readonly<any>): boolean {
        return item.type === 'spell'
            && getProperty(item, 'system.category') === 'combat'
            && getProperty(item, 'system.combat.type') === 'direct'
            && getProperty(item, 'system.action.opposed.resist.test') !== '';
    }

    override migrateItem(item: any): void {
        setProperty(item, 'system.action.opposed.resist.test', '');
    }
}
