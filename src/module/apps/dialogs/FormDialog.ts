export interface FormDialogData {
    title?: string;
	buttons: Record<string, object>;
	default?: string;
	templateData: object;
	templatePath: string;
	onAfterClose?: Function;
}

export interface FormDialogOptions extends Dialog.Options {
    // When true, will apply dialog form element inputs to this.data.
    applyFormChangesOnSubmit: boolean | null
}

/** TODO: Documentation with usage example
 *  TODO: Rework getDialogData approach with the general getData Application style,
 *        to allow rerender from within the Dialog instance without external data
 *        reinitialization.
 *        This would for things like updating a dialog based on currently selected tokens
 *        without reopening.
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

        this._amendButtonsWithName();
    }

    async close() {
        await super.close();

        if (this.canceled) {
            this._selectionResolve(this.selection);
        }
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
        this._selectionResolve(this.selection);
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
        const data = fd.toObject();

        this._updateData(data);
    }

    _updateData(data) {
        //@ts-ignore // TODO: FormDialog.data typing is missing
        foundry.utils.mergeObject(this.data.templateData, data);
    }

    // @ts-ignore
    async getData() {
        //@ts-ignore // TODO: FormDialog.data typing is missing.
        const content = await renderTemplate(this.data.templatePath, this.data.templateData);
        // @ts-ignore
        return mergeObject(super.getData(), {
            content
        });
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

    /** Allow for the selected button to be addressed by it's key, not it's localized label.
     */
    _amendButtonsWithName() {
        //@ts-ignore
        Object.keys(this.data.buttons).forEach(name => this.data.buttons[name].name = name);
    }

    /**
     * See FormApplication._renderInner
     */
    async _renderInner(data: object): Promise<JQuery<HTMLElement>> {
        const html = await super._renderInner(data);
        this.form = html.filter((i, el) => el instanceof HTMLFormElement)[0] as HTMLFormElement;
        if ( !this.form ) this.form = html.find("form")[0];
        return html;
    }

    /**
     * Sub dialogs should override this method for custom handling of closing dialog.
     */
    onAfterClose(html) {}
}