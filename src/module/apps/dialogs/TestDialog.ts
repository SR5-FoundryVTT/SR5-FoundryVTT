import { SR5 } from "../../config";
import { Helpers } from "../../helpers";
import { Translation } from '../../utils/strings';
import { ModifiableValueType } from "src/module/types/template/Base";
import { SuccessTest, SuccessTestData } from "../../tests/SuccessTest";
import { FormDialog, FormDialogData, FormDialogOptions } from "./FormDialog";

export interface TestDialogData extends FormDialogData {
    test: SuccessTest
    rollMode: string
    rollModes: CONFIG.Dice.RollModes
    config: typeof SR5
}

/**
 * A way of allowing tests to inject handlers without having to sub-class the whole dialog
 */
export interface TestDialogListener {
    query: string
    on: string
    callback: (event: any, dialog: TestDialog) => void
}

/**
 * TODO: Add TestDialog JSDoc
 */
export class TestDialog extends FormDialog {
    declare data: TestDialogData
    // Listeners as given by the dialogs creator.
    listeners: TestDialogListener[]

    // @ts-expect-error // TODO: default option value with all the values...
    constructor(data, options: FormDialogOptions = {}, listeners: TestDialogListener[]=[]) {
        // Allow for Sheet style form submit value handling.
        options.applyFormChangesOnSubmit = true;
        super(data, options);

        this.listeners = listeners;
    }

    static override get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'test-dialog';
        // TODO: Class Dialog here is needed for dialog button styling.
        options.classes = ['sr5', 'form-dialog'];
        options.resizable = true;
        options.height = 'auto';
        // @ts-expect-error
        options.width = 'auto';
        return options;
    }

    override activateListeners(html: JQuery) {
        super.activateListeners(html);

        this._injectExternalActiveListeners(html);
    }

    /**
     * Inject the listeners while binding local `this` to them.
     */
    _injectExternalActiveListeners(html: JQuery) {
        for (const listener of this.listeners) {
            //@ts-expect-error
            html.find(listener.query).on(listener.on, (event: JQuery<HTMLElement>) => listener.callback.bind(this.data.test)(event, this));
        }
    }

    /**
     * Overwrite this method to provide an alternative template for the dialog inner content.
     *
     * data.templatePath work's the same and can be used as well.
     */
    override get templateContent(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/success-test-dialog.hbs';
    }

    //@ts-expect-error
    getData() {
        const data = super.getData() as unknown as TestDialogData;

        //@ts-expect-error //TODO: default to general roll mode user setting
        data.rollMode = data.test.data.options?.rollMode;
        data.rollModes = CONFIG.Dice.rollModes;
        data.default = 'roll'; // TODO: Where is this even used and what's it for again?

        // Add in general SR5 config to allow access to general values.
        data.config = SR5;

        return data;
    }

    /**
     * Overwrite this method to provide the dialog application title.
     */
    override get title() {
        const data = this.data as unknown as TestDialogData;
        return game.i18n.localize(data.test.title as Translation);
    }

    /**
     * Overwrite this method to provide dialog buttons.
     */
    override get buttons() {
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
     * Callback for after the dialog has closed.
     * @param html
     */
    override async onAfterClose(html: JQuery<HTMLElement>, buttonSelected?: string): Promise<SuccessTestData> {
        return Promise.resolve(this.data.test.data);
    }

    /**
     * Update ValueField data used on the template and alter automatic calculation with manual override values, where
     * necessary.
     *
     * @param data An object with keys in Foundry UpdateData style {'key.key.key': value}
     */
    override _updateData(data) {
        // The user canceled their interaction by canceling, don't apply form changes.
        if (this.selectedButton === 'cancel') return;

        // First, apply changes to ValueField style values in a way that makes sense.
        Object.entries(data).forEach(([key, value]) => {
            // key is expected to be relative from TestDialog.data and begin with 'test'
            const valueField = foundry.utils.getProperty(this.data, key) as ModifiableValueType | undefined | null;
            if (!valueField || foundry.utils.getType(valueField) !== 'Object' || !valueField.hasOwnProperty('mod')) return;

            // Remove from further automatic data merging.
            delete data[key]

            // Don't apply an unneeded override.
            if (valueField.value === value) return;

            if (value === null || value === '')
                // @ts-expect-error fvtt-types don't know about the null somehow
                valueField.override = null;
            else
                valueField.override = { name: 'SR5.ManualOverride', value: Number(value), min: false, max: false };
        });

        // Second, apply generic values.
        foundry.utils.mergeObject(this.data, data);

        // Give tests opportunity to change resulting values on the fly.
        this.data.test.prepareBaseValues();
        this.data.test.calculateBaseValues();
        this.data.test.validateBaseValues();
    }
}