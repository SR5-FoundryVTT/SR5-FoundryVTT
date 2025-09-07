import { FLAGS } from '../constants';
import { CompendiaSettingFlow } from '@/module/settings/CompendiaSettingFlow';
import AbstractCompendiaSettings from '@/module/settings/AbstractCompendiaSettings';

/**
 * Render a list of selects for different use case compendia, allowing users to select which compendia they want to use
 * for each use case.
 */
export default class SR5CompendiaSettings extends AbstractCompendiaSettings {
    getPacks() {
        return [
            CompendiaSettingFlow.getPackSettingConfiguration(FLAGS.GeneralActionsPack),
            CompendiaSettingFlow.getPackSettingConfiguration(FLAGS.MatrixActionsPack),
            CompendiaSettingFlow.getPackSettingConfiguration(FLAGS.ICActionsPack),
        ];
    }

    override get title() {
        return game.i18n.localize('SR5.CompendiaSettings.Title');
    }
}
