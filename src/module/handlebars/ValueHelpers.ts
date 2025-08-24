import { ModifiableValueType } from "../types/template/Base"

/**
 * Helpers around handling handlebar display of ModifiableValue fields.
 */
export const registerValueHelpers = () => {
    Handlebars.registerHelper('overrideNone', (value: ModifiableValueType) => {
        if (value.override) return false;
        if (value.upgrade && value.value === value.upgrade.value) return false;
        if (value.downgrade && value.value === value.downgrade.value) return false;

        return true;
    });
    Handlebars.registerHelper('overrideTotal', (value: ModifiableValueType) => {
        return value.override;
    });
    Handlebars.registerHelper('overrideUpgrade', (value: ModifiableValueType) => {
        if (!value.upgrade) return false;

        return value.value === value.upgrade.value;
    });
    Handlebars.registerHelper('overrideDowngrade', (value: ModifiableValueType) => {
        if (!value.downgrade) return false;

        return value.value === value.downgrade.value;
    });
}