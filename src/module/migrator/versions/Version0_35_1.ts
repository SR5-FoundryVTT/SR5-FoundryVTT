import { VersionMigration } from '../VersionMigration';

const { setProperty, getProperty } = foundry.utils;

const LEGACY_ROLL_MODE_MAP = {
    publicroll: 'public',
    gmroll: 'gm',
    blindroll: 'blind',
    selfroll: 'self',
} as const;

/**
 * Migration for version 0.35.1:
 *
 * Fix action `system.action.roll_mode` values that still use legacy
 * Foundry roll mode keys after the V14 chat mode migration.
 */
export class Version0_35_1 extends VersionMigration {
    readonly TargetVersion = '0.35.1';

    override handlesItem(item: Readonly<any>): boolean {
        const rollMode = getProperty(item, 'system.action.roll_mode');
        return typeof rollMode === 'string' && rollMode in LEGACY_ROLL_MODE_MAP;
    }

    override migrateItem(item: any): void {
        const rollMode = getProperty(item, 'system.action.roll_mode') as string;

        if (rollMode in LEGACY_ROLL_MODE_MAP) {
            setProperty(item, 'system.action.roll_mode', LEGACY_ROLL_MODE_MAP[rollMode]);
        }
    }
}
