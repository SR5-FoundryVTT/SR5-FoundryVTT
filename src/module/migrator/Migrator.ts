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
import { Version0_37_0 } from './versions/Version0_37_0';
import { Version0_37_4 } from './versions/Version0_37_4';
import { Version0_38_0 } from './versions/Version0_38_0';
import { VersionMigration, MigratableDocument, MigratableDocumentName, MigratableDocumentType } from "./VersionMigration";
import { MigrationStorage } from "./MigrationStorage";

const { deepClone, setProperty } = foundry.utils;

/** Version assigned to raw embedded data so it receives the complete migration chain. */
export const UNMIGRATED_VERSION = '0.0.0';


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
        new Version0_37_0(),
        new Version0_37_4(),
        new Version0_38_0(),
    ] as const;

    private static pendingMigrationCount = 0;

    /** Completed migration watermark, including migrations ahead of the development manifest. */
    static get migrationVersion(): string {
        const latest = this.s_Versions.at(-1)?.TargetVersion ?? "0.0.0";
        return this.compareVersion(latest, game.system.version) > 0 ? latest : game.system.version;
    }

    // Temporary marker for completed migrations that still need to be persisted.
    private static get _migrationMark() {
        return this.migrationVersion + ".0";
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

    private static getPendingWorldMigrators(): readonly VersionMigration[] {
        const version = game.settings.get(game.system.id, FLAGS.KEY_DATA_VERSION);
        return this.s_Versions.filter(migrator =>
            migrator.handlesWorldMigration() &&
            this.compareVersion(migrator.TargetVersion, version) > 0
        );
    }

    private static normalizeArray(data: any): any[] {
        if (data == null) return [];
        return Array.isArray(data) ? data : Object.values(data); 
    }

    private static markMigrated(data: { _stats: { systemVersion: string } }, nested: boolean): void {
        data._stats.systemVersion = nested ? this.migrationVersion : this._migrationMark;
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
            data._stats.systemVersion ??= UNMIGRATED_VERSION;
        }

        // If _stats is missing, or systemVersion is not present, or the document is already migrated, skip migration.
        if (!data._stats || !('systemVersion' in data._stats)) return false;
        if (this.compareVersion(data._stats.systemVersion, this.migrationVersion) >= 0) return false;

        path = [...path, type, data._id ?? "unknown"];
        const migrationKey = path.join(".");

        let migrated = false;
        if (type === "Item") {
            // Only normalize an existing flag; lifting nested items removes it and must not see it return.
            if (data.flags?.shadowrun5e?.embeddedItems != null) {
                const items = this.normalizeArray(data.flags.shadowrun5e.embeddedItems);
                for (const nestedItems of items) {
                    const nestedMigrated = this.migrate("Item", nestedItems, true, path);
                    migrated = migrated || nestedMigrated;
                }
                setProperty(data, 'flags.shadowrun5e.embeddedItems', items);
            }

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
     * Apply migrations to the source of a token's ActorDelta.
     *
     * Deltas carry no _stats of their own, so every migrator handling them runs on every load and
     * must leave already migrated delta data untouched.
     */
    public static migrateActorDelta(data: any) {
        if (!data || typeof data !== 'object') return;

        for (const migrator of this.s_Versions) {
            if (!migrator.handlesActorDelta(data)) continue;
            try {
                migrator.migrateActorDelta(data);
            } catch (error) {
                console.error(`Failed ActorDelta migration to ${migrator.TargetVersion}.\nID: ${data._id ?? 'unknown'};\n`, error);
            }
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
        // No need to migrate if the document is not a migratable document.
        if (doc._stats.systemVersion !== this._migrationMark) return;

        // Mark document as up-to-date
        doc._stats.systemVersion = this.migrationVersion;
        doc._source._stats.systemVersion = this.migrationVersion;

        // Update Parent First
        if (doc.parent instanceof Actor || doc.parent instanceof Item || doc.parent instanceof Combat)
            await this.updateMigratedDocument(doc.parent);

        // Save migrated data silently (no hooks/renders) to avoid intermediate state issues.
        return doc.update(doc.toObject() as any, { diff: false, recursive: false, noHook: true, render: false });
    }

    public static BeginMigration() {
        const pendingForcedMigrations = this.getPendingWorldMigrators();
        if (this.pendingMigrationCount === 0 && pendingForcedMigrations.length === 0) return;
        const migratedVersion = game.settings.get(game.system.id, FLAGS.KEY_DATA_VERSION);
        if (this.compareVersion(migratedVersion, this.migrationVersion) >= 0) return;

        const localizedWarningTitle = game.i18n.localize('SR5.MIGRATION.WarningTitle');
        const localizedWarningHeader = game.i18n.localize('SR5.MIGRATION.WarningHeader');
        const localizedWarningRequired = game.i18n.localize('SR5.MIGRATION.WarningRequired');
        const localizedWarningDescription = game.i18n.localize('SR5.MIGRATION.WarningDescription');
        const localizedWarningBackup = game.i18n.localize('SR5.MIGRATION.WarningBackup');
        const localizedWarningBegin = game.i18n.localize('SR5.MIGRATION.BeginMigration');

        const d = new foundry.appv1.api.Dialog({
            title: localizedWarningTitle,
            content:
                `<h2 style="color: red; text-align: center">${localizedWarningHeader} (${this.pendingMigrationCount + pendingForcedMigrations.length})</h2>` +
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
        parent: NonNullable<Parameters<Doc['implementation']['updateDocuments']>[1]>['parent'] = null,
        pack?: string
    ) {
        this.updateProgressbar();
        const migratedDocs = docs.filter(d => d._stats?.systemVersion === this._migrationMark);

        for (const batch of MigrationStorage.batchBySize(migratedDocs)) {
            try {
                await cls.implementation.updateDocuments(
                    batch as any,
                    // Save migrated data silently (no hooks/renders) to avoid intermediate state issues.
                    { parent: parent as any, pack, diff: false, recursive: false, noHook: true, render: false }
                );
            } catch (error) {
                console.error(`Failed migration update for ${cls.documentName} documents (parent: ${parent?.uuid ?? pack ?? 'none'}).`, error);
            }
        }
    }

    /**
     * Whether a document source, or any item source below it, still owes a migration update.
     */
    private static hasPendingItems(items: any[] = []): boolean {
        return items.some(item =>
            item?._stats?.systemVersion === this._migrationMark ||
            (item?.effects ?? []).some((effect: any) => effect?._stats?.systemVersion === this._migrationMark)
        );
    }

    /**
     * Persist lazily migrated contents of world-owned Actor and Scene compendiums.
     *
     * Their documents migrate on load like any other, but nothing else ever writes them back, so
     * data derived during migration, like lifted items, would be recreated on every load.
     */
    private static async updateWorldCompendiums(packs: foundry.documents.collections.CompendiumCollection<any>[]) {
        for (const pack of packs) {
            this.updateProgressbar();
            try {
                const documents = await pack.getDocuments();

                if (pack.documentName === 'Actor') {
                    const actors = documents as Actor.Implementation[];
                    const pending = actors.filter(actor => {
                        const source = actor.toObject() as any;
                        return source._stats?.systemVersion === this._migrationMark ||
                            this.hasPendingItems(source.items) ||
                            (source.effects ?? []).some((effect: any) => effect?._stats?.systemVersion === this._migrationMark);
                    });
                    if (pending.length === 0) continue;

                    await MigrationStorage.withUnlockedPack(pack, async () => {
                        await this.updateDocuments(Actor, pending.map(actor => actor.toObject()) as any, null, pack.collection);
                        for (const actor of pending) {
                            await this.updateDocuments(Item, actor.toObject().items, actor);
                            await this.updateDocuments(ActiveEffect, actor.toObject().effects, actor);
                            for (const item of actor.items)
                                await this.updateDocuments(ActiveEffect, item.toObject().effects, item);
                        }
                    });
                }

                if (pack.documentName === 'Scene') {
                    const scenes = (documents as Scene.Implementation[]).filter(scene =>
                        scene.tokens.some(token => !token.actorLink && this.hasPendingItems((token.toObject() as any).delta?.items))
                    );
                    if (scenes.length === 0) continue;

                    await MigrationStorage.withUnlockedPack(pack, async () => {
                        for (const scene of scenes)
                            await MigrationStorage.updateTokens(scene, MigrationStorage.tokenSources(scene));
                    });
                }
            } catch (error) {
                console.error(`Failed migration update for compendium ${pack.collection}.`, error);
            }
        }
    }

    /**
     * Migrate all actors in the game.
     */
    private static async updateAllMigratableDocuments() {
        const start = performance.now();
        const worldMigrators = this.getPendingWorldMigrators();
        const worldPacks = game.packs.filter(pack =>
            pack.metadata.packageType === 'world' && ['Actor', 'Scene'].includes(pack.documentName)
        );

        // Estimate total migration steps
        this.totalMigrations =
            1 + game.items.size +                         // Items + their effects
            1 + game.actors.size * 2 +                    // Actor + their items + their effects
            [...game.actors].reduce((sum, actor) => sum + actor.items.size, 0) +  // Actor item effects
            1 + game.combats.size +                       // Combats + their combatants
            game.scenes.size +                            // Non-actor tokens
            worldPacks.length +                           // World Actor and Scene compendiums
            worldMigrators.length;                       // Forced world migrations

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
            await MigrationStorage.updateTokens(scene, MigrationStorage.tokenSources(scene));
        }

        /* World compendiums */
        await this.updateWorldCompendiums(worldPacks as foundry.documents.collections.CompendiumCollection<any>[]);

        for (const migrator of worldMigrators) {
            this.updateProgressbar();
            try {
                await migrator.MigrateWorld();
            } catch (error) {
                console.error(`Failed forced migration to ${migrator.TargetVersion}.`, error);
            }
        }

        /* Finalize Migration */
        await game.settings.set(game.system.id, FLAGS.KEY_DATA_VERSION, this.migrationVersion);
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
