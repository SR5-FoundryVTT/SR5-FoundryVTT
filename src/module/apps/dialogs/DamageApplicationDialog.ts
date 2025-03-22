import {FormDialog, FormDialogData} from "./FormDialog";
import DamageData = Shadowrun.DamageData;
import {SR5Actor} from "../../actor/SR5Actor";
import { SR5Item } from "../../item/SR5Item";

export class DamageApplicationDialog extends FormDialog {

    constructor(targets : (SR5Actor|SR5Item)[], damage: DamageData, options?) {
        const dialogData = DamageApplicationDialog.getDialogData(targets, damage);
        super(dialogData, options);
    }

    static override get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'damage-application';
        // TODO: Class Dialog here is needed for dialog button styling.
        options.classes = ['sr5', 'form-dialog'];
        options.resizable = true;
        options.height = 'auto';
        return options; 
    }

    static getDialogData(targets : (SR5Actor|SR5Item)[], damage: DamageData): FormDialogData {
        const title = game.i18n.localize('SR5.DamageApplication.Title');
        const templatePath = 'systems/shadowrun5e/dist/templates/apps/dialogs/damage-application.html';

        // Restructure to allow template to differentiate between documents for token img/name usage.
        const targetsData = targets.map(target => ({target, isActor: target instanceof SR5Actor}));

        const templateData = {
            damage,
            targetsData
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
        } as unknown as FormDialogData;
    }
}