import {FormDialog, FormDialogData, FormDialogOptions} from "./FormDialog";
import {SuccessTest} from "../../tests/SuccessTest";
import { PartsList } from "../../parts/PartsList";
import { SuccessTestData } from './../../tests/SuccessTest';


export interface TestDialogData extends FormDialogData {
    test: SuccessTest
    rollMode: string
    rollModes: CONFIG.Dice.RollModes
}

/**
 * TODO: Add TestDialog JSDoc
 */
export class TestDialog extends FormDialog {
    data: TestDialogData
    
    // @ts-ignore // TODO: default option value with all the values...
    constructor(data, options?: FormDialogOptions = {}) {
        
        options.applyFormChangesOnSubmit = true;
        super(data, options);
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'test-dialog';
        // TODO: Class Dialog here is needed for dialog button styling.
        options.classes = ['sr5', 'form-dialog'];
        options.resizable = true;
        options.height = 'auto';
        return options;
    }

    get templateContent(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/test-dialog.html';
    }

    getData() {
        const data = super.getData() as unknown as TestDialogData;
        
        //@ts-ignore //TODO: default to general roll mode user setting
        data.rollMode = data.test.data.options?.rollMode;
        data.rollModes = CONFIG.Dice.rollModes;
        data.default = 'roll';

        return data;
    }

    get title() {
        const data = this.data as unknown as TestDialogData;
        return game.i18n.localize(data.test.title);
    }

    static getDialogData(test: SuccessTest) {
        console.error('TODO: Remove this method')
        // roll mode handling.
        // const rollMode = test.data.options?.rollMode;
        // const rollModes = CONFIG.Dice.rollModes;

        // const templateData = {
        //     test,
        //     rollMode,
        //     rollModes
        // };

        

        const onAfterClose = (html) => {
            return test.data;
        };

        return {
            onAfterClose
        }
    }

    get buttons() {
        return {
            roll: {
                label: game.i18n.localize('SR5.Roll'),
                icon: '<i class="fas fa-dice-six"></i>'
            },
            cancel: {
                label: game.i18n.localize('SR5.Dialogs.Common.Cancel')
            }
        };
    }

    onAfterClose(html: JQuery<HTMLElement>): SuccessTestData {
        return this.data.test.data;
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
            const valueField = foundry.utils.getProperty(this.data, key);
            if (foundry.utils.getType(valueField) !== 'Object' || !valueField.hasOwnProperty('mod')) return;

            // This data point will be manually handled.
            delete data[key]

            // No changes been made from default calculation.
            if (valueField.value === value) return;

            // Override calculation path but keep parts, as to keep the original test code (Automatics + Agility)
            const valueType = foundry.utils.getType(value);

            // Determine correct 'no value' value to be used.
            let zeroValue: any;
            switch (valueType) {
                case "boolean":
                    zeroValue = false;
                    break;
                default:
                    zeroValue = 0;
            }

            // Reset calculation while keeping all values for transparency.
            valueField.base = zeroValue;
            valueField.mod = valueField.mod.map(mod => {
                mod.value = zeroValue;
                return mod;
            });
            // Adding the manual override as only value.
            valueField.mod = PartsList.AddUniquePart(valueField.mod, 'SR5.ManualOverride', value);
        });

        // Second, apply generic values.
        // @ts-ignore
        foundry.utils.mergeObject(this.data, data)
    }
}