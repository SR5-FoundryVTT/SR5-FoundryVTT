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

    static override PARTS = {
        ...super.PARTS,
        footer: { template: "systems/shadowrun5e/dist/templates/apps/tabs/combat-tracker/footer.hbs" }
    } as const;

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
        console.log(app, html, _context, _options);
        const $html = $(html);

        if (app.viewed?.round) {
            const $title = $html.find(".encounter-title");

            if ($title.length) {
                const currentPass = app.viewed.system.initiativePass;
                $title.text(`Turn ${app.viewed.round} (Pass ${currentPass})`);
            }
        }

        $html.find(".combatant").each((_, li) => {
            const $li = $(li);
            const combatant = app.viewed?.combatants.get($li.data("combatant-id"));
            if (!combatant) return;

            this._addInitiativeIcon($li, combatant);
            this._addSeizeIcon($li, combatant);
            this._addActedIndicator($li, combatant);
        });

        $html.find('.combat-control[data-action="nextPhase"], .combat-control[data-action="previousPhase"]').on('contextmenu', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();

            game.tooltip.deactivate();

            const currentAction = $(ev.currentTarget).data('action') as string;
            const isNext = currentAction.includes('next');

            // Use attribute selectors to directly target the correct menus
            const $menu = $html.find(`.combat-extra-menu[data-time="${isNext ? 'next' : 'previous'}"]`);
            const $otherMenu = $html.find(`.combat-extra-menu[data-time="${isNext ? 'previous' : 'next'}"]`);

            // Close the other menu
            $otherMenu.addClass('hidden');

            // Toggle the current menu
            const wasHidden = $menu.hasClass('hidden');
            $menu.toggleClass('hidden', !wasHidden);

            // If the menu was just OPENED, add a one-time listener to close it
            if (wasHidden) {
                $(document).one('mousedown.combatExtraMenu', (event) => {
                    // Check if the click was *inside* the menu
                    // Do nothing if clicking inside
                    if ($(event.target).closest('.combat-extra-menu').length)
                        return;
                    $menu.addClass('hidden');
                    $otherMenu.addClass('hidden');
                });
            } else {
                // If the menu was just CLOSED, remove any lingering listeners
                $(document).off('mousedown.combatExtraMenu');
            }
        });
        
        // Prevent duplicate bindings by tagging the container
        if ($html.hasClass("sr5-bound")) return;
        $html.addClass("sr5-bound");

        // Prevent clicks inside the menu from closing it
        $html.on('click', '.combat-extra-menu', ev => ev.stopPropagation());

        $html.on('click', '.combat-control[data-action="nextPhase"], .combat-control[data-action="previousPhase"]', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();

            const action = $(ev.currentTarget).data('action') as string;

            try {
                if (action === 'nextPhase') void game.combat?.nextTurn();
                else if (action === 'previousPhase') void game.combat?.previousTurn();
            } catch (err) {
                console.error('Combat action failed', action, err);
            }
        });

        // Delegate click inside menus
        $html.on('click', '.combat-extra-menu [data-action]', (ev) => {
            ev.stopPropagation();

            // Clean up the global listener immediately
            $(document).off('mousedown.combatExtraMenu');

            const action = $(ev.currentTarget).data('action') as string;
            $html.find('.combat-time').addClass('hidden');

            try {
                if (action === 'nextPass') void game.combat?.nextPass();
                else if (action === 'nextTurn') void game.combat?.nextRound();
                else if (action === 'previousTurn') void game.combat?.previousRound();
                // else if (action === 'previousPass') void game.combat?.previousPass();
            } catch (err) {
                console.error('Combat extra action failed', action, err);
            }
        });

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
