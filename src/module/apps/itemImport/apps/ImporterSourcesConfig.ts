import { SYSTEM_NAME, FLAGS } from "@/module/constants";

import AppV2 = foundry.applications.api.ApplicationV2;
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

interface ImporterContext extends AppV2.RenderContext {
    availablePacks: { id: string; label: string }[];
    selectedPacks: { id: string; label: string; isFirst: boolean; isLast: boolean }[];
}

const BaseClass = HandlebarsApplicationMixin(ApplicationV2<ImporterContext>);
type BaseClassType = InstanceType<typeof BaseClass>;

/**
 * The configuration window for the Actor Importer.
 * Extends ApplicationV2 with the Handlebars Mixin.
 */
export class ImporterSourcesConfig extends BaseClass {
    /**
     * Store the pending changes locally.
     * We initialize it from the settings when the app is created.
     */
    private selectedIds: string[];

    constructor(...args: ConstructorParameters<typeof BaseClass>) {
        super(...args);
        // Load the saved setting into our instance state
        this.selectedIds = game.settings.get(SYSTEM_NAME, FLAGS.ImporterCompendiumOrder);
    }

    /**
     * Default options for the application window.
     */
    static override DEFAULT_OPTIONS = {
        ...super.DEFAULT_OPTIONS,
        id: "importer-config-app",
        tag: "form",
        position: {
            width: 700,
            height: "auto" as const,
        },
        window: {
            resizable: true,
            classes: ["sr5e", "importer-config"],
            icon: "fas fa-cogs",
        }
    };

    /**
     * Template parts used by the HandlebarsApplicationMixin.
     */
    static override PARTS = {
        content: {
            template: "systems/shadowrun5e/templates/apps/importer-sources-config.hbs",
        },
    };

    override get title() {
        return "Importer Sources Configuration";
    }

    /**
     * Prepare data for the Handlebars template.
     * This is the ApplicationV2 way to prepare context.
     */
    protected override async _prepareContext(...args: Parameters<BaseClassType["_prepareContext"]>) {
        const context = await super._prepareContext(...args);

        const allPacks = game.packs
            .filter((pack) => pack.metadata.type === "Item")
            .map((pack) => ({id: pack.collection, label: pack.metadata.label}));

        context.selectedPacks = this.selectedIds
            .map((id, index) => {
                const pack = allPacks.find((p) => p.id === id);
                if (!pack) return null;
                return {
                    ...pack,
                    isFirst: index === 0,
                    isLast: index === this.selectedIds.length - 1,
                };
            }).filter((a) => a !== null);

        const selectedIdSet = new Set(this.selectedIds);
        context.availablePacks = allPacks.filter((p) => !selectedIdSet.has(p.id));

        return context;
    }

    /**
     * Add event listeners after the template is rendered.
     * This is provided by the HandlebarsApplicationMixin.
     */
    protected override async _onRender(...args: Parameters<BaseClassType["_onRender"]>) {
        await super._onRender(...args);

        const $html = $(this.element);
        if (!$html) return;

        // --- Action Buttons (Add, Remove, Move) ---
        $html.find<HTMLButtonElement>("button[data-action]").on("click", (event) => {
            event.preventDefault();
            const action = event.currentTarget.dataset.action;
            const packId = event.currentTarget.dataset.packId;
            if (!packId) return;
            this._handleAction(action, packId);
        });

        // We manually bind the save button since there's no _updateObject
        $html.find<HTMLButtonElement>('button[type="submit"]').on("click", (event) => {
            event.preventDefault();
            void this._onSave();
        });
    }

    /**
     * Handles list manipulation (add, remove, move).
     */
    private _handleAction(action: string | undefined, packId: string) {
        const idx = this.selectedIds.indexOf(packId);

        switch (action) {
            case "add":
                if (idx === -1) this.selectedIds.push(packId);
                break;
            case "remove":
                if (idx > -1) this.selectedIds.splice(idx, 1);
                break;
            case "move-up":
                if (idx > 0) {
                    // Swap with the item before it
                    [this.selectedIds[idx - 1], this.selectedIds[idx]] = [
                        this.selectedIds[idx],
                        this.selectedIds[idx - 1],
                    ];
                }
                break;
            case "move-down":
                if (idx > -1 && idx < this.selectedIds.length - 1) {
                    // Swap with the item after it
                    [this.selectedIds[idx + 1], this.selectedIds[idx]] = [
                        this.selectedIds[idx],
                        this.selectedIds[idx + 1],
                    ];
                }
                break;
        }

        // Re-render the application to show the UI changes
        void this.render();
    }

    /**
     * Handle the save button click.
     */
    private async _onSave() {
        await game.settings.set(SYSTEM_NAME, FLAGS.ImporterCompendiumOrder, this.selectedIds);
        ui.notifications.info("Actor Importer configuration saved!");
        void this.close();
    }
}
