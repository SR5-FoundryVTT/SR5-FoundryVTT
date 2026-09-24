import { SR } from '../../constants';
import { SituationModifier, SituationalModifierApplyOptions } from './SituationModifier';
import type { RegionalPhysicalEnvironment } from '@/module/vision/environmentalRegions/EnvironmentalRegionFlow';
import EnvironmentalModifierLevels = Shadowrun.EnvironmentalModifierLevels;
import EnvironmentalModifiersSourceData = Shadowrun.EnvironmentalModifiersSourceData;
import EnvironmentalModifiersData = Shadowrun.EnvironmentalModifiersData;

/**
 * Rules application of situation modifiers for environmental conditions.
 */
export class EnvironmentalModifier extends SituationModifier {
    declare source: EnvironmentalModifiersSourceData
    declare applied: EnvironmentalModifiersData
    override type: Shadowrun.SituationModifierType = 'environmental';

    get levels(): EnvironmentalModifierLevels {
        return SR.combat.environmental.levels;
    }

    override _applyRegionalModifiers(options: SituationalModifierApplyOptions): void {
        const regional = this.modifiers?.regional.physical;
        if (!regional) return;

        const applicable = options.applicable?.length ? new Set(options.applicable) : null;
        const categories = Object.entries(regional) as [keyof RegionalPhysicalEnvironment, number][];
        for (const [category, regionValue] of categories) {
            if (applicable && !applicable.has(category)) continue;
            if (regionValue >= this.levels.good) continue;
            this.applied.active[category] = Math.min(this.applied.active[category] ?? this.levels.good, regionValue);
        }
    }

    /**
     * Apply rules for environmental modifier selection to calculate a total modifier value.
     *
     * Only the most severe condition counts. Two or more conditions tied for most severe bump it up a row.
     *
     * SR5#173 'Environmental Modifiers'
     */
    override _calcActiveTotal(): number {
        // A fixed value selection overrides other selections.
        const { value: fixed, light, glare, ...others } = this.applied.active;
        if (fixed) return fixed;

        // Light and glare share a single column (SR5#175), so only the worse of both counts.
        const conditions = [...Object.values(others), Math.min(light || 0, glare || 0)];

        // Rows of the environmental modifiers table, from good to extreme.
        const rows = Object.values(this.levels);
        // Should a condition miss a level, ignore it and fail gracefully.
        const levels = conditions.filter(condition => rows.includes(condition));

        const { good } = this.levels;
        const worst = Math.min(good, ...levels);
        const count = levels.filter(level => level === worst).length;
        if (worst === good || count < 2) return worst;
        return rows[Math.min(rows.indexOf(worst) + 1, rows.length - 1)];
    }

    /**
     * A selection inherited from a parent document, like the scene, can't be removed on this document.
     * Override it with a good condition instead.
     */
    override setInactive(modifier: string): void {
        if (this.source.active[modifier] !== this.applied.active[modifier]) this.setActive(modifier, 0);
        else super.setInactive(modifier);
    }
}
