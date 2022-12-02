import { SituationModifier, SituationModifierCategory } from './SituationModifier';
import BackgroundCountModifiersSourceData = Shadowrun.BackgroundCountModifiersSourceData;
import BackgroundCountModifiersData = Shadowrun.BackgroundCountModifiersData;

/**
 * Rules application of situation modifieres for magic.
 */
export class BackgroundCountModifier extends SituationModifier {
    source: BackgroundCountModifiersSourceData
    applied: BackgroundCountModifiersData
    category: SituationModifierCategory = 'background_count';

    /**
     * Calculate the modifier from the selected background count level.
     * 
     * Background count level is positive, while the positive value left is to be applied
     * as a negative modifier.
     * 
     */
    get total(): number {
        return Math.max(this.applied.total, 0) * -1;
    }
}