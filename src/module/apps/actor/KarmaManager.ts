import { SR5Actor } from '@/module/actor/SR5Actor';
import { SheetFlow } from '@/module/flows/SheetFlow';
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';

const { DocumentSheetV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class KarmaManager extends HandlebarsApplicationMixin(DocumentSheetV2)<SR5Actor, any> {
    karmaModifier = 0;

    getKarma() {
        return this.document.asType('character')?.system._source.karma.value ?? 0;
    }

    getCareerKarma() {
        return this.document.asType('character')?.system._source.karma.max ?? 0;
    }

    getModifiedKarma() {
        return this.getKarma() + this.karmaModifier;
    }

    getModifiedCareerKarma() {
        if (this.karmaModifier > 0) {
            return this.getCareerKarma() + this.karmaModifier;
        }
        return this.getCareerKarma();
    }

    override get title() {
        return game.i18n.localize("SR5.KarmaManager.Title");
    }

    override async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.karma = this.getKarma();
        context.careerKarma = this.getCareerKarma();
        context.karmaModifier = this.karmaModifier ?? 0;
        context.modifiedKarma = this.getModifiedKarma();
        context.modifiedCareerKarma = this.getModifiedCareerKarma();
        return context;
    }

    static async #increaseKarma(this: KarmaManager, event) {
        event.preventDefault();
        event.stopPropagation();
        const amount = Number(event.target.closest('[data-amount]').dataset.amount);
        this.karmaModifier += amount;
        if (this.getModifiedKarma() < 0) {
            this.karmaModifier = -this.getModifiedKarma();
        }
        await this.render();
    }

    static async #reduceKarma(this: KarmaManager, event) {
        event.preventDefault();
        event.stopPropagation();
        const amount = Number(event.target.closest('[data-amount]').dataset.amount);
        this.karmaModifier -= amount;
        if (this.getModifiedKarma() < 0) {
            this.karmaModifier = -this.getModifiedKarma();
        }
        await this.render();
    }

    static async #submitChanges(this: KarmaManager, event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.getModifiedKarma() < 0) {
            this.karmaModifier = -this.getModifiedKarma();
        }
        const finalKarma = this.getModifiedKarma();
        const finalCareerKarma = this.getModifiedCareerKarma();
        await this.document.update({system: { karma: { value: finalKarma, max: finalCareerKarma } }});
        await this.close();
    }

    static async #cancel(this: KarmaManager, event) {
        this.close();
    }

    override async _onRender(context, options) {
        this.element.querySelector<HTMLInputElement>('[name="incoming-karma"]')
            ?.addEventListener('change', (event: any) => {
                this.karmaModifier = Number(event.target?.value ?? 0);
                if (this.getModifiedKarma() < 0) {
                    this.karmaModifier = -this.getModifiedKarma();
                }
                this.render();
        })
        return super._onRender(context, options);
    }

    static override PARTS = {
        details: {
            template: SheetFlow.templateBase('karma-manager/details')
        },
        footer: {
            template: SheetFlow.templateBase('karma-manager/footer')
        }
    }

    static override DEFAULT_OPTIONS = {
        classes: [SR5_APPV2_CSS_CLASS, 'karma-manager'],
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
            increaseKarma: KarmaManager.#increaseKarma,
            reduceKarma: KarmaManager.#reduceKarma,

            submitChanges: KarmaManager.#submitChanges,
            cancel: KarmaManager.#cancel,
        }
    }

}
