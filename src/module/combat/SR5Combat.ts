import {SR5Actor} from "../actor/SR5Actor";
import {CombatRules} from "../sr5/Combat";
import {FLAGS, SR, SYSTEM_NAME, SYSTEM_SOCKET} from "../constants";
import Combatant = Combat.Combatant;

/**
 * Foundry combat implementation for Shadowrun5 rules.
 *
 * TODO: Store what combatants already acted and with what initiative base and dice they did. This can be used to alter
 *       initiative score without fully rerolling and maintain propper turn order after an actor raised they ini while
 *       stepping over other actors that already had their action phase in the current initiative pass.
 *       @PDF SR5#160 'Chaning Initiative'
 */
export class SR5Combat extends Combat {
    constructor(...args: any) {
        super(...args);

        this._registerSocketListeners();
    }

    get initiativePass(): number {
        return this.getFlag(SYSTEM_NAME, FLAGS.CombatInitiativePass) as number || SR.combat.INITIAL_INI_PASS;
    }

    static async setInitiativePass(combat: SR5Combat, pass: number) {
        await combat.unsetFlag(SYSTEM_NAME, FLAGS.CombatInitiativePass);
        await combat.setFlag(SYSTEM_NAME, FLAGS.CombatInitiativePass, pass);
    }

    /**
     * Use the given actors token to get the combatant.
     * NOTE: The token must be used, instead of just the actor, as unlinked tokens will all use the same actor id.
     */
    getActorCombatant(actor: SR5Actor): undefined | any {
        const token = actor.getToken();
        if (!token) return;
        return this.getCombatantByToken(token.id);
    }

    /**
     * Add ContextMenu options to CombatTracker Entries -- adds the basic Initiative Subtractions
     * @param html
     * @param options
     */
    static addCombatTrackerContextOptions(html, options: any[]) {
        options.push(
            {
                name: game.i18n.localize('SR5.COMBAT.ReduceInitByOne'),
                icon: '<i class="fas fa-caret-down"></i>',
                callback: async (li) => {
                    // @ts-ignore
                    const combatant = await game.combat.getCombatant(li.data('combatant-id'));
                    if (combatant) {
                        const combat: SR5Combat = game.combat as unknown as SR5Combat;
                        await combat.adjustInitiative(combatant, -1);
                    }
                },
            },
            {
                name: game.i18n.localize('SR5.COMBAT.ReduceInitByFive'),
                icon: '<i class="fas fa-angle-down"></i>',
                callback: async (li) => {
                    // @ts-ignore
                    const combatant = await game.combat.getCombatant(li.data('combatant-id'));
                    if (combatant) {
                        const combat: SR5Combat = game.combat as unknown as SR5Combat;
                        await combat.adjustInitiative(combatant, -5);
                    }
                },
            },
            {
                name: game.i18n.localize('SR5.COMBAT.ReduceInitByTen'),
                icon: '<i class="fas fa-angle-double-down"></i>',
                callback: async (li) => {
                    // @ts-ignore
                    const combatant = await game.combat.getCombatant(li.data('combatant-id'));
                    if (combatant) {
                        const combat: SR5Combat = game.combat as unknown as SR5Combat;
                        await combat.adjustInitiative(combatant, -10);
                    }
                },
            },
        );
        return options;
    }

    /**
     *
     * @param combatant
     * @param adjustment
     */
    async adjustInitiative(combatant: string | any, adjustment: number): Promise<void> {
        combatant = typeof combatant === 'string' ? this.combatants.find((c) => c._id === combatant) : combatant;
        if (!combatant || typeof combatant === 'string') {
            console.error('Could not find combatant with id ', combatant);
            return;
        }
        const newCombatant = {
            _id: combatant._id,
            initiative: Number(combatant.initiative) + adjustment,
        };
        // @ts-ignore
        await this.updateCombatant(newCombatant);
    }

    /**
     * Handle the change of an initiative pass. This needs owner permissions on the combat document.
     * @param combatId
     */
    static async handleIniPass(combatId: string) {
        const combat = game.combats?.get(combatId) as unknown as SR5Combat;
        if (!combat) return;

        const initiativePass = combat.initiativePass + 1;
        // Start at the top!
        const turn = 0;

        for (const combatant of combat.combatants) {
            const initiative = CombatRules.reduceIniResultAfterPass(Number(combatant.initiative));
            // TODO: Foundry 0.9 The Combat#updateCombatant method has been deprecated in favor of Combatant#update and will be removed in 0.9.0
            await combat.updateCombatant({_id: combatant._id, initiative});
        }

        await SR5Combat.setInitiativePass(combat, initiativePass);
        await combat.update({turn});
        return;
    }

    /**
     * Handle the change of a initiative round. This needs owner permission on the combat document.
     * @param combatId
     */
    static async handleNextRound(combatId: string) {
        const combat = game.combats?.get(combatId) as unknown as SR5Combat;
        if (!combat) return;
        await combat.resetAll();
        await SR5Combat.setInitiativePass(combat, SR.combat.INITIAL_INI_PASS);

        if (game.settings.get(SYSTEM_NAME, FLAGS.OnlyAutoRollNPCInCombat)) {
            await combat.rollNPC();
        } else {
            await combat.rollAll();
        }

        const turn = 0;
        await combat.update({turn});
    }

    /**
     * Make sure Shadowrun initiative order is applied.
     */
    setupTurns(): any[] {
        const turns = super.setupTurns();
        return turns.sort(SR5Combat.sortByRERIC);
    }

    static sortByRERIC(left, right): number {
        // First sort by initiative value if different
        const leftInit = Number(left.initiative);
        const rightInit = Number(right.initiative);
        if (isNaN(leftInit)) return 1;
        if (isNaN(rightInit)) return -1;
        if (leftInit > rightInit) return -1;
        if (leftInit < rightInit) return 1;

        // now we sort by ERIC
        const genData = (actor): number[] => {
            // There are broken scenes out there, which will try setting up a combat without valid actors.
            if (!actor) return [0, 0, 0, 0];
            // edge, reaction, intuition, coin flip
            return [
                Number(actor.getEdge().value),
                Number(actor.findAttribute('reaction')?.value),
                Number(actor.findAttribute('intuition')?.value),
                // @ts-ignore
                new Roll('1d2').evaluate({async: false}).total as number,
            ];
        };

        const leftData = genData(left.actor);
        const rightData = genData(right.actor);
        // if we find a difference that isn't 0, return it
        for (let index = 0; index < leftData.length; index++) {
            const diff = rightData[index] - leftData[index];
            if (diff !== 0) return diff;
        }

        return 0;
    }

    /**
     * Return the position in the current ini pass of the next undefeated combatant.
     */
    get nextUndefeatedTurnPosition(): number {
        for (let [turnInPass, combatant] of this.turns.entries()) {
            // Skipping is only interesting when moving forward.
            if (turnInPass <= this.turn) continue;
            // @ts-ignore
            if (!combatant.defeated && combatant.initiative > 0) {
                return turnInPass;
            }
        }
        // The current turn is the last undefeated combatant. So go to the end and beeeeyooond.
        return this.turns.length;
    }

    /**
     * Return the position in the current ini pass of the next combatant that has an action phase left.
     */
    get nextViableTurnPosition(): number {
        // Start at the next position after the current one.
        for (let [turnInPass, combatant] of this.turns.entries()) {
            // Skipping is only interesting when moving forward.
            if (turnInPass <= this.turn) continue;
            // @ts-ignore
            if (combatant.initiative > 0) {
                return turnInPass;
            }
        }
        // The current turn is the last undefeated combatant. So go to the end and beeeeyooond.
        return this.turns.length;
    }

    /**
     * Determine wheter the current combat situation (current turn order) needs and can have an initiative pass applied.
     * @return true means that an initiative pass must be applied
     */
    doIniPass(nextTurn: number): boolean {
        // We're currently only stepping from combatant to combatant.
        if (nextTurn < this.turns.length) return false;
        // Prepare another possible initiative order.
        const currentScores = this.combatants.map(combatant => Number(combatant.initiative));

        return CombatRules.iniOrderCanDoAnotherPass(currentScores);
    }

    /**
     * After all combatants have had their action phase (click on next 'turn') handle shadowrun rules for
     * initiative pass and combat turn.
     *
     * As long as a combatant still has a positive initiative score left, go to the next pass.
     *  Raise the Foundry turn and don't raise the Foundry round.
     * As soons as all combatants have no initiative score left, go to the next combat round.
     *  Reset the Foundry pass and don't raise the Foundry turn.
     *
     * Retrigger Initiative Rolls on each new Foundry round.
     *
     *
     * * @Override
     */
    async nextTurn(): Promise<void> {
        console.error('nextTurn', this);
        // Maybe advance to the next round/init pass
        let nextRound = this.round;
        let initiativePass = this.initiativePass;
        // Get the next viable turn position.
        let nextTurn = this.settings.skipDefeated ?
            this.nextUndefeatedTurnPosition :
            this.nextViableTurnPosition;

        // Start of the combat Handling
        if (nextRound === 0 && initiativePass === 0) {
            await this.startCombat();
            return;
        }

        // Just step from one combatant to the next!
        if (nextTurn < this.turns.length) {
            await this.update({turn: nextTurn});
            return;
        }

        // Initiative Pass Handling. Owner permissions are needed to change the initiative pass.
        if (!game.user?.isGM && this.doIniPass(nextTurn)) {
            await this._createDoIniPassSocketMessage();
            return;
        }

        if (game.user?.isGM && this.doIniPass(nextTurn)) {
            await SR5Combat.handleIniPass(this.id)
            return;
        }

        // Initiative Round Handling.
        // NOTE: It's not checked if the next is needed. This should result int he user noticing the turn going up, when it
        //       maybe shouldn't and reporting a unhandled combat phase flow case.
        return this.nextRound();
    }

    async startCombat() {
        const nextRound = SR.combat.INITIAL_INI_ROUND;
        const initiativePass = SR.combat.INITIAL_INI_PASS;
        // Start at the top!
        const nextTurn = 0;

        await SR5Combat.setInitiativePass(this, initiativePass);
        await this.update({round: nextRound, turn: nextTurn});

        if (game.settings.get(SYSTEM_NAME, FLAGS.OnlyAutoRollNPCInCombat)) {
            await this.rollNPC();
        } else {
            await this.rollAll();
        }

        return this;
    }

    async nextRound(): Promise<void> {
        // Let Foundry handle time and some other things.
        await super.nextRound();

        // Owner permissions are needed to change the shadowrun initiative round.
        if (!game.user?.isGM) {
            await this._createDoNextRoundSocketMessage();
        } else {
            await SR5Combat.handleNextRound(this.id);
        }
    }

    /**
     * use default behaviour but ALWAYS start at the top!
     */
    async rollAll(): Promise<SR5Combat> {
        const combat = await super.rollAll() as unknown as SR5Combat;
        if (combat.turn !== 0)
            await combat.update({turn: 0});
        return combat;
    }

    async updateNewCombatants(ids: string[]) {
        const newCombatants = this.combatants.filter(combatant => combatant._id && ids.includes(combatant._id));
        if (!newCombatants) return;

        // Reduce initiative score for ongoing initiative passes.
        const updateData = newCombatants.map(combatant => {
            // Cast initiative as number, since it should always be that way here.
            const initiative = CombatRules.reduceIniOnLateSpawn(combatant.initiative as number, this.initiativePass);
            return {
                _id: combatant._id,
                initiative
            }
        })

        // @ts-ignore
        await this.updateCombatant(updateData);
    }


    /**
     * Shadowrun starts at the top, except for subsequent initiative passes, then it depends on the new values.
     */
    async rollInitiative(ids, options): Promise<SR5Combat> {
        const combat = await super.rollInitiative(ids, options) as SR5Combat;

        // if (this.initiativePass > SR.combat.INITIAL_INI_PASS)
        //     await this.updateNewCombatants(newIds);

        if (this.initiativePass === SR.combat.INITIAL_INI_PASS)
            await combat.update({turn: 0});

        return combat;
    }

    /**
     * Alter initiative formula to include initiative pass reduction.
     *
     * NOTE: Should this here fail or be buggy, there always is SR5Combat.updateNewCombatants which can be uncommented in SR5Combat.rollInitiative
     * @deprecated since Foundry 0.8. Kept for possible Foundry 0.7 support. Might just be not needed anymore during 0.8 lifecycle.
     * @param combatant
     */
    _getInitiativeFormula(combatant: Combatant) {
        if (this.initiativePass === SR.combat.INITIAL_INI_PASS) { // @ts-ignore
            return super._getInitiativeFormula(combatant);
        }

        // Reduce for initiative passes until zero.
        return SR5Combat._getSystemInitiativeFormula(this.initiativePass);
    }

    static _getSystemInitiativeBaseFormula() {
        // @ts-ignore
        return String(CONFIG.Combat.initiative.formula || game.system.data.initiative);
    }

    static _getSystemInitiativeFormula(initiativePass: number): string {
        initiativePass = initiativePass > 1 ? initiativePass : 1;
        const baseFormula = SR5Combat._getSystemInitiativeBaseFormula();
        const ongoingIniPassModified = (initiativePass - 1) * -SR.combat.INI_RESULT_MOD_AFTER_INI_PASS;
        return `max(${baseFormula} - ${ongoingIniPassModified}[Pass], 0)`;
    }

    _registerSocketListeners() {
        // @ts-ignore
        game.socket.on(SYSTEM_SOCKET, async (message) => {
            switch (message.type) {
                case (FLAGS.DoNextRound):
                    if (!message.data.hasOwnProperty('id') && typeof message.data.id !== 'string') {
                        console.error(`SR5Combat Socket Message ${FLAGS.DoNextRound} data.id must be a string (combat id) but is ${typeof message.data} (${message.data})!`);
                        return;
                    }

                    return await SR5Combat.handleNextRound(message.data.id);
                case (FLAGS.DoInitPass):
                    if (!message.data.hasOwnProperty('id') && typeof message.data.id !== 'string') {
                        console.error(`SR5Combat Socket Message ${FLAGS.DoInitPass} data.id must be a string (combat id) but is ${typeof message.data} (${message.data})!`);
                        return;
                    }

                    return await SR5Combat.handleIniPass(message.data.id);
            }
        })
    }

    async _createDoNextRoundSocketMessage() {
        //@ts-ignore
        await game.socket.emit(`${SYSTEM_SOCKET}`, {type: FLAGS.DoNextRound, data: {id: this.id}});
    }

    async _createDoIniPassSocketMessage() {
        //@ts-ignore
        await game.socket.emit(`${SYSTEM_SOCKET}`, {type: FLAGS.DoInitPass, data: {id: this.id}});
    }
}

/**
 * Since Foundry 0.8 Combat._getInitiativeFormula has been moved to Combatant._getInitiativeFormula.
 *
 *  This method enhances Combatant#_getInitiativeFormula. Check hooks.ts#init for when it comes into play.
 *
 *  During initiative roll modify the initiative result depending on the current combats initiative pass.
 */
export function _combatantGetInitiativeFormula() {
    const combat = this.parent;
    return SR5Combat._getSystemInitiativeFormula(combat.initiativePass);
}