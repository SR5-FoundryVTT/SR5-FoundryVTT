import { FLAGS, SYSTEM_NAME } from "@/module/constants";
import { LinksHelpers } from "@/module/utils/links";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Encapsulates all types and interfaces used by the CompendiumBrowser application.
 */
export namespace CompendiumBrowserTypes {
    export type Tabs = "Actor" | "Item" | "Settings";
    export type Pack = CompendiumCollection<"Actor" | "Item">;
    export type FilterEntry = { value: string; id: string; selected: boolean };

    export type PackNode = {
        id: string;
        name: string;
        selected: boolean;
        type: "Actor" | "Item";
    };

    export type FolderNode = {
        id: string;
        name: string;
        type: "Folder";
        collapsed: boolean;
        selectionState: "none" | "some" | "all";
        children: (FolderNode | PackNode)[];
    };

    export interface Context extends foundry.applications.api.ApplicationV2.RenderContext {
        activeTab: Tabs;
        types: FilterEntry[];
    }

    export interface Configuration extends foundry.applications.api.ApplicationV2.Configuration {}

    export interface RenderOptions extends foundry.applications.api.ApplicationV2.RenderOptions {
        tab: Tabs;
        parts: ("tabs" | "filters" | "results" | "settings")[];
    }

    export interface SearchOptions {
        /** The document type to search for, "Actor" or "Item". */
        docType: "Actor" | "Item";
        /** An optional string to filter by name. */
        searchQuery?: string;
        /** An optional array of document subtypes (e.g., ["weapon", "spell"]). */
        typeFilters?: string[];
        /** An optional array of pack collections (e.g., ["shadowrun5e.core-items"]) to explicitly include. */
        packFilters?: string[];
    }

    /**
     * The enriched index entry returned by the search.
     */
    export type SearchResult = CompendiumCollection.IndexEntry<"Item" | "Actor"> & { sourcePack: string };
}

// =========================================================================
//                                  BASE CLASS SETUP
// =========================================================================

const BaseClass = HandlebarsApplicationMixin(
    ApplicationV2<
        CompendiumBrowserTypes.Context,
        CompendiumBrowserTypes.Configuration,
        CompendiumBrowserTypes.RenderOptions
    >,
);
type BaseClassType = InstanceType<typeof BaseClass>;

/**
 * A generic compendium browser application that allows users to view and search
 * across multiple compendium packs simultaneously.
 */
export class CompendiumBrowser extends BaseClass {
    // =========================================================================
    //                            STATIC CONFIGURATION
    // =========================================================================

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
            clearSearch: function (this: CompendiumBrowser) {
                this._onClearSearch();
            },
            openDoc: (event: MouseEvent, target: HTMLElement) => CompendiumBrowser._openDoc(event, target),
            openSource: (event: MouseEvent, target: HTMLElement) => CompendiumBrowser._openSource(event, target),
            toggleCollapse: (event: MouseEvent, target: HTMLElement) => CompendiumBrowser.onToggleCollapse(event, target),
        },
    };

    static override PARTS = {
        tabs: { template: "systems/shadowrun5e/dist/templates/apps/compendium-browser/tabs.hbs" },
        filters: { template: "systems/shadowrun5e/dist/templates/apps/compendium-browser/filters.hbs" },
        results: { template: "systems/shadowrun5e/dist/templates/apps/compendium-browser/results.hbs" },
        settings: { template: "systems/shadowrun5e/dist/templates/apps/compendium-browser/settings.hbs" },
    };

    static override TABS = {
        tabs: {
            initial: "Item",
            tabs: [
                { id: "Actor", icon: "fa-solid fa-user", label: "Actors" },
                { id: "Item", icon: "fa-solid fa-suitcase", label: "Items" },
                { id: "Settings", icon: "fa-solid fa-gear", label: "Settings" },
            ],
        },
    };

    // =========================================================================
    //                               STATIC API
    // =========================================================================

    /**
     * Searches and filters compendium packs based on the provided criteria.
     *
     * @param options The search parameters.
     * @returns A promise that resolves to an array of enriched compendium index entries.
     */
    public static async search(
        options: CompendiumBrowserTypes.SearchOptions,
    ): Promise<CompendiumBrowserTypes.SearchResult[]> {
        const { docType, searchQuery, typeFilters, packFilters } = options;

        const activePacks = game.packs.filter(
            (p): p is CompendiumBrowserTypes.Pack =>
                p.visible && p.metadata.type === docType &&
                (!packFilters?.length || packFilters.includes(p.collection)),
        );

        const indexes = await Promise.all(activePacks.map(async (pack) => pack.getIndex()));
        let entries = indexes.flatMap((index, idx) => {
            const packTitle = activePacks[idx].title;
            return [...index.values()].map((entry) => ({ ...entry, sourcePack: packTitle }));
        });

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            entries = entries.filter((i) => i.name?.toLowerCase().includes(query));
        }

        if (typeFilters && typeFilters.length > 0)
            entries = entries.filter((e) => typeFilters.includes(e.type as string));

        return entries;
    }

    // =========================================================================
    //                                     STATE
    // =========================================================================

    private activeTab: CompendiumBrowserTypes.Tabs = "Item";
    private allFilters: CompendiumBrowserTypes.FilterEntry[] = [];
    private packBlackList: string[] = [];
    private _searchQuery: string = "";

    /** State for virtual scrolling */
    private readonly scrollState = {
        throttle: false,
        height: 50, // Estimated height of a single result row
        entries: [] as CompendiumBrowserTypes.SearchResult[],
    };

    // =========================================================================
    //                               LIFECYCLE HOOKS
    // =========================================================================

    /** Initializes the Compendium Browser, populating available packs and setting initial filters. */
    constructor(options?: ConstructorParameters<typeof BaseClass>[0]) {
        super(options);
        this._buildFilterList();
        this.packBlackList = game.settings.get(SYSTEM_NAME, FLAGS.CompendiumBrowserBlacklist);
    }

    /** Defines the application window's title. */
    override get title() {
        return game.i18n.localize("SR5.CompendiumBrowser.Title");
    }

    /** Prepares the base context object for rendering the application. */
    override async _prepareContext(...args: Parameters<BaseClassType["_prepareContext"]>) {
        return {
            ...(await super._prepareContext(...args)),
            searchQuery: this._searchQuery,
        };
    }

    /** Prepares context for specific template parts, like fetching results or providing filter data. */
    protected override async _preparePartContext(
        ...[partId, context, options]: Parameters<BaseClassType["_preparePartContext"]>
    ) {
        await super._preparePartContext(partId, context, options);
        if (partId === "filters") {
            context.activeTab = this.activeTab;
            context.types = this.allFilters;
        }
        return context;
    }

    protected override async _onRender(...[context, options]: Parameters<BaseClassType["_onRender"]>) {
        await super._onRender(context, options);

        if (this.activeTab === "Settings") {
            void this._renderSettings().then(() => this.settingsListeners(this.element));
        } else {
            // Fetch results and then render the initial visible set
            void this._refreshEntries().then(async () => this._renderResultSlice(0, 50));
        }
    }

    // =========================================================================
    //                          EVENT LISTENER SETUP
    // =========================================================================

    /** Attaches listeners to the main application frame, such as for drag-and-drop and scrolling. */
    protected override _attachFrameListeners() {
        super._attachFrameListeners();
        this.element.addEventListener("dragstart", this._onDrag.bind(this));
        this.element.addEventListener("scroll", (event) => {
            void this._scrollResults(event);
        }, { capture: true, passive: true });
    }

    /** Delegates listener attachment to specific methods based on which part of the template is rendered. */
    override _attachPartListeners(...[partId, htmlElement, options]: Parameters<BaseClassType["_attachPartListeners"]>) {
        super._attachPartListeners(partId, htmlElement, options);
        if (partId === "filters") this.filterListeners(htmlElement);

        if (this.activeTab === "Settings") {
            if (partId === "results") htmlElement.classList.add("hidden");
            else if (partId === "settings") htmlElement.classList.remove("hidden");
        } else if (partId === "settings") {
            htmlElement.classList.add("hidden");
        }
    }

    /** Attaches input and change listeners to the search bar and filter checkboxes. */
    private filterListeners(htmlElement: HTMLElement) {
        const searchInput = htmlElement.querySelector<HTMLInputElement>("#compendium-browser-search");
        if (searchInput) {
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

    /** Attaches change listeners to the pack checkboxes in the settings tab. */
    private settingsListeners(htmlElement: HTMLElement) {
        const checkboxes = htmlElement.querySelectorAll<HTMLInputElement>(".pack-row label input[type='checkbox']");
        for (const checkbox of checkboxes) {
            checkbox.addEventListener("change", (event) => this._onPackCheckboxChange(event));
        }
    }

    // =========================================================================
    //                               EVENT HANDLERS
    // =========================================================================

    /** Handles switching between the main tabs (e.g., 'Actors', 'Items'), updating filters and re-rendering. */
    override changeTab(...[tab, group, options]: Parameters<BaseClassType["changeTab"]>) {
        super.changeTab(tab, group, options);
        this.activeTab = tab as CompendiumBrowserTypes.Tabs;
        this._buildFilterList();
        void this.render({ parts: ["filters", "results", "settings"] });
    }

    /** Handles the `input` event on the search field to update the query and re-render results. */
    private _onSearch(event: Event, target: HTMLInputElement) {
        this._searchQuery = target.value;
        void this.render({ parts: [this.activeTab === "Settings" ? "settings" : "results"] });
    }

    /** Handles the click event for the 'clear search' button, resetting the query. */
    private _onClearSearch() {
        this._searchQuery = "";
        void this.render({ parts: ["filters", this.activeTab === "Settings" ? "settings" : "results"] });
    }

    /** Handles the `change` event for a type filter checkbox. */
    private _onFilterChange(type: string, selected: boolean) {
        const typeEntry = this.allFilters.find((t) => t.id === type);
        if (typeEntry) typeEntry.selected = selected;
        void this.render({ parts: [this.activeTab === "Settings" ? "settings" : "results"] });
    }

    /** Handles the `dragstart` event for a compendium entry row. */
    private _onDrag(event: DragEvent) {
        const target = event.target as HTMLElement | null;
        const { uuid } = target?.closest<HTMLElement>("[data-uuid]")?.dataset ?? {};
        if (!uuid) return;

        const { type } = foundry.utils.parseUuid(uuid);
        event.dataTransfer?.setData("text/plain", JSON.stringify({ type, uuid }));
    }

    /** Handles a change event on a pack or folder checkbox in the settings. */
    private _onPackCheckboxChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const id = target.dataset.id;
        const type = target.dataset.type as "folder" | "pack";

        if (type === "pack") {
            if (target.checked) this.packBlackList = this.packBlackList.filter((p) => p !== id!);
            else this.packBlackList.push(id!);
        } else {
            const toRemove = !target.checked && !target.classList.contains("indeterminate");

            for (const pack of game.packs) {
                if (pack.folder == null) continue;
                if ([pack.folder, ...pack.folder.ancestors].some((f) => f.id === id)) {
                    if (toRemove) {
                        this.packBlackList.push(pack.collection);
                    } else {
                        this.packBlackList = this.packBlackList.filter((p) => p !== pack.collection);
                    }
                }
            }
        }
        void game.settings.set(SYSTEM_NAME, FLAGS.CompendiumBrowserBlacklist, this.packBlackList);
        void this.render({ parts: ["settings"] });
    }

    /** Handles toggling folder collapse in the settings tree. */
    private static onToggleCollapse(event: MouseEvent, target: HTMLElement) {
        event.preventDefault();
        event.stopPropagation();
        target.closest<HTMLElement>(".collapsible")?.classList.toggle("collapsed");
    }

    /** Handles a click on a result row to open the corresponding document sheet. */
    private static async _openDoc(event: MouseEvent, target: HTMLElement) {
        const el = target.closest<HTMLElement>("[data-uuid]");
        const uuid = el?.dataset.uuid;
        if (!uuid) return;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const doc = (await fromUuid(uuid)) as Actor | Item | null;
        await doc?.sheet?.render(true);
    }

    /** Handles a click on the source element within a result row to open the sourcebook reference. */
    private static _openSource(event: MouseEvent, target: HTMLElement) {
        const el = target.closest<HTMLElement>("[data-action='openSource']");
        const source = el?.textContent?.trim();
        if (!source) return;

        void LinksHelpers.openSource(source);
    }

    // =========================================================================
    //                         CORE DATA & RENDERING LOGIC
    // =========================================================================

    /**
     * Asynchronously refreshes the compendium entries for the browser instance
     * by calling the static search API with the current state.
     */
    private async _refreshEntries() {
        if (this.scrollState.throttle) return;
        this.scrollState.throttle = true;

        const selectedTypes = this.allFilters.filter((f) => f.selected).map((f) => f.id);
        const selectedPacks = game.packs.filter(p => !this.packBlackList.includes(p.collection)).map(p => p.collection);

        let entries = await CompendiumBrowser.search({
            docType: this.activeTab as 'Actor' | 'Item',
            searchQuery: this._searchQuery,
            typeFilters: selectedTypes.length ? selectedTypes : undefined,
            packFilters: selectedPacks.length ? selectedPacks : undefined,
        });

        entries = entries.map(entry => ({
            ...entry, type: game.i18n.localize(`TYPES.${this.activeTab}.${entry.type}`),
        })).sort((a, b) => a.name!.localeCompare(b.name!, game.i18n.lang));

        this.scrollState.entries = entries;
        this.scrollState.throttle = false;

        if (entries.length === 0) {
            const loading = this.element.querySelector<HTMLElement>(".compendium-list .loading");
            const noResults = this.element.querySelector<HTMLElement>(".compendium-list .no-results");
            if (loading) loading.hidden = true;
            if (noResults) noResults.hidden = false;
        }
    }

    /** Renders a slice of the results for virtual scrolling. */
    private async _renderResultSlice(indexStart: number, indexEnd: number) {
        if (this.scrollState.throttle) return;
        this.scrollState.throttle = true;

        const container = this.element.querySelector<HTMLElement>(".compendium-list");
        if (!container) return;

        const toRender: Element[] = [];

        // Create a top padding div to simulate the height of all items before the rendered slice
        const topPadDiv = document.createElement("div");
        topPadDiv.className = "top-pad";
        topPadDiv.style.height = `${indexStart * this.scrollState.height}px`;
        toRender.push(topPadDiv);

        // Ensure that we always start rendering from an odd index to maintain consistent row styling
        if (indexStart % 2 === 0) {
            const topOddPadDiv = document.createElement("div");
            topOddPadDiv.className = "top-pad";
            topOddPadDiv.style.height = `0px`;
            toRender.push(topOddPadDiv);
        }

        indexStart = Math.max(0, indexStart);
        indexEnd = Math.min(this.scrollState.entries.length, indexEnd);
        for (let idx = indexStart; idx < indexEnd; idx++) {
            const entry = this.scrollState.entries[idx];
            const html = await foundry.applications.handlebars.renderTemplate(
                "systems/shadowrun5e/dist/templates/apps/compendium-browser/entries.hbs",
                { entry },
            );
            const template = document.createElement("template");
            template.innerHTML = html;
            toRender.push(template.content.firstElementChild!);
        }

        // Create a bottom padding div to simulate the height of all items after the rendered slice
        const bottomPadDiv = document.createElement("div");
        bottomPadDiv.className = "bottom-pad";
        bottomPadDiv.style.height = `${(this.scrollState.entries.length - indexEnd) * this.scrollState.height}px`;
        toRender.push(bottomPadDiv);

        container.replaceChildren(...toRender);
        this.scrollState.throttle = false;
    }

    /** Handles scroll events to implement virtual scrolling for the results list. */
    private async _scrollResults(event: Event) {
        const target = event.target as HTMLElement | null;
        if (this.scrollState.throttle || !target?.matches(".compendium-list")) return;
        const { scrollTop, clientHeight } = target;
        const entriesPerScreen = Math.ceil(clientHeight / this.scrollState.height);

        // Calculate the range of entries to render, including a buffer above and below the visible area
        const startIndex = Math.max(0, Math.floor(scrollTop / this.scrollState.height) - 2 * entriesPerScreen);
        const endIndex = Math.min(this.scrollState.entries.length, startIndex + 5 * entriesPerScreen);

        await this._renderResultSlice(startIndex, endIndex);
    }

    // =========================================================================
    //                            SETTINGS PANE LOGIC
    // =========================================================================

    /** Renders the settings pane. */
    private async _renderSettings() {
        const tree = this._buildPackTree();
        const context = { tree };
        const html = await foundry.applications.handlebars.renderTemplate(
            "systems/shadowrun5e/dist/templates/apps/compendium-browser/settings.hbs",
            context,
        );

        const container = this.element.querySelector<HTMLElement>(".compendium-settings");
        if (!container) return;

        const content = document.createElement("div");
        content.innerHTML = html;
        container.replaceChildren(...content.firstElementChild!.children);

        this._updateIndeterminateStates(container, tree);
    }

    /** Retrieves and filters the packs to be displayed in the settings tree. */
    private _getFilteredSettingsPacks(): { pack: CompendiumBrowserTypes.Pack; path: Folder[] }[] {
        let packs = game.packs
            .filter((p): p is CompendiumBrowserTypes.Pack => p.visible && ["Actor", "Item"].includes(p.metadata.type))
            .map((p) => ({
                pack: p,
                path: p.folder ? [...p.folder.ancestors.reverse(), p.folder] : [],
            }))
            .sort((a, b) => {
                const aPath = [...a.path.map((folder) => folder.name), a.pack.metadata.label];
                const bPath = [...b.path.map((folder) => folder.name), b.pack.metadata.label];
                return aPath.join("/").localeCompare(bPath.join("/"));
            });

        // Filter by selected package types (system, world, module)
        if (this.allFilters.some((f) => f.selected)) {
            const selectedIds = this.allFilters.filter((f) => f.selected).map((f) => f.id);
            const selectedModules = selectedIds.filter((id) => id !== "system" && id !== "world");

            packs = packs.filter(({ pack }) => {
                const { packageType, packageName } = pack.metadata;
                if (packageType === "system" && selectedIds.includes("system")) return true;
                if (packageType === "world" && selectedIds.includes("world")) return true;
                if (packageType === "module" && selectedModules.includes(packageName)) return true;
                return false;
            });
        }

        // Filter by search query
        if (this._searchQuery) {
            packs = packs.filter(({ pack }) =>
                pack.metadata.label.toLowerCase().includes(this._searchQuery.toLowerCase()),
            );
        }
        return packs;
    }

    /** Builds the hierarchical tree of folders and packs for the settings pane. */
    private _buildPackTree(): CompendiumBrowserTypes.FolderNode {
        const packs = this._getFilteredSettingsPacks();
        const root: CompendiumBrowserTypes.FolderNode = {
            name: "__root__",
            id: "__root__",
            type: "Folder",
            collapsed: false,
            selectionState: "none",
            children: [],
        };

        const folderMap = new Map<string, CompendiumBrowserTypes.FolderNode>([["", root]]);

        for (const { pack, path } of packs) {
            // Ensure all parent folders exist in the tree
            for (let i = 0; i < path.length; i++) {
                const folderId = path[i].id!;
                if (!folderMap.has(folderId)) {
                    const parentId = i > 0 ? path[i - 1].id! : "";
                    const parentNode = folderMap.get(parentId)!;
                    const folderNode: CompendiumBrowserTypes.FolderNode = {
                        id: folderId,
                        name: path[i].name,
                        children: [],
                        type: "Folder",
                        collapsed: false,
                        selectionState: "none",
                    };
                    parentNode.children.push(folderNode);
                    folderMap.set(folderId, folderNode);
                }
            }

            // Add the pack itself to its parent folder
            const parentId = path.length ? path[path.length - 1].id! : "";
            const parentNode = folderMap.get(parentId)!;
            parentNode.children.push({
                id: pack.collection,
                type: pack.metadata.type,
                name: pack.metadata.label,
                selected: !this.packBlackList.includes(pack.collection),
            });
        }

        // Recursively calculate selection states after the tree is built
        this._updateFolderSelectionState(root);
        return root;
    }

    /** Recursively updates the selection state of a folder based on its children. */
    private _updateFolderSelectionState(folder: CompendiumBrowserTypes.FolderNode): "none" | "some" | "all" {
        let checkedCount = 0;
        let childCount = 0;

        for (const child of folder.children) {
            if (child.type === "Folder") {
                const childState = this._updateFolderSelectionState(child);
                if (childState === "all") checkedCount++;
                if (childState === "some") checkedCount += 0.5;
            } else {
                if (child.selected) checkedCount++;
            }
            childCount++;
        }

        if (checkedCount === 0) folder.selectionState = "none";
        else if (checkedCount === childCount) folder.selectionState = "all";
        else folder.selectionState = "some";

        return folder.selectionState;
    }

    /** Updates the visual indeterminate state of checkboxes in the DOM. */
    private _updateIndeterminateStates(container: HTMLElement, node: CompendiumBrowserTypes.FolderNode) {
        const checkbox = container.querySelector<HTMLInputElement>(`input[data-id="${node.id}"]`);
        if (checkbox && node.selectionState === "some") checkbox.classList.add("indeterminate");

        for (const child of node.children.filter((n): n is CompendiumBrowserTypes.FolderNode => n.type === "Folder")) {
            this._updateIndeterminateStates(container, child);
        }
    }

    // =========================================================================
    //                               FILTER LOGIC
    // =========================================================================

    /** Populates and sorts the `allFilters` array based on the document types or packages of the active tab. */
    private _buildFilterList() {
        if (this.activeTab !== "Settings") {
            this.allFilters = Object.keys(CONFIG[this.activeTab].dataModels)
                .map((id) => ({ value: game.i18n.localize(`TYPES.${this.activeTab}.${id}`), id, selected: false }))
                .sort((a, b) => a.value.localeCompare(b.value, game.i18n.lang));
            return;
        }

        const packs = game.packs.filter(
            (p): p is CompendiumBrowserTypes.Pack => p.visible && ["Actor", "Item"].includes(p.metadata.type),
        );
        const hasWorld = packs.some((p) => p.metadata.packageType === "world");
        const modules = Array.from(
            new Set(packs.filter((p) => p.metadata.packageType === "module").map((p) => p.metadata.packageName)),
        );

        this.allFilters = [{ value: game.i18n.localize("SR5.CompendiumBrowser.Filters.System"), id: "system", selected: false }];

        if (hasWorld) {
            this.allFilters.push({ value: game.i18n.localize("SR5.CompendiumBrowser.Filters.World"), id: "world", selected: false });
        }

        this.allFilters.push(
            ...modules
                .map((m) => ({
                    value: game.modules.get(m)?.title ?? m.capitalize(),
                    id: m,
                    selected: false,
                }))
                .sort((a, b) => a.value.localeCompare(b.value, game.i18n.lang)),
        );
    }
}
