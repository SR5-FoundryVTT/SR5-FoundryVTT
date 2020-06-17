
export type SR5RollResult = {
    formula: string,
    hits: number,
    glitches: number,
    dice: number[]
}

export class SR5Dice {
    /**
     * Build a formula for a Shadowrun dice roll.
     * @param count The number of dice to roll.
     * @param limit A limit, if any. Negative for no limit.
     * @param explode If the dice should explode on sixes.
     */
    public static ToFormula(count: number, limit: number = -1, explode: boolean = false): string {
        if (count <= 0) {
            throw new FormulaError("Must request least one die be rolled.");
        }

        let formula = `${count}d6`;

        if (explode) {
            formula += 'x6';
        }

        if (limit) {
            formula += `kh${limit}`;
        }

        formula += 'cs>=5';
        return formula;
    }

    /**
     * Roll some dice and return the results.
     * @param count The number of dice to roll.
     * @param limit The limit of the roll. Pass a negative number for no limit. No limit by default.
     * @param explode If the dice should explode or not, defaults to false.
     */
    public static Roll(count: number, limit: number = -1, explode: boolean = false): SR5RollResult {
        if (count <= 0) {
            //Not the roll's job to display a notification
            //Catch this in the calling function if you need to alert the user
            throw new DiceError("Must roll at least one die.");
        }

        const formula = SR5Dice.ToFormula(count, limit, explode);
        const results = new Roll(formula)
            .roll().dice[0].rolls
            .map((die) => die.roll);

        return {
            formula,
            hits: results.filter((value) => value >= 5).length,
            glitches: results.filter((value) => value === 1).length,
            dice: results
        }
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

/**
 * An error that occurs during the construction of a dice pool formula.
 */
export class FormulaError extends Error {
    constructor(message: string) {
        super(message);
    }
}
