import {FormDialog, FormDialogData, FormDialogOptions} from "./FormDialog";
import {SuccessTest} from "../../tests/SuccessTest";
import { SuccessTestData } from './../../tests/SuccessTest';
import {SR5} from "../../config";
import {Helpers} from "../../helpers";


export interface TestDialogData extends FormDialogData {
    test: SuccessTest
    rollMode: string
    rollModes: CONFIG.Dice.RollModes
    config: typeof SR5
}

/**
 * TODO: Add TestDialog JSDoc
 */
export class TestDialog extends FormDialog {
    data: TestDialogData

    // @ts-ignore // TODO: default option value with all the values...
    constructor(data, options?: FormDialogOptions = {}) {
        // Allow for Sheet style form submit value handling.
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
        // @ts-ignore
        options.width = 'auto';
        return options;
    }

    activateListeners(html: JQuery) {
        super.activateListeners(html);

        // Handle in-dialog entity links to render the respective sheets.
        html.find('.entity-link').on('click', Helpers.renderEntityLinkSheet)
    }

    /**
     * Overwrite this method to provide an alternative template for the dialog inner content.
     *
     * data.templatePath work's the same and can be used as well.
     */
    get templateContent(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/success-test-dialog.html';
    }

    getData() {
        const data = super.getData() as unknown as TestDialogData;

        //@ts-ignore //TODO: default to general roll mode user setting
        data.rollMode = data.test.data.options?.rollMode;
        data.rollModes = CONFIG.Dice.rollModes;
        data.default = 'roll';

        // Add in general SR5 config to allow access to general values.
        data.config = SR5;

        return data;
    }

    /**
     * Overwrite this method to provide the dialog application title.
     */
    get title() {
        const data = this.data as unknown as TestDialogData;
        return game.i18n.localize(data.test.title);
    }

    /**
     * Overwrite this method to provide dialog buttons.
     */
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

    /**
     * Callback for after the dialoge has closed.
     * @param html
     */
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
        // The user canceled their interaction by cancenling, don't apply form changes.
        if (this.selectedButton === 'cancel') return;

        // First, apply changes to ValueField style values in a way that makes sense.
        Object.entries(data).forEach(([key, value]) => {
            // key is expected to be relative from TestDialog.data and begin with 'test'
            // @ts-ignore
            const valueField = foundry.utils.getProperty(this.data, key);
            if (foundry.utils.getType(valueField) !== 'Object' || !valueField.hasOwnProperty('mod')) return;

            // Remove from further automatic data merging.
            delete data[key]

            // Don't apply an unneeded override.
            if (valueField.value === value) return;

            if (value === null || value === '')
                delete valueField.override
            else
                valueField.override = {name: 'SR5.ManualOverride', value: Number(value)};
        });

        // Second, apply generic values.
        // @ts-ignore
        foundry.utils.mergeObject(this.data, data);

        // Give tests opportunity to change resulting values on the fly.
        this.data.test.prepareBaseValues();
        this.data.test.calculateBaseValues();
    }
}