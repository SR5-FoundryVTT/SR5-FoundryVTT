import { SR5Actor } from '@/module/actor/SR5Actor';
import { SheetFlow } from '@/module/flows/SheetFlow';
import { SR5_APPV2_CSS_CLASS } from '@/module/constants';

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class InventoryRenameApp extends HandlebarsApplicationMixin(ApplicationV2)<any> {
    private newName = '';

    constructor(private readonly actor: SR5Actor,
                private readonly inventory: string,
                private readonly actionMode: 'edit' | 'create', options = {}) {
        super(options);
        this.newName = inventory;
    }

    override get title() {
        return game.i18n.localize("SR5.InventoryRename.Title");
    }

    override async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.actor = this.actor;
        context.newName = this.newName;
        return context;
    }

    static async #submitChanges(this: InventoryRenameApp, event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.actor.inventory.exists(this.newName)) {
            ui.notifications.warn("Inventory with that name already exists");
            return;
        }
        if (this.actionMode === 'create') {
            await this.actor.inventory.create(this.newName);
        } else if (this.actionMode === 'edit') {
            await this.actor.inventory.rename(this.inventory, this.newName);
        }
        if (this.actor.sheet) {
            (this.actor.sheet as any).selectedInventory = this.newName;
            await this.actor.sheet.render();
        }
        this.close();
    }

    static async #cancel(this: InventoryRenameApp, event) {
        this.close();
    }

    override async _onRender(context, options) {
        this.element.querySelector<HTMLInputElement>('[name="inventory-name"]')
            ?.addEventListener('change', (event: any) => {
                this.newName = event.target?.value ?? '';
            })
        return super._onRender(context, options);
    }

    static override PARTS = {
        details: {
            template: SheetFlow.templateBase('actor/apps/inventory-rename/details')
        },
        footer: {
            template: SheetFlow.templateBase('actor/apps/inventory-rename/footer')
        }
    }

    static override DEFAULT_OPTIONS = {
        classes: [SR5_APPV2_CSS_CLASS, 'inventory-rename'],
        form: {
            submitOnChange: false,
            closeOnSubmit: false,
        },
        position: {
            width: 300,
        },
        window: {
            resizable: true,
        },
        actions: {
            submitChanges: InventoryRenameApp.#submitChanges,
            cancel: InventoryRenameApp.#cancel,
        }
    }

}
