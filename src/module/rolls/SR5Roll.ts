/**
 * Apply Shadowrun 5 rules to a FoundryVTT Roll.
 */
export class SR5Roll extends Roll {
    get results() {
        return this.dice[0].results;
    }

    /**
     * The amount of dice going into the throw (the pool used).
     * NOTE: this can be different from the amount of dice actually thrown.
     */
    get pool(): number {
        return this.dice[0].number || 0;
    }

    /**
     * The amount of dice actually thrown after all dice explosions have been resolved.
     */
    get poolThrown(): number {
        return this.results.length;
    }

    get hits(): number {
        return this.total || 0;
    }

    get glitches(): number {
        return this.results.filter(result => result.failure).length;
    }

    get glitched(): boolean {
        return this.glitches > Math.floor(this.pool / 2);
    }
}
