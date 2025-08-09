import { SituationModifier } from './SituationModifier';
import BackgroundCountModifiersSourceData = Shadowrun.BackgroundCountModifiersSourceData;
import BackgroundCountModifiersData = Shadowrun.BackgroundCountModifiersData;

/**
 * Rules application of situation modifieres for magic.
 */
export class BackgroundCountModifier extends SituationModifier {
    declare source: BackgroundCountModifiersSourceData
    declare applied: BackgroundCountModifiersData
    override type: Shadowrun.SituationModifierType = 'background_count';
}
