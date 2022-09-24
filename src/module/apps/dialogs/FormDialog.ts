export interface FormDialogData extends Dialog.Data{
	templateData: object;
	templatePath: string;
	onAfterClose?: Function;
}

export interface FormDialogOptions extends DialogOptions {
    // When true, will apply dialog form element inputs to this.data.
    applyFormChangesOnSubmit: boolean | null
}

/**
 * A FormDialog is the FormApplication equivalent for Dialogs.
 *
 * It will look for form elements and apply value changes to the local data property according to the name attribute
 * of the form element. This works the same as it does with general FoundryVTT Applications.
 */
export class FormDialog extends Dialog<FormDialogOptions> {
    selection: object;
    selectedButton: string;
    form: HTMLFormElement;

    _onAfterClose: Function;
    _selectionPromise: Promise<object>;
    _selectionResolve: Function;
    _selectionReject: Function;
    _templateData: object;
    _templatePath: string;

    constructor(data: FormDialogData, options?: FormDialogOptions) {
        // @ts-ignore
        super(data, options);

        const {templateData, templatePath} = data;
        this._templateData = templateData;
        this._templatePath = templatePath;

        this._onAfterClose = data.onAfterClose || this.onAfterClose;

        this.selection = this._emptySelection();

        this._selectionPromise = new Promise((resolve, reject) => {
            this._selectionResolve = resolve;
            // Reject is stored, but never used in favor of FormDialog.canceled
            this._selectionReject = reject;
        });
    }

    async close() {
        await super.close();

        if (this.canceled) {
            // Delay resolving the dialog promise to avoid Foundry calling this.element.remove(), removing all open dialogs.
            setTimeout(() => this._selectionResolve(this.selection), 250);
        }
    }

    activateListeners(html: JQuery) {
        super.activateListeners(html);

        html.on("change", "input,select,textarea", this._onChangeInput.bind(this));
    }


    async submit(button) {
        this.selectedButton = button.name ?? button.label;

        this.applyFormData();

        super.submit(button);
        // @ts-ignore
        await this.afterSubmit("jQuery" in this.options ? this.element : this.element [0]);
    }

    async afterSubmit(html: JQuery) {
        // Await in case of a possible async handler.
        this.selection = await this._onAfterClose(html, this.selectedButton);

        // Delay resolving the dialog promise to avoid Foundry calling this.element.remove(), removing all open dialogs.
        setTimeout(() => this._selectionResolve(this.selection), 250);
    }

    /**
     * Allow Foundry Sheet behaviour for dialogs with complex forms.
     * @returns
     */
    applyFormData() {
        //@ts-ignore // TODO: FormDialog class definition should override options,but doesn't.
        if (!this.options.applyFormChangesOnSubmit) return;

        if ( !this.form ) throw new Error(`The FormApplication subclass has no registered form element`);
        const fd = new FormDataExtended(this.form, {editors: {}});
        //@ts-ignore // TODO: foundry-vtt-types v10
        const data = fd.object;

        this._updateData(data);
    }

    _updateData(data) {
        //@ts-ignore // TODO: FormDialog.data typing is missing
        foundry.utils.mergeObject(this.data.templateData, data);
    }

    //@ts-ignore
    getData() {
        // Dialog.getData expects buttons to be set.
        this.data.buttons = this.data.buttons || this.buttons;
        this._amendButtonsWithName(this.data.buttons);

        // Call preconfigured Dialog.getData.
        const data = super.getData();

        // Merge default Dialog data with whatever's been given.
        return mergeObject(data, {
            ...this.data,
            content: ''
        });
    }

    /**
     * Dialog button object to be rendered underneath dialog content.
     * Follows Dialog.data.buttons typing.
     */
    get buttons() {
        return {}
    }

    /**
     * Template file to render the inner dialog content with.
     * Will be given FormDialog.data to render.
     */
    get templateContent(): string {
        return '';
    }

    async select(): Promise<any> {
        await this.render(true);

        if (this._selectionPromise === undefined || this.selection === undefined) {
            return this._emptySelection();
        }
        return await this._selectionPromise;
    }

    _emptySelection(): object {
        return {};
    }

    /** Dialog has been confirmed and something has been selected.
     */
    get selected(): boolean {
        return !this.canceled;
    }

    /** Dialog has been canceled and nothing has been selected.
     *
     * Will also report cancel if a cancel button has been defined.
     */
    get canceled(): boolean {
        return !this.selectedButton || this.selectedButton === 'cancel';
    }

    /** @override */
    static getButtons(): Record<string, object> {
        return {};
    }

    /** Allow for the selected button to be addressed by its key, not it's localized label.
     */
    _amendButtonsWithName(buttons) {
        Object.keys(buttons).forEach(name => buttons[name].name = name);
    }

    /**
     * See FormApplication._renderInner
     */
    async _renderInner(data): Promise<JQuery<HTMLElement>> {
        const templatePath = data.templatePath || this.templateContent;
        if (templatePath)
            data.content = await renderTemplate(data.templatePath || this.templateContent,
                                                data.templateData || data);

        const html = await super._renderInner(data);
        this.form = html.filter((i, el) => el instanceof HTMLFormElement)[0] as HTMLFormElement;
        if ( !this.form ) this.form = html.find("form")[0];
        return html;
    }

    /**
     * Based on FormDialog.options configuration apply changes to data.
     */
    async _onChangeInput(event) {
        const el = event.target;

        if ( this.options.applyFormChangesOnSubmit ) {
            this.applyFormData();
            this.render();
        }
    }

    /**
     * Sub dialogs should override this method for custom handling of closing dialog.
     */
    onAfterClose(html: JQuery<HTMLElement>) {}
}