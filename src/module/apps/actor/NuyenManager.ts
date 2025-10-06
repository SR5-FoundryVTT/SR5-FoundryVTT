import { SR5Actor } from '@/module/actor/SR5Actor';
import { SheetFlow } from '@/module/flows/SheetFlow';
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';

const { DocumentSheetV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class NuyenManager extends HandlebarsApplicationMixin(DocumentSheetV2)<SR5Actor, any> {
    nuyenModifier = 0;

    getNuyen() {
        return this.document.asType('character')?.system._source.nuyen ?? 0;
    }

    override get title() {
        return game.i18n.localize("SR5.NuyenManager.Title");
    }

    override async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.nuyen = this.getNuyen();
        context.nuyenModifier = this.nuyenModifier ?? 0;
        context.modifiedNuyen = context.nuyen + context.nuyenModifier;
        return context;
    }

    static async #increaseNuyen(this: NuyenManager, event) {
        event.preventDefault();
        event.stopPropagation();
        const amount = Number(event.target.closest('[data-amount]').dataset.amount);
        this.nuyenModifier += amount;
        await this.render();
    }

    static async #reduceNuyen(this: NuyenManager, event) {
        event.preventDefault();
        event.stopPropagation();
        const amount = Number(event.target.closest('[data-amount]').dataset.amount);
        this.nuyenModifier -= amount;
        await this.render();
    }

    static async #submitChanges(this: NuyenManager, event) {
        event.preventDefault();
        event.stopPropagation();
        const currentNuyen = this.getNuyen();
        const modifiedNuyen = currentNuyen + this.nuyenModifier;
        this.document.update({system: { nuyen: modifiedNuyen }});
        this.close();
    }

    static async #cancel(this: NuyenManager, event) {
        this.close();
    }

    override async _onRender(context, options) {
        this.element.querySelector<HTMLInputElement>('[name="incoming-nuyen"]')
            ?.addEventListener('change', (event: any) => {
                console.log(event);
                this.nuyenModifier = Number(event.target?.value ?? 0);
                this.render();
        })
        return super._onRender(context, options);
    }

    static override PARTS = {
        details: {
            template: SheetFlow.templateBase('nuyen-manager/details')
        },
        footer: {
            template: SheetFlow.templateBase('nuyen-manager/footer')
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
