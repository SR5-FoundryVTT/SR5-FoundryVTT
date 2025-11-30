import { ModifiableValueType } from '../types/template/Base';
type ChangeType = ModifiableValueType['changes'][number];

/**
 * Helpers around handling handlebar display of ModifiableValue fields.
 */
export const registerModifierHelpers = () => {
    Handlebars.registerHelper('getChangeValue', (change: ChangeType) => {
        switch (change.mode) {
            case 0:
            case 2:
                return change.value > 0 ? `+${change.value}` : `${change.value}`;
            case 1:
                return `* ${change.value}`;
            case 3:
                return `↓ ${change.value}`;
            case 4:
                return `↑ ${change.value}`;
            default:
                return `➝ ${change.value}`;
        }
    });

    Handlebars.registerHelper('getChangeCSS', (change: ChangeType) => {
        if (!change.applied)
            return 'mod-change-unapplied';
        if (change.masked)
            return 'mod-change-masked';
        return '';
    });

    Handlebars.registerHelper('getChangeDescription', (change: ChangeType) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const effect = fromUuidSync(change.effectUuid ?? '') as ActiveEffect | null;
        return effect?.description || '';
    });
}
