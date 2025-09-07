import { ModifiableValueType } from "../types/template/Base"

/**
 * Helpers around handling handlebar display of ModifiableValue fields.
 */
export const registerModifierHelpers = () => {
    Handlebars.registerHelper('ModifierMode', (value: ModifiableValueType): 'override' | 'upgrade' | 'downgrade' | null => {
        return value?.mode ?? null;
    });
}
