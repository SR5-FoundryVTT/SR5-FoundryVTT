import {FormDialog, FormDialogData} from "./FormDialog";
import DamageData = Shadowrun.DamageData;
import ActorArmorData = Shadowrun.ActorArmorData;
import {SR5Actor} from "../../actor/SR5Actor";

export type DamageAndSoakPerActor = {
    actor: SR5Actor;
    modified: DamageData;
    armor: ActorArmorData;
    perception?: string;
    hotsim?: boolean;
}

export class DamageApplicationDialog extends FormDialog {

    constructor(damagePerActor : DamageAndSoakPerActor[], damage: DamageData, options?: Application.Options) {

        const dialogData = DamageApplicationDialog.getDialogData(damagePerActor, damage);
        super(dialogData, options);
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'damage-application';
        // TODO: Class Dialog here is needed for dialog button styling.
        options.classes = ['sr5', 'form-dialog'];
        options.resizable = true;
        options.height = 'auto';
        return options; 
    }

    static getDialogData(damagePerActor : DamageAndSoakPerActor[], damage: DamageData): FormDialogData {
        const title = game.i18n.localize('SR5.DamageApplication.Title');
        const templatePath = 'systems/shadowrun5e/dist/templates/apps/dialogs/damage-application.html';

        const actorDamage : any = damagePerActor;

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
        }
    }
}