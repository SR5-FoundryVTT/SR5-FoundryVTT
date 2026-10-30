import { SR } from '../../constants';
import { SituationModifier, SituationalModifierApplyOptions } from './SituationModifier';
import EnvironmentalModifierLevels = Shadowrun.EnvironmentalModifierLevels;
import EnvironmentalModifiersSourceData = Shadowrun.EnvironmentalModifiersSourceData;
import EnvironmentalModifiersData = Shadowrun.EnvironmentalModifiersData;

/**
 * Light and glare share a single column of the environmental modifiers table (SR5#175), which holds one
 * selection. Its kind only decides which compensation applies, like low-light for light or flare
 * compensation for glare. Each kind maps to the other one.
 */
const LIGHT_GLARE = { light: 'glare', glare: 'light' } as const;

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

        const { good } = this.levels;
        const applicable = options.applicable?.length ? new Set(options.applicable) : null;
        for (const category of ['visibility', 'wind'] as const) {
            const regionValue = regional[category];
            if (applicable && !applicable.has(category)) continue;
            if (regionValue >= good) continue;
            this.applied.active[category] = Math.min(this.applied.active[category] ?? good, regionValue);
        }

        // A region's light or glare replaces the selection in that column unless the selection is worse.
        const { light, glare } = regional;
        const kind = glare < good ? 'glare' : 'light';
        const regionValue = kind === 'glare' ? glare : light;
        if (regionValue >= good || (applicable && !applicable.has(kind))) return;
        const current = Math.min(this.applied.active.light ?? good, this.applied.active.glare ?? good);
        if (regionValue > current) return;
        this.applied.active[kind] = regionValue;
        this.applied.active[LIGHT_GLARE[kind]] = good;
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

        // Light and glare are one column, so only one can contribute a penalty.
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
     * Selecting light clears glare and the other way around, also over a parent document's selection.
     */
    override setActive(modifier: string, level: number): void {
        const other = LIGHT_GLARE[modifier];
        if (other) this.source.active[other] = this.levels.good;
        super.setActive(modifier, level);
    }

    override toggleSelection(modifier: string, value: number): void {
        if (modifier === 'light' && value === this.levels.good) {
            this.setActive(modifier, value);
            return;
        }
        super.toggleSelection(modifier, value);
    }

    /**
     * A selection inherited from a parent document, like the scene, can't be removed on this document.
     * Override it with a good condition instead. Light and glare are cleared together.
     */
    override setInactive(modifier: string): void {
        const other = LIGHT_GLARE[modifier];
        for (const key of other ? [modifier, other] : [modifier]) {
            if (this.source.active[key] !== this.applied.active[key]) this.source.active[key] = this.levels.good;
            else delete this.source.active[key];
        }
        this._updateDocumentSourceModifiers();
    }
}
