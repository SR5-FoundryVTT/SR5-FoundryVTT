import { SR5 } from '../../config';
import { Translation } from '../../utils/strings';
import { ModifiableValue } from "@/module/mods/ModifiableValue";
import { FLAGS, SYSTEM_NAME } from '../../constants';
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';
import { AnyMutableObject, DeepPartial } from 'fvtt-types/utils';
import { ModifiableValueType } from '@/module/types/template/Base';
import { SuccessTest, SuccessTestData } from '../../tests/SuccessTest';
import { LinksHelpers } from '@/module/utils/links';
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
    rollModes: CONFIG.ChatMessage.modes;
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
            return changes.some(change => !ModifiableValue.isBaseChange(change));
        }

        if (hasModifierChanges(test?.pool?.changes))
            this._expandedList.add('test.data.pool');
        if (hasModifierChanges(test?.limit?.changes))
            this._expandedList.add('test.data.limit');
        if (hasModifierChanges(test?.threshold?.changes))
            this._expandedList.add('test.data.threshold');

        if (game.settings.get(SYSTEM_NAME, FLAGS.ModifyRollExpanded))
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
            width: 300,
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
        // @ts-expect-error TODO: fvtt - v14 - missing messageMode setting
        context.rollMode = this.test.data.options?.rollMode ?? game.settings.get('core', 'messageMode');
        // TODO: fvtt-types - type CONFIG.ChatMessage.modes upstream once available
        context.rollModes = (CONFIG.ChatMessage as unknown as { modes: CONFIG.ChatMessage.modes }).modes;
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

            const isExpanded = modValueDiv.classList.toggle('expanded');
            if (isExpanded) this._expandedList.add(path);
            else this._expandedList.delete(path);
            void this.render();
        };

        html.find('input:not(.manual-modifier-name):not(.manual-modifier-value),select,textarea').on('change', () => applyAndRender());

        html.find('.manual-modifier-name, .manual-modifier-value').on('keydown', ev => {
            if (ev.key !== 'Enter') return;

            ev.preventDefault();
            ev.stopPropagation();

            const input = ev.currentTarget;
            const row = input.closest<HTMLLIElement>('.manual-modifier-entry');
            if (!row) return;

            if (!this._createManualModifierFromRow(row)) return;

            const path = row.dataset.path;
            if (path) this._expandedList.add(path);
            void this.render();
        });

        html.find('.manual-modifier-create').on('click', event => {
            event.preventDefault();
            event.stopPropagation();

            const button = event.currentTarget as HTMLButtonElement;
            const row = button.closest<HTMLLIElement>('.manual-modifier-entry');
            if (!row) return;

            if (!this._createManualModifierFromRow(row)) return;

            const path = row.dataset.path;
            if (path) this._expandedList.add(path);
            void this.render();
        });

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

        html.find('.modifier-source-button').on('click', async event => {
            event.preventDefault();
            event.stopPropagation();

            const button = event.currentTarget as HTMLButtonElement;
            const source = button.dataset.source;
            if (!source) return;

            if (LinksHelpers.isUuid(source)) {
                const effect = await fromUuid(source);
                if (effect instanceof ActiveEffect) {
                    await effect.sheet?.render(true);
                    return;
                }
            }

            await LinksHelpers.openSource(source);
        });

        html.find('.breakdown-entry').on('click', event => {
            const target = event.target;
            // Let form controls and effect icon keep native behavior.
            if (target.closest('input, select, textarea, button, .modifier-effect-button')) return;

            const checkbox = event.currentTarget.querySelector<HTMLInputElement>('input[type="checkbox"]');
            if (!checkbox) return;

            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        });

        html.find('.modify-roll-header').on('click', event => {
            event.preventDefault();
            const sectionDiv = event.currentTarget.closest('.modify-roll-section');
            if (!sectionDiv) return;

            const isExpanded = sectionDiv.classList.toggle('expanded');
            if (isExpanded) this._expandedList.add('modify-roll');
            else this._expandedList.delete('modify-roll');
            void game.settings.set(SYSTEM_NAME, FLAGS.ModifyRollExpanded, isExpanded);
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

        await SuccessTest.hydrateValueModifierTooltipsForTest(this.test, html);

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

    _createManualModifierFromRow(row: HTMLLIElement): boolean {
        const path = row.dataset.path;
        if (!path) return false;

        const nameInput = row.querySelector<HTMLInputElement>('.manual-modifier-name');
        const valueInput = row.querySelector<HTMLInputElement>('.manual-modifier-value');
        const rawName = nameInput?.value?.trim() ?? '';
        const rawValue = valueInput?.value?.trim() ?? '';
        if (!rawName && !rawValue) return false;

        const context = { test: this.test };
        const valueField = foundry.utils.getProperty(context, path);
        if (!ModifiableValue.isModifiableValue(valueField)) return false;

        const value = Number(rawValue || 0);
        const safeValue = Number.isFinite(value) ? value : 0;
        const name = rawName || game.i18n.localize('SR5.ManualModifier');

        ModifiableValue.add(valueField, name, safeValue, {
            mode: 'ADD',
            enabled: true,
            priority: ModifiableValue.MANUAL_PRIORITY,
        });

        this.test.prepareBaseValues();
        this.test.calculateBaseValues();
        this.test.validateBaseValues();

        return true;
    }

    _updateData(data: AnyMutableObject) {
        if (this.selectedButton === 'cancel') return;

        const entries = Object.entries(data);
        const enabledEntries = entries.filter(([key]) => key.endsWith('.enabled'));
        const otherEntries = entries.filter(([key]) => !key.endsWith('.enabled'));
        const changePathPattern = /^test\.data\.(pool|limit|threshold)\.changes\.(\d+)\./;

        const context = { test: this.test };

        for (const [key, value] of [...enabledEntries, ...otherEntries]) {
            const changeMatch = changePathPattern.exec(key);
            if (changeMatch) {
                const path = `test.data.${changeMatch[1]}`;
                const modValue = foundry.utils.getProperty(context, path);
                if (!ModifiableValue.isModifiableValue(modValue)) continue;

                const index = Number(changeMatch[2]);
                if (!Number.isInteger(index) || !modValue.changes[index]) continue;
            }

            const valueField = foundry.utils.getProperty(context, key);
            if (!ModifiableValue.isModifiableValue(valueField)) {
                foundry.utils.setProperty(context, key, value);
                continue;
            }

            // Don't apply an unneeded override.
            if (valueField.value !== value) {
                ModifiableValue.addUnique(
                    valueField,
                    'SR5.ManualOverride',
                    value as number | null,
                    { mode: 'OVERRIDE', priority: ModifiableValue.TOP_PRIORITY }
                );
            } 
        }

        this.test.prepareBaseValues();
        this.test.calculateBaseValues();
        this.test.validateBaseValues();
    }
}
