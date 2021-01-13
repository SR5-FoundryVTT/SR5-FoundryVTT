import {FormDialog, FormDialogData} from "./FormDialog";
import DamageData = Shadowrun.DamageData;
import {SR5Actor} from "../../actor/SR5Actor";

export class DamageApplicationDialog extends FormDialog {
    constructor(actors: SR5Actor[], damage: DamageData, options?: ApplicationOptions) {
        const dialogData = DamageApplicationDialog.getDialogData(actors, damage);
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

    // TODO: check if 'getData' is what this is...
    static getDialogData(actors: SR5Actor[], damage: DamageData): FormDialogData {
        const title = game.i18n.localize('SR5.DamageApplication.Title');
        const templatePath = 'systems/shadowrun5e/dist/templates/apps/dialogs/damage-application.html';

        // Possibly modify damage type for each actor due to armor, to increase transparency.
        const actorDamage = actors.map(actor => {
            return {
                actor,
                // Don't change damage type for grunt to avoid confusing user.
                modified: actor._applyDamageTypeChangeForArmor(damage),
                armor: actor.getModifiedArmor(damage)
            }
        });

        const templateData = {
            damage,
            actorDamage,
        };

        const buttons = {
            damage: {
                label: game.i18n.localize('SR5.DamageApplication.ApplyDamage')
            },
            unmodifiedDamage: {
                label: game.i18n.localize('SR5.DamageApplication.ApplyUnmodifiedDamage')
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