import {SR5Actor} from "../actor/SR5Actor";
import {FLAGS, SR, SYSTEM_NAME} from "../constants";
import {CombatRules} from "../rules/CombatRules";
import {SocketMessage} from "../sockets";
import SocketMessageData = Shadowrun.SocketMessageData;

/**
 * Foundry combat implementation for Shadowrun5 rules.
 *
 * TODO: Store what combatants already acted and with what initiative base and dice they did. This can be used to alter
 *       initiative score without fully rerolling and maintain propper turn order after an actor raised they ini while
 *       stepping over other actors that already had their action phase in the current initiative pass.
 *       @PDF SR5#160 'Chaning Initiative'
 */
export class SR5Combat extends Combat {
    // Overwrite foundry-vtt-types v9 combatTrackerSettings type definitions.
    override get settings() {
        return super.settings as {resource: string, skipDefeated: boolean};
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
    getActorCombatant(actor: SR5Actor): undefined | Combatant {
        const token = actor.getToken();
        if (!token) return;
        return this.getCombatantByToken(token.id as string);
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
                    const combatant = await game.combat?.combatants.get(li.data('combatant-id'));
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
                    const combatant = await game.combat?.combatants.get(li.data('combatant-id'));
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
                    const combatant = await game.combat?.combatants.get(li.data('combatant-id'));
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
     * Adjust a combatants initiative score in combat.
     * 
     * @param combatant Combatant to adjust
     * @param adjustment The adjustment that's to be added onto the current ini score.
     */
    async adjustInitiative(combatant: string | any, adjustment: number) {
        combatant = typeof combatant === 'string' ? this.combatants.find((c) => c.id === combatant) : combatant;
        if (!combatant || typeof combatant === 'string') {
            console.error('Could not find combatant with id ', combatant);
            return;
        }
        // @ts-ignore
        await combatant.update({
            initiative: Number(combatant.initiative) + adjustment,
        });
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

        // Collect all combatants ini changes for singular update.
        const combatants: {_id: string|null, initiative: number}[] = [];
        for (const combatant of combat.combatants) {
            const initiative = CombatRules.reduceIniResultAfterPass(Number(combatant.initiative));
            
            combatants.push({
                _id: combatant.id,
                initiative
            });
        }

        await combat.update({
            turn, 
            combatants, 
            [`flags.${SYSTEM_NAME}.${FLAGS.CombatInitiativePass}`]: initiativePass
        });

        await combat.handleActionPhase();
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
        await combat.handleActionPhase();
    }

    /**
     * New action phase might need changes on the actor that only the GM can reliable make.
     */
    async handleActionPhase() {
        if (!game.user?.isGM)            
            await this._createNewActionPhaseSocketMessage();
        else 
            await SR5Combat.handleActionPhase(this.id as string);
    }

    /**
     * When combat enters a new combat phase, apply necessary changes.
     * 
     * This action phase change can occur through phase/turn/round changes.
     * 
     * @param combatId Combat with the current combatant entering it's next action phase.
     */
    static async handleActionPhase(combatId: string) {
        const combat = game.combats?.get(combatId) as SR5Combat;
        if (!combat) return;

        const combatant = combat.combatant;
        if (!combatant) return;

        // Defense modifiers reset on a new action phase.
        await combatant.actor?.removeDefenseMultiModifier();

        const turnsSinceLastAttackSetting = combatant.getFlag(SYSTEM_NAME, FLAGS.TurnsSinceLastAttack);
        if (foundry.utils.getType(turnsSinceLastAttackSetting) !== 'number') return await combatant.actor?.clearProgressiveRecoil();
        
        const turnsSinceLastAttack = Number(turnsSinceLastAttackSetting);
        if (turnsSinceLastAttack > 0) await combatant.actor?.clearProgressiveRecoil();
        else await combatant.setFlag(SYSTEM_NAME, FLAGS.TurnsSinceLastAttack, 1);
    }

    /**
     * Make sure Shadowrun initiative order is applied.
     */
    override setupTurns(): any[] {
        const turns = super.setupTurns();
        return turns.sort(SR5Combat.sortByRERIC);
    }

    /**
     * Sort combatants by Shadowrun5e attribute order of
     *  - initiative score
     *  - edge 
     *  - reaction
     *  - intuition
     *  - coin toss
     * 
     * @param left A combatant in order
     * @param right A combatant in order
     * @returns A Array.sort result determining sort order: -1, 1, 0
     */
    static sortByRERIC(left: Combatant, right: Combatant): number {
        // Sanitize missing actors by not re-ordering
        if (!left.actor) return 0;
        if (!right.actor) return 0;

        // First sort by initiative value if different
        const leftInit = Number(left.initiative);
        const rightInit = Number(right.initiative);
        if (isNaN(leftInit)) return 1;
        if (isNaN(rightInit)) return -1;
        if (leftInit > rightInit) return -1;
        if (leftInit < rightInit) return 1;

        // now we sort by ERIC
        const genData = (actor: SR5Actor): number[] => {
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
            if (this.turn !== null && turnInPass <= this.turn) continue;
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
            if (this.turn !== null && turnInPass <= this.turn) continue;
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
    override async nextTurn(): Promise<this | undefined> {
        // Maybe advance to the next round/init pass
        let nextRound = this.round;
        let initiativePass = this.initiativePass;
        // Get the next viable turn position.
        let nextTurn = this.settings?.skipDefeated ?
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
            await this.handleActionPhase();
            return;
        }

        // Initiative Pass Handling. Owner permissions are needed to change the initiative pass.
        if (!game.user?.isGM && this.doIniPass(nextTurn)) {
            await this._createDoIniPassSocketMessage();
            return;
        }

        if (game.user?.isGM && this.doIniPass(nextTurn)) {
            await SR5Combat.handleIniPass(this.id as string);
            return;
        }


        // Initiative Round Handling.
        // NOTE: It's not checked if the next is needed. This should result in the user noticing the turn going up, when it
        //       maybe shouldn't and reporting a unhandled combat phase flow case.
        return this.nextRound();
    }

    override async startCombat() {        
        // Roll initiative for all combatants.
        // Disable Foundry behavior of keeping the 'current' combatants turn.
        // Shadowrun 5 starts at the top of the ini order, this avoids an .update
        if (game.settings.get(SYSTEM_NAME, FLAGS.OnlyAutoRollNPCInCombat)) {            
            await this.rollNPC({updateTurn: false});
        } else {
            await this.rollAll({updateTurn: false});
        }

        // Start at top of the ini order.
        const turn = 0;
        const round = SR.combat.INITIAL_INI_ROUND;
        const initiativePass = SR.combat.INITIAL_INI_PASS;

        await this.update({
            turn,
            round,
            [`flags.${SYSTEM_NAME}.${FLAGS.CombatInitiativePass}`]: initiativePass
        });

        await this.handleActionPhase();

        return this;
    }

    override async nextRound(): Promise<any> {
        // Let Foundry handle time and some other things.
        await super.nextRound();

        // Owner permissions are needed to change the shadowrun initiative round.
        if (!game.user?.isGM) {
            await this._createDoNextRoundSocketMessage();
        } else {
            await SR5Combat.handleNextRound(this.id as string);
        }
    }

    /**
     * This handler handles FoundryVTT hook preUpdateCombatant
     *
     * @param combatant The Combatant to update
     * @param changed The changedData (tends to a diff)
     * @param options
     * @param id
     */
    static onPreUpdateCombatant(combatant: Combatant, changed, options, id) {
        console.log('Shadowrun5e | Handle preUpdateCombatant to apply system rules', combatant, changed);

        // Disallow invalid ini scores to be applied by any source.
        if (changed.initiative) changed.initiative = CombatRules.getValidInitiativeScore(changed.initiative);
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

    static async _handleDoNextRoundSocketMessage(message: SocketMessageData) {
        if (!message.data.hasOwnProperty('id') && typeof message.data.id !== 'string') {
            console.error(`SR5Combat Socket Message ${FLAGS.DoNextRound} data.id must be a string (combat id) but is ${typeof message.data} (${message.data})!`);
            return;
        }

        return await SR5Combat.handleNextRound(message.data.id);
    }

    static async _handleDoInitPassSocketMessage(message: SocketMessageData) {
        if (!message.data.hasOwnProperty('id') && typeof message.data.id !== 'string') {
            console.error(`SR5Combat Socket Message ${FLAGS.DoInitPass} data.id must be a string (combat id) but is ${typeof message.data} (${message.data})!`);
            return;
        }

        return await SR5Combat.handleIniPass(message.data.id);
    }

    /**
     * Apply changes on the given combat for new action phase
     * @param message 
     */
    static async _handleDoNewActionPhaseSocketMessage(message: SocketMessageData) {
        if (!message.data.hasOwnProperty('id') && typeof message.data.id !== 'string') {
            console.error(`SR5Combat Socket Message ${FLAGS.DoNewActionPhase} data.id must be a string (combat id) but is ${typeof message.data} (${message.data})!`);
            return;
        }

        return await SR5Combat.handleActionPhase(message.data.id);
    }

    async _createDoNextRoundSocketMessage() {
        await SocketMessage.emitForGM(FLAGS.DoNextRound, {id: this.id});
    }

    async _createDoIniPassSocketMessage() {
        await SocketMessage.emitForGM(FLAGS.DoInitPass, {id: this.id});
    }

    async _createNewActionPhaseSocketMessage() {
        await SocketMessage.emitForGM(FLAGS.DoNewActionPhase, {id: this.id});
    }

    override delete(...args): Promise<this | undefined> {
        // Remove all combat related modifiers.
        this.combatants.contents.forEach(combatant => combatant.actor?.removeDefenseMultiModifier());
        return super.delete(...args);
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