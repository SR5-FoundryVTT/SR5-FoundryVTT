import SR5CombatData = Shadowrun.SR5CombatData;
import {SR5Actor} from "../actor/SR5Actor";
import {CombatRules} from "../sr5/Combat";
import {FLAGS, SYSTEM_NAME} from "../constants";

/**
 * Foundry combat implementation for Shadowrun5 rules.
 */
export class SR5Combat extends Combat {
    data: SR5CombatData;

    get initiativePass(): number {
        return this.data?.initiativePass || 0;
    }

    constructor(...args) {
        // @ts-ignore
        super(...args);

        // NOTE: This is currently handled during damage application in the Actor.
        // Hooks.on('updateActor', (actor) => {
        //     const combatant = this.getActorCombatant(actor);
        //     if (combatant) {
        //         // handle monitoring Wound changes
        //     }
        // });
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
                        const combat: SR5Combat = game.combat as SR5Combat;
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
                        const combat: SR5Combat = game.combat as SR5Combat;
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
                        const combat: SR5Combat = game.combat as SR5Combat;
                        await combat.adjustInitiative(combatant, -10);
                    }
                },
            },
        );
        return options;
    }

    protected _onUpdate(data: object, ...args) {
        console.log(data);
        // @ts-ignore
        super._onUpdate(data, ...args);
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
     * Make sure Shadowrun initiative order is applied.
     */
    setupTurns(): any[] {
        const turns = super.setupTurns();
        console.error(turns);
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
        const genData = (actor) => {
            // edge, reaction, intuition, coinflip
            return [
                Number(actor.getEdge().value),
                Number(actor.findAttribute('reaction')?.value),
                Number(actor.findAttribute('intuition')?.value),
                new Roll('1d2').roll().total,
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
        for (let n = this.turn + 1; n++; n < this.combatants.length) {
            const combatant = this.combatants[n];
            if (combatant.initiative > 0)
                return n;
        }
        // If nothing is found, start at the top.
        return 0
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
            await this.update({ turn: nextTurn });
            return;
        }

        // if (!game.user.isGM) {
        //     return;
        // }

        // Initiative Pass Handling.
        if (this.doIniPass(nextTurn)) {
            initiativePass = initiativePass + 1;
            // Start at the top!
            nextTurn = 0;

            const combatants: any[] = [];
            for (const combatant of this.combatants) {
                const initiative = CombatRules.reduceIniResultAfterPass(Number(combatant.initiative));
                combatants.push({_id: combatant._id, initiative});
            }
            if (combatants.length > 0)
                // @ts-ignore
                await this.updateCombatant(combatants);

             await this.update({ round: nextRound, turn: nextTurn, initiativePass });
             return;
        }

        // Initiative Round Handling.
        // NOTE: It's not checked if the next is needed. This should result int he user noticing the turn going up, when it
        //       maybe shouldn't and reporting a unhandled combat phase flow case.
        return this.nextRound();
    }

    async startCombat() {
        const nextRound = 1;
        const initiativePass = 1;
        // Start at the top!
        const nextTurn = 0;

        if (game.settings.get(SYSTEM_NAME, FLAGS.OnlyAutoRollNPCInCombat)) {
            await this.rollNPC();
        } else {
            await this.rollAll();
        }

        return await this.update({ round: nextRound, turn: nextTurn, initiativePass });
    }

    async nextRound(): Promise<void> {
        await super.nextRound();

        const initiativePass = 0;

        await this.resetAll();

        if (game.settings.get(SYSTEM_NAME, FLAGS.OnlyAutoRollNPCInCombat)) {
            await this.rollNPC();
        } else {
            await this.rollAll();
        }

        await this.update({ initiativePass });
    }
}
