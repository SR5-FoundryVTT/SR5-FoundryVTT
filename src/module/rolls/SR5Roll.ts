import {SR} from "../constants";
import ModList = Shadowrun.ModList;

// TODO: Data for casting actor / item (uuid)
// TODO: maybe copy of the action data from the casting item / actor
interface ShadowrunRollData {
    limit: number
    threshold: number
    parts: ModList<number> // TODO: Is this useful?
    explodeSixes: boolean
}

/**
 * Apply Shadowrun 5 rules to a FoundryVTT Roll.
 *
 * TODO: This class should create a basic Success Test template and be extended
 *       for further Test templates (versus, action, weapon?, spell?)
 *
 * TODO: A chat message should contain all data needed to cast resulting actions.
 */
export class SR5Roll extends Roll {
    override data: ShadowrunRollData

    get sides(): number[] {
        // TODO: The system only supports v11+... this should be removable
        // 0.7.x foundryVTT
        if (this.terms) {
            //@ts-expect-error TODO: foundry-vtt-types v10
            return this.terms[0].results.map(result => result.result);
        }

        //@ts-expect-error // Supports old 0.6.x foundryVTT
        return this.parts[0].rolls.map(roll => roll.roll);
    }

    get limit(): number {
        return this.data.limit;
    }

    get threshold(): number {
        return this.data.threshold;
    }

    get parts(): ModList<number> {
        return this.data.parts;
    }

    // TODO: Not needed anymore with complex Formula of SuccessTest
    get explodeSixes(): boolean {
        return this.data.explodeSixes;
    }

    count(side: number): number {
        return this.sides.reduce((counted, result) => result === side ? counted + 1 : counted,
                                 0);
    }

    // TODO: Rework this to work with the complex formula of SuccessTest.formula (total counts all cs and cf)
    get hits(): number {
        return this.sides.reduce((hits, result) => SR.die.success.includes(result) ? hits + 1 : hits,
                                 0);
    }

    get glitches(): number {
        return this.sides.reduce((glitches, result) => SR.die.glitch.includes(result) ? glitches + 1 : glitches,
                                 0);
    }


    /**
     * The amount of dice going into the throw (the pool used).
     * 
     * NOTE: this can be different from the amount of dice actually thrown.
     *       Use SR5Roll#diceThrown instead
     */
    get pool(): number {
        // TODO: system only supports v11+... this should be removable
        // 0.7.x > FoundryVTT
        if (this.terms) {
            return this.dice[0].number;
        }

        //@ts-expect-error // till 0.6.x FoundryVTT
        return this.parts[0].rolls.length;
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