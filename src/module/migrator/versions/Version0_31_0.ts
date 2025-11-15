import { VersionMigration } from "../VersionMigration";

/**
 * Update importFlags to their correct values.
 * Update all dataSchema to their correct values choices.
 * Fixes a typo in the lifestyle type "luxory" -> "luxury"
 */
export class Version0_31_0 extends VersionMigration {
    readonly TargetVersion = "0.31.0";

    private migrateImportFlags(doc: any): void {
        if (doc.system?.importFlags?.isImported === false) {
            doc.system.importFlags = null;
        } else if (doc.system?.importFlags) {
            doc.system.importFlags.category ??= doc.system.importFlags.subType;
        }
    }

    override migrateActor(actor: any): void {
        this.migrateImportFlags(actor);
    }

    override migrateItem(item: any): void {
        this.migrateImportFlags(item);

        if (item.type === 'lifestyle' && item.system.type === 'luxory')
            item.system.type = 'luxury';
    }
}
