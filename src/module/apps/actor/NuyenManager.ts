import { DeepPartial } from 'fvtt-types/utils';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { SheetFlow } from '@/module/flows/SheetFlow';
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';
import ApplicationV2 = foundry.applications.api.ApplicationV2;
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

interface NuyenManagerContext extends HandlebarsApplicationMixin.RenderContext {
    nuyen: number;
    nuyenModifier: number;
    modifiedNuyen: number;
};

export class NuyenManager extends HandlebarsApplicationMixin(ApplicationV2)<NuyenManagerContext> {
    nuyenModifier = 0;

    getNuyen() {
        return this.actor.asType('character')?.system._source.nuyen ?? 0;
    }

    constructor(private readonly actor: SR5Actor, options = {}) {
        super(options);
    }

    override get title() {
        return game.i18n.localize("SR5.NuyenManager.Title");
    }

    override async _prepareContext(options: Parameters<ApplicationV2['_prepareContext']>[0]) {
        const context = await super._prepareContext(options);
        context.nuyen = this.getNuyen();
        context.nuyenModifier = this.nuyenModifier ?? 0;
        context.modifiedNuyen = context.nuyen + context.nuyenModifier;
        return context;
    }

    static async #increaseNuyen(this: NuyenManager, event: PointerEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (!(event.target instanceof HTMLElement)) return;
        const amount = Number(event.target.closest<HTMLElement>('[data-amount]')!.dataset.amount);
        this.nuyenModifier += amount;
        await this.render();
    }

    static async #reduceNuyen(this: NuyenManager, event: PointerEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (!(event.target instanceof HTMLElement)) return;
        const amount = Number(event.target.closest<HTMLElement>('[data-amount]')!.dataset.amount);
        this.nuyenModifier -= amount;
        await this.render();
    }

    static async #submitChanges(this: NuyenManager, event: PointerEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (!(event.target instanceof HTMLElement)) return;
        const currentNuyen = this.getNuyen();
        const modifiedNuyen = currentNuyen + this.nuyenModifier;
        await this.actor.update({system: { nuyen: modifiedNuyen }});
        void this.close();
    }

    static async #cancel(this: NuyenManager, event: Event) {
        void this.close();
    }

    override async _onRender(
        context: DeepPartial<NuyenManagerContext>,
        options: DeepPartial<ApplicationV2.RenderOptions>
    ) {
        this.element.querySelector<HTMLInputElement>('[name="incoming-nuyen"]')
            ?.addEventListener('change', (event: any) => {
                console.log(event);
                this.nuyenModifier = Number(event.target?.value ?? 0);
                void this.render();
            }
        );
        return super._onRender(context, options);
    }

    static override PARTS = {
        details: {
            template: SheetFlow.templateBase('actor/apps/nuyen-manager/details')
        },
        footer: {
            template: SheetFlow.templateBase('actor/apps/nuyen-manager/footer')
        }
    }

    static override DEFAULT_OPTIONS = {
        classes: [SR5_APPV2_CSS_CLASS, 'nuyen-manager'],
        form: {
            submitOnChange: false,
            closeOnSubmit: false,
        },
        position: {
            width: 400,
        },
        window: {
            resizable: true,
        },
        actions: {
            increaseNuyen: NuyenManager.#increaseNuyen,
            reduceNuyen: NuyenManager.#reduceNuyen,

            submitChanges: NuyenManager.#submitChanges,
            cancel: NuyenManager.#cancel,
        }
    }

}
