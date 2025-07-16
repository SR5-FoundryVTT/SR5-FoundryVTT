/**
 * Base class for version migrations that convert game data from an older version to a newer one.
 * 
 * By default, only actors, items, and active effects are handled, but subclasses may extend
 * this class to support additional data types as needed.
 * 
 * These methods are designed to be atomic and modular, enabling precise upgrades
 * without requiring full system-wide context.
 */

export type MigratorDocumentTypes = "Actor" | "Item" | "ActiveEffect";

export abstract class VersionMigration {
    /**
     * The target version string that this migration upgrades data to.
     */
    public abstract TargetVersion: `${number}.${number}.${number}`;

    /**
     * Apply this migration to an actor.
     * Override in subclasses to modify actor data as needed.
     */
    public migrateActor(actor: any): void { }

    /**
     * Apply this migration to an item.
     * Override in subclasses to modify item data as needed.
     */
    public migrateItem(item: any): void { }

    /**
     * Apply this migration to an active effect.
     * Override in subclasses to modify active effect data as needed.
     */
    public migrateActiveEffect(effect: any): void { }

    /**
     * Indicates whether the subclass overrides the corresponding migration method
     * (`migrateActor`, `migrateItem`, `migrateActiveEffect`), used to determine if
     * the migration applies to a given document type.
     */
    public readonly implements: Record<MigratorDocumentTypes, boolean>;
    constructor() {
        const proto = Object.getPrototypeOf(this);
        this.implements = {
            Actor: proto.migrateActor !== VersionMigration.prototype.migrateActor,
            Item: proto.migrateItem !== VersionMigration.prototype.migrateItem,
            ActiveEffect: proto.migrateActiveEffect !== VersionMigration.prototype.migrateActiveEffect
        };
    }
}
