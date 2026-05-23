import { LinksHelpers } from '../utils/links';
import { ModifiableValue } from '../mods/ModifiableValue';
import { ModifiableValueType } from '../types/template/Base';
type ChangeType = ModifiableValueType['changes'][number];

/**
 * Helpers around handling handlebar display of ModifiableValue fields.
 */
export const registerModifierHelpers = () => {
    const getModifierChanges = (changes: ChangeType[] = []) => {
        if (!Array.isArray(changes)) return [];
        return changes.filter(change => !ModifiableValue.isBaseChange(change));
    };

    const getActiveModifierChanges = (changes: ChangeType[] = []) => {
        return getModifierChanges(changes).filter(change => change.enabled);
    };

    const getDiffValueChange = (modValue: ModifiableValueType) => {
        return modValue.value - modValue.changes
            .filter(change => ModifiableValue.isBaseChange(change))
            .reduce((base, change) => base + change.value, modValue.base);
    }

    const getChangeEffect = (change: ChangeType) => {
        if (!LinksHelpers.isUuid(change?.source)) return null;

        const effect = fromUuidSync(change.source) as unknown;
        if (!(effect instanceof ActiveEffect)) return null;

        return effect;
    }

    Handlebars.registerHelper('isBaseChange', (change: ChangeType) => {
        return ModifiableValue.isBaseChange(change);
    });

    Handlebars.registerHelper('hasModifierChanges', (changes: ChangeType[]) => {
        return Array.isArray(changes) && changes.some(change => !ModifiableValue.isBaseChange(change));
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
            case 5:
                return `➝ ${change.value}`;
            default:
                return `? ${change.value}`;
        }
    });

    Handlebars.registerHelper('getChangeCSS', (change: ChangeType) => {
        const cssClasses: string[] = [];
        if (!change.enabled) cssClasses.push('mod-change-disabled');
        if (change.invalidated) cssClasses.push('mod-change-invalidated');
        return cssClasses.join(' ');
    });

    Handlebars.registerHelper('getChangeEffectImage', (change: ChangeType) => {
        const effect = getChangeEffect(change);
        return effect?.img ?? '';
    });

    Handlebars.registerHelper('getChangeDescription', (change: ChangeType) => {
        const effect = getChangeEffect(change);
        if (!effect && LinksHelpers.isPDF(change.source))
            return change.source;

        return effect?.description || '';
    });
}
