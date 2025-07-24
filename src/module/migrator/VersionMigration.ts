/**
 * Base class for version migrations that convert game data from an older version to a newer one.
 * 
 * By default, only actors, items, and active effects are handled, but subclasses may extend
 * this class to support additional data types as needed.
 * 
 * These methods are designed to be atomic and modular, enabling precise upgrades
 * without requiring full system-wide context.
 */

export type MigratableDocument = Actor.Implementation | Item.Implementation | ActiveEffect.Implementation;
export type MigratableDocumentName = MigratableDocument['documentName'];

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
