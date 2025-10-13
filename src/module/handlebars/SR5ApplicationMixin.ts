import { SR5_APPV2_CSS_CLASS } from '@/module/constants';

import { SR5Item } from '@/module/item/SR5Item';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5 } from '@/module/config';
import { LinksHelpers } from '@/module/utils/links';
import { SheetFlow } from '@/module/flows/SheetFlow';
import ApplicationV2 = foundry.applications.api.ApplicationV2;
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;
import { SR5ActiveEffect } from '@/module/effect/SR5ActiveEffect';

export default <BaseClass extends HandlebarsApplicationMixin.BaseClass>(base: BaseClass): HandlebarsApplicationMixin.Mix<BaseClass> => {
    return class SR5ApplicationMixin extends foundry.applications.api.HandlebarsApplicationMixin(base) {
        declare document: SR5Item | SR5Actor;
        declare element: HTMLElement;
        declare window: ApplicationV2.Window;
        declare editIcon: HTMLElement;
        declare isEditable: boolean;
        declare options: typeof SR5ApplicationMixin.DEFAULT_OPTIONS;

        private expandedUuids = new Set<string>();

        static DEFAULT_OPTIONS = {
            classes: [SR5_APPV2_CSS_CLASS],
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
            },
        };

        static async #toggleEditMode(this, event: MouseEvent) {
            event.preventDefault();
            event.stopPropagation();
            if (this.isEditable) {
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

        async _prepareContext(options) {
            // @ts-ignore
            const context = await super._prepareContext(options);
            context.isEditMode = this.isEditMode;
            context.isPlayMode = this.isPlayMode;
            if (this.document) {
                if (!context.system) {
                    context.system = this.document.toObject(false).system;
                }
                context.systemFields = this.document.system.schema.fields;
            }

            context.user = game.user;
            context.config = SR5;

            context.expandedUuids = {};
            for (const uuid of this.expandedUuids) {
                const document = SheetFlow.fromUuidSync(uuid);
                if (document) {
                    if (document instanceof SR5Item || document instanceof SR5Actor) {
                        console.log('document', document);
                        const html = await TextEditor.enrichHTML((document as any).system.description.value, {
                            secrets: document.isOwner,
                            rollData: document.getRollData(),
                        });

                        context.expandedUuids[uuid] = {
                            html,
                        }
                    } else if (document instanceof SR5ActiveEffect) {
                        const html = await TextEditor.enrichHTML(document.description, {
                            secrets: document.isOwner,
                        });

                        context.expandedUuids[uuid] = {
                            html,
                        }
                    }
                }
            }

            return context;
        }

        override async _preparePartContext(partId, context, options) {
            const partContext = await super._preparePartContext(partId, context, options);

            if (partContext?.primaryTabs) {
                if (partId in partContext.primaryTabs) {
                    partContext.tab = partContext.primaryTabs[partId];
                }
            }

            return partContext;
        }

        /**
         * Show / hide the items description within a sheet item l ist.
         */
        static async #toggleListItemDescription(this: SR5ApplicationMixin, event) {
            event.preventDefault();
            const uuid = SheetFlow.closestUuid(event.target);
            if (!uuid) return;
            if (this.expandedUuids.has(uuid)) {
                this.expandedUuids.delete(uuid);
            } else {
                this.expandedUuids.add(uuid);
            }
            // @ts-expect-error i hate mixxins
            await this.render();
        }

        static async #openSource(event) {
            const sourceId = SheetFlow.closestSource(event.target);
            if (sourceId) {
                await LinksHelpers.openSource(sourceId);
            }
        }

        static async #openUuid(event) {
            const uuid = SheetFlow.closestUuid(event.target);
            if (uuid) {
                const document = SheetFlow.fromUuidSync(uuid);
                if (document && (document instanceof SR5Item || document instanceof SR5Actor || document instanceof SR5ActiveEffect)) {
                    document.sheet?.render(true);
                }
            }
        }

        /**
         * Do any final preparations when rendering the sheet
         * @param context
         * @param options
         */
        protected override async _renderHTML(context, options) {
            // push footer to the end of parts os it is rendered at the bottom
            if (options.parts.includes('footer')) {
                const index = options.parts.indexOf('footer');
                if (index !== options.parts.length - 1) {
                    options.parts.push(options.parts.splice(index, 1)[0]);
                }
            }
            if (options.parts.includes('header')) {
                const index = options.parts.indexOf('header');
                if (index !== 0) {
                    options.parts.unshift(options.parts.splice(index, 1)[0]);
                }
            }
            return await super._renderHTML(context, options);
        }

        /**
         * Handle anything needed after the sheet has been rendered
         * - register tagify inputs
         * @param context
         * @param options
         */
        async _postRender(context, options) {
            // @ts-ignore
            await super._postRender(context, options);
            // once we render, process the Tagify Elements to we rendered
            Hooks.call('sr5_processTagifyElements', this.element);

            if (this.editIcon) {
                this.editIcon.className = this.isEditMode ? 'fas fa-toggle-off' : 'fas fa-toggle-on';
            }
        }

        async _renderFrame(options) {
            // @ts-ignore
            const frame = await super._renderFrame(options);
            if (this.isEditable) {
                const button = document.createElement('button');
                button.style.fontSize = '150%';
                button.className = 'header-control icon';
                button.dataset.tooltip = 'SR5.Tooltips.ToggleEditMode';
                this.editIcon = document.createElement('i');
                button.appendChild(this.editIcon);
                this.editIcon.className = this.isEditMode ? 'fas fa-toggle-off' : 'fas fa-toggle-on';
                button.dataset.action = 'toggleEditMode';

                this.window?.header?.prepend(button);
            }

            return frame;
        }
    }; // end of SR5ApplicationMixin
}
