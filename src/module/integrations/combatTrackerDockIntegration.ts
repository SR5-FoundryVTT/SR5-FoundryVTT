export interface CombatTrackerDockConfig {
    CombatantPortrait: new (combatant: Combatant.Implementation) => {
        combatant: Combatant.Implementation;
        // oxlint-disable-next-line typescript/method-signature-style
        getData(): Promise<unknown>;
    };
}

/**
 * Compatibility integration for Carousel Combat Tracker (`combat-tracker-dock`).
 *
 * SR5 uses `system.pad` combatants as internal initiative-pass markers. They are
 * not turns and must not be presented as portraits. Carousel deliberately renders
 * hidden combatants for GMs, so its portrait class needs to handle SR5 pads directly.
 */
export class CombatTrackerDockIntegration {
    /**
     * Carousel calls this hook as it publishes its extensibility configuration during `init`.
     * Registering before `init` allows SR5 to replace only the portrait class without mutating
     * Carousel's combatant ordering or its source files.
     */
    static registerHooks(): void {
        Hooks.once('combat-tracker-dock-init', (config: CombatTrackerDockConfig) => {
            const BaseCombatantPortrait = config.CombatantPortrait;

            config.CombatantPortrait = class extends BaseCombatantPortrait {
                override async getData(): Promise<unknown> {
                    if (this.combatant.system?.pad === true) return null;
                    return super.getData();
                }
            };
        });
    }
}
