import { DeepPartial } from 'fvtt-types/utils';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5Item } from '@/module/item/SR5Item';
import { SheetFlow } from '@/module/flows/SheetFlow';
import { MetatypeFlow } from '@/module/flows/MetatypeFlow';
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';
import { isElementInstance } from '@/module/utils/dom';

const { fromUuid } = foundry.utils;
import ApplicationV2 = foundry.applications.api.ApplicationV2;
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

export interface MetatypeCardData {
    uuid: string;
    name: string;
    originalName: string;
    img: string | null;
    karma: number;
    sourceLabel: string;
    isSelected: boolean;
}

export interface MetatypeSelectorContext extends HandlebarsApplicationMixin.RenderContext {
    items: MetatypeCardData[];
    selectedUuid: string | null;
    hasCurrentMetatype: boolean;
}

export class MetatypeSelector extends HandlebarsApplicationMixin(ApplicationV2)<MetatypeSelectorContext> {
    selectedUuid: string | null = null;
    private searchFilter = '';

    constructor(private readonly actor: SR5Actor, options: DeepPartial<ApplicationV2.Configuration> = {}) {
        super(options);
    }

    override get title(): string {
        return game.i18n.localize('SR5.MetatypeSelector.Title');
    }

    async getMetatypes(): Promise<SR5Item<'metatype'>[]> {
        const metatypes: SR5Item<'metatype'>[] = [];

        // Compendium metatypes
        const pack = game.packs.get('shadowrun5e.sr5e-metatypes') || game.packs.get('sr5e-metatypes');
        if (pack) {
            const docs = await pack.getDocuments();
            for (const doc of docs) {
                if (doc instanceof SR5Item && doc.isType('metatype')) {
                    metatypes.push(doc);
                }
            }
        }

        // World metatypes
        if (game.items) {
            for (const item of game.items.values()) {
                if (item instanceof SR5Item && item.isType('metatype')) {
                    metatypes.push(item);
                }
            }
        }

        return metatypes;
    }

    override async _prepareContext(options: Parameters<ApplicationV2['_prepareContext']>[0]): Promise<MetatypeSelectorContext> {
        const context = await super._prepareContext(options);
        const docs = await this.getMetatypes();

        // Preselect the metatype currently on the actor
        if (this.selectedUuid === null) {
            const currentItem = this.actor.metatypeItem;
            const currentUuid = currentItem?.uuid ?? (this.actor.isType('character') ? this.actor.system.metatypeUuid : null);
            const currentName = currentItem?.name ?? (this.actor.isType('character') ? this.actor.system.metatype : '');

            const match = docs.find(d => {
                if (currentUuid && d.uuid === currentUuid) return true;
                if (currentName) {
                    const dName = d.name.toLowerCase();
                    const cName = currentName.toLowerCase();
                    if (dName === cName) return true;
                    if (d.system?.metatype?.toLowerCase() === cName) return true;
                    if (MetatypeFlow.localizeMetatype(d).toLowerCase() === cName) return true;
                }
                return false;
            });
            if (match?.uuid) {
                this.selectedUuid = match.uuid;
            }
        }

        context.items = docs.map(doc => ({
            uuid: doc.uuid ?? '',
            name: MetatypeFlow.localizeMetatype(doc),
            originalName: doc.name,
            img: doc.img,
            karma: doc.system.karma ?? 0,
            sourceLabel: doc.pack ? 'Compendium' : 'World',
            isSelected: Boolean(this.selectedUuid && this.selectedUuid === doc.uuid),
        })).sort((a, b) => a.name.localeCompare(b.name));

        context.selectedUuid = this.selectedUuid;
        context.hasCurrentMetatype = Boolean(this.actor.metatypeItem || (this.actor.isType('character') && this.actor.system.metatype));
        return context;
    }

    override async _onRender(
        context: DeepPartial<MetatypeSelectorContext>,
        options: DeepPartial<ApplicationV2.RenderOptions>
    ): Promise<void> {
        const searchInput = this.element.querySelector<HTMLInputElement>('[name="metatype-search"]');
        if (searchInput) {
            searchInput.value = this.searchFilter;
            searchInput.addEventListener('input', (event: Event) => {
                const target = event.target as HTMLInputElement;
                this.searchFilter = target.value.trim().toLowerCase();
                this.filterCardsLocally();
            });
        }

        if (this.searchFilter) {
            this.filterCardsLocally();
        }

        return super._onRender(context, options);
    }

    private filterCardsLocally(): void {
        const cards = this.element.querySelectorAll<HTMLElement>('.metatype-card');
        const query = this.searchFilter;
        let visibleCount = 0;
        for (const card of cards) {
            const text = (card.textContent || '').toLowerCase();
            const originalName = (card.dataset.originalName || '').toLowerCase();
            const matches = !query || text.includes(query) || originalName.includes(query);
            card.style.display = matches ? '' : 'none';
            if (matches) visibleCount++;
        }
        const noResults = this.element.querySelectorAll<HTMLElement>('.metatype-no-results');
        for (const el of noResults) {
            el.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    static async #selectCard(this: MetatypeSelector, event: PointerEvent): Promise<void> {
        event.preventDefault();
        if (!isElementInstance(event.target, HTMLElement)) return;
        const card = event.target.closest<HTMLElement>('[data-uuid]');
        this.selectedUuid = card?.dataset.uuid ?? null;
        await this.render();
    }

    static async #submitChanges(this: MetatypeSelector, event: Event): Promise<void> {
        event.preventDefault();
        if (!this.selectedUuid) return;
        const item = await fromUuid(this.selectedUuid);
        if (item instanceof SR5Item && item.isType('metatype')) {
            await MetatypeFlow.applyMetatypeToActor(this.actor, item);
        }
        await this.close();
    }

    static async #removeMetatype(this: MetatypeSelector, event: Event): Promise<void> {
        event.preventDefault();
        const metatypeItem = this.actor.metatypeItem;
        if (metatypeItem) {
            await metatypeItem.delete();
        } else if (this.actor.isType('character')) {
            await this.actor.update({
                system: {
                    metatype: '',
                    metatypeUuid: null,
                }
            });
        }
        await this.close();
    }

    static #cancel(this: MetatypeSelector, event: Event): void {
        event.preventDefault();
        void this.close();
    }

    static override PARTS = {
        details: {
            template: SheetFlow.templateBase('actor/apps/metatype-selector/details'),
        },
        footer: {
            template: SheetFlow.templateBase('actor/apps/metatype-selector/footer'),
        },
    };

    static override DEFAULT_OPTIONS = {
        classes: [SR5_APPV2_CSS_CLASS, 'metatype-selector'],
        position: {
            width: 540,
            height: 440,
        },
        window: {
            resizable: true,
        },
        actions: {
            selectCard: MetatypeSelector.#selectCard,
            submitChanges: MetatypeSelector.#submitChanges,
            removeMetatype: MetatypeSelector.#removeMetatype,
            cancel: MetatypeSelector.#cancel,
        },
    };
}
