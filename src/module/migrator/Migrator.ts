import { Version0_8_0 } from "./versions/Version0_8_0";
import { Version0_18_0 } from './versions/Version0_18_0';
import { Version0_16_0 } from './versions/Version0_16_0';
import { Version0_27_0 } from './versions/Version0_27_0';
import { Version0_30_0 } from './versions/Version0_30_0';
import { VersionMigration, MigratorDocumentTypes } from "./VersionMigration";
const { SchemaField, TypedObjectField, ArrayField } = foundry.data.fields;

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
 * - updateMigratedDocuments
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
    private static getMigrators(type: MigratorDocumentTypes, version: string | null): readonly VersionMigration[] {
        version ??= '0.0.0'; // Default to '0.0.0' if no version is provided.
        return this.s_Versions.filter(migrator =>
            migrator.implements[type] && this.compareVersion(migrator.TargetVersion, version) > 0
        );
    }

    /**
     * Applies migration logic to a provided data object of the specified type during world load
     * 
     * This is connected to Migrator.updateMigratedDocuments which will persist migrated data during the
     * update process.
     */
    public static migrate(type: MigratorDocumentTypes, data: any): void {
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
        const failure = schema.validate(data.system, { partial: true });
        if (failure) {
            const logs: Record<string, { oldValue: unknown; newValue: unknown; }> = {};
            this._sanitize(data.system, failure, (key) => schema.fields[key], logs);
            console.warn(
                `Document Sanitized on Migration:\n` +
                `ID: ${data._id}; Name: ${data.name};\n` +
                `Type: ${type}; SubType: ${data.type}; Version: ${data._stats.systemVersion};\n`
            );
            console.table(logs);
        }
    }

    /**
     * Apply migrated data to the document to persist and mark it as up-to-date.
     * 
     * This is connected to Migrator.migrate which will migrate document data on the fly
     * during a documents migrateData call before data preparation.
     * 
     * To avoid endless migrations during world load, we assume the document is migrated and will
     * persist that migration based on an out of date document system version, whenever it's
     * updated next by the user.
     * 
     * @param doc Updated document.
     */
    static async updateMigratedDocuments(doc: Actor | Item | ActiveEffect) {
        // No need to migrate if the document is already up-to-date.
        if (doc._stats.systemVersion === game.system.version) return;

        // If no migrators found, nothing to do.
        const migrators = this.getMigrators(doc.documentName, doc._stats.systemVersion);
        if (migrators.length === 0) return;

        // Mark document as up-to-date
        doc._stats.systemVersion = game.system.version;
        // Persist the change without triggering diff logic
        await doc.update(doc.toObject() as any, { diff: false, recursive: false });
    }

    /**
     * Check whether a value is a structured object.
     * This is used to determine whether the value can have nested validation failures.
     */
    private static isStructured(value: unknown): value is Record<string, unknown> {
        return value !== null && typeof value === "object" && !Array.isArray(value);
    }

    /**
     * Recursively sanitize a source object or array by replacing invalid values
     * with their field's default values based on a model failure structure.
     *
     * This ensures that all invalid data (either from nested fields or arrays)
     * is corrected to conform with the expected data model schema.
     * 
     * @param source - The object or array to sanitize.
     * @param modelFailure - The validation failure data structure, containing fields and/or elements with issues.
     * @param resolveField - A function that retrieves the corresponding schema field for a given key.
     * @param path - The current nested path being processed, used for logging and tracing.
     */
    private static _sanitize(
        source: Record<string, unknown> | Array<unknown>,
        modelFailure: foundry.data.validation.DataModelValidationFailure,
        resolveField: (key: string) => foundry.data.fields.DataField.Any,
        logs: Record<string, { oldValue: unknown; newValue: unknown; }>,
        path: string[] = []
    ): void {
        // Merge both named field failures and indexed element failures into one flat map for iteration.
        const failures = {
            ...modelFailure.fields,
            ...Object.fromEntries(modelFailure.elements.map(e => [e.id.toString(), e.failure]))
        };

        for (const [fieldName, failure] of Object.entries(failures)) {
            const value = source[fieldName];
            const field = resolveField(fieldName);
            const currentPath = [...path, fieldName];

            if (field instanceof SchemaField && this.isStructured(value))
                this._sanitize(value, failure, (subKey) => field.fields[subKey], logs, currentPath);
            else if (field instanceof TypedObjectField && this.isStructured(value))
                this._sanitize(value, failure, () => field.element, logs, currentPath);
            else if (field instanceof ArrayField && Array.isArray(value))
                this._sanitize(value, failure, () => field.element, logs, currentPath);
            else {
                let newValue: unknown;

                // Avoid conversion from T to [T] on cleaning in ArrayField.
                if (!(field instanceof ArrayField)) {
                    const cleanValue = field.clean(value);
                    newValue = field.validate(cleanValue) == null ? cleanValue : field.getInitialValue();
                } else {
                    newValue = field.getInitialValue();
                }

                logs[currentPath.join(".")] = { oldValue: value, newValue };
                source[fieldName] = newValue;
            }
        }
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
