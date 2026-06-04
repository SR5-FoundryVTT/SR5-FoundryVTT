import { VersionMigration } from "../VersionMigration";

const SelectionFields = [
    'selection_attributes',
    'selection_categories',
    'selection_limits',
    'selection_skills',
    'selection_tests',
] as const;

/**
 * Converts selection fields in active effects from arrays of objects to arrays of strings (IDs).
 */
export class Version0_36_0 extends VersionMigration {
    readonly TargetVersion = "0.36.0";

    private _mapSelectionValue(value: unknown): string | undefined {
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && value !== null && typeof value['id'] === 'string') {
            return value['id'];
        }
        return undefined;
    }

    override handlesActiveEffect(effect: Readonly<any>): boolean {
        return SelectionFields.some((field) => {
            const values = effect?.system?.[field];
            return Array.isArray(values) && values.some((value) => typeof value !== 'string');
        });
    }

    override migrateActiveEffect(effect: any): void {
        const system = effect.system;
        if (!system) return;

        for (const field of SelectionFields) {
            const values = system[field];
            if (!Array.isArray(values)) continue;

            system[field] = values
                .map(value => this._mapSelectionValue(value))
                .filter(value => typeof value === 'string');
        }
    }
}
