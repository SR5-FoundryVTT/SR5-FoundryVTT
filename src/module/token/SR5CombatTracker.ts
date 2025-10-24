import CombatTracker = foundry.applications.sidebar.tabs.CombatTracker;

export class SR5CombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
    static renderCombatTracker(
        app: CombatTracker,
        html: HTMLElement,
        context: CombatTracker.RenderContext,
        options: CombatTracker.RenderOptions
    ) {
        console.log(app, html, context, options);

        // Iterate over each combatant <li> in the tracker
        $(html).find(".combatant").each((_, li) => {
            const combatantLi = $(li);
            const combatantId = combatantLi.data("combatant-id");

            // Get the combatant and their associated actor
            const combatant = app.viewed?.combatants.get(combatantId);

            this.addInitiativeIcon(combatantLi, combatant);
        });
    }

    private static addInitiativeIcon(
        combatantLi: JQuery<HTMLElement>,
        combatant: Combatant.Implementation | undefined
    ): void {
        // --- Prevent duplicate renders ---
        const existingIcon = combatantLi.find(".combatant-init-mode-icon");
        if (existingIcon.length)
            existingIcon.remove();

        const init = combatant?.actor?.system.initiative.perception;
        const iconData = {
            'meatspace': { cssClass: "mode-physical", iconClass: "fa-solid fa-person-running" },
            'astral': { cssClass: "mode-astral", iconClass: "fa-solid fa-star" },
            'matrix': { cssClass: "mode-matrix", iconClass: "fa-solid fa-laptop-code" },
            'undefined': { cssClass: "mode-unknown", iconClass: "fa-solid fa-x" }
        } as const;

        combatantLi.find(".token-image").after(`
            <div class="combatant-init-mode-icon ${iconData[init ?? 'undefined'].cssClass}">
                <i class="${iconData[init ?? 'undefined'].iconClass}"></i>
            </div>
        `);
    }
}
