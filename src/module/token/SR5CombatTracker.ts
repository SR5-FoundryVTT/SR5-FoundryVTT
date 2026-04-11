import CombatTracker = foundry.applications.sidebar.tabs.CombatTracker;
import { SR5Combat } from '../combat/SR5Combat';
import { SR5Combatant } from '../combat/SR5Combatant';

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
        header: { template: 'systems/shadowrun5e/dist/templates/apps/tabs/combat-tracker/header.hbs' },
        tracker: {
            template: 'systems/shadowrun5e/dist/templates/apps/tabs/combat-tracker/tracker.hbs',
            scrollable: ['']
        },
        footer: { template: "systems/shadowrun5e/dist/templates/apps/tabs/combat-tracker/footer.hbs" }
    };

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
                const combatant = this._getCombatantFromLi(li);
                if (!combatant) return false;

                const edge = combatant.actor?.system.attributes.edge;
                return combatant.isOwner && edge !== null && edge !== undefined && combatant.initiative !== null && combatant.initiative !== undefined;
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
    ): Promise<CombatTracker.TurnContext> {
        type SR5TurnContext = CombatTracker.TurnContext & {
            pad?: boolean;
            modeClass?: string;
            modeIcon?: string;
            modeTitle?: string;
            seize?: boolean;
            acted?: boolean;
        };

        const turn = await super._prepareTurnContext(combat, combatant, index) as SR5TurnContext;

        const mode = combatant.actor?.system.initiative.perception ?? 'undefined';
        const modeLabel = {
            meatspace: game.i18n.localize('SR5.COMBAT.ModeMeatspace'),
            astral: game.i18n.localize('SR5.COMBAT.ModeAstral'),
            matrix: game.i18n.localize('SR5.COMBAT.ModeMatrix'),
            undefined: game.i18n.localize('SR5.COMBAT.ModeUnknown')
        } as const;
        const modes = {
            meatspace: { cls: 'mode-physical', icon: 'fa-solid fa-person-running' },
            astral: { cls: 'mode-astral', icon: 'fa-solid fa-star' },
            matrix: { cls: 'mode-matrix', icon: 'fa-solid fa-laptop-code' },
            undefined: { cls: 'mode-unknown', icon: 'fa-solid fa-question' }
        } as const;

        const modeConfig = modes[mode];
        const localizedMode = modeLabel[mode];

        turn.pad = combatant.system.pad;
        turn.modeClass = modeConfig.cls;
        turn.modeIcon = modeConfig.icon;
        turn.modeTitle = game.i18n.format('SR5.COMBAT.ModeTitle', { mode: localizedMode });
        turn.seize = combatant.system.seize;
        turn.acted = combatant.system.acted && combatant.combat?.combatant?.id !== combatant.id;

        if (turn.initiative)
            turn.initiative = Math.max(turn.initiative, 0);

        return turn;
    }

    // ---- Private Helpers ----

    private _onSR5TrackerClick(event: MouseEvent): void {
        if (event.button !== 0) return;

        const target = event.target as HTMLElement | null;
        if (!target) return;

        const phaseControl = target.closest<HTMLElement>('.combat-control[data-action="nextPhase"], .combat-control[data-action="previousPhase"]');
        if (!phaseControl) {
            const clickedInsideMenu = Boolean(target.closest('.combat-extra-menu'));
            if (!clickedInsideMenu) this._closeExtraMenus();
        }

        const toggleActedTarget = target.closest<HTMLElement>('[data-action="toggleActed"]');
        if (!toggleActedTarget) return;

        event.preventDefault();
        event.stopPropagation();
        this._onToggleActed(toggleActedTarget);
    }

    private _onSR5TrackerContextMenu(event: MouseEvent): void {
        // Ensure we are only reacting to right-clicks (button 2)
        if (event.button !== 2) return;

        const target = event.target as HTMLElement | null;
        if (!target) return;

        const phaseControl = target.closest<HTMLElement>('.combat-control[data-action="nextPhase"], .combat-control[data-action="previousPhase"]');
        if (!phaseControl) return;

        event.preventDefault();
        event.stopPropagation();

        game.tooltip.deactivate();

        const action = phaseControl.dataset.action;
        if (!action) return;

        this._toggleExtraMenu(action === 'nextPhase' ? 'next' : 'previous');
    }

    protected override async _onClickAction(
        event: PointerEvent,
        target: Parameters<CombatTracker['_onClickAction']>[1]
    ) {
        const action = target.dataset.action;
        if (!action) return super._onClickAction(event, target);

        const combat = this.viewed as SR5Combat | null;
        if (!combat) return;

        const methodMap = {
            nextPhase: 'nextTurn',
            previousPhase: 'previousTurn',
            nextPass: 'nextPass',
            previousPass: 'previousPass',
            nextTurn: 'nextRound',
            previousTurn: 'previousRound',
        } as const;

        const methodName = methodMap[action] as typeof methodMap[keyof typeof methodMap] | undefined;
        if (!methodName) return super._onClickAction(event, target);

        if (event.button !== 0) return;

        this._closeExtraMenus();

        const control = target instanceof HTMLButtonElement ? target : null;
        if (control) control.disabled = true;
        try {
            const method = combat[methodName];
            if (typeof method === 'function') await method.call(combat);
        } finally {
            if (control) control.disabled = false;
        }
    }

    private _onToggleActed(target: HTMLElement): void {
        if (!game.user.isGM) return;

        const combatant = this._getCombatantFromElement(target);
        if (!combatant) return;

        const hasActed = Boolean(combatant.system.acted);

        void (async () => {
            await this.viewed?.createHistorySnapshot();
            await combatant.update({ system: { acted: !hasActed } });
        })();
    }

    private async _onSeizeInitiative(li: HTMLElement): Promise<void> {
        const combatant = this._getCombatantFromLi(li);
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

    private _getCombatantFromLi(li: HTMLElement): SR5Combatant | null {
        const combatantId = li.dataset.combatantId;
        if (typeof combatantId !== 'string') return null;
        return (this.viewed?.combatants.get(combatantId) as SR5Combatant | undefined) ?? null;
    }

    private _getCombatantFromElement(element: HTMLElement): SR5Combatant | null {
        const combatantElement = element.closest<HTMLElement>('.combatant[data-combatant-id]');
        if (!combatantElement) return null;

        const combatantId = combatantElement.dataset.combatantId;
        if (!combatantId) return null;

        return (this.viewed?.combatants.get(combatantId) as SR5Combatant | undefined) ?? null;
    }

    private _toggleExtraMenu(time: 'next' | 'previous'): void {
        const menu = this.element.querySelector<HTMLElement>(`.combat-extra-menu[data-time="${time}"]`);
        const otherTime = time === 'next' ? 'previous' : 'next';
        const otherMenu = this.element.querySelector<HTMLElement>(`.combat-extra-menu[data-time="${otherTime}"]`);

        if (!menu) return;
        otherMenu?.classList.add('hidden');

        const shouldHide = !menu.classList.contains('hidden');
        menu.classList.toggle('hidden', shouldHide);
    }

    private _closeExtraMenus(): void {
        this.element.querySelectorAll<HTMLElement>('.combat-extra-menu').forEach(menu => menu.classList.add('hidden'));
    }
}
