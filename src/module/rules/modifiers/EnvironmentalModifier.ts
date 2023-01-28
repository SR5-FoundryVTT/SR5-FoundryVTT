import { SR } from '../../constants';
import { SituationModifier, SituationModifierCategory } from './SituationModifier';
import EnvironmentalModifierLevels = Shadowrun.EnvironmentalModifierLevels;
import EnvironmentalModifiersSourceData = Shadowrun.EnvironmentalModifiersSourceData;
import EnvironmentalModifiersData = Shadowrun.EnvironmentalModifiersData;

/**
  * Rules application of situation modifieres for matrix.
 */
export class EnvironmentalModifier extends SituationModifier {
    source: EnvironmentalModifiersSourceData
    applied: EnvironmentalModifiersData
    category: SituationModifierCategory = 'environmental';

    
    get levels(): EnvironmentalModifierLevels {
        return SR.combat.environmental.levels;
    }

    /**
     * How many selectios / modifiers are active per level of enviornmental modifiers.
     * 
     * A level would be light and fitting modifiers would be 'Light Rain', 'Light Winds' or Medium Range.
     * 
     * @param values Active modifier values to be matched to level values
     * @returns A count per level of modifiers on that level
     */
    activeLevels(values: Number[]): Record<string, number> {
        return {
            light: values.reduce((count: number, value: number) => (value === this.levels.light ? count + 1 : count), 0) as number,
            moderate: values.reduce((count: number, value: number) => (value === this.levels.moderate ? count + 1 : count), 0) as number,
            heavy: values.reduce((count: number, value: number) => (value === this.levels.heavy ? count + 1 : count), 0) as number,
            extreme: values.reduce((count: number, value: number) => (value === this.levels.extreme ? count + 1 : count), 0) as number
        }
    }

    /**
     * Apply rules for environmental modifier selection to calculate a total modifier value.
     * 
     * SR5#173 'Environmental Modifiers'
     */
    _calcActiveTotal(): number {
        // A fixed value selection overrides other selections.
        if (this.applied.active.value)
            return this.applied.active.value;

        // Calculation based on active modifier categories, excluding manual overwrite.
        const activeCategories = Object.entries(this.applied.active);
        // Should an active category miss a level set, ignore and fail gracefully.
        const activeValues = activeCategories.map(([category, level]) => level ? level : 0);
        // Calculate the amout of categor
        const count = this.activeLevels(activeValues);

        if (count.extreme > 0 || count.heavy >= 2) {
            return this.levels.extreme;
        }
        else if (count.heavy === 1 || count.moderate >= 2) {
            return this.levels.heavy;
        }
        else if (count.moderate === 1 || count.light >= 2) {
            return this.levels.moderate;
        }
        else if (count.light === 1) {
            return this.levels.light;
        } 

        return this.levels.good;
    }

    setInactive(modifier: string): void {
        if (this.source.active[modifier] !== this.applied.active[modifier]) this.setActive(modifier, 0);
        else delete this.source.active[modifier];
    }
}