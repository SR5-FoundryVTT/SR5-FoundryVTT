import { FLAGS } from "../constants";
import { Sanitizer } from "../sanitizer/Sanitizer";
import { Version0_8_0 } from "./versions/Version0_8_0";
import { Version0_16_0 } from './versions/Version0_16_0';
import { Version0_18_0 } from './versions/Version0_18_0';
import { Version0_27_0 } from './versions/Version0_27_0';
import { Version0_30_0 } from './versions/Version0_30_0';
import { Version0_30_3 } from './versions/Version0_30_3';
import { Version0_30_6 } from './versions/Version0_30_6';
import { Version0_31_0 } from './versions/Version0_31_0';
import { Version0_31_5 } from './versions/Version0_31_5';
import { Version0_32_0 } from './versions/Version0_32_0';
import { Version0_32_1 } from './versions/Version0_32_1';
import { Version0_32_4 } from './versions/Version0_32_4';
import { Version0_33_0 } from './versions/Version0_33_0';
import { Version0_33_1 } from './versions/Version0_33_1';
import { Version0_34_0 } from './versions/Version0_34_0';
import { Version0_34_1 } from './versions/Version0_34_1';
import { Version0_35_1 } from './versions/Version0_35_1';
import { Version0_35_2 } from './versions/Version0_35_2';
import { Version0_36_0 } from './versions/Version0_36_0';
import { VersionMigration, MigratableDocument, MigratableDocumentName, MigratableDocumentType } from "./VersionMigration";

const { deepClone, setProperty } = foundry.utils;


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
        new Version0_16_0(),
        new Version0_18_0(),
        new Version0_27_0(),
        new Version0_30_0(),
        new Version0_30_3(),
        new Version0_30_6(),
        new Version0_31_0(),
        new Version0_31_5(),
        new Version0_32_0(),
        new Version0_32_1(),
        new Version0_32_4(),
        new Version0_33_0(),
        new Version0_33_1(),
        new Version0_34_0(),
        new Version0_34_1(),
        new Version0_35_1(),
        new Version0_35_2(),
        new Version0_36_0(),
    ] as const;

    private static pendingMigrationCount = 0;

    // Generate the migration version mark used to track current system version in documents.
    private static get _migrationMark() {
        return game.system.version + ".0";
    }

    // Returns an array of migration functions applicable to the given document type and version.
    private static getMigrators(
        version: string | null,
        type: MigratableDocumentName,
        data: any
    ): readonly VersionMigration[] {
        return this.s_Versions.filter(migrator =>
            (!type || migrator[`handles${type}`](data)) &&
            this.compareVersion(migrator.TargetVersion, version) > 0
        );
    }

    private static normalizeArray(data: any): any[] {
        if (data == null) return [];
        return Array.isArray(data) ? data : Object.values(data); 
    }

    private static markMigrated(data: { _stats: { systemVersion: string } }, nested: boolean): void {
        data._stats.systemVersion = nested ? game.system.version : this._migrationMark;
        this.pendingMigrationCount += nested ? 0 : 1;
    }

    private static formatElapsedTime(milliseconds: number): string {
        const totalSeconds = Math.round(milliseconds / 1000);
        if (totalSeconds < 60) {
            return this.formatElapsedUnit(totalSeconds, 'second');
        }

        const wholeMinutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;
        if (wholeMinutes < 60) {
            return `${this.formatElapsedUnit(wholeMinutes, 'minute')} ${this.formatElapsedUnit(remainingSeconds, 'second')}`;
        }

        const wholeHours = Math.floor(wholeMinutes / 60);
        const remainingMinutes = wholeMinutes % 60;
        return `${this.formatElapsedUnit(wholeHours, 'hour')} ${this.formatElapsedUnit(remainingMinutes, 'minute')}`;
    }

    private static formatElapsedUnit(value: number, unit: 'second' | 'minute' | 'hour'): string {
        const roundedValue = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
        const label = roundedValue === 1 ? unit : `${unit}s`;
        return `${roundedValue} ${label}`;
    }

    /**
     * Applies migration logic to a provided data object of the specified type during world load
     * 
     * This is connected to Migrator.updateMigratedDocument which will persist migrated data during the
     * update process.
     * 
     * Note: This method was previously called during `_initializeSource`,
     * but that caused migration of embedded items to be skipped in synthetic documents.
     */
    public static migrate(type: MigratableDocumentName, data: any, nested = false, path: string[] = []): boolean {
        // Nested Items and AEs before V10 doesn't have _stats and also is not automatically added when loaded from server.
        if (nested || (type === "ActiveEffect" && data.label)) {
            data.type ??= "base";
            data._stats ??= {};
            data._stats.systemVersion ??= "0.0.0";
        }

        // If _stats is missing, or systemVersion is not present, or the document is already migrated, skip migration.
        if (!data._stats || !('systemVersion' in data._stats)) return false;
        if (this.compareVersion(data._stats.systemVersion, game.system.version) === 0) return false;

        path = [...path, type, data._id ?? "unknown"];
        const migrationKey = path.join(".");

        let migrated = false;
        if (type === "Item") {
            const items = this.normalizeArray(data.flags?.shadowrun5e?.embeddedItems);
            for (const nestedItems of items) {
                const nestedMigrated = this.migrate("Item", nestedItems, true, path);
                migrated = migrated || nestedMigrated;
            }
            setProperty(data, 'flags.shadowrun5e.embeddedItems', items);

            if (nested) {
                const effects = this.normalizeArray(data.effects);
                for (const nestedEffect of effects) {
                    const nestedMigrated = this.migrate("ActiveEffect", nestedEffect, true, path);
                    migrated = migrated || nestedMigrated;
                }
                setProperty(data, 'effects', effects);
            }
        }

        const migrators = this.getMigrators(data._stats.systemVersion, type, data);

        if (migrators.length === 0) {
            if (migrated)
                this.markMigrated(data, nested);

            return migrated;
        }

        for (const migrator of migrators) {
            try {
                migrator[`migrate${type}`](data);
            } catch (error) {
                console.error(
                    `Failed ${type} migration to ${migrator.TargetVersion}.\n` + 
                    `UUID: ${migrationKey}; Name: ${data.name};\n` +
                    `Type: ${type}; SubType: ${data.type}; Version: ${data._stats.systemVersion};\n`,
                    error
                );
            }
        }

        // After all migrations, sanitize the data model.
        // This ensures that the data conforms to the current schema.
        const schema = CONFIG[type].dataModels[data.type]?.schema;
        if (!schema) {
            console.error(
                `Skipping migration sanitization due to missing schema:\n` +
                `UUID: ${migrationKey}; Name: ${data.name};\n` +
                `Type: ${type}; SubType: ${data.type}; Version: ${data._stats.systemVersion};\n`
            );
        } else {
            const correctionLogs = Sanitizer.sanitize(schema, data.system);

            if (correctionLogs) {
                console.warn(
                    `Document Sanitized on Migration:\n` +
                    `UUID: ${migrationKey}; Name: ${data.name};\n` +
                    `Type: ${type}; SubType: ${data.type}; Version: ${data._stats.systemVersion};\n`
                );
                console.table(correctionLogs);
            }
        }

        // Mark as a migratable document.
        this.markMigrated(data, nested);
        return true;
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

        // Update Parent First
        if (doc.parent instanceof Actor || doc.parent instanceof Item || doc.parent instanceof Combat)
            await this.updateMigratedDocument(doc.parent);

        // Save migrated data silently (no hooks/renders) to avoid intermediate state issues.
        return doc.update(doc.toObject() as any, { diff: false, recursive: false, noHook: true, render: false });
    }

    public static BeginMigration() {
        if (this.pendingMigrationCount === 0) return;
        const migratedVersion = game.settings.get(game.system.id, FLAGS.KEY_DATA_VERSION);
        if (this.compareVersion(migratedVersion, game.system.version) >= 0) return;

        const localizedWarningTitle = game.i18n.localize('SR5.MIGRATION.WarningTitle');
        const localizedWarningHeader = game.i18n.localize('SR5.MIGRATION.WarningHeader');
        const localizedWarningRequired = game.i18n.localize('SR5.MIGRATION.WarningRequired');
        const localizedWarningDescription = game.i18n.localize('SR5.MIGRATION.WarningDescription');
        const localizedWarningBackup = game.i18n.localize('SR5.MIGRATION.WarningBackup');
        const localizedWarningBegin = game.i18n.localize('SR5.MIGRATION.BeginMigration');

        const d = new foundry.appv1.api.Dialog({
            title: localizedWarningTitle,
            content:
                `<h2 style="color: red; text-align: center">${localizedWarningHeader} (${this.pendingMigrationCount})</h2>` +
                `<p style="text-align: center"><i>${localizedWarningRequired}</i></p>` +
                `<p>${localizedWarningDescription}</p>` +
                `<h3 style="color: red">${localizedWarningBackup}</h3>`,
            buttons: {
                ok: {
                    label: localizedWarningBegin,
                    callback: async () => this.updateAllMigratableDocuments(),
                },
            },
            default: 'ok',
        });
        d.render(true);
    }

    // Track migration progress
    private static totalMigrations = 0;
    private static completedMigrations = 0;
    private static progressbar: foundry.applications.ui.Notifications.Notification | null = null;
    private static updateProgressbar() {
        if (!this.progressbar)
            this.progressbar = ui.notifications.info("Migrating Documents...", { progress: true });

        this.completedMigrations++;
        this.progressbar.update({
            pct: this.completedMigrations / this.totalMigrations,
            message: `Migrating Documents... (${this.completedMigrations}/${this.totalMigrations})`
        });
    }

    /**
     * Update documents of a specific type.
     */
    private static async updateDocuments<Doc extends MigratableDocumentType>(
        cls: Doc,
        docs: NonNullable<Parameters<Doc['implementation']['updateDocuments']>[0]>,
        parent: NonNullable<Parameters<Doc['implementation']['updateDocuments']>[1]>['parent'] = null
    ) {
        this.updateProgressbar();
        try {
            return await cls.implementation.updateDocuments(
                docs.filter(d => d._stats?.systemVersion === this._migrationMark) as any,
                // Save migrated data silently (no hooks/renders) to avoid intermediate state issues.
                { parent: parent as any, diff: false, recursive: false, noHook: true, render: false }
            );
        } catch (error) {
            console.error(`Failed migration update for ${cls.documentName} documents (parent: ${parent?.uuid ?? 'none'}).`, error);
        }
    }

    /**
     * Migrate all actors in the game.
     */
    private static async updateAllMigratableDocuments() {
        const start = performance.now();

        // Estimate total migration steps
        this.totalMigrations =
            1 + game.items.size +                         // Items + their effects
            1 + game.actors.size * 2 +                    // Actor + their items + their effects
            [...game.actors].reduce((sum, actor) => sum + actor.items.size, 0) +  // Actor item effects
            1 + game.combats.size +                       // Combats + their combatants
            game.scenes.size;                             // Non-actor tokens

        /* Items and its embedded Effects */
        await this.updateDocuments(Item, deepClone(game.items._source));

        for (const item of game.items)
            await this.updateDocuments(ActiveEffect, item.toObject().effects, item);

        /* Actors and its embedded documents */
        await this.updateDocuments(Actor, deepClone(game.actors._source));

        for (const actor of game.actors) {
            await this.updateDocuments(Item, actor.toObject().items, actor);
            await this.updateDocuments(ActiveEffect, actor.toObject().effects, actor);

            for (const item of actor.items)
                await this.updateDocuments(ActiveEffect, item.toObject().effects, item);
        }

        /* Combats and its embedded combatants */
        await this.updateDocuments(Combat, deepClone(game.combats._source));

        for (const combat of game.combats)
            await this.updateDocuments(Combatant, combat.toObject().combatants ?? [], combat);

        /* Tokens */
        for (const scene of game.scenes) {
            this.updateProgressbar();
            try {
                await TokenDocument.implementation.updateDocuments(
                    scene.tokens.map(token => {
                        const data = token.toObject();

                        // Foundry uses the parent token ID as the ActorDelta ID.
                        // Provide it upfront to avoid ActorDeltaField._updateDiff assigning _id to the cleaned update value.
                        if (!token.actorLink && data.delta && !data.delta._id)
                            data.delta._id = token.id;

                        return data;
                    }),
                    // Save migrated data silently (no hooks/renders) to avoid intermediate state issues.
                    { parent: scene, diff: false, recursive: false, noHook: true, render: false }
                );
            } catch (error) {
                console.error(`Failed migration update for Token documents in ${scene.uuid}.`, error);
            }
        }

        /* Finalize Migration */
        await game.settings.set(game.system.id, FLAGS.KEY_DATA_VERSION, game.system.version);
        this.pendingMigrationCount = 0;

        new foundry.appv1.api.Dialog({
            title: "Migration Complete",
            content: `
                <h2 style="color: red; text-align: center">Migration Complete</h2>
                <p style="text-align: center">It took ${this.formatElapsedTime(performance.now() - start)}.</p>
            `,
            buttons: {
                ok: {
                    label: "OK",
                    callback: () => {
                        this.progressbar?.remove();
                        ui.notifications.info("Documents have been migrated!");
                    }
                }
            },
            default: "ok"
        }).render(true);
    }

    /**
     * compare two version numbers
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
