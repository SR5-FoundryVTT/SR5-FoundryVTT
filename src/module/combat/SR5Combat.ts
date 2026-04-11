import { SocketMessage } from "../sockets";
import { SR5Actor } from "../actor/SR5Actor";
import { SR5Combatant } from "./SR5Combatant";
import { Migrator } from "../migrator/Migrator";
import { CombatRules } from "../rules/CombatRules";
import { FLAGS, SR, SYSTEM_NAME } from "../constants";
import SocketMessageData = Shadowrun.SocketMessageData;
import BaseCombat = foundry.documents.BaseCombat;

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
    get pass(): number {
        return this.system.pass;
    }

    // Don't alert next player, because it can change easily
    override get nextCombatant(): undefined { return undefined; }

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

        // Unlike Foundry's direct UI actions, SR5 forwards non-GM combat controls via socket and whitelists callable methods.
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

        // Foundry's previous turn logic rewinds index/round state; SR5 restores a full snapshot to include pass, acted, and pad state.
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

        // Foundry has no initiative pass rewind; SR5 rewinds to the latest snapshot of a strictly earlier pass.
        const history = [...(this.system.history ?? [])];
        let snapshot = history.pop();
        while (snapshot?.round === this.round && snapshot.pass === this.pass) {
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

        // Foundry rewinds round numerically; SR5 restores the prior round snapshot to keep pass and per-combatant state consistent.
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
     * @param passedPass If true, the next combatant will be selected without marking the current one as having acted.
     * Used when moving to the next initiative pass, since combatants get a new turn without necessarily having acted in the previous pass.
     */
    override async nextTurn(passedPass?: boolean): Promise<this> {
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

        const updateData = { round: this.round, turn: nextTurn } as Combat.UpdateData;
        const advanceTime = this.getTimeDelta(this.round, this.turn, this.round, nextTurn);
        const updateOptions = { direction: 1, worldTime: { delta: advanceTime }} as Combat.Database.UpdateOperation;

        // Foundry advances turns without snapshotting per move; SR5 snapshots on regular turn progression for rewind support.
        if (!passedPass) {
            updateData.system = { history: this._nextHistory() };

            if (this.combatant)
                updateData.combatants = [{ _id: this.combatant.id!, system: { acted: true } }];
        }

        // @ts-expect-error
        Hooks.callAll("combatTurn", this, updateData, updateOptions);
        await this.update(updateData, updateOptions);

        // Handle start of turn updates for the new combatant
        if (this.combatant)
            await this.combatant.turnUpdate(this.pass);

        return this;
    }

    async nextPass(): Promise<this> {
        if (!game.user?.isGM) {
            SocketMessage.emitForGM(FLAGS.DoCombatFunction, { id: this.id, fnName: 'nextPass' });
            return this;
        }

        // Foundry has no initiative pass concept; SR5 creates a pass transition and reduces initiatives for all combatants.
        // End of initiative pass: check if another pass is needed
        // Determine if any combatant has enough initiative for another pass
        const nextTurn = this.turns.findIndex((c) => {
            if (this.settings.skipDefeated && c.isDefeated) return false;
            return c.initiative != null && CombatRules.initAfterPass(c.initiative) > 0;
        });

        // End of initiative pass
        if (nextTurn === -1)
            return this.nextRound();
        
        const updateData = {
            system: {
                history: this._nextHistory(),
                pass: this.pass + 1,
            }
        } as Combat.UpdateData;

        // Add padding combatants for the new pass.
        // These will be sorted to the end of the initiative order and can be used to track pass
        // changes in the UI and prevent issues with combatants being added mid-pass.
        const padData = this.turns.filter(c => !c.system.pad).map(() => ({ system: { pad: true } }));
        await this.createEmbeddedDocuments("Combatant", padData);

        updateData.combatants = this.combatants.map((c) => c.initPassUpdateData());
        await this.update(updateData);
        return this.nextTurn(true);
    }

    override async nextRound() {
        if (!game.user?.isGM) {
            SocketMessage.emitForGM(FLAGS.DoCombatFunction, { id: this.id, fnName: 'nextRound' });
            return this;
        }

        // Foundry nextRound mainly advances round/turn; SR5 also persists state, clears pass padding, and resets initiative pass.
        await this.createHistorySnapshot();

        const padCombatants = this.combatants
            .filter(combatant => combatant.system.pad)
            .map(combatant => combatant.id);

        // If there are any pad combatants, remove them before starting the new round to clean up the initiative tracker.
        if (padCombatants.length)
            await this.deleteEmbeddedDocuments('Combatant', padCombatants);

        const nextRound = this.round + 1;
        const advanceTime = this.getTimeDelta(this.round, this.turn, nextRound, null);

        // Update the document, passing data through a hook first
        const updateData = {
            turn: null,
            round: nextRound,
            system: { pass: SR.combat.INITIAL_INI_PASS },
            combatants: this.combatants.map((c) => c.roundUpdateData()),
        } as Combat.UpdateData;
        const updateOptions = {direction: 1, worldTime: { delta: advanceTime }} as Combat.Database.UpdateOperation;

        // @ts-expect-error
        Hooks.callAll("combatRound", this, updateData, updateOptions);
        await this.update(updateData, updateOptions);

        if (this.combatants.size) {
            await this.resetAll();
            await this.rollForActors({ updateTurn: false });
        }

        return this;
    }

    /**
     * Forces the creation of a history snapshot without advancing the turn.
     */
    async createHistorySnapshot() {
        return this.update({ system: { history: this._nextHistory() } });
    }

    /**
     * Clean up combat-related effects when the combat is deleted.
     */
    override async delete(operation?: BaseCombat.Database.DeleteOperation) {
        // Remove all combat-related modifiers.
        for (const combatant of this.combatants) {
            await combatant.actor?.removeDefenseMultiModifier();
        }
        return super.delete(operation);
    }

    /**
     * Compares two combatants to determine their sort order in the initiative tracker.
     */
    protected override _sortCombatants(a: Combatant.Implementation, b: Combatant.Implementation): number {
        // Foundry defaults to initiative+id ordering; SR5 adds pad/seize/ERIC tie-break flow semantics.
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

    override async rollInitiative(ids: string | string[], options?) {
        await super.rollInitiative(ids, options);

        // SR5-specific blitz cleanup: consume and reset blitz flag after Foundry resolves initiative rolls.
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
        combatant: Combatant.Implementation,
        context: Combat.TurnEventContext,
    ) {}

    /**
     * Rolls initiative for actors based on system settings.
     */
    private async rollForActors(options?) {
        const rollForAll = !game.settings.get(SYSTEM_NAME, FLAGS.OnlyAutoRollNPCInCombat);
        return rollForAll ? this.rollAll(options) : this.rollNPC(options);
    }

    /**
     * Generates a snapshot of the current combat state to be stored in the history array.
     * @returns {SR5Combat['system']['history']}
     * @private
     */
    private _nextHistory(): SR5Combat['system']['history'] {
        const history = [...(this.system.history ?? [])];
        history.push({
            turn: this.turn,
            pass: this.pass,
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

    /**
     * Restores the combat document to the state defined in the provided snapshot.
     * @param snapshot - The historical state to restore.
     * @param history - The remaining history array to persist.
     * @private
     */
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

        const advanceTime = this.getTimeDelta(this.round, this.turn, snapshot.round, snapshot.turn);

        // Now restore the state safely
        await this.update(
            {
                turn: snapshot.turn,
                round: snapshot.round,
                combatants: snapshot.combatants,
                system: { pass: snapshot.pass, history }
            },
            { diff: false, direction: -1, worldTime: { delta: advanceTime } }
        );

        return this;
    }
}
