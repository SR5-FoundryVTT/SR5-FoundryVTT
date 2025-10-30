import CombatTracker = foundry.applications.sidebar.tabs.CombatTracker;

/**
 * Shadowrun 5e – Custom Combat Tracker Enhancements
 * Adds:
 *  - Context option to "Seize Initiative"
 *  - Initiative mode icon (meatspace/astral/matrix)
 *  - Seize indicator icon
 *  - GM-only "acted" toggle
 */
export class SR5CombatTracker extends CombatTracker {
    protected override _getEntryContextOptions(): ContextMenu.Entry<HTMLElement>[] {
        const options = super._getEntryContextOptions();

        options.splice(1, 0, {
            name: 'Seize Initiative',
            icon: '<i class="fa-solid fa-angles-up"></i>',
            condition: li => {
                const combatant = this._getCombatantFromLi(li);

                const edge = combatant.actor?.system.attributes.edge;
                return combatant.isOwner && edge != null && combatant.initiative != null;
            },
            callback: li => this._onSeizeInitiative(li)
        });

        return options;
    }

    /**
     * Renders SR5-specific visual indicators for each combatant.
     */
    static renderCombatTracker(
        app: CombatTracker,
        html: HTMLElement,
        _context: CombatTracker.RenderContext,
        _options: CombatTracker.RenderOptions
    ): void {
        const $html = $(html);

        $html.find(".combatant").each((_, li) => {
            const $li = $(li);
            const combatant = app.viewed?.combatants.get($li.data("combatant-id"));
            if (!combatant) return;

            this._addInitiativeIcon($li, combatant);
            this._addSeizeIcon($li, combatant);
            this._addActedIndicator($li, combatant);
        });

        // Prevent duplicate bindings by tagging the container
        if ($html.hasClass("sr5-bound")) return;
        $html.addClass("sr5-bound");

        // GM-only click handler for toggling "acted" status
        $html.on("click", "[data-action='toggleActed']", (event: JQuery.ClickEvent) => {
            event.preventDefault();
            event.stopPropagation();

            if (!game.user.isGM) return;

            const $li = $(event.currentTarget).closest(".combatant");
            const combatant = app.viewed?.combatants.get($li.data("combatant-id"));
            if (!combatant) return;

            const hasActed = combatant.system.acted;
            void combatant.update({ system: { acted: !hasActed } });
        });
    }

    // ---- Private Helpers ----

    private _onSeizeInitiative(li: HTMLElement): void {
        const combatant = this._getCombatantFromLi(li);
        if (!combatant?.actor) return;

        const edge = combatant.actor.system.attributes.edge;
        const seized = combatant.system.seize ?? false;

        if (seized && !game.user.isGM) {
            ui.notifications.warn("You cannot seize initiative again until the start of your next turn.");
            return;
        }

        void combatant.update({ system: { seize: !seized } });
        void combatant.actor.update({
            system: { attributes: { edge: { uses: edge.uses + (seized ? -1 : 1) } } }
        });
    }

    private _getCombatantFromLi(li: HTMLElement): Combatant.Implementation {
        const combatantId = $(li).data("combatant-id");
        return this.viewed!.combatants.get(combatantId)!;
    }

    // ---- UI Builders ----

    private static _addInitiativeIcon($li: JQuery<HTMLElement>, combatant: Combatant.Implementation): void {
        $li.find(".combatant-init-mode-icon").remove();

        const mode = combatant.actor?.system.initiative.perception ?? "undefined";
        const modes = {
            meatspace: { cls: "mode-physical", icon: "fa-solid fa-person-running" },
            astral: { cls: "mode-astral", icon: "fa-solid fa-star" },
            matrix: { cls: "mode-matrix", icon: "fa-solid fa-laptop-code" },
            undefined: { cls: "mode-unknown", icon: "fa-solid fa-question" }
        } as const;

        const { cls, icon } = modes[mode];

        $li.find(".token-image").after(`
            <div class="combatant-init-mode-icon ${cls}" title="Mode: ${mode}">
                <i class="${icon}"></i>
            </div>
        `);
    }

    private static _addSeizeIcon($li: JQuery<HTMLElement>, combatant: Combatant.Implementation): void {
        $li.find(".combatant-seize-icon").remove();

        if (combatant.system.seize) {
            $li.find(".token-initiative").prepend(`
                <div class="combatant-seize-icon" title="Seized Initiative">
                    <i class="fa-solid fa-angles-up"></i>
                </div>
            `);
        }
    }

    private static _addActedIndicator($li: JQuery<HTMLElement>, combatant: Combatant.Implementation): void {
        const hasActed = combatant.system.acted && combatant.combat?.combatant?.id !== combatant.id;
        $li.toggleClass("acted", hasActed);

        $li.find(".token-initiative").prepend(`
            <div class="combatant-acted-icon ${hasActed ? "active" : ""}"
                 data-action="toggleActed"
                 title="Toggle Acted Status (GM Only)">
                <i class="fa-solid fa-circle-check"></i>
            </div>
        `);
    }
}
