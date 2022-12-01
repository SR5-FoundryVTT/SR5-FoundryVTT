import { SituationModifier, SituationModifierCategory } from './SituationModifier';
import NoiseModifiersSourceData = Shadowrun.NoiseModifiersSourceData;
import NoiseModifiersData = Shadowrun.NoiseModifiersData;

/**
 * Rules application of situation modifieres for matrix.
 */
export class NoiseModifier extends SituationModifier {
    source: NoiseModifiersSourceData
    applied: NoiseModifiersData
    category: SituationModifierCategory = 'noise'

    /**
     * Calculate the modifier from the selected noise level.
     * 
     * Noise level is positive, while the positive value left is to be applied
     * as a negative modifier.
     * 
     * SR5#230 Noise
     */
    get total(): number {
        return Math.max(this.applied.total, 0) * -1;
    }
}