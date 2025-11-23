import { DeepPartial } from 'fvtt-types/utils';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { SheetFlow } from '@/module/flows/SheetFlow';
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';
import ApplicationV2 = foundry.applications.api.ApplicationV2;
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

interface ReputationManagerContext extends HandlebarsApplicationMixin.RenderContext {
    streetCred: number;
    streetCredModifier: number;
    notoriety: number;
    notorietyModifier: number;
    publicAwareness: number;
    publicAwarenessModifier: number;
};

export class ReputationManager extends HandlebarsApplicationMixin(ApplicationV2)<ReputationManagerContext> {
    streetCredModifier = 0;
    notorietyModifier = 0;
    publicAwarenessModifier = 0;

    constructor(private readonly actor: SR5Actor, options = {}) {
        super(options);
    }

    getStreetCred() {
        return this.actor.asType('character')?.system._source.street_cred ?? 0;
    }

    getNotoriety() {
        return this.actor.asType('character')?.system._source.notoriety ?? 0;
    }

    getPublicAwareness() {
        return this.actor.asType('character')?.system._source.public_awareness ?? 0;
    }

    override get title() {
        return game.i18n.localize("SR5.ReputationManager.Title");
    }

    override async _prepareContext(options: Parameters<ApplicationV2['_prepareContext']>[0]) {
        const context = await super._prepareContext(options);
        context.streetCred = this.getStreetCred() + this.streetCredModifier;
        context.streetCredModifier = this.streetCredModifier;
        context.notoriety = this.getNotoriety() + this.notorietyModifier;
        context.notorietyModifier = this.notorietyModifier;
        context.publicAwareness = this.getPublicAwareness() + this.publicAwarenessModifier;
        context.publicAwarenessModifier = this.publicAwarenessModifier;
        return context;
    }

    override async _onRender(
        context: DeepPartial<ReputationManagerContext>,
        options: DeepPartial<ApplicationV2.RenderOptions>
    ) {
        this.element.querySelector<HTMLInputElement>('[name="incoming-street-cred"]')
            ?.addEventListener('change', (event: any) => {
                this.streetCredModifier = Number(event.target?.value ?? 0);
                void this.render();
            })
        this.element.querySelector<HTMLInputElement>('[name="incoming-notoriety"]')
            ?.addEventListener('change', (event: any) => {
                this.notorietyModifier = Number(event.target?.value ?? 0);
                void this.render();
            })
        this.element.querySelector<HTMLInputElement>('[name="incoming-public-awareness"]')
            ?.addEventListener('change', (event: any) => {
                this.publicAwarenessModifier = Number(event.target?.value ?? 0);
                void this.render();
            })
        return super._onRender(context, options);
    }

    static async #increase(this: ReputationManager, event: PointerEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (!(event.target instanceof HTMLElement)) return;
        const type = event.target.closest<HTMLElement>('[data-type]')!.dataset.type;
        if (type === 'street_cred') {
            this.streetCredModifier += 1;
        } else if (type === 'notoriety') {
            this.notorietyModifier += 1;
        } else if (type === 'public_awareness') {
            this.publicAwarenessModifier += 1;
        }
        await this.render();
    }

    static async #reduce(this: ReputationManager, event: PointerEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (!(event.target instanceof HTMLElement)) return;
        const type = event.target.closest<HTMLElement>('[data-type]')!.dataset.type;
        if (type === 'street_cred') {
            this.streetCredModifier -= 1;
        } else if (type === 'notoriety') {
            this.notorietyModifier -= 1;
        } else if (type === 'public_awareness') {
            this.publicAwarenessModifier -= 1;
        }
        await this.render();
    }

    static async #submitChanges(this: ReputationManager) {
        const updateData = {};
        if (this.streetCredModifier !== 0) {
            updateData['system.street_cred'] = this.getStreetCred() + this.streetCredModifier;
        }
        if (this.publicAwarenessModifier !== 0) {
            updateData['system.public_awareness'] = this.getPublicAwareness() + this.publicAwarenessModifier;
        }
        if (this.notorietyModifier !== 0) {
            updateData['system.notoriety'] = this.getNotoriety() + this.notorietyModifier;
        }
        if (!isEmpty(updateData)) {
            await this.actor.update(updateData);
        }
        void this.close();
    }

    static async #cancel(this: ReputationManager) {
        void this.close();
    }

    static override PARTS = {
        details: {
            template: SheetFlow.templateBase('actor/apps/reputation-manager/details')
        },
        footer: {
            template: SheetFlow.templateBase('actor/apps/reputation-manager/footer')
        }
    }

    static override DEFAULT_OPTIONS = {
        classes: [SR5_APPV2_CSS_CLASS, 'reputation-manager'],
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
            increase: ReputationManager.#increase,
            reduce: ReputationManager.#reduce,

            submitChanges: ReputationManager.#submitChanges,
            cancel: ReputationManager.#cancel,
        }
    }

}
