import { SocketMessage } from "../sockets";
import { SR5Actor } from "../actor/SR5Actor";
import { SR5Combatant } from "./SR5Combatant";
import { Migrator } from "../migrator/Migrator";
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

    static override migrateData(source: any) {
        Migrator.migrate("Combat", source);
        return super.migrateData(source);
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
     * Handles socket messages to trigger combat functions remotely.
     */
    static async _handleSocketMessage(message: SocketMessageData) {
        const { id, fnName } = message.data ?? {};
        if (typeof id !== 'string' || typeof fnName !== 'string') return;
        if (fnName !== 'nextTurn' && fnName !== 'previousTurn') return;

        const combat = game.combats.get(id);
        const method = combat?.[fnName];
        if (typeof method !== 'function') return;

        return await method.call(combat);
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
     * Move to the previous turn in the combat.
     */
    override async previousTurn(): Promise<this> {
        if (!game.user?.isGM) {
            SocketMessage.emitForGM(FLAGS.DoCombatFunction, { id: this.id, fnName: 'previousTurn' });
            return this;
        }

        await this.combatant?.update({ system: { acted: false } });
        return super.previousTurn();
    }

    /**
     * After all combatants have had their action phase, handle Shadowrun rules for
     * initiative passes and combat turns.
     */
    override async nextTurn(): Promise<this> {
        if (!game.user?.isGM) {
            SocketMessage.emitForGM(FLAGS.DoCombatFunction, { id: this.id, fnName: 'nextTurn' });
            return this;
        }

        let nextTurn = this.nextTurnPosition();
        const advanceTime = this.getTimeDelta(this.round, this.turn, this.round, nextTurn);

        // Step to next combatant in current pass
        if (nextTurn !== null) {
            const combatants = this.combatant ? [{ _id: this.combatant.id!, system: { acted: true } }] : [];
            await this.update({ turn: nextTurn, combatants }, { direction: 1, worldTime: { delta: advanceTime } });
            return this;
        }

        // End of initiative pass: check if another pass is needed
        // Determine if any combatant has enough initiative for another pass
        nextTurn = this.turns.findIndex((c) => {
            if (this.settings.skipDefeated && c.isDefeated) return false;
            return c.initiative != null && CombatRules.initAfterPass(c.initiative) > 0;
        });

        // Start a new initiative pass
        if (nextTurn !== -1) {
            const initiativePass = this.initiativePass + 1;
            const combatants = this.combatants.map((c) => c.initPassUpdateData());
            await this.update(
                { turn: nextTurn, combatants, system: { initiativePass } },
                { diff: false, direction: 1, worldTime: { delta: advanceTime } }
            );

            // Trigger start-of-turn logic for the new combatant
            if (this.combatant) {
                await this._onStartTurn(this.combatant, { turn: nextTurn, round: this.round, skipped: false });
            }
            return this;
        }

        // End of round
        return this.nextRound();
    }

    /**
     * Return the position in the current initiative pass of the next undefeated combatant.
     */
    nextTurnPosition(): number | null {
        for (const [turnInPass, combatant] of this.turns.entries()) {
            // Skip the current combatant.
            if (combatant.id === this.combatant?.id) continue;
            // Skip defeated combatants if the setting is active.
            if (this.settings.skipDefeated && combatant.isDefeated) continue;

            if (combatant.canAct()) return turnInPass;
        }

        // The current turn is the last undefeated combatant, so go to the end.
        return null;
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
        await this.update({ system: { initiativePass: SR.combat.INITIAL_INI_PASS } });
        await this.resetAll();
        await this.rollForActors({ updateTurn: false });

        const firstTurn = this.settings.skipDefeated ? this.turns.findIndex(c => !c.isDefeated) : 0;
        await this.update({ turn: firstTurn >= 0 ? firstTurn : null, combatants: this.combatants.map((c) => c.roundUpdateData()) });

        return super._onStartRound(context);
    }

    /**
     * When a combatant's turn starts, apply necessary changes.
     */
    protected override async _onStartTurn(combatant: Combatant.Implementation, context: Combat.TurnEventContext) {
        if (!context.skipped) await combatant.turnUpdate(this.initiativePass);

        return super._onStartTurn(combatant, context);
    }

    /**
     * Compares two combatants to determine their sort order in the initiative tracker.
     */
    protected override _sortCombatants(a: Combatant.Implementation, b: Combatant.Implementation): number {
        // Primary comparison: Initiative Score
        const initA = Number.isNumeric(a.initiative) ? a.initiative ?? 0 : -Infinity;
        const initB = Number.isNumeric(b.initiative) ? b.initiative ?? 0 : -Infinity;
        if (initA !== initB || !a.actor || !b.actor) return initB - initA;

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

    override async rollInitiative(ids: string | string[], options?: Combat.InitiativeOptions) {
        await super.rollInitiative(ids, options);

        for (const id of Array.isArray(ids) ? ids : [ids]) {
            const actor = this.combatants.get(id)?.actor;
            if (actor?.system.initiative.blitz) {
                const edgeValue = actor.system.attributes.edge.value;
                await actor.update({
                    system: {
                        initiative: { blitz: false },
                        attributes: { edge: { value: edgeValue + 1 } } 
                    }
                });
            }
        }

        return this;
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
}
