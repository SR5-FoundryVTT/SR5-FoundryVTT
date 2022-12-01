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
     _calcActiveTotal(): number {
        const levelTotal = super._calcActiveTotal();
        return Math.max(levelTotal, 0) * -1;
    }
}