import { DeepPartial } from 'fvtt-types/utils';
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';
import ApplicationV2 = foundry.applications.api.ApplicationV2;
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

export interface PromptDialogButton {
    label: string
    icon?: string
}

export interface PromptDialogData {
    title: string
    templateData?: object
    templatePath: string
    buttons?: Record<string, PromptDialogButton>
    default?: string
    onAfterClose?: (html: JQuery, selectedButton?: string) => Promise<object> | object
}

interface PromptDialogContext extends HandlebarsApplicationMixin.RenderContext {
    dialogContent: string
    buttons: Record<string, PromptDialogButton>
}

export interface PromptDialogOptions extends Partial<ApplicationV2.Configuration> {
    applyFormChangesOnSubmit?: boolean | null
}

export class PromptDialog extends HandlebarsApplicationMixin(ApplicationV2)<PromptDialogContext> {
    dialogData: PromptDialogData;

    selection: object;
    selectedButton = '';

    _selectionPromise: Promise<object>;
    _selectionResolve!: (event: object) => void;
    _selectionReject!: (event: unknown) => void;
    _selectionSettled = false;

    _onAfterClose: (html: JQuery, selectedButton?: string) => Promise<object> | object;
    _applyFormChangesOnSubmit: boolean;

    constructor(data: PromptDialogData, options: PromptDialogOptions = {}) {
        const { applyFormChangesOnSubmit = false, ...appOptions } = options;
        super(appOptions);

        this.dialogData = data;
        this._onAfterClose = data.onAfterClose || this.onAfterClose.bind(this);
        this._applyFormChangesOnSubmit = applyFormChangesOnSubmit === true;

        this.selection = this._emptySelection();

        this._selectionPromise = new Promise((resolve, reject) => {
            this._selectionResolve = resolve;
            this._selectionReject = reject;
        });
    }

    static override PARTS = {
        content: {
            template: 'systems/shadowrun5e/dist/templates/v2/dialogs/form-dialog/content.hbs'
        },
        footer: {
            template: 'systems/shadowrun5e/dist/templates/v2/dialogs/form-dialog/footer.hbs'
        }
    }

    static override DEFAULT_OPTIONS = {
        classes: [SR5_APPV2_CSS_CLASS, 'sr5', 'form-dialog'],
        position: {
            width: 400,
            height: 'auto' as const,
        },
        window: {
            resizable: true,
        }
    }

    override get title() {
        return this.dialogData.title;
    }

    get selected(): boolean {
        return !this.canceled;
    }

    get canceled(): boolean {
        return !this.selectedButton || this.selectedButton === 'cancel';
    }

    async select(): Promise<object> {
        await this.render({ force: true });

        if (this._selectionPromise === undefined || this.selection === undefined)
            return this._emptySelection();

        return this._selectionPromise;
    }

    _emptySelection(): object {
        return {};
    }

    override async close(options?: ApplicationV2.ClosingOptions): Promise<this> {
        const closed = await super.close(options);

        if (this.canceled && !this._selectionSettled) {
            this._selectionSettled = true;
            this._selectionResolve(this.selection);
        }

        return closed;
    }

    protected override async _prepareContext(
        options: Parameters<ApplicationV2['_prepareContext']>[0]
    ): Promise<PromptDialogContext> {
        const context = await super._prepareContext(options);

        const templateData = this.dialogData.templateData || {};
        context.dialogContent = await foundry.applications.handlebars.renderTemplate(this.dialogData.templatePath, templateData as Record<string, unknown>);
        context.buttons = this.dialogData.buttons || this.buttons;

        return context;
    }

    protected override async _onRender(
        context: DeepPartial<PromptDialogContext>,
        options: DeepPartial<ApplicationV2.RenderOptions>
    ) {
        await super._onRender(context, options);

        const html = $(this.element);

        html.find("[data-application-part='footer'] button[data-action]").on('click', event => {
            event.preventDefault();
            const button = event.currentTarget;
            const action = button.dataset.action;
            if (!action) return;
            void this.submitButton(action);
        });

        if (this._applyFormChangesOnSubmit) {
            html.find('input,select,textarea').on('change', () => {
                this.applyFormData();
                void this.render();
            });
        }
    }

    async submitButton(buttonName: string) {
        this.selectedButton = buttonName;

        this.applyFormData();
        await this.afterSubmit($(this.element), this.selectedButton);

        await this.close();
    }

    async afterSubmit(html: JQuery, selectedButton?: string) {
        this.selection = await this._onAfterClose(html, selectedButton);

        if (!this._selectionSettled) {
            this._selectionSettled = true;
            this._selectionResolve(this.selection);
        }
    }

    applyFormData() {
        const form = this.element.querySelector('form');
        if (!form) return;

        const fd = new foundry.applications.ux.FormDataExtended(form, {editors: {}});
        const data = fd.object;

        this._updateData(data);
    }

    _updateData(data) {
        if (this.selectedButton === 'cancel') return;

        const templateData = this.dialogData.templateData as Record<string, unknown>;
        if (!templateData) return;

        foundry.utils.mergeObject(templateData, data as Record<string, unknown>);
    }

    get buttons(): Record<string, PromptDialogButton> {
        return {};
    }

    async onAfterClose(html: JQuery, selectedButton?: string) {
        return {} as object;
    }
}
