import { VersionMigration } from './VersionMigration';
import { LegacyMigration } from './versions/LegacyMigration';
import { Version0_6_5 } from './versions/Version0_6_5';
import { Version0_6_10 } from './versions/Version0_6_10';
import {Version0_7_2} from "./versions/Version0_7_2";

type VersionDefinition = {
    versionNumber: string;
    migration: VersionMigration;
};
export class Migrator {
    // Map of all version migrations to their target version numbers.
    private static readonly s_Versions: VersionDefinition[] = [
        { versionNumber: LegacyMigration.TargetVersion, migration: new LegacyMigration() },
        { versionNumber: Version0_6_5.TargetVersion, migration: new Version0_6_5() },
        { versionNumber: Version0_6_10.TargetVersion, migration: new Version0_6_10() },
        { versionNumber: Version0_7_2.TargetVersion, migration: new Version0_7_2() },
    ];

    //TODO: Call on Init()
    public static async BeginMigration() {
        let currentVersion = game.settings.get(VersionMigration.MODULE_NAME, VersionMigration.KEY_DATA_VERSION) as string;
        if (currentVersion === undefined || currentVersion === null) {
            currentVersion = VersionMigration.NO_VERSION;
        }

        const migrations = Migrator.s_Versions.filter(({ versionNumber }) => {
            // if versionNUmber is greater than currentVersion, we need to apply this migration
            return this.compareVersion(versionNumber, currentVersion) === 1;
        });

        // No migrations are required, exit.
        if (migrations.length === 0) {
            return;
        }

        const localizedWarningTitle = game.i18n.localize('SR5.MIGRATION.WarningTitle');
        const localizedWarningHeader = game.i18n.localize('SR5.MIGRATION.WarningHeader');
        const localizedWarningRequired = game.i18n.localize('SR5.MIGRATION.WarningRequired');
        const localizedWarningDescription = game.i18n.localize('SR5.MIGRATION.WarningDescription');
        const localizedWarningBackup = game.i18n.localize('SR5.MIGRATION.WarningBackup');
        const localizedWarningBegin = game.i18n.localize('SR5.MIGRATION.BeginMigration');

        const d = new Dialog({
            title: localizedWarningTitle,
            content:
                `<h2 style="color: red; text-align: center">${localizedWarningHeader}</h2>` +
                `<p style="text-align: center"><i>${localizedWarningRequired}</i></p>` +
                `<p>${localizedWarningDescription}</p>` +
                `<h3 style="color: red">${localizedWarningBackup}</h3>`,
            buttons: {
                ok: {
                    label: localizedWarningBegin,
                    callback: () => this.migrate(migrations),
                },
            },
            default: 'ok',
        });
        d.render(true);
    }

    private static async migrate(migrations: VersionDefinition[]) {
        // we want to apply migrations in ascending order until we're up to the latest
        migrations.sort((a, b) => {
            return this.compareVersion(a.versionNumber, b.versionNumber);
        });

        await this.migrateWorld(game, migrations);
        await this.migrateCompendium(game, migrations);

        const localizedWarningTitle = game.i18n.localize('SR5.MIGRATION.SuccessTitle');
        const localizedWarningHeader = game.i18n.localize('SR5.MIGRATION.SuccessHeader');
        const localizedSuccessDescription = game.i18n.localize('SR5.MIGRATION.SuccessDescription');
        const localizedSuccessPacksInfo = game.i18n.localize('SR5.MIGRATION.SuccessPacksInfo');
        const localizedSuccessConfirm = game.i18n.localize('SR5.MIGRATION.SuccessConfirm');
        const packsDialog = new Dialog({
            title: localizedWarningTitle,
            content:
                `<h2 style="text-align: center; color: green">${localizedWarningHeader}</h2>` +
                `<p>${localizedSuccessDescription}</p>` +
                `<p style="text-align: center"><i>${localizedSuccessPacksInfo}</i></p>`,
            buttons: {
                ok: {
                    icon: '<i class="fas fa-check"></i>',
                    label: localizedSuccessConfirm,
                },
            },
            default: 'ok',
        });
        packsDialog.render(true);
    }

    /**
     * Migrate all world objects
     * @param game
     * @param migrations
     */
    private static async migrateWorld(game: Game, migrations: VersionDefinition[]) {
        // Run the migrations in order
        for (const { migration } of migrations) {
            await migration.Migrate(game);
        }
    }

    /**
     * Iterate over all world compendium packs
     * @param game Game that will be migrated
     * @param migrations Instances of the version migration
     */
    private static async migrateCompendium(game: Game, migrations: VersionDefinition[]) {
        // Migrate World Compendium Packs
        // @ts-ignore // TODO: TYPE: Possibly undefined
        const packs = game.packs.filter((pack) => pack.metadata.package === 'world' && ['Actor', 'Item', 'Scene'].includes(pack.metadata.entity));

        // Run the migrations in order on each pack.
        for (const pack of packs) {
            for (const { migration } of migrations) {
                await migration.MigrateCompendiumPack(pack);
            }
        }
    }

    // found at: https://helloacm.com/the-javascript-function-to-compare-version-number-strings/
    // updated for typescript
    /**
     * compare two version numbers, returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
     * @param v1
     * @param v2
     */
    public static compareVersion(v1: string, v2: string) {
        const s1 = v1.split('.').map((s) => parseInt(s, 10));
        const s2 = v2.split('.').map((s) => parseInt(s, 10));
        const k = Math.min(v1.length, v2.length);
        for (let i = 0; i < k; ++i) {
            if (s1[i] > s2[i]) return 1;
            if (s1[i] < s2[i]) return -1;
        }
        return v1.length === v2.length ? 0 : v1.length < v2.length ? -1 : 1;
    }
}
