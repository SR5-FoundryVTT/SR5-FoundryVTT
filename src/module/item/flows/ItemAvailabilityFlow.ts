import { SR5 } from '@/module/config';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import { AvailabilityValueType } from '@/module/types/template/Technology';

export type AvailabilityRestriction = AvailabilityValueType['restriction'];

/**
 * Handling of automations around the items availability code.
 */
export const ItemAvailabilityFlow = {
    // Parsing always expects the fixed English R/F notation used by imported source data
    // (Chummer, book data), independent of the current UI language.
    restrictionFromSuffix(suffix: string) {
        if (!suffix) return 'none';
        if (suffix.trim().toUpperCase().endsWith('F')) return 'forbidden';
        return 'restricted';
    },

    // Composing a displayed value uses the localized abbreviation, as translators may
    // choose a different letter than the English R/F.
    suffixFromRestriction(restriction: AvailabilityRestriction): string {
        return game.i18n.localize(SR5.availabilityRestrictionSuffixes[restriction]);
    },

    /**
     * Separate an availability string into its parts.
     *
     * Examples: 12, 12R, 12F
     */
    parseAvailability(avail: string) {
        if (avail === '' || avail === '0')
            return { isValid: true, availability: 0, restriction: 'none' } as const;

        avail = avail.replace(/\([+-]\d{1,2}\)$/, '');

        const availParts = /^(\d+)(.*)$/.exec(avail);
        if (!availParts)
            return { isValid: false, availability: avail, restriction: 'none' } as const;

        return {
            isValid: true,
            availability: parseInt(availParts[1], 10),
            restriction: ItemAvailabilityFlow.restrictionFromSuffix(availParts[2]),
        } as const;
    },

    parseAvailabilityString(avail: string) {
        const parsed = ItemAvailabilityFlow.parseAvailability(avail);
        if (!parsed.isValid || typeof parsed.availability !== 'number') {
            return {
                base: 0,
                value: 0,
                restriction: 'none' as AvailabilityRestriction,
                label: avail,
            };
        }

        return {
            base: parsed.availability,
            value: parsed.availability,
            restriction: parsed.restriction,
            label: ItemAvailabilityFlow.composeValue(parsed.availability, parsed.restriction),
        };
    },

    composeValue(base: number, restriction: AvailabilityRestriction): string {
        return `${Math.ceil(base)}${ItemAvailabilityFlow.suffixFromRestriction(restriction)}`;
    },

    calculateValue(availability: AvailabilityValueType): string {
        ModifiableValue.calcTotal(availability, { min: 0 });

        const restriction = ItemAvailabilityFlow.normalizeRestriction(availability.restriction);
        availability.restriction = restriction;

        availability.label = ItemAvailabilityFlow.composeValue(availability.value, restriction);
        return availability.label;
    },

    normalizeRestriction(value: string): AvailabilityRestriction {
        return ['none', 'restricted', 'forbidden'].includes(value)
            ? value as AvailabilityRestriction
            : ItemAvailabilityFlow.restrictionFromSuffix(value);
    },
};
