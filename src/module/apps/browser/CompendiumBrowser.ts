import { LinksHelpers } from "@/module/utils/links";
import AppV2 = foundry.applications.api.ApplicationV2;
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

type Context = AppV2.RenderContext & Record<string, any>;

/**
 * A generic compendium browser application that allows users to view and search
 * across multiple compendium packs simultaneously using checkboxes.
 */
export class CompendiumBrowser extends HandlebarsApplicationMixin(ApplicationV2<Context>) {
    /** The list of all discovered compendia. */
    private readonly _packs: CompendiumCollection<any>[] = [];

    /** An array of IDs for the currently selected compendium packs. */
    private _activePackIds: string[] = [];

    /** The current string being used to filter results. */
    private _searchQuery: string = "";

    /** The cursor position in the search input to preserve during re-renders. */
    private _searchCursorPosition: number | null = null;

    private static readonly typesPart = {
        actors: [] as string[],
        items: [] as string[],
    };

    /** A reference to the tooltip DOM element. */
    #tooltipElement: HTMLElement | null = null;
    /** A timeout handle to manage the tooltip's hide delay. */
    #tooltipTimeout: number | null = null;

    constructor(options?: ConstructorParameters<typeof ApplicationV2>[0]) {
        super(options);
        this._packs = [...game.packs.values()] as CompendiumCollection<any>[];
        if (this._packs.length > 0) {
            this._activePackIds.push(this._packs[1].collection);
        }

        CompendiumBrowser.typesPart.actors = Object.keys(CONFIG.Actor.dataModels);
        CompendiumBrowser.typesPart.items = Object.keys(CONFIG.Item.dataModels);
    }

    /**
     * Defines the default options for the Compendium Browser application window.
     */
    static override DEFAULT_OPTIONS = {
        id: "compendium-browser",
        tag: "form",
        classes: ["compendium-browser"],
        position: { width: 1050, height: 700 },
        window: {
            title: "Compendium Browser",
            minimizable: true,
            resizable: true
        },
        actions: {
            clearSearch: this.prototype._onClearSearch.bind(this),
            openDoc: this.#openDoc.bind(this),
            openSource: this.#openSource.bind(this),
            togglePack: this.prototype._onTogglePack.bind(this),
        }
    };

    /**
     * Defines the Handlebars template parts used by this application.
     */
    static override PARTS = {
        filters: {
            template: "systems/shadowrun5e/dist/templates/apps/compendium-browser/filters.hbs",
        },
        results: {
            template: "systems/shadowrun5e/dist/templates/apps/compendium-browser/results.hbs",
        },
    };

    /**
     * The title of the application window.
     */
    override get title() {
        return "Compendium Browser";
    }

    static async #openDoc(event: MouseEvent, target: HTMLElement) {
        const el = target.closest<HTMLElement>("[data-uuid]");
        const uuid = el?.dataset.uuid;
        if (!uuid) return;

        const doc = await fromUuid(uuid) as Actor | Item | null;
        await doc?.sheet?.render(true);
    }

    static async #openSource(event: MouseEvent, target: HTMLElement) {
        const el = target.closest<HTMLElement>("[data-action='openSource']");
        const source = el?.textContent?.trim();
        if (!source) return;

        await LinksHelpers.openSource(source);
    }

    /**
     * Attach event listeners to the application's rendered HTML.
     */
    protected override async _onRender(...args: Parameters<AppV2<Context>["_onRender"]>): Promise<void> {
        await super._onRender(...args);
        this.element.addEventListener("dragstart", this._onDrag.bind(this));

        const searchInput = this.element.querySelector<HTMLInputElement>("#compendium-browser-search");
        if (searchInput) {
            if (this._searchCursorPosition) {
                searchInput.focus();
                searchInput.setSelectionRange(this._searchCursorPosition, this._searchCursorPosition);
                this._searchCursorPosition = null;
            }
            searchInput.addEventListener("input", event =>  { void this._onSearch(event, searchInput); });
        }

        const resultsContainer = this.element.querySelector<HTMLElement>(".compendium-list");
        if (resultsContainer) {
            // We use event delegation on the container for efficiency
            // resultsContainer.addEventListener("mouseover", this.#onRowMouseEnter.bind(this));
            // resultsContainer.addEventListener("mouseout", this.#onRowMouseLeave.bind(this));
            // resultsContainer.addEventListener("mousemove", this.#onRowMouseMove.bind(this));
        }
    }

    /**
     * Prepare the data object to be rendered by the Handlebars template.
     */
    override async _prepareContext(options: Parameters<AppV2["_prepareContext"]>[0]) {
        const activePacks = this._packs.filter(p => this._activePackIds.includes(p.collection));
        const indexes = await Promise.all(activePacks.map(async pack => pack.getIndex()));
        let entries = indexes.flatMap(index => [...index.values()]) as CompendiumCollection.IndexEntry<'Item'>[];

        if (this._searchQuery) {
            const query = this._searchQuery.toLowerCase();
            entries = entries.filter(i => i.name?.toLowerCase().includes(query));
        }

        const packsForFilters = this._packs.map(p => ({
            id: p.collection,
            label: p.metadata.label,
            isChecked: this._activePackIds.includes(p.collection),
        }));

        return {
            ...(await super._prepareContext(options)),
            packs: packsForFilters,
            types: CompendiumBrowser.typesPart.items,
            entries: entries,
            searchQuery: this._searchQuery,
        };
    }

    /**
     * Handle the dragstart event for a compendium entry.
     */
    private _onDrag(event: DragEvent) {
        const target = event.target as HTMLElement | null;
        const { uuid } = target?.closest<HTMLElement>("[data-uuid]")?.dataset ?? {};
        if (!uuid) return;
        const { type } = foundry.utils.parseUuid(uuid);
        try {
            event.dataTransfer?.setData("text/plain", JSON.stringify({ type, uuid }));
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Handle ticking or unticking a compendium pack checkbox.
     */
    private async _onTogglePack(event: Event, target: HTMLInputElement): Promise<void> {
        const filterId = target.dataset.filterId;
        if (!filterId) return;

        if (target.checked) {
            if (!this._activePackIds.includes(filterId)) {
                this._activePackIds.push(filterId);
            }
        } else {
            this._activePackIds = this._activePackIds.filter(id => id !== filterId);
        }
        await this.render();
    }

    /**
     * Handle the input event on the search field to live-filter the results.
     */
    private async _onSearch(event: Event, target: HTMLInputElement): Promise<void> {
        this._searchCursorPosition = target.selectionStart;
        this._searchQuery = target.value;
        await this.render();
    }

    /**
     * Handle clicking the clear search button.
     */
    private async _onClearSearch(): Promise<void> {
        this._searchQuery = "";
        await this.render();
    }

    /**
     * Handle the mouse entering a result row to show the tooltip.
     */
    async #onRowMouseEnter(event: MouseEvent): Promise<void> {
        const row = (event.target as HTMLElement)?.closest<HTMLElement>(".result-row");
        if (!row) return;

        // Clear any pending timeout to hide the tooltip
        if (this.#tooltipTimeout) clearTimeout(this.#tooltipTimeout);

        const entryElem = row.closest<HTMLElement>("[data-uuid]");
        const uuid = entryElem?.dataset.uuid;
        if (!uuid) return;

        const item = await fromUuid(uuid) as Item;
        if (!item) return;

        // IMPORTANT: Update this path to your actual weapon card template
        const templatePath = "systems/shadowrun5e/dist/templates/apps/compendium-browser/cards/weapon.hbs";
        const content = await foundry.applications.handlebars.renderTemplate(templatePath, { item: item.toObject(false), system: item.toObject(false).system });

        // Create the tooltip element if it doesn't exist
        if (!this.#tooltipElement) {
            this.#tooltipElement = document.createElement("aside");
            this.#tooltipElement.className = "item-preview-tooltip";
            document.body.append(this.#tooltipElement);
        }

        this.#tooltipElement.innerHTML = content;
        this.#tooltipElement.style.display = "block";

        // Position it immediately
        this.#onRowMouseMove(event);
    }

    /**
     * Handle the mouse leaving a result row to hide the tooltip.
     */
    #onRowMouseLeave(event: MouseEvent): void {
        // Set a short timeout to hide/remove the tooltip. This prevents flickering.
        this.#tooltipTimeout = window.setTimeout(() => {
            if (this.#tooltipElement) {
                this.#tooltipElement.remove();
                this.#tooltipElement = null;
            }
        }, 50);
    }

    /**
     * Handle the mouse moving over a result row to update the tooltip's position.
     */
    #onRowMouseMove(event: MouseEvent): void {
        if (!this.#tooltipElement) return;

        let top = event.clientY;
        let left = event.clientX;

        const tooltipWidth = this.#tooltipElement.offsetWidth;
        const tooltipHeight = this.#tooltipElement.offsetHeight;

        // Prevent tooltip from going off the screen
        if (left + tooltipWidth > window.innerWidth)
            left = event.clientX - tooltipWidth;
        if (top + tooltipHeight > window.innerHeight)
            top = event.clientY - tooltipHeight;

        this.#tooltipElement.style.top = `${top}px`;
        this.#tooltipElement.style.left = `${left}px`;
    }

    /*
     * Ensures the tooltip is removed when the application window is closed.
     */
    override async close(...args: Parameters<AppV2["close"]>) {
        if (this.#tooltipTimeout)
            clearTimeout(this.#tooltipTimeout);
        this.#tooltipTimeout = null;

        if (this.#tooltipElement) {
            this.#tooltipElement.remove();
            this.#tooltipElement = null;
        }

        return super.close(...args);
    }
}
