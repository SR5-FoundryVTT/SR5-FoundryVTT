import { SituationModifier } from './SituationModifier';
import NoiseModifiersSourceData = Shadowrun.NoiseModifiersSourceData;
import NoiseModifiersData = Shadowrun.NoiseModifiersData;

/**
 * Rules application of situation modifieres for matrix.
 */
export class NoiseModifier extends SituationModifier {
    override source: NoiseModifiersSourceData
    override applied: NoiseModifiersData
    override type: Shadowrun.SituationModifierType = 'noise'
}
