import { SR5Actor } from "../../actor/SR5Actor";
import {FormDialog, FormDialogData, FormDialogOptions} from "./FormDialog";
import {SuccessTest} from "../../tests/SuccessTest";
import {CORE_FLAGS, CORE_NAME} from "../../constants";
import { PartsList } from "../../parts/PartsList";
import {DefaultValues} from "../../data/DataDefaults";


/**
 * TODO: Add TestDialog JSDoc
 */
export class TestDialog extends FormDialog {
    // @ts-ignore // TODO: default option value with all the values...
    constructor(test: SuccessTest, options?: FormDialogOptions = {}) {
        const dialogData = TestDialog.getDialogData(test);
        options.applyFormChangesOnSubmit = true;
        super(dialogData, options);
    }

    static get template(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/test-dialog.html';
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
        const templatePath = this.template;
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
            // const rollMode = html.find('input#rollMode').val();
            // if (test.data.options?.rollMode !== rollMode) { // @ts-ignore
            //     test.data.options.rollMode = rollMode;
            // }
            // const pool = Number(html.find('input[name=pool]').val());
            // const threshold = Number(html.find('input[name=threshold]').val());
            // const limit = Number(html.find('input[name=limit]').val());
            // const pushTheLimit = html.find('input[name=pushTheLimit]').is(':checked');
            //
            // const data = duplicate(test.data);
            //
            // // Manual changes change everything, so replace all data sources to a static value.
            // if (data.pool.value !== pool) {
            //     data.pool = DefaultValues.valueData({
            //         base: pool,
            //         label: data.pool.label
            //     });
            // }
            // if (data.threshold.value !== threshold) {
            //     data.threshold = DefaultValues.valueData({
            //         base: threshold,
            //         label: data.threshold.label
            //     });
            // }
            // if (data.limit.value !== limit) {
            //     data.limit = DefaultValues.valueData({
            //         base: limit,
            //         label: data.limit.label
            //     })
            // }
            // if (data.values.pushTheLimit.base !== pushTheLimit) {
            //     data.values.pushTheLimit.base = pushTheLimit;
            //     data.values.pushTheLimit.value = pushTheLimit;
            //
            // }

            return test.data;
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

    /**
     * Update ValueField data used on the template and alter automatic calculation with manual override values, where
     * necessary.
     *
     * @param data An object with keys in Foundry UpdateData style {'key.key.key': value}
     */
    _updateData(data) {
        // First, apply changes to ValueField style values in a way that makes sense.
        Object.entries(data).forEach(([key, value]) => {
            // @ts-ignore
            const valueField = foundry.utils.getProperty(this.data.templateData, key);
            if (!valueField) return console.error('Shadowrun 5e | TestDialog modified a value not existent on test', key, this.data);
            if (foundry.utils.getType(valueField) !== 'Object' || !valueField.hasOwnProperty('mod')) return;

            // This data point will be manually handled.
            delete data[key]

            // No changes been made from default calculation.
            if (valueField.value === value) return;

            // Override calculation path but keep parts, as to keep the original test code (Automatics + Agility)
            valueField.base = 0;
            valueField.mod = valueField.mod.map(mod => {
                mod.value = 0;
                return mod;
            });
            valueField.mod = PartsList.AddUniquePart(valueField.mod, 'SR5.ManualOverride', value);
        });

        // Second, apply generic values.
        // @ts-ignore
        foundry.utils.mergeObject(this.data.templateData, data)
    }
}