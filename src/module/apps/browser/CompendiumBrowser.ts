import { LinksHelpers } from "@/module/utils/links";
import AppV2 = foundry.applications.api.ApplicationV2;

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class CompendiumBrowser extends HandlebarsApplicationMixin(ApplicationV2<any>) {
    /**
     * Default options for the application window.
     */
    static override DEFAULT_OPTIONS = {
        id: "compendium-browser",
        tag: "form",
        position: {
            width: 850,
            height: 700
        },
        window: {
            classes: ["compendium-browser"],
            title: "Compendium Browser",
            minimizable: true,
            resizable: true
        },
        actions: {
            openDoc: CompendiumBrowser.#openDoc,
            openSource: CompendiumBrowser.#openSource,
        }
    };

    /**
     * Template parts used by the HandlebarsApplicationMixin.
     */
    static override PARTS = {
        content: {
            template: "systems/shadowrun5e/dist/templates/apps/compendium-browser.hbs",
        },
    };

    /**
     * Dynamic title for the application window.
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
        const container = target.closest<HTMLElement>("[data-action='openSource']");
        if (!container) return;

        const el = container.querySelector<HTMLElement>(".item-source");
        const source = el?.textContent?.trim();
        if (!source) return;

        await LinksHelpers.openSource(source);
    }

    override _attachFrameListeners() {
        super._attachFrameListeners();
        this.element.addEventListener("dragstart", this._onDrag.bind(this));
    }

    override async _prepareContext(options: Parameters<AppV2["_prepareContext"]>[0]) {
        // Start with the base context from the parent class
        const baseContext = await super._prepareContext(options);

        const pack = game.packs.get("world.sr5gear") as CompendiumCollection<'Item'> | undefined;

        if (!pack) return baseContext;

        return {
            ...baseContext,
            entries: Array.from((await pack.getIndex()).values()),
            lastType: null,
        };
    }

    _onDrag(event: DragEvent) {
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
}
