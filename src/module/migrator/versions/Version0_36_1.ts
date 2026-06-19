import { VersionMigration } from '../VersionMigration';

// Old flat filter dimensions -> new condition type.
const flatDimensions = [
    { valueKey: 'selection_tests', modeKey: 'selection_tests_mode', type: 'tests' },
    { valueKey: 'selection_categories', modeKey: 'selection_categories_mode', type: 'categories' },
    { valueKey: 'selection_skills', modeKey: 'selection_skills_mode', type: 'skills' },
    { valueKey: 'selection_attributes', modeKey: 'selection_attributes_mode', type: 'attributes' },
    { valueKey: 'selection_limits', modeKey: 'selection_limits_mode', type: 'limits' },
] as const;

/**
 * Migrate Active Effect filters/apply-to to the per-target model.
 * * New shape:
 * - effect.system.targets: [{ id, applyTo, conditions: [{ type, mode, values }] }]
 * - each effect.system.changes[i].target references the first created target.
 */
export class Version0_36_1 extends VersionMigration {
    readonly TargetVersion = '0.36.1';

    override migrateActiveEffect(effect: any): void {
        const system = effect.system;
        if (!system || typeof system !== 'object') return;

        // Build conditions cleanly, dropping empty ones
        const conditions = flatDimensions.flatMap(({ valueKey, modeKey, type }) => {
            const values = system[valueKey];
            return Array.isArray(values) && values.length > 0
                ? [{ type, mode: system[modeKey] ?? 'include', values }]
                : [];
        });

        // Generate a single ID and assign the target directly
        const targetId = foundry.utils.randomID();
        system.targets = [{
            id: targetId,
            applyTo: system.applyTo ?? 'actor',
            conditions
        }];

        // Assign the target to existing changes
        for (const change of system.changes ?? []) {
            change.target = targetId;
        }
    }
}