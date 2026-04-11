import { SocketMessage } from "../sockets";
import { SR5Actor } from "../actor/SR5Actor";
import { SR5Combatant } from "./SR5Combatant";
import { Migrator } from "../migrator/Migrator";
import { CombatRules } from "../rules/CombatRules";
import { FLAGS, SR, SYSTEM_NAME } from "../constants";
import SocketMessageData = Shadowrun.SocketMessageData;

const MAX_HISTORY_SIZE = 50;

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

    override get nextCombatant(): undefined { return undefined; }

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
                    const combatant = game.combat?.combatants.get(li.data("combatant-id") as string);
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

        const allowedFunctions = new Set(['nextTurn', 'previousTurn', 'nextPass', 'previousPass', 'nextRound', 'previousRound']);
        if (!allowedFunctions.has(fnName)) return;

        const combat = game.combats.get(id);
        const method = combat?.[fnName] as unknown;
        if (typeof method !== 'function') return;

        return await method.call(combat);
    }

    /**
     * Helper method to get a combatant for a specific actor.
     * If multiple combatants exist, tries to resolve by controlled tokens.
     */
    getActorCombatant(actor: SR5Actor): SR5Combatant | null {
        const combatants = this.getCombatantsByActor(actor);

        // If only one combatant, return it directly
        if (combatants.length === 1) {
            return combatants[0];
        }

        // If multiple combatants, try to resolve by controlled tokens
        if (combatants.length > 1) {
            const activeTokens = actor.getActiveTokens();
            const matchingCombatants = (canvas.tokens?.controlled ?? [])
                .filter(token => activeTokens.includes(token))
                .map(token => token.combatant)
                .filter(c => c?.combat?.id === this.id);

            if (matchingCombatants.length === 1)
                return matchingCombatants[0];

            ui.notifications.warn(
                `SR5 | Actor '${actor.name}' has multiple combatants in Combat '${this.id}'. Please select one token.`
            );
            throw new Error('Multiple combatants found for actor.');
        }

        // No combatant found
        return null;
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

        const history = [...(this.system.history ?? [])];
        const snapshot = history.pop();
        if (!snapshot) {
            ui.notifications?.warn(game.i18n.localize('SR5.COMBAT.NoHistoryAvailable'));
            return this;
        }

        return this._restoreSnapshot(snapshot, history);
    }
    
    async previousPass(): Promise<this> {
        if (!game.user?.isGM) {
            SocketMessage.emitForGM(FLAGS.DoCombatFunction, { id: this.id, fnName: 'previousPass' });
            return this;
        }

        const history = [...(this.system.history ?? [])];
        let snapshot = history.pop();
        while (snapshot?.round === this.round && snapshot.initiativePass === this.initiativePass) {
            snapshot = history.pop();
        }

        if (!snapshot) {
            ui.notifications?.warn(game.i18n.localize('SR5.COMBAT.NoHistoryAvailable'));
            return this;
        }

        return this._restoreSnapshot(snapshot, history);
    }

    override async previousRound(): Promise<this> {
        if (!game.user?.isGM) {
            SocketMessage.emitForGM(FLAGS.DoCombatFunction, { id: this.id, fnName: 'previousRound' });
            return this;
        }

        const history = [...(this.system.history ?? [])];
        let snapshot = history.pop();

        while (snapshot?.round === this.round) {
            snapshot = history.pop();
        }

        if (!snapshot) {
            ui.notifications?.warn(game.i18n.localize('SR5.COMBAT.NoHistoryAvailable'));
            return this;
        }

        return this._restoreSnapshot(snapshot, history);
    }

    /**
     * After all combatants have had their action phase, handle Shadowrun rules for
     * initiative passes and combat turns.
     * @param skipAct If true, the next combatant will be selected without marking the current one as having acted.
     * Used when moving to the next initiative pass, since combatants get a new turn without necessarily having acted in the previous pass.
     */
    override async nextTurn(skipAct?: boolean): Promise<this> {
        if (!game.user?.isGM) {
            SocketMessage.emitForGM(FLAGS.DoCombatFunction, { id: this.id, fnName: 'nextTurn' });
            return this;
        }

        const nextTurn = this.turns.findIndex(combatant => {
            if (combatant.isDefeated && this.settings.skipDefeated) return false;
            if (combatant.id === this.combatant?.id) return false;
            return combatant.canAct() && !combatant.acted();
        });

        // End of Pass
        if (nextTurn === -1)
            return this.nextPass();

        // Step to next combatant in current pass
        if (skipAct) {
            await this.update({ turn: nextTurn });
            return this;
        }

        const history = this._nextHistory();
        const combatants = this.combatant ? [{ _id: this.combatant.id!, system: { acted: true } }] : [];
        
        // 2. Include the history in the update payload
        await this.update({ turn: nextTurn, combatants, system: { history } });
        return this;
    }

    async nextPass(): Promise<this> {
        if (!game.user?.isGM) {
            SocketMessage.emitForGM(FLAGS.DoCombatFunction, { id: this.id, fnName: 'nextPass' });
            return this;
        }

        // End of initiative pass: check if another pass is needed
        // Determine if any combatant has enough initiative for another pass
        const nextTurn = this.turns.findIndex((c) => {
            if (this.settings.skipDefeated && c.isDefeated) return false;
            return c.initiative != null && CombatRules.initAfterPass(c.initiative) > 0;
        });

        // End of initiative pass
        const history = this._nextHistory();
        if (nextTurn === -1) {
            await this.update({ system: { history } });
            return this.nextRound();
        }

        const initiativePass = this.initiativePass + 1;

        const padData = this.turns.filter(c => !c.system.pad).map(() => ({ system: { pad: true } }));
        await this.createEmbeddedDocuments("Combatant", padData);

        const combatants = this.combatants.map((c) => c.initPassUpdateData());
        await this.update({ combatants, system: { initiativePass, history } });
        return this.nextTurn(true);
    }

    override async nextRound() {
        if (!game.user?.isGM) {
            SocketMessage.emitForGM(FLAGS.DoCombatFunction, { id: this.id, fnName: 'nextRound' });
            return this;
        }

        await this.createHistorySnapshot();
        await this._clearCombatantPadding();

        return super.nextRound();
    }

    async createHistorySnapshot() {
        return this.update({ system: { history: this._nextHistory() } });
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

        if (this.combatants.size) {
            await this.resetAll();
            await this.rollForActors({ updateTurn: false });
            const firstTurn = this.settings.skipDefeated ? this.turns.findIndex(c => !c.isDefeated) : 0;
            await this.update({ turn: firstTurn >= 0 ? firstTurn : null, combatants: this.combatants.map((c) => c.roundUpdateData()) });
        }

        return super._onStartRound(context);
    }

    /**
     * When a combatant's turn starts, apply necessary changes.
     */
    protected override async _onStartTurn(combatant: Combatant.Implementation, context: Combat.TurnEventContext) {
        if (!context.skipped) await combatant.turnUpdate(this.initiativePass);

        return super._onStartTurn(combatant, context);
    }

    protected override async _onEndTurn(combatant: Combatant.Implementation, context: Combat.TurnEventContext) {
        return super._onEndTurn(combatant, context);
    }

    /**
     * Compares two combatants to determine their sort order in the initiative tracker.
     */
    protected override _sortCombatants(a: Combatant.Implementation, b: Combatant.Implementation): number {
        // Pad are made for pushing turns down the initiative order, so they always go first.
        if (a.system.pad || b.system.pad)
            return (b.system.pad ? 1 : 0) - (a.system.pad ? 1 : 0);

        // First check for seize the initiative status
        if (a.system.seize !== b.system.seize)
            return (b.system.seize ? 1 : 0) - (a.system.seize ? 1 : 0);

        // Primary comparison: Initiative score (higher acts first)
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
                const edge = actor.system.attributes.edge;
                await actor.update({
                    system: {
                        initiative: { blitz: false },
                        attributes: { edge: { uses: Math.min(edge.uses + 1, edge.value) } }
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
        ...args: Parameters<Combat["_clearMovementHistoryOnStartTurn"]>
    ) {}

    /**
     * Rolls initiative for actors based on system settings.
     */
    private async rollForActors(options?: Combat.InitiativeOptions) {
        const rollForAll = !game.settings.get(SYSTEM_NAME, FLAGS.OnlyAutoRollNPCInCombat);
        return rollForAll ? this.rollAll(options) : this.rollNPC(options);
    }

    private _nextHistory(): SR5Combat['system']['history'] {
        const history = [...(this.system.history ?? [])];
        history.push({
            turn: this.turn,
            initiativePass: this.initiativePass,
            round: this.round,
            combatants: this.combatants.map((combatant) => ({
                _id: combatant.id,
                defeated: combatant.defeated,
                initiative: combatant.initiative ?? null,
                system: structuredClone(combatant.system),
            }))
        });
        return history.slice(-MAX_HISTORY_SIZE);
    }

    private async _restoreSnapshot(
        snapshot: SR5Combat['system']['history'][number],
        history: SR5Combat['system']['history']
    ): Promise<this> {
        // Check if the current combat has more pads than the snapshot had
        const currentPads = this.combatants.filter(c => c.system.pad).map(c => c.id);
        const snapshotPads = snapshot.combatants.filter(c => c.system.pad).map(c => c._id);

        // Find pads that exist now but didn't exist in the snapshot, and delete them
        const padsToDelete = currentPads.filter(id => !snapshotPads.includes(id));
        if (padsToDelete.length > 0)
            await this.deleteEmbeddedDocuments("Combatant", padsToDelete);

        // Now restore the state safely
        await this.update(
            {
                turn: snapshot.turn,
                round: snapshot.round,
                combatants: snapshot.combatants,
                system: { initiativePass: snapshot.initiativePass, history }
            },
            { diff: false, direction: -1 }
        );

        return this;
    }

    private async _clearCombatantPadding(): Promise<void> {
        const padCombatants = this.combatants
            .filter(combatant => combatant.system.pad)
            .map(combatant => combatant.id)
            .filter((id): id is string => typeof id === 'string');

        if (padCombatants.length === 0) return;
        await this.deleteEmbeddedDocuments('Combatant', padCombatants);
    }
}
