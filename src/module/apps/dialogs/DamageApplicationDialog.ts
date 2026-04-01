import { PromptDialogData, PromptDialog } from './PromptDialog';
import {SR5Actor} from "../../actor/SR5Actor";
import { DamageType } from "src/module/types/item/Action";
import { SR5Item } from "@/module/item/SR5Item";
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';

export class DamageApplicationDialog extends PromptDialog {

    constructor(targets: (SR5Actor | SR5Item)[], damage: DamageType, options?) {
        const dialogData = DamageApplicationDialog.getDialogData(targets, damage);
        super(dialogData, options);
    }

    static override DEFAULT_OPTIONS = {
        ...PromptDialog.DEFAULT_OPTIONS,
        id: 'damage-application',
        classes: [SR5_APPV2_CSS_CLASS, 'sr5', 'form-dialog'],
        window: {
            resizable: true,
        },
        position: {
            width: 560,
            height: 'auto' as const,
        },
    }

    static getDialogData(targets: (SR5Actor | SR5Item)[], damage: DamageType): PromptDialogData {
        const title = game.i18n.localize('SR5.DamageApplication.Title');
        const templatePath = 'systems/shadowrun5e/dist/templates/apps/dialogs/damage-application.hbs';

        // Restructure to allow template to differentiate between documents for token img/name usage.
        const targetsData = targets.map(target => ({target, isActor: target instanceof SR5Actor}));
        const templateData = {
            damage,
            targetsData,
        };

        const buttons = {
            damage: {
                label: game.i18n.localize('SR5.DamageApplication.ApplyDamage')
            }
        }

        const onAfterClose = () => targets;

        return {
            title,
            templatePath,
            templateData,
            onAfterClose,
            buttons,
            default: 'damage'
        };
    }
}