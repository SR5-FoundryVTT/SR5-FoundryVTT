import { LinksHelpers } from "@/module/utils/links";
import AppV2 = foundry.applications.api.ApplicationV2;
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * A generic compendium browser application that allows users to view and search
 * across multiple compendium packs simultaneously using checkboxes.
 * @extends {HandlebarsApplicationMixin(ApplicationV2)}
 */
export class CompendiumBrowser extends HandlebarsApplicationMixin(ApplicationV2<any>) {
    /** The list of all discovered compendia. */
    private _packs: CompendiumCollection<any>[] = [];

    /** An array of IDs for the currently selected compendium packs. */
    private _activePackIds: string[] = [];

    /** The current string being used to filter results. */
    private _searchQuery: string = "";

    /** The cursor position in the search input to preserve during re-renders. */
    private _searchCursorPosition: number | null = null;

    /**
     */
    constructor(options = {}) {
        super(options);
        this._packs = [...game.packs.values()] as CompendiumCollection<any>[];
        if (this._packs.length > 0) {
            this._activePackIds.push(this._packs[0].collection);
        }
    }

    /**
     * Defines the default options for the Compendium Browser application window.
     */
    static override DEFAULT_OPTIONS = {
        id: "compendium-browser",
        tag: "form",
        position: { width: 1050, height: 700 },
        window: {
            classes: ["compendium-browser"],
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
    } as const;

    /**
     * Defines the Handlebars template parts used by this application.
     */
    static override PARTS = {
        content: {
            template: "systems/shadowrun5e/dist/templates/apps/compendium-browser.hbs",
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
    protected override async _onRender(context: object, options: Parameters<AppV2["_onRender"]>[1]): Promise<void> {
        await super._onRender(context, options);
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
            packs: packsForFilters,
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
        const packId = target.dataset.packId;
        if (!packId) return;

        if (target.checked) {
            if (!this._activePackIds.includes(packId)) {
                this._activePackIds.push(packId);
            }
        } else {
            this._activePackIds = this._activePackIds.filter(id => id !== packId);
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
}
