import { SR5_APPV2_CSS_CLASS } from '@/module/constants';


import ApplicationV2 = foundry.applications.api.ApplicationV2;
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;
import { SR5Item } from '@/module/item/SR5Item';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { SheetFlow } from '@/module/flows/SheetFlow';

export default <BaseClass extends HandlebarsApplicationMixin.BaseClass>(base: BaseClass): HandlebarsApplicationMixin.Mix<BaseClass> => {
    return class SR5ApplicationMixin extends foundry.applications.api.HandlebarsApplicationMixin(base) {
        declare document: SR5Item | SR5Actor;
        declare element: HTMLElement;
        declare window: ApplicationV2.Window;
        declare editIcon: HTMLElement;
        declare isEditable: boolean;

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
            }
        }

        static async #toggleEditMode(this, event: MouseEvent) {
            event.preventDefault();
            event.stopPropagation();
            if (this.isEditable) {
                this._isEditMode = !this._isEditMode;
            } else {
                this._isEditMode = false;
            }
            await this.render();
        }

        protected _isEditMode = false;

        async _prepareContext(options) {
            // @ts-ignore
            const context = await super._prepareContext(options);
            context.isEditMode = this._isEditMode;
            context.isPlayMode = !this._isEditMode;
            if (this.document) {
                if (!context.system) {
                    context.system = this.document.toObject(false).system;
                }
                context.systemFields = this.document.system.schema.fields;
            }

            context.user = game.user;

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
        static async #toggleListItemDescription(event) {
            event.preventDefault();
            // find the list-item parent so we can find the child item
            const item = $(event.target).parents('.new-list-item-container');
            const field = $(item).find('.new-list-item-description');
            field.toggle();
        }

        /**
         * Do any final preparations when rendering the sheet
         * @param context
         * @param options
         */
        protected override async _renderHTML(context, options) {
            // push footer to the end of parts os it is rendered at the bottom
            if (options.parts.includes("footer")) {
                const index = options.parts.indexOf("footer");
                if (index !== options.parts.length - 1) {
                    options.parts.push(options.parts.splice(index, 1)[0]);
                }
            }
            if (options.parts.includes("header")) {
                const index = options.parts.indexOf("header");
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
                this.editIcon.className = this._isEditMode ? 'fas fa-file-pen' : 'fas fa-pen-to-square';
            }
        }

        async _renderFrame(options) {
            // @ts-ignore
            const frame = await super._renderFrame(options);
            if (this.isEditable) {
                const button = document.createElement('button');
                button.setAttribute('font-size', '150%');
                button.className = 'header-control icon'
                button.dataset.tooltip = "SR5.Tooltips.ToggleEditMode"
                this.editIcon = document.createElement('i');
                button.appendChild(this.editIcon);
                this.editIcon.className = this._isEditMode ? 'fas fa-file-pen' : 'fas fa-pen-to-square';
                button.dataset.action = "toggleEditMode";

                this.window?.controls?.after(button);
            }

            return frame;
        }

    } // end of SR5ApplicationMixin
}
