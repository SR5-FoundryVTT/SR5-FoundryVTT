import { SR5Actor } from "../../actor/SR5Actor";
import { FormDialog, FormDialogData } from "./FormDialog";
import {SuccessTest} from "../../tests/SuccessTest";
import {CORE_FLAGS, CORE_NAME} from "../../constants";


/**
 * TODO: Add TestDialog JSDoc
 */
export class TestDialog extends FormDialog {
    constructor(actor: SR5Actor, test: SuccessTest, options?: ApplicationOptions) {
        const dialogData = TestDialog.getDialogData(actor, test);
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

    static getDialogData(actor: SR5Actor, test: SuccessTest): FormDialogData {
        // @ts-ignore
        const title = game.i18n.localize(test.constructor.label);
        const templatePath = 'systems/shadowrun5e/dist/templates/apps/dialogs/test-dialog.html';

        // roll mode handling.
        const rollMode = game.settings.get(CORE_NAME, CORE_FLAGS.RollMode);
        const rollModes = CONFIG.Dice.rollModes;

        const templateData = {
            test,
            actor,
            rollMode,
            rollModes
        };

        const buttons = {
            roll: {
                label: 'TODO: Roll'
            },
            cancel: {
                label: 'TODO: Cancel'
            }
        };

        const onAfterClose = (html) => console.error('After Close', html);

        return {
            title,
            templatePath,
            templateData,
            buttons,
            default: 'roll',
            onAfterClose
        }
    }
}