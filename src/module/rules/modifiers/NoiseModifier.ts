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
}