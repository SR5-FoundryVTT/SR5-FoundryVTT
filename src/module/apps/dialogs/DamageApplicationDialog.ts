import {FormDialog, FormDialogData} from "./FormDialog";
import DamageData = Shadowrun.DamageData;
import {SR5Actor} from "../../actor/SR5Actor";

export class DamageApplicationDialog extends FormDialog {

    constructor(actors: SR5Actor[], damage: DamageData, options?: ApplicationOptions) {

        const dialogData = DamageApplicationDialog.getDialogData(actors, damage);
        super(dialogData, options);
    }

    // TODO: check if 'getData' is what this is...
    static getDialogData(actors: SR5Actor[], damage: DamageData): FormDialogData {
        const title = game.i18n.localize('SR5.DamageApplication.Title');
        const templatePath = 'systems/shadowrun5e/dist/templates/apps/dialogs/damage-application.html';

        // Possibly modify damage type for each actor due to armor, to increase transparency.
        const actorDamage = actors.map(actor => {
            return {
                actor,
                incoming: damage,
                damage: actor.applyDamageTypeChangeForArmor(damage),
                armor: actor.getArmor()
            }
        });

        const templateData = {
            damage,
            actorDamage,
        };

        const onAfterClose = () => actorDamage;
        const buttons = {
            damage: {
                label: game.i18n.localize('SR5.DamageApplication.Damage')
            }
        }

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