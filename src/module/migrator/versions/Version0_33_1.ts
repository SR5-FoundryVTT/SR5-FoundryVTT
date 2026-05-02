import { VersionMigration } from "../VersionMigration";

type MigratingActiveEffectChange = {
    key: string;
};

type MigratingActiveEffect = {
    changes?: MigratingActiveEffectChange[];
};

/**
 * Migrations for 0.33.0 missing schema changes:
 * - A) change keys including .mods instead of .changes
 */
export class Version0_33_1 extends VersionMigration {
    readonly TargetVersion = "0.33.1";
    override handlesActiveEffect(_effect: Readonly<unknown>): boolean {
        const effect = _effect as MigratingActiveEffect;

        // A) Some changes referenced a legacy ModifiableValue schema suffix.
        if (effect.changes?.some(change => Version0_33_1.LegacyModifiableValueKeyPattern.test(change.key))) return true;

        return false;
    }

    override migrateActiveEffect(effect: unknown): void {
        // Migration Case A)
        Version0_33_1.MigrateEffectKeysFromModToChanges(effect);
    }

    /**
     * 0.32.x had ModifiableValueSchema contain a .mod/.mods property, while
     * 0.33.0 uses the .changes property instead.
     */
    private static readonly LegacyModifiableValueKeyPattern = /\.mods?$/;
    static MigrateEffectKeysFromModToChanges(effect: unknown): void {
        const migratingEffect = effect as MigratingActiveEffect;

        for (const change of migratingEffect.changes ?? []) {
            if (Version0_33_1.LegacyModifiableValueKeyPattern.test(change.key)) {
                change.key = change.key.replace(Version0_33_1.LegacyModifiableValueKeyPattern, '.changes');
            }
        }
    }
}