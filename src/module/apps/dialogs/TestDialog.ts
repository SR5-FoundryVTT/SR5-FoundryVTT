import { SR5Actor } from "../../actor/SR5Actor";
import { FormDialog, FormDialogData } from "./FormDialog";
import {SuccessTest} from "../../tests/SuccessTest";
import {CORE_FLAGS, CORE_NAME} from "../../constants";


/**
 * TODO: Add TestDialog JSDoc
 */
export class TestDialog extends FormDialog {
    constructor(test: SuccessTest, options?: ApplicationOptions) {
        const dialogData = TestDialog.getDialogData(test);
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

    static getDialogData(test: SuccessTest): FormDialogData {
        // @ts-ignore
        const title = game.i18n.localize(test.constructor.label);
        const templatePath = 'systems/shadowrun5e/dist/templates/apps/dialogs/test-dialog.html';

        // roll mode handling.
        const rollMode = game.settings.get(CORE_NAME, CORE_FLAGS.RollMode);
        const rollModes = CONFIG.Dice.rollModes;

        const templateData = {
            test,
            rollMode,
            rollModes
        };

        const buttons = {
            roll: {
                label: game.i18n.localize('SR5.Roll'),
                icon: '<i class="fas fa-dice-six"></i>'
            },
            cancel: {
                label: game.i18n.localize('SR5.Dialogs.Common.Cancel')
            }
        };

        const onAfterClose = (html) => {
            const pool = Number(html.find('input[name=pool]').val());
            const threshold = Number(html.find('input[name=threshold]').val());
            const limit = Number(html.find('input[name=limit]').val());

            const data = duplicate(test.data);
            data.pool.base = pool;
            data.threshold.base = threshold;
            data.limit.base = limit;

            console.warn('Test After Dialog', test.data);

            return data;
        };

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