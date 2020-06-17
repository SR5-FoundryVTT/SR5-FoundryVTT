import { VersionMigration } from './VersionMigration';
import { LegacyMigration } from './versions/LegacyMigration';

export class Migrator {
    // This maps version number to migration.
    // It is capable of supporting *multiple* migrations for a single version,
    //  but this should be done with care, as both will run.
    private static readonly s_Versions = [
        { versionNumber: LegacyMigration.MigrationVersion, migration: LegacyMigration },
    ];

    //TODO: Call on Init()
    public static async BeginMigration() {
        let currentVersion = game.settings.get(
            VersionMigration.MODULE_NAME,
            VersionMigration.KEY_DATA_VERSION
        );
        if (currentVersion === undefined || currentVersion === null) {
            currentVersion = VersionMigration.NO_VERSION;
        }

        const migrations = Migrator.s_Versions.filter(({ versionNumber }) => {
            // if versionNUmber is greater than currentVersion, we need to apply this migration
            return this.compareVersion(versionNumber, currentVersion) === 1;
        });
        // we want to apply migrations in ascending order until we're up to the latest
        migrations.sort((a, b) => {
            return this.compareVersion(a.versionNumber, b.versionNumber);
        });
        // Run the migrations in order
        for (const migrationInfo of migrations) {
            const migration = new migrationInfo.migration();
            await migration.Migrate(game);
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
