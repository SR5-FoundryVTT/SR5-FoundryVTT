import {FormDialog, FormDialogData} from "./FormDialog";
import {SR5Actor} from "../../actor/SR5Actor";
import { DamageType } from "src/module/types/item/Action";

export class DamageApplicationDialog extends FormDialog {

    constructor(actors : SR5Actor[], damage: DamageType, options?) {
        const dialogData = DamageApplicationDialog.getDialogData(actors, damage);
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

    static getDialogData(actors : SR5Actor[], damage: DamageType): FormDialogData {
        const title = game.i18n.localize('SR5.DamageApplication.Title');
        const templatePath = 'systems/shadowrun5e/dist/templates/apps/dialogs/damage-application.hbs';

        // Simplify / refactor this
        const actorDamage : any = actors.map(a => { return {actor:a} }) ;
        const templateData = {
            damage,
            actorDamage,
        };

        const buttons = {
            damage: {
                label: game.i18n.localize('SR5.DamageApplication.ApplyDamage')
            }
        }

        const onAfterClose = () => actorDamage;

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