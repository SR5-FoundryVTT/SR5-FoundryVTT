import { SR5Actor } from "../../actor/SR5Actor";
import { FormDialog, FormDialogData } from "./FormDialog";
import {SuccessTest} from "../../tests/SuccessTest";
import {CORE_FLAGS, CORE_NAME} from "../../constants";
import { PartsList } from "../../parts/PartsList";
import {DefaultValues} from "../../data/DataDefaults";


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
        const title = game.i18n.localize(test.title);
        const templatePath = 'systems/shadowrun5e/dist/templates/apps/dialogs/test-dialog.html';

        // roll mode handling.
        const rollMode = test.data.options?.rollMode;
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

            // Manual changes change everything, so replace all data sources to a static value.
            if (data.pool.value !== pool) {
                data.pool = DefaultValues.valueData({
                    base: pool,
                    label: data.pool.label
                });
            }
            if (data.threshold.value !== threshold) {
                data.threshold = DefaultValues.valueData({
                    base: threshold,
                    label: data.threshold.label
                });
            }
            if (data.limit.value !== limit) {
                data.limit = DefaultValues.valueData({
                    base: limit,
                    label: data.limit.label
                })
            }

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