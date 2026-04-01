import { SR5 } from '../../config';
import { Translation } from '../../utils/strings';
import { PartsList } from '@/module/parts/PartsList';
import { FLAGS, SYSTEM_NAME } from '../../constants';
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';
import { AnyMutableObject, DeepPartial } from 'fvtt-types/utils';
import { ModifiableValueType } from '@/module/types/template/Base';
import { SuccessTest, SuccessTestData } from '../../tests/SuccessTest';
import ApplicationV2 = foundry.applications.api.ApplicationV2;
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

export interface TestDialogLike {
    render: (...args: any[]) => unknown
}

/**
 * A way of allowing tests to inject handlers without having to sub-class the whole dialog
 */
export interface TestDialogListener {
    query: string
    on: string
    callback: (event: any, dialog: TestDialogLike) => void
}

interface TestDialogContext extends HandlebarsApplicationMixin.RenderContext {
    test: any;
    rollMode: string;
    rollModes: CONFIG.Dice.RollModes;
    config: typeof SR5;
    expandedPaths: string[];
    dialogContent: string;
}

export class TestDialog extends HandlebarsApplicationMixin(ApplicationV2)<TestDialogContext> {
    test: SuccessTest;
    listeners: TestDialogListener[];
    _expandedList: Set<string>;

    selection: SuccessTestData;
    selectedButton = '';

    _selectionPromise: Promise<SuccessTestData>;
    _selectionResolve!: (event: SuccessTestData) => void;
    _selectionReject!: (event: unknown) => void;
    _selectionSettled = false;

    constructor(test: SuccessTest, listeners: TestDialogListener[] = [], options = {}) {
        super(options);

        this.test = test;
        this.listeners = listeners;
        this._expandedList = new Set<string>();

        this.selection = this._emptySelection();

        this._selectionPromise = new Promise((resolve, reject) => {
            this._selectionResolve = resolve;
            this._selectionReject = reject;
        });

        const hasModifierChanges = (changes?: ModifiableValueType['changes']) => {
            if (!Array.isArray(changes)) return false;
            return changes.some(change => !PartsList.isBaseChange(change));
        }

        if (hasModifierChanges(test?.pool?.changes))
            this._expandedList.add('test.data.pool');
        if (hasModifierChanges(test?.limit?.changes))
            this._expandedList.add('test.data.limit');
        if (hasModifierChanges(test?.threshold?.changes))
            this._expandedList.add('test.data.threshold');

        if (!game.settings.get(SYSTEM_NAME, FLAGS.CollapseModifyRollByDefault))
            this._expandedList.add('modify-roll');
    }

    static override PARTS = {
        content: {
            template: 'systems/shadowrun5e/dist/templates/v2/dialogs/test-dialog/content.hbs'
        },
        footer: {
            template: 'systems/shadowrun5e/dist/templates/v2/dialogs/test-dialog/footer.hbs'
        }
    }

    static override DEFAULT_OPTIONS = {
        classes: [SR5_APPV2_CSS_CLASS, 'sr5', 'form-dialog'],
        id: 'test-dialog-v2',
        position: {
            width: 560,
            height: 'auto' as const,
        },
        window: {
            resizable: true,
        },
        form: {
            submitOnChange: false,
            closeOnSubmit: false,
        },
        actions: {
            roll: TestDialog.#roll,
            cancel: TestDialog.#cancel,
        }
    }

    override get title() {
        return game.i18n.localize(this.test.title as Translation);
    }

    get canceled(): boolean {
        return !this.selectedButton || this.selectedButton === 'cancel';
    }

    async select(): Promise<SuccessTestData> {
        await this.render({ force: true });

        if (this._selectionPromise === undefined || this.selection === undefined)
            return this._emptySelection();

        return this._selectionPromise;
    }

    _emptySelection(): SuccessTestData {
        return this.test.data;
    }

    override async close(options?: ApplicationV2.ClosingOptions): Promise<this> {
        const closed = await super.close(options);

        if (this.canceled && !this._selectionSettled) {
            this._selectionSettled = true;
            this._selectionResolve(this.selection);
        }

        return closed;
    }

    static async #roll(this: TestDialog, event: Event) {
        event.preventDefault();
        this.selectedButton = 'roll';

        this.applyFormData();

        this.selection = this.test.data;
        if (!this._selectionSettled) {
            this._selectionSettled = true;
            this._selectionResolve(this.selection);
        }

        await this.close();
    }

    static async #cancel(this: TestDialog, event: Event) {
        event.preventDefault();
        this.selectedButton = 'cancel';
        await this.close();
    }

    protected override async _prepareContext(
        options: Parameters<ApplicationV2['_prepareContext']>[0]
    ): Promise<TestDialogContext> {
        const context = await super._prepareContext(options);

        context.test = this.test;
        context.rollMode = this.test.data.options?.rollMode ?? game.settings.get('core', 'rollMode');
        context.rollModes = CONFIG.Dice.rollModes;
        context.config = SR5;
        context.expandedPaths = Array.from(this._expandedList);
        context.dialogContent = await foundry.applications.handlebars.renderTemplate(this.test._dialogTemplate, context as unknown as Record<string, unknown>);

        return context;
    }

    protected override async _onRender(
        context: DeepPartial<TestDialogContext>,
        options: DeepPartial<ApplicationV2.RenderOptions>
    ) {
        await super._onRender(context, options);

        const html = $(this.element);

        const applyAndRender = () => {
            this.applyFormData();
            void this.render();
        }

        const toggleModifiableValue = (element: HTMLElement | null) => {
            const modValueDiv = element?.closest<HTMLDivElement>('.modifiable-value');
            const path = modValueDiv?.dataset.path;
            if (!modValueDiv || !path) return;

            if (!modValueDiv.classList.contains('has-modifiers')) return;

            const isExpanded = modValueDiv.classList.toggle('expanded');
            if (isExpanded) this._expandedList.add(path);
            else this._expandedList.delete(path);
            void this.render();
        };

        html.find('input,select,textarea').on('change', () => applyAndRender());

        html.find('.modifiable-value .form-fields input[type="number"]').on('keydown', ev => {
            if (ev.key === 'Enter') { ev.preventDefault(); ev.currentTarget.blur(); }
        });

        html.find('.toggle-breakdown').on('click', event => {
            event.preventDefault();
            toggleModifiableValue(event.currentTarget);
        });

        html.find('.modifiable-value').on('click', event => {
            const target = event.target;
            if (target.closest('input, select, textarea, button, a, .breakdown-list')) return;
            toggleModifiableValue(target);
        });

        html.find('.breakdown-entry').on('click', event => {
            const target = event.target;
            if (target.closest('input[type="checkbox"]')) return;

            const checkbox = event.currentTarget.querySelector<HTMLInputElement>('input[type="checkbox"]');
            if (!checkbox) return;

            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        });

        html.find('.result-header').on('click', event => {
            event.preventDefault();
            const sectionDiv = event.currentTarget.closest('.result-override-section');
            if (!sectionDiv) return;

            const isExpanded = sectionDiv.classList.toggle('expanded');
            if (isExpanded) this._expandedList.add('result-override');
            else this._expandedList.delete('result-override');
            void this.render();
        });

        html.find('.modify-roll-header').on('click', event => {
            event.preventDefault();
            const sectionDiv = event.currentTarget.closest('.modify-roll-section');
            if (!sectionDiv) return;

            const isExpanded = sectionDiv.classList.toggle('expanded');
            if (isExpanded) this._expandedList.add('modify-roll');
            else this._expandedList.delete('modify-roll');
            void this.render();
        });

        html.find('.modify-roll-content .toggle-checkbox-row').on('click', event => {
            const target = event.target;
            if (target.closest('input[type="checkbox"]')) return;

            const checkbox = event.currentTarget.querySelector<HTMLInputElement>('input[type="checkbox"]');
            if (!checkbox) return;

            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        });

        html.find('.roll-mode-button').on('click', event => {
            event.preventDefault();

            const button = event.currentTarget;
            const rollMode = button.dataset.rollMode;
            if (!rollMode) return;

            if (this.test.data.options?.rollMode === rollMode) return;

            foundry.utils.setProperty(this.test, 'data.options.rollMode', rollMode);
            this.test.prepareBaseValues();
            this.test.calculateBaseValues();
            this.test.validateBaseValues();
            void this.render();
        });

        this._injectExternalActiveListeners(html);
    }

    _injectExternalActiveListeners(html: JQuery) {
        for (const listener of this.listeners) {
            html.find(listener.query).on(listener.on, event => listener.callback.bind(this.test)(event, this));
        }
    }

    applyFormData() {
        const form = this.element.querySelector('form');
        if (!form) return;

        const fd = new foundry.applications.ux.FormDataExtended(form, {editors: {}});
        const data = fd.object;

        this._updateData(data);
    }

    _updateData(data: AnyMutableObject) {
        if (this.selectedButton === 'cancel') return;

        const entries = Object.entries(data);
        const appliedEntries = entries.filter(([key]) => key.endsWith('.applied'));
        const otherEntries = entries.filter(([key]) => !key.endsWith('.applied'));

        const context = { test: this.test };

        for (const [key, value] of [...appliedEntries, ...otherEntries]) {
            const valueField = foundry.utils.getProperty(context, key);
            if (!PartsList.isModifiableValue(valueField)) {
                foundry.utils.setProperty(context, key, value);
                continue;
            }

            if (valueField.value !== value)
                PartsList.addUniquePart(valueField, 'SR5.ManualOverride', value as number | null, CONST.ACTIVE_EFFECT_MODES.OVERRIDE, Infinity);
        }

        this.test.prepareBaseValues();
        this.test.calculateBaseValues();
        this.test.validateBaseValues();
    }
}
