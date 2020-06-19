import { VersionMigration } from './VersionMigration';
import { LegacyMigration } from './versions/LegacyMigration';

type VersionDefinition = {
    versionNumber: string;
    migration: VersionMigration;
};
export class Migrator {
    // Map of all version migrations to their target version numbers.
    private static readonly s_Versions: VersionDefinition[] = [{ versionNumber: LegacyMigration.TargetVersion, migration: new LegacyMigration() }];

    //TODO: Call on Init()
    public static async BeginMigration() {
        let currentVersion = game.settings.get(VersionMigration.MODULE_NAME, VersionMigration.KEY_DATA_VERSION);
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

        await this.migrateWorld(game, migrations);
        await this.migrateCompendium(game, migrations);

        //TODO: Localization
        const packsDialog = new Dialog({
            title: 'Migration complete!',
            content:
                '<h3>Migration Complete</h3>' +
                '<p>Any world compendium packs that exist in the world were also updated.</p>' +
                '<p style="color: red">Due to technical limitations with FoundryVTT, actor compendium packs are unable to be updated at this time.' +
                ' You will have to manually update these packs.</p>',
            buttons: {
                ok: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Close',
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
