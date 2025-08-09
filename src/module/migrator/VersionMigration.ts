export type MigratableDocument = Actor.Implementation | Item.Implementation | ActiveEffect.Implementation;
export type MigratableDocumentName = MigratableDocument['documentName'];

/**
 * Base class for version migrations that convert game data from an older version to a newer one.
 * 
 * By default, only actors, items, and active effects are handled, but subclasses may extend
 * this class to support additional data types as needed.
 * 
 * These methods are designed to be atomic and modular, enabling precise upgrades
 * without requiring full system-wide context.
 * 
 * Note: if you want to sanitize a document without migration, return true on the handles functions,
 * and not implement a migration function for the document. Sanitation then will be called.
 * 
 * Note: if you want to migrate a new embedded item during document migration, consider this approach:
 *
 * override migrateActor(_actor: any): void {
 *     _actor.items.push({
 *         name: "New Embedded Item",
 *         type: "action",
 *         _id: foundry.utils.randomID(16),
 *         system: DataDefaults.baseSystemData('action'),
 *     } as any);
 * }
 */
export abstract class VersionMigration {
    abstract TargetVersion: `${number}.${number}.${number}`;

    migrateActor(_actor: any): void {}
    handlesActor(_actor: Readonly<any>) { return this.migrates.Actor; }

    migrateItem(_item: any): void {}
    handlesItem(_item: Readonly<any>) { return this.migrates.Item; }

    migrateActiveEffect(_effect: any): void {}
    handlesActiveEffect(_effect: Readonly<any>) { return this.migrates.ActiveEffect; }

    /**
     * Flags which migration methods have been overridden in the subclass.
     * Used to determine support for each document type.
     */
    private readonly migrates: Record<MigratableDocumentName, boolean>;
    constructor() {
        const proto = Object.getPrototypeOf(this);
        this.migrates = {
            Actor: proto.migrateActor !== VersionMigration.prototype.migrateActor,
            Item: proto.migrateItem !== VersionMigration.prototype.migrateItem,
            ActiveEffect: proto.migrateActiveEffect !== VersionMigration.prototype.migrateActiveEffect
        };
    }
}
