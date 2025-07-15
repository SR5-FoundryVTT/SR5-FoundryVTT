/**
 * Base class for version migrations that convert game data from an older version to a newer one.
 * 
 * By default, only actors, items, and active effects are handled, but subclasses may extend
 * this class to support additional data types as needed.
 * 
 * These methods are designed to be atomic and modular, enabling precise upgrades
 * without requiring full system-wide context.
 */
export abstract class VersionMigration {
    /**
     * The target version string that this migration upgrades data to.
     */
    public abstract TargetVersion: `${number}.${number}.${number}`;

    /**
     * Apply this migration to an actor.
     * Override in subclasses to modify actor data as needed.
     */
    public migrateActor(actor: any): any {
        return actor;
    }

    /**
     * Apply this migration to an item.
     * Override in subclasses to modify item data as needed.
     */
    public migrateItem(item: any): any {
        return item;
    }

    /**
     * Apply this migration to an active effect.
     * Override in subclasses to modify active effect data as needed.
     */
    public migrateActiveEffect(effect: any): any {
        return effect;
    }
}
