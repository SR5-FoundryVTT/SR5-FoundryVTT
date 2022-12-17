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
}