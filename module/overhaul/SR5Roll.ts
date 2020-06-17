export class SR5Die extends Die {
    constructor() {
        super(6);
    }
}

export class SR5Roll extends Roll {
    /**
     * Build a formula for a Shadowrun dice roll.
     * Assumes roll will be valid (e.g. you pass a positive count).
     * @param count The number of dice to roll.
     * @param limit A limit, if any. Negative for no limit.
     * @param explode If the dice should explode on sixes.
     */
    public static ToFormula(count: number, limit: number = -1, explode: boolean = false): string {
        let formula = `${count}d6`;
        if (explode) { formula += 'x6'; }
        if (limit > 0) { formula += `kh${limit}`; }

        return `${formula}cs>=5`;
    }

    /**
     * Helper method to construct a roll, roll the dice, then return the results.
     * @param count The number of dice to roll.
     * @param limit The limit of the roll. Pass a negative number for no limit. No limit by default.
     * @param explode If the dice should explode or not, defaults to false.
     */
    public static Roll(count: number, limit: number = -1, explode: boolean = false): SR5Roll {
        if (count <= 0) {
            throw new DiceError("Must request least one die be rolled.");
        }

        return new SR5Roll(count, limit, explode).roll();
    }

    /**
     * The number of dice in this roll.
     */
    protected m_Count: number;

    /**
     * The limit of this roll
     */
    protected m_Limit: number;

    /**
     * If the roll should explode or not
     */
    protected m_Explode: boolean;

    constructor(count: number, limit: number = -1, explode: boolean = false) {
        if (count <= 0) {
            throw new DiceError("Must request least one die be rolled.");
        }

        super(SR5Roll.ToFormula(count, limit, explode));
        this.m_Count = count;
        this.m_Limit = limit;
        this.m_Explode = explode;
    }

    roll(): SR5Roll {
        const result = super.roll();
        // This *works* but something bugs me about it...
        // I have a vague nagging in the back of my head that it may leak.
        Object.assign(this, result);
        return this;
    }

    reroll(): SR5Roll {
        return new SR5Roll(this.m_Count, this.m_Limit, this.m_Explode).roll();
    }

    // Override type...
    get dice(): SR5Die[] {
        return super.dice;
    }

    /**
     * The number of hits rolled.
     */
    get hits(): number {
        // Could also return undefined, null, 0, etc...
        if (!this._rolled) return NaN;
        return this.total;
    }

    /**
     * The number of glitches rolled.
     */
    get glitches(): number {
        // Could also return undefined, null, 0, etc...
        if (!this._rolled) return NaN;
        return this.dice[0].rolls.filter((die) => die.roll === 1).length;
    }

    /**
     * Is this roll a regular (non-critical) glitch?
     */
    get isGlitch(): boolean {
        return this.glitches > (this.dice.length/2);
    }

    /**
     * Is this roll a critical glitch?
     */
    get isCriticalGlitch(): boolean {
        return this.isGlitch && this.hits === 0;
    }
}

/**
 * An error that occurs during the rolling of dice.
 */
export class DiceError extends Error {
    constructor(message: string) {
        super(message);
    }
}