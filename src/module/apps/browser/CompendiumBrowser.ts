import { LinksHelpers } from "@/module/utils/links";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

type Context = foundry.applications.api.ApplicationV2.RenderContext & Record<string, any>;
type FilterEntry = { value: string, id: string, selected: boolean };

const Base = HandlebarsApplicationMixin(ApplicationV2<Context>);
type BaseType = InstanceType<typeof Base>;

/**
 * A generic compendium browser application that allows users to view and search
 * across multiple compendium packs simultaneously using checkboxes.
 */
export class CompendiumBrowser extends Base {
    private activeTab: "Actor" | "Item" = "Item";

    private allFilters: FilterEntry[] = [];

    /** The list of all discovered compendia. */
    private readonly _packs: CompendiumCollection<any>[] = [];

    /** An array of IDs for the currently selected compendium packs. */
    private _activePackIds: string[] = [];

    /** The current string being used to filter results. */
    private _searchQuery: string = "";

    /** The cursor position in the search input to preserve during re-renders. */
    private _searchCursorPosition: number | null = null;

    private static readonly typesPart = {
        
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

        this.allFilters = Object.keys(CONFIG.Item.dataModels)
                            .map(id => ({ value: game.i18n.localize(`TYPES.Item.${id}`), id, selected: false }))
                            .sort((a, b) => a.value.localeCompare(b.value));
    }

    /**
     * Defines the default options for the Compendium Browser application window.
     */
    static override DEFAULT_OPTIONS = {
        tag: "form",
        id: "compendium-browser",
        classes: ["compendium-browser"],
        position: { width: 1050, height: 700 },
        window: {
            title: "Compendium Browser",
            minimizable: true,
            resizable: true
        },
        actions: {
            clearSearch: async (...args: Parameters<CompendiumBrowser['_onClearSearch']>) => this.prototype._onClearSearch.apply(this, args),
            openDoc: async (...args: Parameters<CompendiumBrowser['_openDoc']>) => this.prototype._openDoc.apply(this, args),
            openSource: async (...args: Parameters<CompendiumBrowser['_openSource']>) => this.prototype._openSource.apply(this, args),
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

    /**
     * Handle clicking the clear search button.
     */
    private async _onClearSearch() {
        this._searchQuery = "";
        void this.render({ parts: ["results", "filters"] });
    }

    private async _openDoc(event: MouseEvent, target: HTMLElement) {
        const el = target.closest<HTMLElement>("[data-uuid]");
        const uuid = el?.dataset.uuid;
        if (!uuid) return;

        const doc = await fromUuid(uuid) as Actor | Item | null;
        await doc?.sheet?.render(true);
    }

    private async _openSource(event: MouseEvent, target: HTMLElement) {
        const el = target.closest<HTMLElement>("[data-action='openSource']");
        const source = el?.textContent?.trim();
        if (!source) return;

        await LinksHelpers.openSource(source);
    }

    /**
     * Attach event listeners to the application's rendered HTML.
     */
    protected override _attachFrameListeners() {
        super._attachFrameListeners();
        this.element.addEventListener("dragstart", this._onDrag.bind(this));
    }

    override _attachPartListeners(
        ...[partId, htmlElement, options]: Parameters<BaseType["_attachPartListeners"]>
    ) {
        super._attachPartListeners(partId, htmlElement, options);
        if (partId === "filters")
            this.filterListeners(htmlElement);
        // else if (partId === "results")
        //     this.resultListeners(htmlElement);
    }

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

        const searchFilter = htmlElement.querySelectorAll<HTMLElement>(".compendium-filters .types .type input[type='checkbox']");

        for (const checkbox of searchFilter) {
            checkbox.addEventListener("change", event => {
                const target = event.target as HTMLInputElement;
                const type = target.dataset.type;
                if (type)
                    this._onFilterChange(type, target.checked);
            });
        }
    }

    private resultListeners(htmlElement: HTMLElement) {
        const resultsContainer = htmlElement.querySelector<HTMLElement>(".compendium-list");
        if (resultsContainer) {
            // We use event delegation on the container for efficiency
            resultsContainer.addEventListener("mouseover", this.#onRowMouseEnter.bind(this));
            resultsContainer.addEventListener("mouseout", this.#onRowMouseLeave.bind(this));
            resultsContainer.addEventListener("mousemove", this.#onRowMouseMove.bind(this));
        }
    }

    private _onFilterChange(type: string, selected: boolean) {
        const typeEntry = this.allFilters.find(t => t.id === type);
        if (typeEntry)
            typeEntry.selected = selected;
        void this.render({parts: ["results"]});
    }

    /**
     * Prepare the data object to be rendered by the Handlebars template.
     */
    override async _prepareContext(...args: Parameters<BaseType["_prepareContext"]>) {
        return {
            ...(await super._prepareContext(...args)),
            types: this.allFilters,
            searchQuery: this._searchQuery,
        };
    }

    protected override async _preparePartContext(
        ...[partId, context, options]: Parameters<BaseType["_preparePartContext"]>
    ) {
        await super._preparePartContext(partId, context, options);
        if (partId === "results")
            context.entries = await this.fetch();
        return context;
    }

    private async fetch() {
        const activePacks = this._packs.filter(p => p.visible && p.metadata.type === this.activeTab) as CompendiumCollection<'Actor' | 'Item'>[];
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

        entries.sort((a, b) => b.name ? a.name?.localeCompare(b.name) || 0 : -1);

        return entries.slice(0, 100);
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
     * Handle the input event on the search field to live-filter the results.
     */
    private _onSearch(event: Event, target: HTMLInputElement) {
        this._searchCursorPosition = target.selectionStart;
        this._searchQuery = target.value;
        void this.render({ parts: ["results"] });
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
    override async close(...args: Parameters<BaseType["close"]>) {
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
