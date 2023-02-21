import { SituationModifier } from './SituationModifier';
import BackgroundCountModifiersSourceData = Shadowrun.BackgroundCountModifiersSourceData;
import BackgroundCountModifiersData = Shadowrun.BackgroundCountModifiersData;

/**
 * Rules application of situation modifieres for magic.
 */
export class BackgroundCountModifier extends SituationModifier {
    source: BackgroundCountModifiersSourceData
    applied: BackgroundCountModifiersData
    type: Shadowrun.SituationModifierType = 'background_count';
}