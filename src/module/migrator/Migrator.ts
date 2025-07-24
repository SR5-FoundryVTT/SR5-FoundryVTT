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

    // Generate the migration version mark used to track current system version in documents.
    private static get _migrationMark() {
        return game.system.version + ".0";
    }

    // Returns an array of migration functions applicable to the given document type and version.
    private static getMigrators(type: MigratableDocumentName | null, version: string | null): readonly VersionMigration[] {
        return this.s_Versions.filter(migrator =>
            (!type || migrator.implements[type]) && this.compareVersion(migrator.TargetVersion, version) > 0
        );
    }

    private static normalizeArray(data: any): any[] {
        if (data == null) return [];
        return Array.isArray(data) ? data : Object.values(data); 
    }

    /**
     * Applies migration logic to a provided data object of the specified type during world load
     * 
     * This is connected to Migrator.updateMigratedDocument which will persist migrated data during the
     * update process.
     */
    public static migrate(type: MigratableDocumentName, data: any, nested: boolean = false): void {
        // If _stats is missing, or systemVersion is not present, or the document is already migrated, skip migration.
        if (!data._stats || !('systemVersion' in data._stats)) return;
        if (this.compareVersion(data._stats.systemVersion, game.system.version) === 0) return;

        if (type === "Item") {
            const items = this.normalizeArray(data.flags?.shadowrun5e?.embeddedItems);
            for (const nestedItems of items)
                this.migrate("Item", nestedItems, true);

            foundry.utils.setProperty(data, 'flags.shadowrun5e.embeddedItems', items);

            if (nested) {
                const effects = this.normalizeArray(data.effects);
                for (const nestedEffect of effects)
                    this.migrate("ActiveEffect", nestedEffect, true);

                foundry.utils.setProperty(data, 'effects', effects);
            }
        }

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

        // Mark as a migratable document.
        data._stats.systemVersion = nested ? game.system.version : this._migrationMark;
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
        // No need to migrate if the document is not a migratable document.
        if (doc._stats.systemVersion !== this._migrationMark) return;

        // Mark document as up-to-date
        doc._stats.systemVersion = game.system.version;
        doc._source._stats.systemVersion = game.system.version;

        if (doc.parent) {
            if (doc.parent instanceof Actor || doc.parent instanceof Item)
                await this.updateMigratedDocument(doc.parent);
            else if (doc.parent instanceof TokenDocument && doc.parent.actor)
                await this.updateMigratedDocument(doc.parent.actor);
        }

        // Persist the change without triggering diff logic
        return doc.update(doc.toObject() as any, { diff: false, recursive: false });
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
                    callback: async () => this.migrateAll(),
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
        const progress = ui.notifications.info("Migrating Documents...", {progress: true});

        const tokensWithActors = Array.from(game.scenes).flatMap(scene =>
            scene.tokens.filter(token => !!token.actor && !token.actorLink)
        );

        let completed = 0;
        const total = game.items.size + game.actors.size + tokensWithActors.length;

        await Promise.all(
            game.items.map(async item =>
                this.migrateWithCollections(item as Item.Implementation).then(() => {
                    progress.update({pct: ++completed / total});
                })
            )
        );

        await Promise.all(
            game.actors.map(async actor =>
                this.migrateWithCollections(actor as Actor.Implementation).then(() => {
                    progress.update({pct: ++completed / total});
                })
            )
        );

        await Promise.all(
            tokensWithActors.map(async token =>
                this.migrateWithCollections(token.actor!).then(() => {
                    progress.update({pct: ++completed / total});
                })
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
                    callback: () => { progress.remove(); },
                },
            },
            default: 'ok',
        });
        d.render(true);
    }

    private static async migrateWithCollections(doc: Actor.Implementation | Item.Implementation) {
        await this.updateMigratedDocument(doc);

        const collectionPromises: Promise<any>[] = [];
        type CollectionType = (Actor.Implementation | Item.Implementation)['collections']['effects' | 'items'];
        for (const [key, collection] of Object.entries<CollectionType>(doc.collections)) {
            if (key === 'effects' || key === 'items') {
                for (const child of collection) {
                    collectionPromises.push(
                        child instanceof Item
                            ? this.migrateWithCollections(child)
                            : this.updateMigratedDocument(child)
                    );
                }
            }
        }

        return Promise.all(collectionPromises);
    }

    /**
     * compare two version numbers
     * @param v1
     * @param v2
     * @return 1 if v1 > v2, -1 if v1 < v2, 0 if equal
     */
    public static compareVersion(v1: string | null, v2: string | null): number {
        v1 ??= '0.0.0'; v2 ??= '0.0.0';
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
