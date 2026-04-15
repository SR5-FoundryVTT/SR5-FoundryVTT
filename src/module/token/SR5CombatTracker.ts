import { ValueOf } from 'fvtt-types/utils';
import { SR5Combat } from '../combat/SR5Combat';
import { InitiativeModeOptions, SR5Combatant } from '../combat/SR5Combatant';
import CombatTracker = foundry.applications.sidebar.tabs.CombatTracker;

type InitiativeModeOption = {
    value: InitiativeModeOptions;
    label: string;
    icon: string;
    selected: boolean;
};

type SR5TurnContext = CombatTracker.TurnContext & {
    pad?: boolean;
    modeClass?: string;
    modeIcon?: string;
    modeTitle?: string;
    seize?: boolean;
    acted?: boolean;
    zeroInitiative?: boolean;
    canChangeMode?: boolean;
    modeOptions?: InitiativeModeOption[];
};

/**
 * Shadowrun 5e – Custom Combat Tracker Enhancements
 * Adds:
 * - Context option to "Seize Initiative"
 * - Initiative mode icon (meatspace/astral/matrix)
 * - Seize indicator icon
 * - GM-only "acted" toggle
 */
export class SR5CombatTracker extends CombatTracker {

    // ==========================================
    // Static Properties
    // ==========================================

    private static readonly METHOD_MAP = {
        nextPhase: 'nextTurn',
        previousPhase: 'previousTurn',
        nextPass: 'nextPass',
        previousPass: 'previousPass',
        nextTurn: 'nextRound',
        previousTurn: 'previousRound',
    } as const;

    static override PARTS = {
        ...super.PARTS,
        header: { template: 'systems/shadowrun5e/dist/templates/apps/tabs/combat-tracker/header.hbs' },
        tracker: {
            template: 'systems/shadowrun5e/dist/templates/apps/tabs/combat-tracker/tracker.hbs',
            scrollable: ['']
        },
        footer: { template: "systems/shadowrun5e/dist/templates/apps/tabs/combat-tracker/footer.hbs" }
    };

    // ==========================================
    // Foundry Application Overrides
    // ==========================================

    protected override _attachFrameListeners() {
        super._attachFrameListeners();
        this.element.addEventListener('click', this._onSR5TrackerClick.bind(this), { passive: false });
        this.element.addEventListener('pointerdown', this._onSR5TrackerContextMenu.bind(this), { passive: false, capture: true });
    }

    protected override _getEntryContextOptions() {
        const options = super._getEntryContextOptions();

        options.splice(1, 0, {
            name: game.i18n.localize('SR5.COMBAT.SeizeInitiative'),
            icon: '<i class="fa-solid fa-angles-up"></i>',
            condition: li => {
                const combatant = this._getCombatant(li);
                if (!combatant) return false;

                const edge = combatant.actor?.system.attributes.edge;
                // eslint-disable-next-line eqeqeq
                return combatant.isOwner && edge != null && combatant.initiative != null;
            },
            callback: li => {
                void this._onSeizeInitiative(li);
            }
        });

        return options;
    }

    protected override async _prepareTurnContext(
        combat: Combat.Stored,
        combatant: Combatant.Stored,
        index: number
    ): Promise<SR5TurnContext> {
        const turn = await super._prepareTurnContext(combat, combatant, index) as SR5TurnContext;

        const mode = combatant.actor?.system.initiative.perception ?? 'unknown';
        const modeConfig = SR5Combat.INITIATIVE_MODE_CONFIG[mode];
        const modeOptions = this._prepareInitiativeModeOptions(combatant);

        turn.pad = combatant.system.pad;
        turn.modeClass = modeConfig.cls;
        turn.modeIcon = modeConfig.icon;
        turn.modeTitle = game.i18n.format('SR5.COMBAT.ModeTitle', { mode: game.i18n.localize(modeConfig.label) });
        turn.seize = combatant.system.seize;
        turn.acted = combatant.system.acted && combatant.combat?.combatant?.id !== combatant.id;
        turn.zeroInitiative = combatant.initiative !== null && combatant.initiative <= 0;
        turn.canChangeMode = modeOptions.length > 0;
        turn.modeOptions = modeOptions;

        return turn;
    }

    protected override async _onClickAction(
        event: PointerEvent,
        target: Parameters<CombatTracker['_onClickAction']>[1]
    ) {
        const action = target.dataset.action;
        const methodName = SR5CombatTracker.METHOD_MAP[action] as ValueOf<typeof SR5CombatTracker.METHOD_MAP> | undefined;
        
        if (!this.viewed || !methodName) return super._onClickAction(event, target);
        if (event.button !== 0) return;

        this._closeExtraMenus();

        const control = target instanceof HTMLButtonElement ? target : null;
        if (control) control.disabled = true;
        
        try {
            const method = this.viewed[methodName];
            if (typeof method === 'function') await method.call(this.viewed);
        } finally {
            if (control) control.disabled = false;
        }
    }

    // ==========================================
    // Core Event Handlers
    // ==========================================

    private _onSR5TrackerClick(event: MouseEvent): void {
        if (event.button !== 0) return;

        const target = event.target as HTMLElement | null;
        if (!target) return;

        const validActions = [
            '[data-action="toggleActed"]',
            '[data-action="setInitiativeMode"]',
            '[data-action="toggleInitiativeModeMenu"]',
        ].join(', ');

        const actionTarget = target.closest<HTMLElement>(validActions);
        const action = actionTarget?.dataset.action;

        if (!action) {
            const clickedInsideMenu = Boolean(target.closest('.combat-extra-menu, .combatant-mode-menu'));
            if (!clickedInsideMenu) {
                this._closeExtraMenus();
            }
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (action === 'setInitiativeMode') {
            const combatant = this._getCombatant(actionTarget);
            const mode = actionTarget.dataset.mode as InitiativeModeOptions | undefined;

            if (combatant && mode) {
                void this._onSetInitiativeMode(combatant, mode);
            }

            this._closeExtraMenus();
        } else if (action === 'toggleInitiativeModeMenu') {
            this._toggleCombatantModeMenu(actionTarget);
        } else if (action === 'toggleActed') {
            void this._onToggleActed(actionTarget);
        }
    }

    private _onSR5TrackerContextMenu(event: MouseEvent): void {
        if (event.button !== 2) return;

        const target = event.target as HTMLElement | null;
        const combatControl = target?.closest<HTMLElement>('.combat-control[data-action]');
        const action = combatControl?.dataset.action;

        if (!combatControl || (action !== 'previousPhase' && action !== 'nextPhase')) return;

        event.preventDefault();
        event.stopPropagation();

        game.tooltip.deactivate();
        this._closeExtraMenus();

        const time = action === 'nextPhase' ? 'next' : 'previous';
        const menu = this.element.querySelector<HTMLElement>(`.combat-extra-menu[data-time="${time}"]`);
        menu?.classList.remove('hidden');
    }

    // ==========================================
    // Specific Action Logic
    // ==========================================

    private async _onToggleActed(target: HTMLElement): Promise<void> {
        if (!game.user.isGM) return;

        const combatant = this._getCombatant(target);
        if (!combatant) return;

        await this.viewed?.createHistorySnapshot();
        await combatant.update({ system: { acted: !combatant.system.acted } });
    }

    private async _onSeizeInitiative(li: HTMLElement): Promise<void> {
        const combatant = this._getCombatant(li);
        if (!combatant?.actor) return;

        const edge = combatant.actor.system.attributes.edge;
        const seized = combatant.system.seize ?? false;

        if (seized && !game.user.isGM) {
            ui.notifications.warn(game.i18n.localize('SR5.COMBAT.CannotSeizeAgain'));
            return;
        }

        await this.viewed?.createHistorySnapshot();
        await combatant.update({ system: { seize: !seized } });
        await combatant.actor.update({
            system: { attributes: { edge: { uses: edge.uses + (seized ? -1 : 1) } } }
        });
    }

    private async _onSetInitiativeMode(combatant: SR5Combatant, mode: InitiativeModeOptions): Promise<void> {
        const actor = combatant.actor;
        if (!actor || !combatant.isOwner) return;

        const availableModes = this._prepareInitiativeModeOptions(combatant).map(option => option.value);
        if (!availableModes.includes(mode)) return;

        await actor.setInitiativeMode(mode);
    }

    // ==========================================
    // Utility & DOM Helpers
    // ==========================================

    /** Helper to grab a combatant reliably from any child element of a list item */
    private _getCombatant(element: HTMLElement): SR5Combatant | null {
        const combatantElement = element.closest<HTMLElement>('.combatant[data-combatant-id]');
        const combatantId = combatantElement?.dataset.combatantId;
        if (!combatantId) return null;

        return this.viewed?.combatants.get(combatantId) ?? null;
    }

    private _toggleCombatantModeMenu(trigger: HTMLElement): void {
        const combatantElement = trigger.closest<HTMLElement>('.combatant[data-combatant-id]');
        const modeMenu = combatantElement?.querySelector<HTMLElement>('.combatant-mode-menu');
        if (!modeMenu) return;

        const shouldOpen = modeMenu.classList.contains('hidden');
        this._closeExtraMenus();
        if (shouldOpen) modeMenu.classList.remove('hidden');
    }

    private _closeExtraMenus(): void {
        this.element
            .querySelectorAll<HTMLElement>('.combat-extra-menu, .combatant-mode-menu')
            .forEach(menu => menu.classList.add('hidden'));
    }

    private _prepareInitiativeModeOptions(combatant: SR5Combatant): InitiativeModeOption[] {
        const actor = combatant.actor;
        if (!actor?.isType('spirit', 'character')) return [];

        const { initiative, matrix, special } = actor.system;
        const perception = initiative.perception;
        const selectedMode = perception === 'matrix' ? (matrix?.hot_sim ? 'hot_sim' : 'cold_sim') : perception;
        const options: InitiativeModeOption[] = [];

        if (initiative.meatspace) {
            options.push({
                value: 'meatspace',
                label: game.i18n.localize('SR5.COMBAT.ModeMeatspace'),
                icon: 'fa-solid fa-person-running',
                selected: selectedMode === 'meatspace'
            });
        }

        if (special === 'magic') {
            options.push({
                value: 'astral',
                label: game.i18n.localize('SR5.COMBAT.ModeAstral'),
                icon: 'fa-solid fa-star',
                selected: selectedMode === 'astral'
            });
        }

        if ('matrix' in initiative) {
            options.push({
                value: 'cold_sim',
                label: game.i18n.localize('SR5.Labels.ActorSheet.ColdSim'),
                icon: 'fa-solid fa-laptop-code',
                selected: selectedMode === 'cold_sim'
            });
            options.push({
                value: 'hot_sim',
                label: game.i18n.localize('SR5.HotSim'),
                icon: 'fa-solid fa-laptop-code',
                selected: selectedMode === 'hot_sim'
            });
        }

        return options;
    }
}
