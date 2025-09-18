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
    private readonly _packs: CompendiumCollection<any>[];
    private readonly _activePackIds: string[] = [];
    private _searchQuery: string = "";
    private _searchCursorPosition: number | null = null;
    #tooltipElement: HTMLElement | null = null;
    #tooltipTimeout: number | null = null;

    // State for virtual scrolling
    private readonly results = {
        throttle: false,
        height: 50, // Estimated height of a single result row
        entries: [] as CompendiumCollection.IndexEntry<"Item" | "Actor">[],
    };

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
        if (partId === "filters") {
            context.activeTab = this.activeTab;
            context.types = this.allFilters;
        }
        if (partId === "results") {
            // Fetch results and then render the initial visible set
            void this.fetch().then(async () => this.renderResults(0, 50));
        }
        return context;
    }

    /**
     * Handles cleanup when the application is closed.
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

    // --- Event Listener Setup ---

    /** Attaches listeners to the main application frame, such as for drag-and-drop and scrolling. */
    protected override _attachFrameListeners() {
        super._attachFrameListeners();
        this.element.addEventListener("dragstart", this._onDrag.bind(this));
        this.element.addEventListener("scroll", (event) => { void this._scrollResults(event); }, { capture: true, passive: true });
    }

    /** Delegates listener attachment to specific methods based on which part of the template is rendered. */
    override _attachPartListeners(...[partId, htmlElement, options]: Parameters<BaseType["_attachPartListeners"]>) {
        super._attachPartListeners(partId, htmlElement, options);
        if (partId === "filters") this.filterListeners(htmlElement);
    }

    /**
     * Attaches input and change listeners to the search bar and filter checkboxes.
     */
    private filterListeners(htmlElement: HTMLElement) {
        const searchInput = htmlElement.querySelector<HTMLInputElement>("#compendium-browser-search");
        if (searchInput) {
            // Restore cursor position after re-render
            if (this._searchCursorPosition) {
                searchInput.focus();
                searchInput.setSelectionRange(this._searchCursorPosition, this._searchCursorPosition);
                this._searchCursorPosition = null;
            }
            searchInput.addEventListener("input", (event) => this._onSearch(event, searchInput));
        }

        const typeCheckboxes = htmlElement.querySelectorAll<HTMLInputElement>(".types .type input[type='checkbox']");
        for (const checkbox of typeCheckboxes) {
            checkbox.addEventListener("change", (event) => {
                const target = event.target as HTMLInputElement;
                const type = target.dataset.type;
                if (type) this._onFilterChange(type, target.checked);
            });
        }
    }

    // --- Event Handlers ---

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
     * Handles the `input` event on the search field to update the query and re-render results.
     */
    private _onSearch(event: Event, target: HTMLInputElement) {
        this._searchCursorPosition = target.selectionStart;
        this._searchQuery = target.value;
        void this.render({ parts: ["results"] });
    }

    /** Handles the click event for the 'clear search' button, resetting the query. */
    private async _onClearSearch() {
        this._searchQuery = "";
        void this.render({ parts: ["results", "filters"] });
    }

    /**
     * Handles the `change` event for a type filter checkbox.
     */
    private _onFilterChange(type: string, selected: boolean) {
        const typeEntry = this.allFilters.find((t) => t.id === type);
        if (typeEntry) typeEntry.selected = selected;
        void this.render({ parts: ["results"] });
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
     * Handles scroll events to implement virtual scrolling for the results list.
     */
    private async _scrollResults(event: Event) {
        const target = event.target as HTMLElement | null;
        if (this.results.throttle || !target?.matches(".compendium-list")) return;
        const { scrollTop, clientHeight } = target;
        const entriesPerScreen = Math.ceil(clientHeight / this.results.height);

        // Calculate the range of entries to render, including a buffer above and below the visible area
        const startIndex = Math.max(0, Math.floor(scrollTop / this.results.height) - 2 * entriesPerScreen);
        const endIndex = Math.min(this.results.entries.length, startIndex + 5 * entriesPerScreen);

        await this.renderResults(startIndex, endIndex);
    }

    // --- Core Data & Rendering Logic ---

    /**
     * Asynchronously fetches, filters, and sorts compendium entries based on current state.
     */
    private async fetch() {
        if (this.results.throttle) return;
        this.results.throttle = true;

        const activePacks = this._packs.filter(
            (p) => p.visible && p.metadata.type === this.activeTab
        ) as CompendiumCollection<"Actor" | "Item">[];
        const indexes = await Promise.all(activePacks.map(async (pack) => pack.getIndex()));
        let entries = indexes.flatMap((index) => [...index.values()]);

        if (this._searchQuery) {
            const query = this._searchQuery.toLowerCase();
            entries = entries.filter((i) => i.name?.toLowerCase().includes(query));
        }

        if (this.allFilters.some((f) => f.selected)) {
            const selectedTypes = this.allFilters.filter((f) => f.selected).map((f) => f.id);
            entries = entries.filter((e) => selectedTypes.includes(e.type as string));
        }

        entries = entries.map((entry) => ({ ...entry, type: game.i18n.localize(`TYPES.${this.activeTab}.${entry.type}`) }));

        entries.sort((a, b) => a.name!.localeCompare(b.name!, game.i18n.lang));
        this.results.entries = entries;
        this.results.throttle = false;

        if (entries.length === 0) {
            const loading = this.element.querySelector<HTMLElement>(".compendium-list .loading");
            const noResults = this.element.querySelector<HTMLElement>(".compendium-list .no-results");
            if (loading) loading.hidden = true;
            if (noResults) noResults.hidden = false;
        }
    }

    /**
     * Renders a slice of the results for virtual scrolling.
     */
    private async renderResults(indexStart: number, indexEnd: number) {
        if (this.results.throttle) return;
        this.results.throttle = true;

        const container = this.element.querySelector<HTMLElement>(".compendium-list");
        if (!container) return;

        const toRender: Element[] = [];

        // Create a top padding div to simulate the height of all items before the rendered slice
        const topPadDiv = document.createElement("div");
        topPadDiv.className = "top-pad";
        topPadDiv.style.height = `${indexStart * this.results.height}px`;
        toRender.push(topPadDiv);

        // Ensure that we always start rendering from an odd index to maintain consistent row styling
        if (indexStart % 2 === 0) {
            const topOddPadDiv = document.createElement("div");
            topOddPadDiv.className = "top-pad";
            topOddPadDiv.style.height = `0px`;
            toRender.push(topOddPadDiv);
        }

        console.log({ indexStart, indexEnd, total: this.results.entries.length });

        indexStart = Math.max(0, indexStart);
        indexEnd = Math.min(this.results.entries.length, indexEnd);
        for (let idx = indexStart; idx < indexEnd; idx++) {
            const entry = this.results.entries[idx];
            const html = await foundry.applications.handlebars.renderTemplate(
                "systems/shadowrun5e/dist/templates/apps/compendium-browser/entries.hbs",
                { entry }
            );
            const template = document.createElement("template");
            template.innerHTML = html;
            toRender.push(template.content.firstElementChild!);
        }

        // Create a bottom padding div to simulate the height of all items after the rendered slice
        const bottomPadDiv = document.createElement("div");
        bottomPadDiv.className = "bottom-pad";
        bottomPadDiv.style.height = `${(this.results.entries.length - indexEnd) * this.results.height}px`;
        toRender.push(bottomPadDiv);

        container.replaceChildren(...toRender);
        this.results.throttle = false;
    }

    /** Populates and sorts the `allFilters` array based on the document types of the active tab. */
    private setFilters() {
        this.allFilters = Object.keys(CONFIG[this.activeTab].dataModels)
            .map((id) => ({ value: game.i18n.localize(`TYPES.${this.activeTab}.${id}`), id, selected: false }))
            .sort((a, b) => a.value.localeCompare(b.value, game.i18n.lang));
    }
}
