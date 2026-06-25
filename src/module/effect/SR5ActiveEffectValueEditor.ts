import { DeepPartial } from 'fvtt-types/utils';
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';
import type { SR5ActiveEffect } from './SR5ActiveEffect';
import type { SR5ActiveEffectConfig } from './SR5ActiveEffectConfig';
import ApplicationV2 = foundry.applications.api.ApplicationV2;
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

interface SR5ActiveEffectValueEditorContext extends HandlebarsApplicationMixin.RenderContext {
    applyTo: string;
    inputName: string;
    value: string;
}

export class SR5ActiveEffectValueEditor extends HandlebarsApplicationMixin(ApplicationV2)<SR5ActiveEffectValueEditorContext> {
    static readonly DEFAULT_WIDTH = 360;

    private _value: string;

    constructor(
        private readonly owner: SR5ActiveEffectConfig,
        readonly sourceInput: HTMLInputElement,
        private readonly applyTo: string,
        initialPosition: { top?: number; left?: number } = {},
    ) {
        super({
            position: {
                width: SR5ActiveEffectValueEditor.DEFAULT_WIDTH,
                height: 'auto',
                ...initialPosition,
            }
        });
        this._value = sourceInput.value;
    }

    get document(): SR5ActiveEffect {
        return this.owner.clone;
    }

    override get title() {
        return game.i18n.localize('SR5.ActiveEffect.ValueEditor');
    }

    static override PARTS = {
        editor: {
            template: 'systems/shadowrun5e/dist/templates/effect/active-effect-value-editor.hbs'
        }
    };

    static override DEFAULT_OPTIONS = {
        classes: [SR5_APPV2_CSS_CLASS, 'sr5-active-effect-value-editor'],
        form: {
            submitOnChange: false,
            closeOnSubmit: false,
        },
        position: {
            width: SR5ActiveEffectValueEditor.DEFAULT_WIDTH,
            height: 'auto' as const,
        },
        window: {
            icon: 'fa-solid fa-lambda',
            minimizable: false,
            resizable: true,
            contentClasses: ['standard-form'],
        },
        actions: {
            apply: SR5ActiveEffectValueEditor.#onApply,
            cancel: SR5ActiveEffectValueEditor.#onCancel,
        }
    };

    override async _prepareContext(
        options: Parameters<ApplicationV2['_prepareContext']>[0]
    ): Promise<SR5ActiveEffectValueEditorContext> {
        const context = await super._prepareContext(options);
        context.applyTo = this.applyTo;
        context.inputName = this.sourceInput.name;
        context.value = this._value;
        return context;
    }

    override async _onRender(
        context: DeepPartial<SR5ActiveEffectValueEditorContext>,
        options: DeepPartial<ApplicationV2.RenderOptions>
    ) {
        await super._onRender(context, options);

        const textarea = this.textarea;
        if (!textarea) return;

        textarea.addEventListener('input', event => {
            this._value = (event.currentTarget as HTMLTextAreaElement).value;
        });

        textarea.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                event.preventDefault();
                void this.close();
                return;
            }

            if ((event.key === 'Enter') && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                this.#apply();
            }
        });

        this.#positionDialog();
        this.focusTextarea();
    }

    get textarea() {
        return this.element.querySelector<HTMLTextAreaElement>('textarea[name]');
    }

    focusTextarea() {
        const textarea = this.textarea;
        if (!textarea) return;

        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }

    static #onApply(this: SR5ActiveEffectValueEditor, event: PointerEvent) {
        event.preventDefault();
        this.#apply();
    }

    static #onCancel(this: SR5ActiveEffectValueEditor, event: PointerEvent) {
        event.preventDefault();
        void this.close();
    }

    #apply() {
        if (!this.sourceInput.isConnected) {
            void this.close();
            return;
        }

        this.sourceInput.value = this._value;
        this.sourceInput.dispatchEvent(new Event('input', { bubbles: true }));
        this.sourceInput.dispatchEvent(new Event('change', { bubbles: true }));
        this.sourceInput.focus();

        void this.close();
    }

    #positionDialog() {
        const rect = this.element.getBoundingClientRect();
        const view = this.element.ownerDocument.defaultView;
        const viewportWidth = view?.innerWidth ?? window.innerWidth;
        const viewportHeight = view?.innerHeight ?? window.innerHeight;
        const margin = 8;

        const clampedLeft = Math.min(
            Math.max(margin, this.position.left ?? margin),
            Math.max(margin, viewportWidth - rect.width - margin),
        );
        const clampedTop = Math.min(
            Math.max(margin, this.position.top ?? margin),
            Math.max(margin, viewportHeight - rect.height - margin),
        );

        this.setPosition({
            left: Math.round(clampedLeft),
            top: Math.round(clampedTop),
            width: this.position.width,
            height: this.position.height,
        });
    }
}
