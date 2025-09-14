import { LinksHelpers } from "@/module/utils/links";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

// --- Type Definitions ---
type Context = foundry.applications.api.ApplicationV2.RenderContext & Record<string, any>;
type FilterEntry = { value: string; id: string; selected: boolean };
const Base = HandlebarsApplicationMixin(ApplicationV2<Context>);
type BaseType = InstanceType<typeof Base>;

/**
 * A generic compendium browser application that allows users to view and search
 * across multiple compendium packs simultaneously.
 */
export class CompendiumBrowser extends Base {
    // --- Static Configuration ---

    static override DEFAULT_OPTIONS = {
        tag: "form",
        id: "compendium-browser",
        classes: ["compendium-browser"],
        position: { width: 900, height: 750 },
        window: {
            icon: "fa-solid fa-book-open-reader",
            title: "Compendium Browser",
            minimizable: true,
            resizable: true,
        },
        actions: {
            clearSearch: async (...args: Parameters<CompendiumBrowser["_onClearSearch"]>) =>
                this.prototype._onClearSearch.apply(this, args),
            openDoc: async (...args: Parameters<CompendiumBrowser["_openDoc"]>) => this.prototype._openDoc.apply(this, args),
            openSource: async (...args: Parameters<CompendiumBrowser["_openSource"]>) =>
                this.prototype._openSource.apply(this, args),
        },
    };

    static override PARTS = {
        tabs: { template: "systems/shadowrun5e/dist/templates/apps/compendium-browser/tabs.hbs" },
        filters: { template: "systems/shadowrun5e/dist/templates/apps/compendium-browser/filters.hbs" },
        results: { template: "systems/shadowrun5e/dist/templates/apps/compendium-browser/results.hbs" },
    };

    static override TABS = {
        tabs: {
            initial: "Item",
            tabs: [
                { id: "Actor", icon: "fa-solid fa-user", label: "Actors" },
                { id: "Item", icon: "fa-solid fa-suitcase", label: "Items" },
            ],
        },
    };

    // --- Instance State ---

    private activeTab: "Actor" | "Item" = "Item";
    private allFilters: FilterEntry[] = [];
    private readonly _packs: CompendiumCollection<any>[] = [];
    private _activePackIds: string[] = [];
    private _searchQuery: string = "";
    private _searchCursorPosition: number | null = null;
    #tooltipElement: HTMLElement | null = null;
    #tooltipTimeout: number | null = null;

    // --- Lifecycle Methods ---

    /**
     * Initializes the Compendium Browser, populating available packs and setting initial filters.
     */
    constructor(options?: ConstructorParameters<typeof Base>[0]) {
        super(options);
        this._packs = [...game.packs.values()] as CompendiumCollection<any>[];
        if (this._packs.length > 0) {
            this._activePackIds.push(this._packs[1].collection);
        }
        this.setFilters();
    }

    /** Defines the application window's title. */
    override get title() {
        return "Compendium Browser";
    }

    /**
     * Prepares the base context object for rendering the application.
     */
    override async _prepareContext(...args: Parameters<BaseType["_prepareContext"]>) {
        return {
            ...(await super._prepareContext(...args)),
            searchQuery: this._searchQuery,
        };
    }

    /**
     * Prepares context for specific template parts, like fetching results or providing filter data.
     */
    protected override async _preparePartContext(
        ...[partId, context, options]: Parameters<BaseType["_preparePartContext"]>
    ) {
        await super._preparePartContext(partId, context, options);
        if (partId === "results") context.entries = await this.fetch();
        if (partId === "filters") {
            context.activeTab = this.activeTab;
            context.types = this.allFilters;
        }
        return context;
    }

    /**
     * Handles cleanup when the application is closed, ensuring the tooltip is removed.
     */
    override async close(...args: Parameters<BaseType["close"]>) {
        if (this.#tooltipTimeout) clearTimeout(this.#tooltipTimeout);
        this.#tooltipTimeout = null;
        if (this.#tooltipElement) {
            this.#tooltipElement.remove();
            this.#tooltipElement = null;
        }
        return super.close(...args);
    }

    // --- Public Methods ---

    /**
     * Handles switching between the main tabs (e.g., 'Actors', 'Items'), updating filters and re-rendering.
     */
    override changeTab(...[tab, group, options]: Parameters<BaseType["changeTab"]>) {
        super.changeTab(tab, group, options);
        this.activeTab = tab as "Actor" | "Item";
        this.setFilters();
        void this.render({ parts: ["filters", "results"] });
    }

    // --- Event Listeners & Handlers ---

    /** Attaches listeners to the main application frame, such as for drag-and-drop functionality. */
    protected override _attachFrameListeners() {
        super._attachFrameListeners();
        this.element.addEventListener("dragstart", this._onDrag.bind(this));
    }

    /** Delegates listener attachment to specific methods based on which part of the template is rendered. */
    override _attachPartListeners(...[partId, htmlElement, options]: Parameters<BaseType["_attachPartListeners"]>) {
        super._attachPartListeners(partId, htmlElement, options);
        if (partId === "filters") this.filterListeners(htmlElement);
        // else if (partId === "results") this.resultListeners(htmlElement);
    }

    /**
     * Attaches input and change listeners to the search bar and filter checkboxes.
     */
    private filterListeners(htmlElement: HTMLElement) {
        const searchInput = htmlElement.querySelector<HTMLInputElement>("#compendium-browser-search");
        if (searchInput) {
            if (this._searchCursorPosition) {
                searchInput.focus();
                searchInput.setSelectionRange(this._searchCursorPosition, this._searchCursorPosition);
                this._searchCursorPosition = null;
            }
            searchInput.addEventListener("input", event => this._onSearch(event, searchInput));
        }

        const typeCheckboxes = htmlElement.querySelectorAll<HTMLInputElement>(".types .type input[type='checkbox']");
        for (const checkbox of typeCheckboxes) {
            checkbox.addEventListener("change", event => {
                const target = event.target as HTMLInputElement;
                const type = target.dataset.type;
                if (type) this._onFilterChange(type, target.checked);
            });
        }
    }

    /**
     * Attaches mouse event listeners to the results list container for tooltip handling.
     */
    private resultListeners(htmlElement: HTMLElement) {
        const resultsContainer = htmlElement.querySelector<HTMLElement>(".compendium-list");
        if (resultsContainer) {
            resultsContainer.addEventListener("mouseover", this.#onRowMouseEnter.bind(this));
            resultsContainer.addEventListener("mouseout", this.#onRowMouseLeave.bind(this));
            resultsContainer.addEventListener("mousemove", this.#onRowMouseMove.bind(this));
        }
    }

    /** Handles the click event for the 'clear search' button, resetting the query. */
    private async _onClearSearch() {
        this._searchQuery = "";
        void this.render({ parts: ["results", "filters"] });
    }

    /**
     * Handles the `input` event on the search field to update the query and re-render results.
     */
    private _onSearch(event: Event, target: HTMLInputElement) {
        this._searchCursorPosition = target.selectionStart;
        this._searchQuery = target.value;
        void this.render({ parts: ["results"] });
    }

    /**
     * Handles the `change` event for a type filter checkbox.
     */
    private _onFilterChange(type: string, selected: boolean) {
        const typeEntry = this.allFilters.find(t => t.id === type);
        if (typeEntry) typeEntry.selected = selected;
        void this.render({ parts: ["results"] });
    }

    /**
     * Handles the `dragstart` event for a compendium entry row.
     */
    private _onDrag(event: DragEvent) {
        const target = event.target as HTMLElement | null;
        const { uuid } = target?.closest<HTMLElement>("[data-uuid]")?.dataset ?? {};
        if (!uuid) return;

        const { type } = foundry.utils.parseUuid(uuid);
        event.dataTransfer?.setData("text/plain", JSON.stringify({ type, uuid }));
    }

    /**
     * Handles a click on a result row to open the corresponding document sheet.
     */
    private async _openDoc(event: MouseEvent, target: HTMLElement) {
        const el = target.closest<HTMLElement>("[data-uuid]");
        const uuid = el?.dataset.uuid;
        if (!uuid) return;

        const doc = (await fromUuid(uuid)) as Actor | Item | null;
        await doc?.sheet?.render(true);
    }

    /**
     * Handles a click on the source element within a result row to open the sourcebook reference.
     */
    private async _openSource(event: MouseEvent, target: HTMLElement) {
        const el = target.closest<HTMLElement>("[data-action='openSource']");
        const source = el?.textContent?.trim();
        if (!source) return;

        await LinksHelpers.openSource(source);
    }

    /**
     * Handles the mouse entering a result row to show an item preview tooltip.
     */
    async #onRowMouseEnter(event: MouseEvent): Promise<void> {
        const row = (event.target as HTMLElement)?.closest<HTMLElement>(".result-row");
        if (!row) return;

        if (this.#tooltipTimeout) clearTimeout(this.#tooltipTimeout);

        const uuid = row.closest<HTMLElement>("[data-uuid]")?.dataset.uuid;
        if (!uuid) return;

        const item = (await fromUuid(uuid)) as Item;
        if (!item) return;

        const templatePath = "systems/shadowrun5e/dist/templates/apps/compendium-browser/cards/weapon.hbs";
        const content = await foundry.applications.handlebars.renderTemplate(templatePath, {
            item: item.toObject(false),
            system: item.toObject(false).system,
        });

        if (!this.#tooltipElement) {
            this.#tooltipElement = document.createElement("aside");
            this.#tooltipElement.className = "item-preview-tooltip";
            document.body.append(this.#tooltipElement);
        }

        this.#tooltipElement.innerHTML = content;
        this.#tooltipElement.style.display = "block";
        this.#onRowMouseMove(event);
    }

    /**
     * Handles the mouse leaving a result row, hiding the tooltip after a short delay.
     */
    #onRowMouseLeave(event: MouseEvent): void {
        this.#tooltipTimeout = window.setTimeout(() => {
            if (this.#tooltipElement) {
                this.#tooltipElement.remove();
                this.#tooltipElement = null;
            }
        }, 50);
    }

    /**
     * Handles the mouse moving over a row, updating the tooltip's position.
     */
    #onRowMouseMove(event: MouseEvent): void {
        if (!this.#tooltipElement) return;

        let top = event.clientY;
        let left = event.clientX;
        const tooltipWidth = this.#tooltipElement.offsetWidth;
        const tooltipHeight = this.#tooltipElement.offsetHeight;

        if (left + tooltipWidth > window.innerWidth) left = event.clientX - tooltipWidth;
        if (top + tooltipHeight > window.innerHeight) top = event.clientY - tooltipHeight;

        this.#tooltipElement.style.top = `${top}px`;
        this.#tooltipElement.style.left = `${left}px`;
    }

    // --- Core Logic & Helpers ---

    /**
     * Asynchronously fetches, filters, and sorts compendium entries based on current state.
     */
    private async fetch() {
        const activePacks = this._packs.filter(
            p => p.visible && p.metadata.type === this.activeTab
        ) as CompendiumCollection<"Actor" | "Item">[];
        const indexes = await Promise.all(activePacks.map(async pack => pack.getIndex()));
        let entries = indexes.flatMap(index => [...index.values()]);

        if (this._searchQuery) {
            const query = this._searchQuery.toLowerCase();
            entries = entries.filter(i => i.name?.toLowerCase().includes(query));
        }

        if (this.allFilters.some(f => f.selected)) {
            const selectedTypes = this.allFilters.filter(f => f.selected).map(f => f.id);
            entries = entries.filter(e => selectedTypes.includes(e.type as string));
        }

        entries.sort((a, b) => b.name!.localeCompare(a.name!, game.i18n.lang));

        return entries.slice(0, 100);
    }

    /** Populates and sorts the `allFilters` array based on the document types of the active tab. */
    private setFilters() {
        this.allFilters = Object.keys(CONFIG[this.activeTab].dataModels)
            .map(id => ({ value: game.i18n.localize(`TYPES.${this.activeTab}.${id}`), id, selected: false }))
            .sort((a, b) => a.value.localeCompare(b.value, game.i18n.lang));
    }
}
