/**
 * A GM-Tool to display and control the current world time.
 */
import { DeepPartial } from "fvtt-types/utils";
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';
import { WorldTimeFlow, WorldTimePreset } from '@/module/flows/WorldTimeFlow';
import { intervalToSeconds } from '@/module/utils/timeUnits';
import { ExtendedIntervalUnit } from '@/module/types/flows/ExtendedTest';

import ApplicationV2 = foundry.applications.api.ApplicationV2;
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

interface TimeControlContext extends HandlebarsApplicationMixin.RenderContext {
    currentTime: string;
    worldTime: number;
    presets: (WorldTimePreset & { label: string })[];
    components: {
        year: number;
        month: number;
        dayOfMonth: number;
        hour: number;
        minute: number;
        second: number;
    };
}

export class TimeControlApplication extends HandlebarsApplicationMixin(ApplicationV2)<TimeControlContext> {
    static open() {
        if (!game.user?.isGM) return;
        void new TimeControlApplication().render({ force: true });
    }

    static override PARTS = {
        main: {
            template: 'systems/shadowrun5e/dist/templates/apps/gmtools/time-control.hbs'
        }
    }

    static override DEFAULT_OPTIONS = {
        id: 'time-control',
        classes: [SR5_APPV2_CSS_CLASS, 'sr5', 'time-control'],
        form: {
            submitOnChange: false,
            closeOnSubmit: false,
        },
        position: {
            width: 420,
            height: 'auto' as const,
        },
        window: {
            resizable: true,
        },
        actions: {
            shiftPreset: TimeControlApplication.#onShiftPreset,
            advanceCustom: TimeControlApplication.#onAdvanceCustom,
            rewindCustom: TimeControlApplication.#onRewindCustom,
            setAbsolute: TimeControlApplication.#onSetAbsolute,
        }
    }

    #onUpdateWorldTime = () => { void this.render(); };

    override get title() {
        return game.i18n.localize('SR5.TimeControl.Title');
    }

    override async _prepareContext(options: Parameters<ApplicationV2['_prepareContext']>[0]) {
        const context = await super._prepareContext(options);

        context.currentTime = WorldTimeFlow.format();
        context.worldTime = game.time.worldTime;
        context.presets = WorldTimeFlow.PRESETS.map(preset => ({
            ...preset,
            label: game.i18n.localize(preset.labelKey as Parameters<typeof game.i18n.localize>[0]),
        }));

        const components = game.time.components;
        context.components = {
            year: components.year,
            // Display month and day of month as 1-based values.
            month: components.month + 1,
            dayOfMonth: components.dayOfMonth + 1,
            hour: components.hour,
            minute: components.minute,
            second: components.second,
        };

        return context;
    }

    protected override _onFirstRender(context: DeepPartial<TimeControlContext>, options: DeepPartial<ApplicationV2.RenderOptions>) {
        Hooks.on('updateWorldTime', this.#onUpdateWorldTime);
        return super._onFirstRender(context, options);
    }

    protected override _onClose(options: DeepPartial<ApplicationV2.RenderOptions>) {
        Hooks.off('updateWorldTime', this.#onUpdateWorldTime);
        return super._onClose(options);
    }

    override async _onRender(
        context: DeepPartial<TimeControlContext>,
        options: DeepPartial<ApplicationV2.RenderOptions>
    ) {
        // Live previews without committing anything.
        this.element.querySelectorAll<HTMLElement>('.time-shift-fields input, .time-shift-fields select').forEach(element => {
            element.addEventListener('input', () => this.#updateShiftPreview());
        });
        this.element.querySelectorAll<HTMLInputElement>('.time-absolute-fields input').forEach(input => {
            input.addEventListener('input', () => this.#updateAbsolutePreview());
        });
        this.#updateShiftPreview();
        this.#updateAbsolutePreview();

        return super._onRender(context, options);
    }

    /**
     * Read the custom shift amount in seconds from the form.
     */
    #customShiftSeconds(): number {
        const value = Number((this.element.querySelector<HTMLInputElement>('[name="shift.value"]'))?.value ?? 0);
        const unit = (this.element.querySelector<HTMLSelectElement>('[name="shift.unit"]'))?.value as ExtendedIntervalUnit ?? 'minutes';
        if (Number.isNaN(value)) return 0;
        return intervalToSeconds({ value, unit });
    }

    /**
     * Read the absolute time components from the form, converting to 0-based indices.
     */
    #absoluteComponents(): Partial<foundry.data.CalendarData.TimeComponents> {
        const read = (name: string) => Number(this.element.querySelector<HTMLInputElement>(`[name="absolute.${name}"]`)?.value ?? 0) || 0;
        return {
            year: read('year'),
            month: Math.max(0, read('month') - 1),
            dayOfMonth: Math.max(0, read('dayOfMonth') - 1),
            hour: read('hour'),
            minute: read('minute'),
            second: read('second'),
        };
    }

    #updateShiftPreview() {
        const preview = this.element.querySelector<HTMLElement>('.time-shift-preview');
        if (!preview) return;
        const seconds = this.#customShiftSeconds();
        preview.textContent = seconds ? WorldTimeFlow.preview(seconds) : '';
    }

    #updateAbsolutePreview() {
        const preview = this.element.querySelector<HTMLElement>('.time-absolute-preview');
        if (!preview) return;
        preview.textContent = WorldTimeFlow.previewComponents(this.#absoluteComponents());
    }

    static async #onShiftPreset(this: TimeControlApplication, event: Event, target?: HTMLElement) {
        event.preventDefault();
        const seconds = Number(target?.dataset.seconds ?? 0);
        await WorldTimeFlow.shift(seconds);
    }

    static async #onAdvanceCustom(this: TimeControlApplication, event: Event) {
        event.preventDefault();
        await WorldTimeFlow.shift(this.#customShiftSeconds());
    }

    static async #onRewindCustom(this: TimeControlApplication, event: Event) {
        event.preventDefault();
        await WorldTimeFlow.shift(-this.#customShiftSeconds());
    }

    static async #onSetAbsolute(this: TimeControlApplication, event: Event) {
        event.preventDefault();
        await WorldTimeFlow.setAbsolute(this.#absoluteComponents());
    }
}
