export interface FormDialogData {
    title?: string;
	buttons?: Record<string, DialogButton>;
	default?: string;
	templateData: object;
	templatePath: string;
	onAfterClose: Function;
}

/** TODO: Documentation with usage example
 *
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

    constructor(dialogData: FormDialogData, options?: ApplicationOptions) {
        super(dialogData, options);

        const {templateData, templatePath} = dialogData;
        this._templateData = templateData;
        this._templatePath = templatePath;

        this._onAfterClose = dialogData.onAfterClose;

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
            this._selectionResolve(this.selection);
        }
    }

    async submit(button) {
        this.selectedButton = button.label;

        //@ts-ignore
        super.submit(button);
        await this.afterSubmit(this.options.jQuery ? this.element : this.element [0]);
    }

    async afterSubmit(html: JQuery) {
        // Await in case of a possible async handler.
        this.selection = await this._onAfterClose(html, this.selectedButton);
        this._selectionResolve(this.selection);
    }

    async getData(options) {
        const content = await renderTemplate(this._templatePath, this._templateData);
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

    /** Dialog has been canceled and nothing has been selected
     */
    get canceled(): boolean {
        return !this.selectedButton;
    }

    /** @override */
    static getButtons(): Record<string, DialogButton> {
        return {};
    }
}