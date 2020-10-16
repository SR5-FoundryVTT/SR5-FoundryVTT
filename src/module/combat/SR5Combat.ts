import SR5CombatData = Shadowrun.SR5CombatData;

export class SR5Combat extends Combat {
    get initiativePass(): number {
        return this.data?.initiativePass || 0;
    }

    constructor(...args) {
        // @ts-ignore
        super(...args);

        Hooks.on('updateActor', (actor) => {
            const combatant = this.getActorCombatant(actor);
            if (combatant) {
                // TODO handle monitoring Wound changes
            }
        });
    }

    getActorCombatant(actor: Actor): undefined | any {
        return this.combatants.find((c) => c.actor._id === actor._id);
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

    data: SR5CombatData;

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
                Number(actor.getEdge().max),
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
     * @Override
     * remove any turns that are less than 0
     * filter using ERIC
     */
    setupTurns(): any[] {
        const turns = super.setupTurns().filter((turn) => {
            if (turn.initiative === null) return true;

            const init = Number(turn.initiative);
            if (isNaN(init)) return true;
            return init > 0;
        });
        // @ts-ignore
        this.turns = turns.sort(SR5Combat.sortByRERIC);
        return turns;
    }

    /**
     * @Override
     * proceed to the next turn
     * - handles going to next initiative pass or combat round.
     */
    async nextTurn(): Promise<void> {
        let turn = this.turn;
        let skip = this.settings.skipDefeated;
        // Determine the next turn number
        let next: number | null = null;
        if (skip) {
            for (let [i, t] of this.turns.entries()) {
                if (i <= turn) continue;
                // @ts-ignore
                if (!t.defeated) {
                    next = i;
                    break;
                }
            }
        } else next = turn + 1;

        // Maybe advance to the next round/init pass
        let round = this.round;
        let initPass = this.initiativePass;

        // if both are 0, we just started so set both to 1
        if (round === 0 && initPass === 0) {
            initPass = initPass + 1;
            round = round + 1;
            next = 0;
        } else if (next === null || next >= this.turns.length) {
            const combatants: any[] = [];

            // check for initpass
            const over10Init = this.combatants.reduce((accumulator, running) => {
                return accumulator || Number(running.initiative) > 10;
            }, false);

            // do an initiative pass
            if (over10Init) {
                next = 0;
                initPass = initPass + 1;
                // adjust combatants
                for (const c of this.combatants) {
                    let init = Number(c.initiative);
                    init -= 10;
                    // @ts-ignore
                    combatants.push({ _id: c._id, initiative: init });
                }
            } else {
                next = 0;
                round = round + 1;
                initPass = 0;
                // resetall isn't typed
                // @ts-ignore
                await this.resetAll();
                await this.rollAll();
            }

            if (combatants.length > 0) {
                // @ts-ignore
                await this.updateCombatant(combatants);
            }

            if (skip) {
                // @ts-ignore
                next = this.turns.findIndex((t) => !t.defeated);
                if (next === -1) {
                    // @ts-ignore
                    ui.notifications.warn(game.i18n.localize('COMBAT.NoneRemaining'));
                    next = 0;
                }
            }
        }

        // Update the encounter
        await this.update({ round: round, turn: next, initiativePass: initPass });
    }
}
