import { LinksHelpers } from "@/module/utils/links";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

// --- Type Definitions ---
type Context = foundry.applications.api.ApplicationV2.RenderContext & Record<string, any>;
type FilterEntry = { value: string; id: string; selected: boolean };
const Base = HandlebarsApplicationMixin(ApplicationV2<Context>);
type BaseType = InstanceType<typeof Base>;
type Pack = CompendiumCollection<'Actor' | 'Item'>;

type PackNode = {
    id: string;
    name: string;
    selected: boolean;
    type: "Actor" | "Item";
};

type FolderNode = {
    id: string;
    name: string;
    type: "Folder";
    collapsed: boolean;
    selectionState: "none" | "some" | "all";
    children: (FolderNode | PackNode)[];
};

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
            clearSearch: function (this: CompendiumBrowser) { this._onClearSearch(); },
            openDoc: CompendiumBrowser._openDoc.bind(this),
            openSource: CompendiumBrowser._openSource.bind(this),
            toggleCollapse: CompendiumBrowser.onToggleCollapse.bind(this),
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
                { id: "Config", icon: "fa-solid fa-gear", label: "Settings" },
            ],
        },
    };

    // --- Instance State ---

    private activeTab: "Actor" | "Item" | "Config" = "Item";
    private allFilters: FilterEntry[] = [];xx
    private packBlackList: string[] = [];
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
        this.setFilters();
    }

    /** Defines the application window's title. */
    override get title() {
        return "Compendium Browser";
    }

    private static onToggleCollapse(event: MouseEvent, target: HTMLElement) {
        event.preventDefault();
        event.stopPropagation();
        target.closest<HTMLElement>(".collapsible")?.classList.toggle("collapsed");
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
        return context;
    }

    protected override async _onRender(...[context, options]: Parameters<BaseType["_onRender"]>) {
        await super._onRender(context, options);

        if (this.activeTab === "Config") {
            void this._renderSettings().then(() => this.settingsListeners(this.element));
        } else {
            // Fetch results and then render the initial visible set
            void this.fetch().then(async () => this.prepareResults(0, 50));
        }
    }

    private async _renderSettings() {
        // 1. Build the data tree
        const tree = this._buildPackTree();

        console.log(tree);

        // 2. Prepare context for Handlebars
        const context = { tree };

        // 3. Render the main template
        const html = await foundry.applications.handlebars.renderTemplate(
            "systems/shadowrun5e/dist/templates/apps/compendium-browser/settings.hbs",
            context
        );

        // 4. Inject into the DOM
        const container = this.element.querySelector<HTMLElement>(".compendium-settings");
        if (!container) return;
        
        const content = document.createElement("div");
        content.innerHTML = html;
        container.replaceChildren(...content.firstElementChild!.children);

        // 5. Update checkbox indeterminate states, which can't be done in Handlebars
        this._updateIndeterminateStates(container, tree);
    }

    /** Builds the hierarchical tree of folders and packs. */
    private _buildPackTree(): FolderNode {
        let packs = game.packs
            .filter((p): p is Pack => p.visible && ["Actor", "Item"].includes(p.metadata.type))
            .map(p => ({
                pack: p,
                path: p.folder ? [...p.folder.ancestors.reverse(), p.folder] : [],
            }))
            .sort((a, b) => {
                const aPath = [...a.path.map(folder => folder.name), a.pack.metadata.label];
                const bPath = [...b.path.map(folder => folder.name), b.pack.metadata.label];
                return aPath.join("/").localeCompare(bPath.join("/"));
            });

            if (this.allFilters.some(f => f.selected)) {
                const selected = this.allFilters.filter(f => f.selected);
                const selectedIds = selected.map(f => f.id);

                const selectedModules = selectedIds.filter(id => id !== "system" && id !== "world");

                packs = packs.filter(({ pack }) => {
                    const { packageType, packageName } = pack.metadata;

                    if (packageType === "system" && selectedIds.includes("system")) return true;
                    if (packageType === "world"  && selectedIds.includes("world"))  return true;
                    if (packageType === "module" && selectedModules.includes(packageName)) return true;

                    return false;
                });
            }

        if (this._searchQuery)
            packs = packs.filter(({ pack }) => pack.metadata.label.toLowerCase().includes(this._searchQuery.toLowerCase()));

        const root: FolderNode = {
            name: "__root__", id: "__root__", type: "Folder", collapsed: false, selectionState: "none", children: []
        };

        const folderMap = new Map<string, FolderNode>([["", root]]);

        for (const { pack, path } of packs) {
            // Ensure all parent folders exist in the tree
            for (let i = 0; i < path.length; i++) {
                const folderId = path[i].id!;
                if (!folderMap.has(folderId)) {
                    const parentId = i > 0 ? path[i - 1].id! : "";
                    const parentNode = folderMap.get(parentId)!;
                    const folderNode: FolderNode = {
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

    private settingsListeners(htmlElement: HTMLElement) {
        const checkboxes = htmlElement.querySelectorAll<HTMLInputElement>(".pack-row label input[type='checkbox']");
        for (const checkbox of checkboxes) {
            checkbox.addEventListener("change", (event) => this._onPackCheckboxChange(event));
        }
    }

    private _onPackCheckboxChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const id = target.dataset.id;
        const type = target.dataset.type as "folder" | "pack";
        if (type === "pack") {
            if (target.checked)
                this.packBlackList = this.packBlackList.filter((p) => p !== id!);
            else
                this.packBlackList.push(id!);
        } else {
            const toRemove = !target.checked && !target.classList.contains('indeterminate');

            for (const pack of game.packs) {
                if (pack.folder == null) continue;
                if ([pack.folder, ...pack.folder.ancestors].some(f => f.id === id)) {
                    if (toRemove) {
                        this.packBlackList.push(pack.collection);
                    } else {
                        this.packBlackList = this.packBlackList.filter((p) => p !== pack.collection);
                    }
                }
            }
        }
        void this.render({ parts: ["settings"] });
    }

    /** Recursively updates the selection state of a folder based on its children. */
    private _updateFolderSelectionState(folder: FolderNode): "none" | "some" | "all" {
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
    private _updateIndeterminateStates(container: HTMLElement, node: FolderNode) {
        const checkbox = container.querySelector<HTMLInputElement>(`input[data-id="${node.id}"]`);
        if (checkbox && node.selectionState === "some")
            checkbox.classList.add('indeterminate');

        for (const child of node.children.filter((n): n is FolderNode => n.type === "Folder"))
            this._updateIndeterminateStates(container, child);
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
        this.activeTab = tab as "Actor" | "Item" | "Config";
        this.setFilters();
        void this.render({ parts: ["filters", "results", "settings"] });
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

        if (this.activeTab === "Config") {
            if (partId === "results")
                htmlElement.classList.add("hidden");
            else if (partId === "settings")
                htmlElement.classList.remove("hidden");
        } else if (partId === "settings") {
            htmlElement.classList.add("hidden");
        }
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
        void this.render({ parts: [this.activeTab === "Config" ? "settings" : "results"] });
    }

    /** Handles the click event for the 'clear search' button, resetting the query. */
    private _onClearSearch() {
        this._searchQuery = "";
        void this.render({ parts: ["filters", this.activeTab === "Config" ? "settings" : "results"] });
    }

    /**
     * Handles the `change` event for a type filter checkbox.
     */
    private _onFilterChange(type: string, selected: boolean) {
        const typeEntry = this.allFilters.find((t) => t.id === type);
        if (typeEntry) typeEntry.selected = selected;
        void this.render({ parts: [this.activeTab === "Config" ? "settings" : "results"] });
    }

    /**
     * Handles a click on a result row to open the corresponding document sheet.
     */
    private static async _openDoc(event: MouseEvent, target: HTMLElement) {
        const el = target.closest<HTMLElement>("[data-uuid]");
        const uuid = el?.dataset.uuid;
        if (!uuid) return;

        const doc = (await fromUuid(uuid)) as Actor | Item | null;
        await doc?.sheet?.render(true);
    }

    /**
     * Handles a click on the source element within a result row to open the sourcebook reference.
     */
    private static async _openSource(event: MouseEvent, target: HTMLElement) {
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

        await this.prepareResults(startIndex, endIndex);
    }

    // --- Core Data & Rendering Logic ---

    /**
     * Asynchronously fetches, filters, and sorts compendium entries based on current state.
     */
    private async fetch() {
        if (this.results.throttle) return;
        this.results.throttle = true;

        const activePacks = game.packs.filter(
            (p): p is Pack => p.visible && p.metadata.type === this.activeTab
        );
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
    private async prepareResults(indexStart: number, indexEnd: number) {
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
        if (this.activeTab !== "Config") {
            this.allFilters = Object.keys(CONFIG[this.activeTab].dataModels)
                .map((id) => ({ value: game.i18n.localize(`TYPES.${this.activeTab}.${id}`), id, selected: false }))
                .sort((a, b) => a.value.localeCompare(b.value, game.i18n.lang));
            return;
        }

        const packs = game.packs.filter((p): p is Pack => p.visible && ["Actor", "Item"].includes(p.metadata.type));
        const hasWorld = packs.some(p => p.metadata.packageType === "world");
        const modules = Array.from(new Set(packs.filter(p => p.metadata.packageType === "module").map(p => p.metadata.packageName)));

        this.allFilters = [
            { value: game.i18n.localize("System"), id: "system", selected: false }
        ];

        if (hasWorld)
            this.allFilters = this.allFilters.concat([
                { value: game.i18n.localize("World"), id: "world", selected: false }
            ]);

        this.allFilters = this.allFilters.concat([
            ...modules.map(m => ({
                value: game.modules.get(m)?.title ?? m.capitalize(),
                id: m,
                selected: false,
            })).sort((a, b) => a.value.localeCompare(b.value, game.i18n.lang))
        ]);
    }
}
