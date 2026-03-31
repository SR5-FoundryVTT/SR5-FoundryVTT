import { PartsList } from '../parts/PartsList';
import { ModifiableValueType } from '../types/template/Base';
type ChangeType = ModifiableValueType['changes'][number];

/**
 * Helpers around handling handlebar display of ModifiableValue fields.
 */
export const registerModifierHelpers = () => {
    const getModifierChanges = (changes: ChangeType[] = []) => {
        if (!Array.isArray(changes)) return [];
        return changes.filter(change => !PartsList.isBaseChange(change));
    };

    const getActiveModifierChanges = (changes: ChangeType[] = []) => {
        return getModifierChanges(changes).filter(change => change.applied);
    };

    const getDiffValueChange = (modValue: ModifiableValueType) => {
        return modValue.value - modValue.changes
            .filter(change => change.priority === -Infinity)
            .reduce((base, change) => base + change.value, modValue.base);
    }

    Handlebars.registerHelper('isBaseChange', (change: ChangeType) => {
        return PartsList.isBaseChange(change);
    });

    Handlebars.registerHelper('hasModifierChanges', (changes: ChangeType[]) => {
        return Array.isArray(changes) && changes.some(change => !PartsList.isBaseChange(change));
    });

    Handlebars.registerHelper('modifierCount', (changes: ChangeType[]) => {
        return getModifierChanges(changes).length;
    });

    Handlebars.registerHelper('modifierActiveCount', (changes: ChangeType[]) => {
        return getActiveModifierChanges(changes).length;
    });

    Handlebars.registerHelper('modifierNetTotal', (modValue: ModifiableValueType) => {
        const net = getDiffValueChange(modValue);
        return net > 0 ? `+${net}` : `${net}`;
    });

    Handlebars.registerHelper('modifierSummaryClass', (modValue: ModifiableValueType) => {
        const net = getDiffValueChange(modValue);
        if (net > 0) return 'positive';
        if (net < 0) return 'negative';
        return 'neutral';
    });

    Handlebars.registerHelper('modifierSummaryTooltip', (changes: ChangeType[]) => {
        const all = getModifierChanges(changes).length;
        const active = getActiveModifierChanges(changes).length;
        return `${active}/${all} Active Modifiers`;
    });

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
        const effect = fromUuidSync(change.effectUuid ?? '') as ActiveEffect | null;
        return effect?.description || '';
    });
}
