import { DeepPartial } from 'fvtt-types/utils';

import { SR5_APPV2_CSS_CLASS } from '@/module/constants';
import { WorldTimeFlow } from '@/module/flows/WorldTimeFlow';
import type { SR5Item } from '@/module/item/SR5Item';

import ApplicationV2 = foundry.applications.api.ApplicationV2;
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

interface PreparationTimeContext extends HandlebarsApplicationMixin.RenderContext {
    preparationName: string;
    preview: string;
    components: {
        year: number;
        month: number;
        dayOfMonth: number;
        hour: number;
        minute: number;
        second: number;
    };
}

/**
 * Edit the world-calendar time at which an alchemical preparation was created.
 *
 * This intentionally does not use WorldTimeFlow.setAbsolute: changing a preparation's
 * timestamp must never move the world's clock.
 */
export class PreparationTimeDialog extends HandlebarsApplicationMixin(ApplicationV2)<PreparationTimeContext> {
    readonly #preparation: SR5Item<'preparation'>;

    constructor(preparation: SR5Item<'preparation'>, options = {}) {
        super({ id: PreparationTimeDialog.applicationId(preparation), ...options });
        this.#preparation = preparation;
    }

    static override PARTS = {
        main: {
            template: 'systems/shadowrun5e/dist/templates/apps/dialogs/preparation-time.hbs'
        }
    };

    static override DEFAULT_OPTIONS = {
        classes: [SR5_APPV2_CSS_CLASS, 'sr5', 'time-control', 'preparation-time-dialog'],
        tag: 'form',
        form: {
            handler: PreparationTimeDialog.#onSubmit,
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
            useCurrentTime: PreparationTimeDialog.#onUseCurrentTime,
            cancel: PreparationTimeDialog.#onCancel,
        }
    };

    override get title() {
        return game.i18n.localize('SR5.Preparation.CreationTimeDialog.Title');
    }

    /**
     * A stable DOM id prevents repeated clicks from opening duplicate editors for one item.
     */
    static applicationId(preparation: SR5Item<'preparation'>): string {
        const uuid = String(preparation.uuid ?? preparation.id ?? 'new');
        return `preparation-time-${uuid.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
    }

    static open(preparation: SR5Item<'preparation'>) {
        const existing = foundry.applications.instances.get(PreparationTimeDialog.applicationId(preparation));
        if (existing instanceof PreparationTimeDialog) {
            void existing.render({ force: true });
            return;
        }

        void new PreparationTimeDialog(preparation).render({ force: true });
    }

    /**
     * Convert stored world time into the one-based month and day values shown by the form.
     */
    static componentsForForm(worldTime: number): PreparationTimeContext['components'] {
        const components = WorldTimeFlow.displayComponents(worldTime);
        return {
            year: components.year,
            month: components.month + 1,
            dayOfMonth: components.dayOfMonth + 1,
            hour: components.hour,
            minute: components.minute,
            second: components.second,
        };
    }

    /**
     * Convert flattened FormDataExtended values back into world-time seconds.
     */
    static worldTimeFromForm(data: Record<string, unknown>): number | undefined {
        const read = (name: string) => Number(data[`components.${name}`]);
        const values = {
            year: read('year'),
            month: read('month'),
            dayOfMonth: read('dayOfMonth'),
            hour: read('hour'),
            minute: read('minute'),
            second: read('second'),
        };
        if (Object.values(values).some(value => !Number.isFinite(value))) return;

        const worldTime = WorldTimeFlow.componentsToTime({
            ...values,
            month: values.month - 1,
            dayOfMonth: values.dayOfMonth - 1,
        });
        return Number.isFinite(worldTime) ? worldTime : undefined;
    }

    /**
     * Persist only the creation anchor. The update re-derives potency and re-renders open sheets.
     */
    static async setCreationTime(preparation: SR5Item<'preparation'>, worldTime: number): Promise<void> {
        await preparation.update({ system: { created: { worldTime } } });
    }

    override async _prepareContext(options: Parameters<ApplicationV2['_prepareContext']>[0]) {
        const context = await super._prepareContext(options);
        const worldTime = this.#preparation.system.created.worldTime;

        context.preparationName = this.#preparation.name;
        context.preview = WorldTimeFlow.format(worldTime);
        context.components = PreparationTimeDialog.componentsForForm(worldTime);
        return context;
    }

    protected override async _onRender(
        context: DeepPartial<PreparationTimeContext>,
        options: DeepPartial<ApplicationV2.RenderOptions>
    ) {
        await super._onRender(context, options);

        this.element.querySelectorAll<HTMLInputElement>('.time-absolute-fields input').forEach(input => {
            input.addEventListener('input', () => this.#updatePreview());
        });
        this.#updatePreview();
    }

    #writeComponents(components: PreparationTimeContext['components']) {
        for (const [name, value] of Object.entries(components)) {
            const input = this.element.querySelector<HTMLInputElement>(`[name="components.${name}"]`);
            if (input) input.value = String(value);
        }
    }

    #updatePreview() {
        const preview = this.element.querySelector<HTMLElement>('.time-absolute-preview');
        if (!preview) return;

        const formData = new foundry.applications.ux.FormDataExtended(this.element as HTMLFormElement);
        const worldTime = PreparationTimeDialog.worldTimeFromForm(formData.object as Record<string, unknown>);
        preview.textContent = worldTime === undefined ? '' : WorldTimeFlow.format(worldTime);
    }

    static async #onSubmit(
        this: PreparationTimeDialog,
        event: Event | SubmitEvent,
        form: HTMLFormElement,
        formData: foundry.applications.ux.FormDataExtended
    ) {
        const worldTime = PreparationTimeDialog.worldTimeFromForm(formData.object as Record<string, unknown>);
        if (worldTime === undefined) {
            ui.notifications?.warn('SR5.Preparation.CreationTimeDialog.Invalid', { localize: true });
            return;
        }

        await PreparationTimeDialog.setCreationTime(this.#preparation, worldTime);
        await this.close();
    }

    static #onUseCurrentTime(this: PreparationTimeDialog, event: Event) {
        event.preventDefault();
        this.#writeComponents(PreparationTimeDialog.componentsForForm(game.time.worldTime));
        this.#updatePreview();
    }

    static #onCancel(this: PreparationTimeDialog, event: Event) {
        event.preventDefault();
        void this.close();
    }
}
