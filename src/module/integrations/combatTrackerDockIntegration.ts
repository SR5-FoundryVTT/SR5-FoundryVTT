import type { SR5Combat } from '../combat/SR5Combat';

export interface CombatTrackerDockConfig {
    CombatantPortrait: new (combatant: Combatant.Implementation) => {
        combatant: Combatant.Implementation;
        // oxlint-disable-next-line typescript/method-signature-style
        getData(): Promise<unknown>;
    };
    CombatDock: new (combat?: SR5Combat) => {
        combat: SR5Combat;
        element: HTMLElement | null;
        // oxlint-disable-next-line typescript/method-signature-style
        _onRender(context: unknown, options: unknown): void;
        // oxlint-disable-next-line typescript/method-signature-style
        updateStartEndButtons(): void;
    };
}

/** SR5 labels for Carousel's dock buttons: a Foundry turn is an SR5 action phase, a Foundry round an SR5 combat turn. */
const DOCK_BUTTON_LABELS = {
    'previous-turn': 'SR5.COMBAT.PreviousPhase',
    'next-turn': 'SR5.COMBAT.NextPhase',
    'previous-round': 'SR5.COMBAT.PreviousTurn',
    'next-round': 'SR5.COMBAT.NextTurn',
} as const;

const PASS_BUTTON_ACTIONS = ['sr5-previous-pass', 'sr5-next-pass'] as const;

/** Build a dock control button that runs an SR5 initiative pass method. */
function createPassButton(
    action: typeof PASS_BUTTON_ACTIONS[number],
    icon: string,
    label: string,
    onClick: () => Promise<unknown>
): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `icon ui-control fa-solid ${icon}`;
    button.dataset.action = action;
    button.dataset.tooltip = label;
    button.setAttribute('aria-label', game.i18n.localize(label));
    button.addEventListener('click', () => { void onClick(); });
    return button;
}

/**
 * Compatibility integration for Carousel Combat Tracker (`combat-tracker-dock`).
 *
 * SR5 uses `system.pad` combatants as internal initiative-pass markers. They are
 * not turns and must not be presented as portraits. Carousel deliberately renders
 * hidden combatants for GMs, so its portrait class needs to handle SR5 pads directly.
 *
 * Carousel's dock controls use Foundry's turn/round terms and have no initiative pass
 * controls, so its dock class relabels them with SR5 terms and adds Previous/Next Pass
 * buttons once combat has started.
 */
export class CombatTrackerDockIntegration {
    /**
     * Carousel calls this hook as it publishes its extensibility configuration during `init`.
     * Registering before `init` allows SR5 to replace its portrait and dock classes without mutating
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

            const BaseCombatDock = config.CombatDock;

            config.CombatDock = class extends BaseCombatDock {
                // Carousel derives its template path from APP_ID, which an anonymous subclass cannot infer.
                static get APP_ID(): string {
                    return 'combat-dock';
                }

                // The dock re-renders its whole template, so the buttons are re-applied after every render.
                override _onRender(context: unknown, options: unknown): void {
                    super._onRender(context, options);
                    if (!this.element) return;

                    for (const [action, label] of Object.entries(DOCK_BUTTON_LABELS)) {
                        const button = this.element.querySelector<HTMLElement>(`[data-action="${action}"]`);
                        if (!button) continue;
                        button.dataset.tooltip = label;
                        button.setAttribute('aria-label', game.i18n.localize(label));
                    }

                    // Carousel binds its button listeners during super._onRender, so these only get their own.
                    this.element.querySelector('[data-action="previous-turn"]')?.after(
                        createPassButton('sr5-previous-pass', 'fa-backward-step', 'SR5.COMBAT.PreviousPass', async () => this.combat.previousPass())
                    );
                    this.element.querySelector('[data-action="next-turn"]')?.after(
                        createPassButton('sr5-next-pass', 'fa-forward-step', 'SR5.COMBAT.NextPass', async () => this.combat.nextPass())
                    );

                    this.updateStartEndButtons();
                }

                // Passes only exist in a started combat; SR5Combat.nextPass would otherwise create pads.
                override updateStartEndButtons(): void {
                    super.updateStartEndButtons();
                    if (!this.element) return;

                    for (const action of PASS_BUTTON_ACTIONS) {
                        const button = this.element.querySelector<HTMLElement>(`[data-action="${action}"]`);
                        if (button) button.style.display = this.combat.started ? '' : 'none';
                    }
                }
            };
        });
    }
}
