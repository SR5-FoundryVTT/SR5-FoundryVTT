import { FLAGS } from "../constants";
import { Sanitizer } from "./Sanitizer";
import { Version0_8_0 } from "./versions/Version0_8_0";
import { Version0_18_0 } from './versions/Version0_18_0';
import { Version0_16_0 } from './versions/Version0_16_0';
import { Version0_27_0 } from './versions/Version0_27_0';
import { Version0_30_0 } from './versions/Version0_30_0';
import { VersionMigration, MigratableDocument, MigratableDocumentName } from "./VersionMigration";

/**
 * Seamless data migrator for the SR5 system.
 * 
 * This will automatically migrate data during world load and persist the changes on a otherwise
 * unconnected document update.
 * 
 * Using this approach allows the system to both load collection, compendium and imported document data,
 * apply migrations for missing migration steps, based on the documents last system schema version.
 *
 * The migration is done during world load, to avoid documents entering the "invalid document" state
 * and allow users a seamless experience when opening an out-of-date world / document.
 * 
 * Documents will get remigrated so long until the migrated data can be applied on the next update made to
 * it. If a document is not updated, it will remain out-of-date and be remigrated on every world load.
 * 
 * For this, check these methods:
 * - migrate
 * - updateMigratedDocument
 */
export class Migrator {
    // List of all migrators.
    // ⚠️ Keep this list sorted in ascending order by version number (oldest → newest).
    private static readonly s_Versions = [
        new Version0_8_0(),
        new Version0_18_0(),
        new Version0_16_0(),
        new Version0_27_0(),
        new Version0_30_0(),
    ] as const;

    // Returns an array of migration functions applicable to the given document type and version.
    private static getMigrators(type: MigratableDocumentName | null, version: string | null): readonly VersionMigration[] {
        version ??= '0.0.0'; // Default to '0.0.0' if no version is provided.
        return this.s_Versions.filter(migrator =>
            (!type || migrator.implements[type]) && this.compareVersion(migrator.TargetVersion, version) > 0
        );
    }

    /**
     * Applies migration logic to a provided data object of the specified type during world load
     * 
     * This is connected to Migrator.updateMigratedDocument which will persist migrated data during the
     * update process.
     */
    public static migrate(type: MigratableDocumentName, data: any): void {
        // Lack of _stats usually indicates new or updated data, not needing migration.
        if (!data._stats || !('systemVersion' in data._stats)) return;
        if (data._stats.systemVersion === game.system.version) return;

        const migrators = this.getMigrators(type, data._stats.systemVersion);

        // If no migrators found, nothing to do.
        if (migrators.length === 0) return;

        for (const migrator of migrators)
            migrator[`migrate${type}`](data);
        
        // After all migrations, sanitize the data model.
        // This ensures that the data conforms to the current schema.
        const schema = CONFIG[type].dataModels[data.type].schema;
        const correctionLogs = Sanitizer.sanitize(schema, data.system);

        if (correctionLogs) {
            console.warn(
                `Document Sanitized on Migration:\n` +
                `ID: ${data._id}; Name: ${data.name};\n` +
                `Type: ${type}; SubType: ${data.type}; Version: ${data._stats.systemVersion};\n`
            );
            console.table(correctionLogs);
        }
    }

    /**
     * Apply migrated data to the document to persist and mark it as up-to-date.
     * 
     * This is connected to Migrator.migrate which will migrate document data on the fly
     * during a document migrateData call before data preparation.
     * 
     * To avoid endless migrations during world load, we assume the document is migrated and will
     * persist that migration based on an out of date document system version, whenever it's
     * updated next by the user.
     * 
     * @param doc Updated document.
     */
    static async updateMigratedDocument(doc: MigratableDocument) {
        // No need to migrate if the document is already up-to-date.
        if (doc._stats.systemVersion === game.system.version) return;

        // If no migrators found, nothing to do.
        const migrators = this.getMigrators(doc.documentName, doc._stats.systemVersion);
        if (migrators.length === 0) return;

        // Mark document as up-to-date
        doc._stats.systemVersion = game.system.version;
        // Persist the change without triggering diff logic
        return doc.update(doc.toObject(false) as any, { diff: false, recursive: false });
    }

    public static async BeginMigration() {
        const currentVersion = game.settings.get(game.system.id, FLAGS.KEY_DATA_VERSION) || '0.0.0';

        // No migrations are required, exit.
        const migrators = this.getMigrators(null, currentVersion);
        if (migrators.length === 0) return;

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
                    callback: () => this.migrateAll(),
                },
            },
            default: 'ok',
        });
        d.render(true);
    }

    /**
     * Migrate all actors in the game.
     * 
     * This is called during world load to ensure all actors are up-to-date with the latest system version.
     */
    private static async migrateAll() {
        const start = performance.now();

        await Promise.all(
            game.items.map(async item =>
                this._migrateAll(item as Item.Implementation)
            )
        );

        await Promise.all(
            game.actors.map(async actor =>
                this._migrateAll(actor as Actor.Implementation)
            )
        );

        await game.settings.set(game.system.id, FLAGS.KEY_DATA_VERSION, game.system.version);

        const d = new Dialog({
            title: "Migration Complete",
            content:
                `<h2 style="color: red; text-align: center">Migration Complete</h2>` +
                `<p style="text-align: center">It took ${performance.now() - start} milliseconds.</p>`,
            buttons: {
                ok: {
                    label: "OK",
                },
            },
            default: 'ok',
        });
        d.render(true);
    }

    private static async _migrateAll(doc: Actor.Implementation | Item.Implementation) {
        const itemMigrations = doc.items.map(async item => this._migrateAll(item));
        const effectMigrations = doc.effects.map(async effect => this.updateMigratedDocument(effect));

        await Promise.all([ ...itemMigrations, ...effectMigrations ]);

        return this.updateMigratedDocument(doc);
    }

    /**
     * compare two version numbers
     * @param v1
     * @param v2
     * @return 1 if v1 > v2, -1 if v1 < v2, 0 if equal
     */
    public static compareVersion(v1: string, v2: string): number {
        const s1 = v1.split('.').map(Number);
        const s2 = v2.split('.').map(Number);
        const length = Math.max(s1.length, s2.length);

        for (let i = 0; i < length; i++) {
            const n1 = s1[i] ?? 0;
            const n2 = s2[i] ?? 0;
            if (n1 > n2) return 1;
            if (n1 < n2) return -1;
        }

        return 0;
    }
}
