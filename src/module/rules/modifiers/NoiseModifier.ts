import { SituationModifier } from './SituationModifier';
import NoiseModifiersSourceData = Shadowrun.NoiseModifiersSourceData;
import NoiseModifiersData = Shadowrun.NoiseModifiersData;

/**
 * Rules application of situation modifieres for matrix.
 */
export class NoiseModifier extends SituationModifier {
    source: NoiseModifiersSourceData
    applied: NoiseModifiersData
    type: Shadowrun.SituationModifierType = 'noise'
}