import { FLAGS } from '../constants';
import { CompendiaSettingFlow, PackConfigOrSeparator } from '@/module/settings/CompendiaSettingFlow';
import AbstractCompendiaSettings from '@/module/settings/AbstractCompendiaSettings';

/**
 * Render a list of selects for different use case compendia, allowing users to select which compendia they want to use
 * for each use case.
 * 
 * TODO: This uses a flat list with separators and packs. Instead we could utilize the fieldset structure of FoundryVTT settings to group packs.
 */
export default class SR5CompendiaSettings extends AbstractCompendiaSettings {
    getPacks(): PackConfigOrSeparator[] {
        return [
            { separator: true as const, label: 'SR5.CompendiaSettings.ActionsPacksSection' as const },
            CompendiaSettingFlow.getPackSettingConfiguration(FLAGS.GeneralActionsPack),
            CompendiaSettingFlow.getPackSettingConfiguration(FLAGS.MatrixActionsPack),
            CompendiaSettingFlow.getPackSettingConfiguration(FLAGS.ICActionsPack),
            { separator: true as const, label: 'SR5.CompendiaSettings.SkillsPacksSection' as const },
            CompendiaSettingFlow.getPackSettingConfiguration(FLAGS.SkillsPack),
            CompendiaSettingFlow.getPackSettingConfiguration(FLAGS.SkillGroupsPack),
            CompendiaSettingFlow.getPackSettingConfiguration(FLAGS.SkillSetsPack),
        ];
    }

    override get title() {
        return game.i18n.localize('SR5.CompendiaSettings.Title');
    }
}
