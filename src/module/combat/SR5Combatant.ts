import { SR5Combat } from "./SR5Combat";
import { SR5Die } from "../rolls/SR5Die";
import { Migrator } from "../migrator/Migrator";
import { CombatRules } from "../rules/CombatRules";
import { FLAGS, SR, SYSTEM_NAME } from "../constants";

export type InitiativeModeOptions = 'meatspace' | 'astral' | 'cold_sim' | 'hot_sim';

export type ChangeModeMessageData = {
    combatantId: string;
    fromMode: InitiativeModeOptions;
    toMode: InitiativeModeOptions;
    previousInit: number;
    currentInit: number;
    totalAdjust: number;
    baseAdjust: number;
    diceCountAdjust: number;
    diceRolls: number[];
};

export class SR5Combatant extends Combatant<"base"> {
    static override migrateData(source: any) {
        Migrator.migrate("Combatant", source);
        return super.migrateData(source);
    }

    /** Checks if the combatant can perform an action. */
    canAct(): boolean {
        return this.initiative !== null && this.initiative > 0;
    }

    /** Checks if the combatant has already acted in the current pass. */
    acted(): boolean {
        return this.system.acted;
    }

    protected override _getInitiativeFormula(): string {
        const baseFormula = super._getInitiativeFormula();
        const passesCompleted = this.parent.pass - SR.combat.FIRST_PASS;

        if (passesCompleted <= 0) return baseFormula;

        const penalty = Math.abs(passesCompleted * SR.combat.PASS_PENALTY);
        return `${baseFormula} - ${penalty}[Pass]`;
    }

    protected override async _preDelete(...args: Parameters<Combatant["_preDelete"]>) {
        await this.deleteFlow();
        return super._preDelete(...args);
    }

    /**
     * Cleans up combat-specific state and modifiers from the actor when they 
     * are removed from the combat encounter or when the combat ends.
     */
    async deleteFlow() {
        await this.actor?.clearProgressiveRecoil();
        await this.actor?.removeDefenseMultiModifier();
    }

    /** Adjusts the combatant's initiative score by a given amount. */
    async adjustInitiative(adjustment: number): Promise<this | undefined> {
        if (this.initiative === null) return this;
        return this.update({ initiative: this.initiative + adjustment });
    }

    /**
     * Processes a change in the combatant's initiative mode (e.g., transitioning from meatspace to hot_sim).
     *
     * Depending on the game's configured `InitiativeModeUpdateStrategy`, this method will either:
     * 1. **Reroll:** Trigger a complete initiative reroll using the combat tracker.
     * 2. **Delta Math:** Mathematically calculate the difference in base stats and dice, roll the 
     * delta dice, and apply the combined adjustment to the combatant's current initiative.
     *
     * It also creates a history snapshot for undo purposes and posts a summary card to the chat log.
     *
     * @param fromMode - The initiative mode the combatant is leaving.
     * @param toMode - The initiative mode the combatant is entering.
     * @returns Resolves when the database updates and chat messages are complete.
     */
    async applyModeChange(
        fromMode: InitiativeModeOptions,
        toMode: InitiativeModeOptions,
    ) {
        const { actor, combat, id, initiative: prevInitTotal, system } = this;
        if (!actor || !combat || !id || prevInitTotal === null || fromMode === toMode) return;

        await combat.createHistorySnapshot();

        const { blitz, last: prevInit } = system.initiative;
        const nextInit = actor.system.initiative.current;

        // Reroll strategy exits early
        if (game.settings.get(SYSTEM_NAME, FLAGS.InitiativeModeUpdateStrategy) === 'reroll') {
            await combat.rollInitiative(id, { updateTurn: false, hasBlitz: blitz });
            return;
        }

        // Calculate adjustments inline
        const diceCountAdjust = (blitz ? SR.initiatives.ranges.dice.max : nextInit.dice.value) - prevInit.dice.value;
        const baseAdjust = nextInit.base.value - prevInit.base.value;

        const diceRolls = await this._rollD6(Math.abs(diceCountAdjust));
        const rawSum = diceRolls.reduce((sum, value) => sum + value, 0);
        const totalAdjust = baseAdjust + (diceCountAdjust < 0 ? -rawSum : rawSum);

        await this.update({
            system: { initiative: { last: nextInit } },
            initiative: prevInitTotal + totalAdjust,
        });

        await this._postModeCard({
            combatantId: id,
            fromMode,
            toMode,
            previousInit: prevInitTotal,
            currentInit: prevInitTotal + totalAdjust,
            totalAdjust,
            baseAdjust,
            diceCountAdjust,
            diceRolls,
        });
    }

    private async _rollD6(diceCount: number): Promise<number[]> {
        if (diceCount <= 0) return [];
        const roll = new Roll(`${diceCount}d6`);
        await roll.evaluate();
        return roll.dice.flatMap(d => d.results.filter(r => r.active).map(r => r.result));
    }

    private async _postModeCard(data: ChangeModeMessageData): Promise<void> {
        const name = this.name ?? game.i18n.localize('COMBAT.UnknownCombatant');
        const prevConfig = this._getModeConfig(data.fromMode);
        const currConfig = this._getModeConfig(data.toMode);
        const hasDiceRoll = data.diceRolls.length > 0;

        let adjustmentClass = 'is-neutral';
        if (data.totalAdjust > 0) {
            adjustmentClass = 'is-positive';
        } else if (data.totalAdjust < 0) {
            adjustmentClass = 'is-negative';
        }

        const content = await foundry.applications.handlebars.renderTemplate(
            'systems/shadowrun5e/dist/templates/chat/initiative-mode-change-message.hbs',
            {
                tokenId: this.token?.id ?? null,
                documentUuid: this.actor?.uuid ?? this.token?.uuid ?? null,
                name,
                combatantImage: this.token?.texture?.src ?? this.actor?.img ?? null,
                previousModeClass: prevConfig.cls,
                previousModeIcon: prevConfig.icon,
                previousModeTitle: game.i18n.format('SR5.COMBAT.ModeTitle', { mode: game.i18n.localize(prevConfig.label) }),
                currentModeClass: currConfig.cls,
                currentModeIcon: currConfig.icon,
                currentModeTitle: game.i18n.format('SR5.COMBAT.ModeTitle', { mode: game.i18n.localize(currConfig.label) }),
                previousInitiativeTitle: game.i18n.format('SR5.COMBAT.ModeChangePreviousInitiative'),
                currentInitiativeTitle: game.i18n.format('SR5.COMBAT.ModeChangeNewInitiative'),
                previousInitiative: data.previousInit,
                currentInitiative: data.currentInit,
                adjustment: this._formatSigned(data.totalAdjust),
                adjustmentClass,
                rollTooltip: this._rollTooltip(data),
                showAdjustTooltip: hasDiceRoll,
            }
        );

        const messageData = {
            content,
            speaker: foundry.documents.ChatMessage.implementation.getSpeaker({
                alias: game.i18n.localize('SR5.COMBAT.ModeChangedLabel'),
            }),
            sound: hasDiceRoll ? CONFIG.sounds.dice : undefined,
        } as ChatMessage.CreateData;

        ChatMessage.applyRollMode(messageData, CONST.DICE_ROLL_MODES[this.hidden ? 'PRIVATE' : 'PUBLIC']);
        await foundry.documents.ChatMessage.implementation.create(messageData);
    }

    private _getModeConfig(mode: InitiativeModeOptions) {
        const key = (mode === 'cold_sim' || mode === 'hot_sim') ? 'matrix' : mode;
        return SR5Combat.INITIATIVE_MODE_CONFIG[key];
    }

    private _formatSigned(value: number): string {
        return value >= 0 ? `+${value}` : `${value}`;
    }

    private _rollTooltip(data: ChangeModeMessageData): string {
        const baseText = `${this._formatSigned(data.baseAdjust)}`;
        const hasDice = data.diceRolls.length > 0;
        
        if (!hasDice) {
            return `
                <div class="dice-tooltip initiative-total-tooltip">
                    <span class="initiative-tooltip-base">${baseText}</span>
                </div>
            `;
        }

        const dieItems = data.diceRolls.map(value => {
            const mockResult = { result: value, active: true } as const;
            const cssClasses = SR5Die.getResultCSS(mockResult).filter(Boolean).join(' ');
            return `<li class="roll ${cssClasses}">${value}</li>`;
        });

        const dicePrefix = data.diceCountAdjust < 0 ? '- ' : '+ ';

        return `
            <div class="dice-tooltip initiative-total-tooltip">
                <div class="initiative-tooltip-dice">
                    <span class="initiative-tooltip-paren">${dicePrefix}(</span>
                    <ol class="dice-rolls">
                        ${dieItems.join('')}
                    </ol>
                    <span class="initiative-tooltip-paren">)</span>
                </div>
                <span class="initiative-tooltip-base">${baseText}</span>
            </div>
        `;
    }

    /** Handles updates at the start of a combatant's turn. */
    async turnUpdate(pass: number): Promise<void> {
        if (pass === SR.combat.FIRST_PASS) {
            await this.clearMovementHistory();
        }

        await this.actor?.removeDefenseMultiModifier();

        if (!this.system.attackedLastTurn) {
            await this.actor?.clearProgressiveRecoil();
        }

        await this.update({ system: { attackedLastTurn: false } });
    }

    /** Prepares the data object for updating at the end of an initiative pass. */
    initPassUpdateData() {
        return {
            _id: this._id!,
            system: { acted: false },
            initiative: CombatRules.initAfterPass(this.initiative),
        } as const;
    }

    /** Prepares the data object for updating at the end of a combat round. */
    roundUpdateData() {
        return {
            _id: this._id!,
            system: { acted: false, seize: false, coinFlip: Math.random() },
        } as const;
    }
}