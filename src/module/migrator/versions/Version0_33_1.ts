import { VersionMigration } from "../VersionMigration";

const { getProperty } = foundry.utils;

type MigratingActiveEffectChange = {
    key: string;
};

type MigratingActiveEffectSystem = {
    applyTo?: string;
    changes?: MigratingActiveEffectChange[];
};

type MigratingActiveEffect = {
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
    private static readonly NonModifiableLegacyKeyPaths = new Set([
        'data.action.mod',
        'data.action.opposed.mod',
        'data.action.opposed.resist.mod',
        'data.action.followed.mod',
        'data.modifiers.mod',
        'system.action.mod',
        'system.action.opposed.mod',
        'system.action.opposed.resist.mod',
        'system.action.followed.mod',
        'system.armor.mod',
        'data.modifiers.mod'
    ]);

    readonly TargetVersion = "0.33.1";
    override handlesActiveEffect(_effect: Readonly<unknown>): boolean {
        const effect = _effect as MigratingActiveEffect;

        // B) Some test effects referenced the legacy test modifier field.
        if (Version0_33_1.EffectUsesLegacyTestModifierKey(effect)) return true;

        // A) Some changes referenced a legacy ModifiableValue schema suffix.
        const changes = getProperty(effect, "system.changes");
        if (Array.isArray(changes) && changes.some(change => Version0_33_1.IsLegacyModifiableValueKey(change.key))) return true;

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

        for (const change of migratingEffect.system?.changes ?? []) {
            if (Version0_33_1.IsLegacyModifiableValueKey(change.key)) {
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

        for (const change of migratingEffect.system?.changes ?? []) {
            if (Version0_33_1.LegacyTestModifierKeyPattern.test(change.key)) {
                change.key = Version0_33_1.ModernTestPoolKey;
            }
        }
    }

    private static EffectUsesLegacyTestModifierKey(effect: MigratingActiveEffect): boolean {
        if (!Version0_33_1.isTestScopedEffect(effect)) return false;

        return effect.system?.changes?.some(change => Version0_33_1.LegacyTestModifierKeyPattern.test(change.key)) ?? false;
    }

    private static IsLegacyModifiableValueKey(key: string): boolean {
        return Version0_33_1.LegacyModifiableValueKeyPattern.test(key)
            && !Version0_33_1.NonModifiableLegacyKeyPaths.has(key);
    }

    private static isTestScopedEffect(effect: MigratingActiveEffect): boolean {
        return effect.system?.applyTo === 'test_all' || effect.system?.applyTo === 'test_item';
    }
}