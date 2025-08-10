import { ModifiableValueType } from "../types/template/Base"

/**
 * Helpers around handling handlebar display of ModifiableValue fields.
 */
export const registerValueHelpers = () => {
    Handlebars.registerHelper('overrideNone', (value: ModifiableValueType) => {
        if (!value.override) return true;

        if (!value.override.min && !value.override.max) return false;
        if (value.override.min && value.value === value.override.value) return false;
        if (value.override.max && value.value === value.override.value) return false;

        return true;
    });
    Handlebars.registerHelper('overrideTotal', (value: ModifiableValueType) => {
        return value.override && !value.override.min && !value.override.max;
    });
    Handlebars.registerHelper('overrideUpgrade', (value: ModifiableValueType) => {
        if (!value.override || !value.override.min) return false;

        return value.value === value.override.value;
    });
    Handlebars.registerHelper('overrideDowngrade', (value: ModifiableValueType) => {
        if (!value.override || !value.override.max) return false;

        return value.value === value.override.value;
    });
}