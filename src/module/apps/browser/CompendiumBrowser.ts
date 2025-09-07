import AppV2 = foundry.applications.api.ApplicationV2;
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class CompendiumBrowser extends HandlebarsApplicationMixin(ApplicationV2<any>) {
    /** The list of all discovered compendia. */
    private _packs: CompendiumCollection<any>[] = [];

    /** An array of IDs for the currently selected compendium packs. */
    private _activePackIds: string[] = [];

    /** The current string being used to filter results. */
    private _searchQuery: string = "";

    private _searchCursorPosition: number | null = null;

    constructor(options = {}) {
        super(options);
        this._packs = [...game.packs.values()] as CompendiumCollection<any>[];
        if (this._packs.length > 0) {
            this._activePackIds.push(this._packs[0].collection);
        }
    }

    static override get DEFAULT_OPTIONS() {
        return {
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
                togglePack: this.prototype._onTogglePack,
                // search: this.prototype._onSearch,
                clearSearch: this.prototype._onClearSearch,
            }
        };
    }

    static override PARTS = {
        content: {
            template: "systems/shadowrun5e/dist/templates/apps/compendium-browser.hbs",
        },
    };

    override get title() {
        return "Compendium Browser";
    }
    
    protected override async _onRender(context: object, options: Parameters<AppV2["_onRender"]>[1]): Promise<void> {
        await super._onRender(context, options);
        this.element.addEventListener("dragstart", this._onDrag.bind(this));
        // Manually find the search input and attach a listener.
        const searchInput = this.element.querySelector<HTMLInputElement>("#compendium-browser-search");
        if (searchInput) {
            // Restore cursor position if it was saved.
            if (this._searchCursorPosition !== null) {
                searchInput.focus();
                searchInput.setSelectionRange(this._searchCursorPosition, this._searchCursorPosition);
                this._searchCursorPosition = null; // Reset for the next render
            }
            // Attach the listener for live updates.
            searchInput.addEventListener("input", event => {
                this._onSearch(event, searchInput);
            });
        }
    }

    override async _prepareContext(options: Parameters<AppV2["_prepareContext"]>[0]) {
        const activePacks = this._packs.filter(p => this._activePackIds.includes(p.collection));
        const indexes = await Promise.all(activePacks.map(pack => pack.getIndex()));
        let entries = indexes.flatMap(index => [...index.values()]);

        if (this._searchQuery) {
            const query = this._searchQuery.toLowerCase();
            entries = entries.filter((i: any) => i.name && i.name.toLowerCase().includes(query));
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

    private async _onSearch(event: Event, target: HTMLInputElement): Promise<void> {
        this._searchCursorPosition = target.selectionStart;
        this._searchQuery = target.value;
        await this.render();
    }

    private async _onClearSearch(): Promise<void> {
        this._searchQuery = "";
        await this.render();
    }
}
