import { SR } from "../constants";

/**
 * Apply Shadowrun 5 rules to a FoundryVTT Roll.
 */
export class SR5Roll extends Roll {
    get sides(): number[] {
        return this.dice[0].results.map(result => result.result);
    }

    count(side: number) {
        return this.sides.filter(result => result === side).length;
    }

    // TODO: Rework this to work with the complex formula of SuccessTest.formula (total counts all cs and cf)
    get hits(): number {
        return this.sides.filter(result => (SR.die.success as readonly number[]).includes(result)).length;
    }

    get glitches(): number {
        return this.sides.filter(result => (SR.die.glitch as readonly number[]).includes(result)).length;
    }


    /**
     * The amount of dice going into the throw (the pool used).
     * 
     * NOTE: this can be different from the amount of dice actually thrown.
     *       Use SR5Roll#diceThrown instead
     */
    get pool(): number {
        return this.dice[0].number || 0;
    }

    /**
     * The amount of dice actually thrown after all dice explosions have been resolved.
     */
    get poolThrown(): number {
        return this.sides.length;
    }

    get glitched(): boolean {
        return this.glitches > Math.floor(this.pool / 2);
    }

    override get total(): number {
        return this.hits;
    }
}
