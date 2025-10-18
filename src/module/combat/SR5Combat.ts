import { SocketMessage } from "../sockets";
import { SR5Actor } from "../actor/SR5Actor";
import { SR5Combatant } from "./SR5Combatant";
import { CombatRules } from "../rules/CombatRules";
import { FLAGS, SR, SYSTEM_NAME } from "../constants";
import SocketMessageData = Shadowrun.SocketMessageData;

/**
 * Foundry combat implementation for Shadowrun 5th Edition rules.
 *
 * TODO: Store what combatants already acted and with what initiative base and dice they did. This can be used to alter
 * initiative score without fully rerolling and maintain proper turn order after an actor raised their ini while
 * stepping over other actors that already had their action phase in the current initiative pass.
 * @see SR5 Core Rulebook, p. 160 'Changing Initiative'
 */
export class SR5Combat extends Combat<"base"> {
    get initiativePass(): number {
        return this.system.initiativePass;
    }

    /**
     * Add ContextMenu options to CombatTracker Entries -- adds the basic Initiative Subtractions.
     */
    static addCombatTrackerContextOptions(html: HTMLElement, options: any[]) {
        const mapping = [
            { value: 1, keySuffix: "One", icon: '<i class="fas fa-caret-down"></i>' },
            { value: 5, keySuffix: "Five", icon: '<i class="fas fa-angle-down"></i>' },
            { value: 10, keySuffix: "Ten", icon: '<i class="fas fa-angle-double-down"></i>' },
        ] as const satisfies { value: number; keySuffix: string; icon: string }[];

        for (const { value, keySuffix, icon } of mapping) {
            options.push({
                icon,
                name: game.i18n.localize(`SR5.COMBAT.ReduceInitBy${keySuffix}`),
                callback: async (li: JQuery) => {
                    const combatant = game.combat?.combatants.get(li.data("combatant-id"));
                    if (combatant)
                        await combatant.adjustInitiative(-value);
                },
            });
        }

        return options;
    }

    /**
     * Handles the socket message to trigger an initiative pass change.
     */
    static async _handleDoInitPassSocketMessage(message: SocketMessageData) {
        if (!Object.hasOwn(message.data, "id") || typeof message.data.id !== "string") {
            console.error(
                `SR5Combat Socket Message ${FLAGS.DoInitPass} data.id must be a string (combat id) but is ${typeof message.data} (${message.data})!`
            );
            return;
        }
        return game.combats.get(message.data.id)?.handleIniPass();
    }

    /**
     * Helper method to get a combatant for a specific actor.
     */
    getActorCombatant(actor: SR5Actor): SR5Combatant | null {
        return this.getCombatantsByActor(actor)[0] ?? null;
    }

    /**
     * Helper method to adjust an actor's combatant's initiative.
     * @param actor      The actor that should have their initiative score adjusted.
     * @param adjustment The delta to adjust the initiative score with.
     */
    async adjustActorInitiative(actor: SR5Actor, adjustment: number) {
        for (const combatant of this.getCombatantsByActor(actor))
            await combatant.adjustInitiative(adjustment);
    }

    /**
     * Handle the change of an initiative pass. This needs owner permissions on the combat document.
     */
    async handleIniPass() {
        // Collect all combatants' initiative changes for a singular update.
        const initiativePass = this.initiativePass + 1;
        const combatants = this.combatants.map((c) => c.initPassUpdateData(initiativePass));

        await this.update({ turn: 0, combatants, system: { initiativePass } });
    }

    /**
     * After all combatants have had their action phase, handle Shadowrun rules for
     * initiative passes and combat turns.
     */
    override async nextTurn(): Promise<this> {
        const nextTurn = this.nextTurnPosition();

        // Case 1: Just step from one combatant to the next in the current pass.
        if (nextTurn < this.turns.length) {
            await this.update({ turn: nextTurn });
            return this;
        }

        // Case 2: End of the pass, but another pass is needed.
        if (this.canDoIniPass(nextTurn)) {
            if (!game.user?.isGM)
                this._requestInitiativePassFromGM();
            else
                await this.handleIniPass();
            return this;
        }

        // Case 3: End of the round, no more passes needed.
        return this.nextRound();
    }

    /**
     * Return the position in the current initiative pass of the next undefeated combatant.
     */
    nextTurnPosition(): number {
        for (const [turnInPass, combatant] of this.turns.entries()) {
            // Skip combatants who have already acted in this pass.
            if (this.turn !== null && turnInPass <= this.turn) continue;
            // Skip defeated combatants if the setting is active.
            if (this.settings.skipDefeated && combatant.defeated) continue;

            if (combatant.canAct()) return turnInPass;
        }

        // The current turn is the last undefeated combatant, so go to the end.
        return this.turns.length;
    }

    /**
     * Determine whether the current combat situation needs and can have another initiative pass.
     */
    canDoIniPass(nextTurn: number): boolean {
        // Only consider a new pass if we are at the end of the current turn order.
        if (nextTurn < this.turns.length) return false;
        // A new pass is needed if at least one combatant will have a positive initiative score.
        return this.combatants.some((c) => CombatRules.initAfterPass(c.initiative ?? 0) > 0);
    }

    /**
     * Clean up combat-related effects when the combat is deleted.
     */
    override async delete(...args: Parameters<Combat["delete"]>) {
        // Remove all combat-related modifiers.
        for (const combatant of this.combatants) {
            await combatant.actor?.removeDefenseMultiModifier();
        }
        return super.delete(...args);
    }

    /**
     * At the start of a new round, reset initiatives and roll for combatants.
     */
    protected override async _onStartRound(context: Combat.RoundEventContext) {
        await this.resetAll();

        const combatants = this.combatants.map((c) => c.roundUpdateData());
        await this.update({ turn: 0, combatants, system: { initiativePass: SR.combat.INITIAL_INI_PASS } });

        await this.rollForActors({updateTurn: false});
        return super._onStartRound(context);
    }

    /**
     * When a combatant's turn starts, apply necessary changes.
     */
    protected override async _onStartTurn(combatant: Combatant.Implementation, context: Combat.TurnEventContext) {
        await combatant.turnUpdate(this.initiativePass);

        return super._onStartTurn(combatant, context);
    }

    protected override async _onEndTurn(combatant: Combatant.Implementation, context: Combat.TurnEventContext) {
        await combatant.update({system: { acted: true }});
        return super._onEndTurn(combatant, context);
    }

    /**
     * Compares two combatants to determine their sort order in the initiative tracker.
     */
    protected override _sortCombatants(a: Combatant.Implementation, b: Combatant.Implementation): number {
        // If combatants are missing an actor, don't change their relative order.
        if (!a.actor || !b.actor) return 0;

        // Primary comparison: Initiative Score
        const initA = Number(a.initiative ?? 0);
        const initB = Number(b.initiative ?? 0);
        if (initA !== initB) return initB - initA;

        // Tie-breaker comparisons: Edge, Reaction, Intuition (ERIC) (SR5 p. 159)
        const getAttr = (actor: SR5Actor, attribute: string): number => {
            return actor.findAttribute(attribute)?.value ?? 0;
        };

        const attributesToCompare = ["edge", "reaction", "intuition"] as const;

        for (const attr of attributesToCompare) {
            const diff = getAttr(b.actor, attr) - getAttr(a.actor, attr);
            if (diff !== 0) return diff;
        }

        // Final tie-breaker: a random coin flip value set at the start of the round.
        return a.system.coinFlip - b.system.coinFlip;
    }

    /**
     * Shadowrun does not clear movement history on turn start.
     */
    protected override async _clearMovementHistoryOnStartTurn(
        ..._args: Parameters<Combat["_clearMovementHistoryOnStartTurn"]>
    ) {}

    /**
     * Rolls initiative for actors based on system settings.
     */
    private async rollForActors(options?: Combat.InitiativeOptions) {
        const rollForAll = !game.settings.get(SYSTEM_NAME, FLAGS.OnlyAutoRollNPCInCombat);
        return rollForAll ? this.rollAll(options) : this.rollNPC(options);
    }

    /**
     * Emits a socket message to the GM to handle the initiative pass change.
     */
    private _requestInitiativePassFromGM(): void {
        SocketMessage.emitForGM(FLAGS.DoInitPass, { id: this.id });
    }
}
