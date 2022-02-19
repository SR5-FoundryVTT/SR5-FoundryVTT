export interface FormDialogData {
    title?: string;
	buttons: Record<string, object>;
	default?: string;
	templateData: object;
	templatePath: string;
	onAfterClose?: Function;
}

/** TODO: Documentation with usage example
 *  TODO: Rework getDialogData approach with the general getData Application style,
 *        to allow rerender from within the Dialog instance without external data
 *        reinitialization.
 *        This would for things like updating a dialog based on currently selected tokens
 *        without reopening.
 */
export class FormDialog extends Dialog {
    selection: object;
    selectedButton: string;

    _onAfterClose: Function;
    _selectionPromise: Promise<object>;
    _selectionResolve: Function;
    _selectionReject: Function;
    _templateData: object;
    _templatePath: string;

    constructor(dialogData: FormDialogData, options?: Application.Options) {
        // @ts-ignore
        super(dialogData, options);

        const {templateData, templatePath} = dialogData;
        this._templateData = templateData;
        this._templatePath = templatePath;

        this._onAfterClose = dialogData.onAfterClose ? dialogData.onAfterClose : () => {};

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

        super.submit(button);
        // @ts-ignore
        await this.afterSubmit("jQuery" in this.options ? this.element : this.element [0]);
    }

    async afterSubmit(html: JQuery) {
        // Await in case of a possible async handler.
        this.selection = await this._onAfterClose(html, this.selectedButton);
        this._selectionResolve(this.selection);
    }

    // @ts-ignore
    async getData() {
        const content = await renderTemplate(this._templatePath, this._templateData);
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
}