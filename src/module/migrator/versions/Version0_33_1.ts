import { VersionMigration } from "../VersionMigration";

type MigratingActiveEffectChange = {
    key: string;
};

type MigratingActiveEffectSystem = {
    applyTo?: string;
};

type MigratingActiveEffect = {
    changes?: MigratingActiveEffectChange[];
    system?: MigratingActiveEffectSystem;
};

/**
 * Migrations for 0.33.0 missing schema changes:
 * - A) change keys using legacy ModifiableValue .mod to .changes
 * - B) test effect keys referencing legacy data.modifiers(.mod) instead of data.pool
 */
export class Version0_33_1 extends VersionMigration {
    private static readonly LegacyModifiableValueKeyPattern = /\.mod$/;
    private static readonly LegacyTestModifierKeyPattern = /^data\.modifiers(?:\.mod)?$/;
    private static readonly ModernTestPoolKey = 'data.pool';

    readonly TargetVersion = "0.33.1";
    override handlesActiveEffect(_effect: Readonly<unknown>): boolean {
        const effect = _effect as MigratingActiveEffect;

        // A) Some changes referenced a legacy ModifiableValue schema suffix.
        if (effect.changes?.some(change => Version0_33_1.LegacyModifiableValueKeyPattern.test(change.key))) return true;

        // B) Some test effects referenced the legacy test modifier field.
        if (Version0_33_1.EffectUsesLegacyTestModifierKey(effect)) return true;

        return false;
    }

    override migrateActiveEffect(effect: unknown): void {
        // Migration Case B)
        Version0_33_1.MigrateTestModifierKeyToPool(effect);

        // Migration Case A)
        Version0_33_1.MigrateEffectKeysFromModToChanges(effect);
    }

    /**
        * 0.32.x used .mod for ModifiableValue data.
     */
    static MigrateEffectKeysFromModToChanges(effect: unknown): void {
        const migratingEffect = effect as MigratingActiveEffect;

        for (const change of migratingEffect.changes ?? []) {
            if (Version0_33_1.LegacyModifiableValueKeyPattern.test(change.key)) {
                change.key = change.key.replace(Version0_33_1.LegacyModifiableValueKeyPattern, '.changes');
            }
        }
    }

    /**
        * Earlier test-targeted effects wrote to data.modifiers or data.modifiers.mod,
        * while current tests use data.pool.
     */
    static MigrateTestModifierKeyToPool(effect: unknown): void {
        const migratingEffect = effect as MigratingActiveEffect;

        if (!Version0_33_1.isTestScopedEffect(migratingEffect)) return;

        for (const change of migratingEffect.changes ?? []) {
            if (Version0_33_1.LegacyTestModifierKeyPattern.test(change.key)) {
                change.key = Version0_33_1.ModernTestPoolKey;
            }
        }
    }

    private static EffectUsesLegacyTestModifierKey(effect: MigratingActiveEffect): boolean {
        if (!Version0_33_1.isTestScopedEffect(effect)) return false;

        return effect.changes?.some(change => Version0_33_1.LegacyTestModifierKeyPattern.test(change.key)) ?? false;
    }

    private static isTestScopedEffect(effect: MigratingActiveEffect): boolean {
        return effect.system?.applyTo === 'test_all' || effect.system?.applyTo === 'test_item';
    }
}