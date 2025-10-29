import CombatTracker = foundry.applications.sidebar.tabs.CombatTracker;

export class SR5CombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {

    override _configureRenderOptions(options: CombatTracker.RenderOptions): void {
        super._configureRenderOptions(options);
    }

    protected override _getEntryContextOptions() {
        const entryOptions = super._getEntryContextOptions();

        entryOptions.splice(2, 0, {
            name: 'Seize Initiative',
            icon: '<i class="fa-solid fa-angles-up"></i>',
            condition: li => {
                const combatantId = $(li).data('combatant-id');
                const combatant = this.viewed!.combatants.get(combatantId)!;
                const edge = combatant.actor?.system.attributes.edge;
                return Boolean(
                    combatant.isOwner &&
                    combatant.initiative != null &&
                    edge?.value && edge.uses < edge.max
                );
            },
            callback: li => {
                const combatantId = $(li).data('combatant-id');
                const combatant = this.viewed!.combatants.get(combatantId)!;
                const seize = !combatant.system.seize;
                void combatant.update({ system: { seize } });
                const edge = combatant.actor!.system.attributes.edge;
                void combatant.actor!.update({ system: { attributes: { edge: { uses: edge.uses + (seize ? 1 : -1) } } } });
            }
        });

        return entryOptions;
    }

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
            const combatant = app.viewed!.combatants.get(combatantId)!;

            this.addInitiativeIcon(combatantLi, combatant);
            this.addSeizeInitiativeIcon(combatantLi, combatant);
        });
    }

    private static addInitiativeIcon(
        combatantLi: JQuery<HTMLElement>,
        combatant: Combatant.Implementation
    ): void {
        const init = combatant.actor?.system.initiative.perception;
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

    private static addSeizeInitiativeIcon(
        combatantLi: JQuery<HTMLElement>,
        combatant: Combatant.Implementation
    ): void {
        if (!combatant.system.seize) return;
        const initDiv = combatantLi.find(".token-initiative");
        
        initDiv.prepend(`
            <div class="combatant-seize" 
                 title="Toggle Seized Initiative">
                <i class="fa-solid fa-angles-up"></i>
            </div>
        `);
    }
}
