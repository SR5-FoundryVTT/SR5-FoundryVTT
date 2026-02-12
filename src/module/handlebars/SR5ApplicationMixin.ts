import { SR5_APPV2_CSS_CLASS } from '@/module/constants';

import { Identity } from 'fvtt-types/utils';
import { SR5Item } from '@/module/item/SR5Item';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5 } from '@/module/config';
import { LinksHelpers } from '@/module/utils/links';
import { SheetFlow } from '@/module/flows/SheetFlow';
import { SR5ActiveEffect } from '@/module/effect/SR5ActiveEffect';
import ApplicationV2 = foundry.applications.api.ApplicationV2;
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

const { TextEditor, SearchFilter } = foundry.applications.ux;
const { fromUuid } = foundry.utils;

export namespace SR5ApplicationMixinTypes {
    export interface RenderContext extends ApplicationV2.RenderContext, HandlebarsApplicationMixin.RenderContext {
        user: User;
        config: typeof SR5;
        system: SR5Actor['system'] | SR5Item['system'];

        isLimited: boolean;
        isEditable: boolean;
        isEditMode: boolean;
        isPlayMode: boolean;

        systemFields: Record<string, any>;
        expandedUuids: Record<string, { html: string }>;

        tab?: ApplicationV2.Tab;
        primaryTabs?: Record<string, ApplicationV2.Tab>;
    };

    export interface Configuration extends ApplicationV2.Configuration, HandlebarsApplicationMixin.Configuration {
        filters?: SearchFilter.Configuration[];
        dragDrop?: DragDrop.Configuration[];
    };

    export interface RenderOptions extends ApplicationV2.RenderOptions, HandlebarsApplicationMixin.RenderOptions {
        mode?: 'play' | 'edit';
        renderContext?: string;
    };
};

declare abstract class AnyApplicationV2 extends ApplicationV2<
    any,
    SR5ApplicationMixinTypes.Configuration,
    SR5ApplicationMixinTypes.RenderOptions
> {
    constructor(...args: any[]);
}

export function SR5ApplicationMixin<BaseClass extends Identity<typeof AnyApplicationV2>>(base: BaseClass) {
    type BaseType = InstanceType<
        HandlebarsApplicationMixin.Mix<
            typeof ApplicationV2<
                ApplicationV2.RenderContext,
                SR5ApplicationMixinTypes.Configuration,
                SR5ApplicationMixinTypes.RenderOptions
            >
        >
    >;

    return class SR5ApplicationMixin extends HandlebarsApplicationMixin(base) {

        // isEditable and document will come from the classes
        declare isEditable?: boolean;
        declare document?: SR5Item | SR5Actor;

        readonly #filters: SearchFilter[];
        private readonly expandedUuids = new Set<string>();
        private editIcon?: HTMLElement;
        private wrenchIcon?: HTMLElement;

        static override DEFAULT_OPTIONS = {
            classes: [SR5_APPV2_CSS_CLASS] as string[],
            form: {
                submitOnChange: true,
                closeOnSubmit: false,
            },
            window: {
                resizable: true,
            },
            actions: {
                toggleEditMode: SR5ApplicationMixin.#toggleEditMode,
                showItemDescription: SR5ApplicationMixin.#toggleListItemDescription,
                openSource: SR5ApplicationMixin.#openSource,
                openUuid: SR5ApplicationMixin.#openUuid,
                refresh: SR5ApplicationMixin.#refresh,
            },
        };

        constructor(...args: any[]) {
            super(...args);
            this.#filters = this.#createFilters();
        }

        #createFilters() {
            return this.options?.filters?.map((s) => {
                s.callback = s.callback?.bind(this);
                return new SearchFilter(s);
            }) ?? [];
        }

        static async #toggleEditMode(this: SR5ApplicationMixin, event: MouseEvent) {
            event.preventDefault();
            event.stopPropagation();
            if (this.isEditable) {
                if (this.isEditMode) {
                    await this.submit();
                }
                this._mode = this.isEditMode ? 'play' : 'edit';
            } else {
                this._mode = 'play';
            }
            await this.render();
        }

        protected _mode: 'play' | 'edit' = 'play';

        get isEditMode() {
            return this._mode === 'edit';
        }

        get isPlayMode() {
            return this._mode === 'play';
        }

        protected override async _prepareContext(
            options: Parameters<BaseType["_prepareContext"]>[0]
        ): Promise<SR5ApplicationMixinTypes.RenderContext> {
            const context = await super._prepareContext(options) as SR5ApplicationMixinTypes.RenderContext;
            context.isEditMode = this.isEditMode;
            context.isPlayMode = this.isPlayMode;
            if (this.document) {
                if (!context.system) {
                    if (this.isEditMode) {
                        context.system = this.document.toObject(false).system;
                    } else {
                        context.system = this.document.getRollData();
                    }
                }
                context.systemFields = this.document.system.schema.fields;
            }

            context.user = game.user;
            context.config = SR5;
            context.isLimited = !game.user?.isGM && !!this.document?.limited;
            context.isEditable = !!this.isEditable;

            context.primaryTabs = this._prepareTabs('primary');

            context.expandedUuids = {};
            for (const uuid of this.expandedUuids) {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                const document = await fromUuid(uuid) as SR5Item | SR5Actor | SR5ActiveEffect | null;
                if (document) {
                    if (document instanceof SR5Item || document instanceof SR5Actor) {
                        const html = await TextEditor.enrichHTML(document.system.description.value, {
                            secrets: document.isOwner,
                            rollData: document.getRollData(),
                        });

                        context.expandedUuids[uuid] = { html };
                    } else if (document instanceof SR5ActiveEffect) {
                        const html = await TextEditor.enrichHTML(document.description, {
                            secrets: document.isOwner,
                        });

                        context.expandedUuids[uuid] = { html };
                    }
                }
            }

            return context;
        }

        protected override _prepareTabs(group: string) {
            const parts = super._prepareTabs(group);
            for (const part of Object.values(parts)) {
                if (part.label) {
                    part.label = game.i18n.localize(part.label);
                }
            }
            return parts;
        }

        protected override async _preparePartContext(
            ...[partId, context, options]: Parameters<BaseType["_preparePartContext"]>
        ) {
            const partContext = await super._preparePartContext(partId, context, options) as SR5ApplicationMixinTypes.RenderContext;

            if (partContext?.primaryTabs) {
                if (partId in partContext.primaryTabs) {
                    partContext.tab = partContext.primaryTabs[partId];
                }
            }

            return partContext;
        }

        protected override _configureRenderOptions(options: Parameters<BaseType["_configureRenderOptions"]>[0]) {
            super._configureRenderOptions(options);
            if (options.mode && this.isEditable) this._mode = options.mode;
            // New sheets should always start in edit mode
            else if (options.renderContext === `create${this.document?.documentName}`) this._mode = 'edit';
        }

        /**
         * Help enriching editor field values to HTML used to display editor values as read-only HTML in sheets.
         *
         * @param editorValue A editor field value like Item.system.description.value
         * @param options TextEditor, enrichHTML.options passed through
         * @returns Enriched HTML result
         */
        async enrichEditorFieldToHTML(editorValue: string, options?: TextEditor.EnrichmentOptions): Promise<string> {
            return foundry.applications.ux.TextEditor.implementation.enrichHTML(editorValue, options);
        }

        /**
         * Show / hide the items description within a sheet item list.
         */
        static async #toggleListItemDescription(this: SR5ApplicationMixin, event: PointerEvent) {
            event.preventDefault();
            const target = event.target as HTMLElement;
            const uuid = SheetFlow.closestUuid(target);
            if (!uuid) return;
            if (this.expandedUuids.has(uuid)) {
                this.expandedUuids.delete(uuid);
                target.closest('.list-item-container')?.classList.remove('expanded');
            } else {
                this.expandedUuids.add(uuid);
                target.closest('.list-item-container')?.classList.add('expanded');
                const document = await fromUuid(uuid);
                let html: string | null = null;
                if (document instanceof SR5Item || document instanceof SR5Actor) {
                    html = await TextEditor.enrichHTML((document as any).system.description.value, {
                        secrets: document.isOwner,
                        rollData: document.getRollData(),
                    });
                } else if (document instanceof SR5ActiveEffect) {
                    html = await TextEditor.enrichHTML(document.description, {
                        secrets: document.isOwner,
                    });
                }
                if (html) {
                    target.closest('.list-item-container')!.querySelector('.description-body')!.innerHTML = html;
                }
            }
        }

        static async #refresh(this: SR5ApplicationMixin) {
            await this.render();
        }

        static async #openSource(event: PointerEvent) {
            const sourceId = SheetFlow.closestSource(event.target);
            if (sourceId) {
                await LinksHelpers.openSource(sourceId);
            }
        }

        static async #openUuid(event: PointerEvent) {
            const uuid = SheetFlow.closestUuid(event.target);
            if (uuid) {
                const document = await fromUuid(uuid);
                if (document instanceof SR5Item || document instanceof SR5Actor || document instanceof SR5ActiveEffect) {
                    await document.sheet?.render(true);
                }
            }
        }

        /**
         * Do any final preparations when rendering the sheet
         */
        protected override async _renderHTML(...[context, options]: Parameters<BaseType["_renderHTML"]>) {
            // push footer to the end of parts os it is rendered at the bottom
            if (options.parts?.includes('footer')) {
                const index = options.parts.indexOf('footer');
                if (index !== options.parts.length - 1) {
                    options.parts.push(options.parts.splice(index, 1)[0]);
                }
            }
            if (options.parts?.includes('header')) {
                const index = options.parts.indexOf('header');
                if (index !== 0) {
                    options.parts.unshift(options.parts.splice(index, 1)[0]);
                }
            }
            return super._renderHTML(context, options) as Promise<Record<string, HTMLElement>>;
        }

        protected override async _onRender(...[context, options]: Parameters<BaseType["_onRender"]>) {
            this.#filters.forEach(d => d.bind(this.element));
            return super._onRender(context, options);
        }

        /**
         * Handle anything needed after the sheet has been rendered
         * - register tagify inputs
         */
        protected override async _postRender(...[context, options]: Parameters<BaseType["_postRender"]>) {
            await super._postRender(context, options);
            // once we render, process the Tagify Elements to we rendered
            Hooks.call('sr5_processTagifyElements', this.element);

            if (this.editIcon && this.wrenchIcon) {
                this.editIcon.className = this.isEditMode ? 'fas fa-toggle-large-off fa-stack-2x'
                    : 'fas fa-toggle-large-on fa-stack-2x';
                this.wrenchIcon.style.visibility = this.isEditMode ? 'hidden' : 'visible';
            }
        }

        protected override async _renderFrame(options: Parameters<BaseType["_renderFrame"]>[0]) {
            const frame = await super._renderFrame(options);
            if (this.isEditable) {
                const button = document.createElement('button');
                button.className = 'header-control icon fa-stack';
                button.style.fontSize = '.6rem';
                button.dataset.tooltip = 'SR5.Tooltips.ToggleEditMode';
                button.dataset.action = 'toggleEditMode';

                this.editIcon = document.createElement('i');
                button.appendChild(this.editIcon);
                this.editIcon.className = this.isEditMode ? 'fas fa-toggle-large-off fa-stack-2x'
                    : 'fas fa-toggle-large-on fa-stack-2x';

                this.wrenchIcon = document.createElement('i');
                button.appendChild(this.wrenchIcon);
                this.wrenchIcon.className = 'fas fa-wrench fa-stack-1x fa-rotate-270 edit-wrench-icon';

                this.window?.header?.prepend(button);
            }

            return frame;
        }
    };
}
