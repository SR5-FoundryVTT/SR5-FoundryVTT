import { VersionMigration } from './VersionMigration';
import { Version1 } from './versions/Version1';

export class Migrator {
    // This maps version number to migration.
    // It is capable of supporting *multiple* migrations for a single version,
    //  but this should be done with care, as both will run.
    private static readonly s_Versions = [
        { versionNumber: VersionMigration.NO_VERSION, migration: Version1 }
    ];

    //TODO: Call on Init()
    public static async BeginMigration() {
        let currentVersion = game.settings.get(VersionMigration.MODULE_NAME, VersionMigration.KEY_DATA_VERSION);
        if (currentVersion === undefined || currentVersion === null) {
            currentVersion = VersionMigration.NO_VERSION;
        }
        // Ensure int for safety.
        currentVersion = parseInt(currentVersion);

        const migrations = Migrator.s_Versions.filter(( { versionNumber} ) => {
            return currentVersion >= versionNumber
        });
        // we want to apply migrations in ascending order until we're up to the latest
        migrations.sort(( a, b ) => {
            return a.versionNumber - b.versionNumber
        });
        // Run the migrations in order
        for (const migrationInfo of migrations) {
           const migration = new migrationInfo.migration();
           await migration.Migrate(game);
        }
    }
}