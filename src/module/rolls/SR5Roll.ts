import {SR} from "../constants";
import ModList = Shadowrun.ModList;


type ShadowrunRollData = {
    limit: number
    threshold: number
    parts: ModList<number>
    explodeSixes: boolean
}


/**
 * Apply Shadowrun 5 rules to a FoundryVTT Roll.
 *
 * TODO: This class should create a basic Success Test template and be extended
 *       for further Test templates (versus, action, weapon?, spell?)
 */
export class SR5Roll extends Roll {
    data: ShadowrunRollData

    // add class Roll to the json so dice-so-nice works
    // TODO: Check if this is still necessary.
    toJSON(): any {
        const data = super.toJSON();
        data.class = 'Roll';
        return data;
    }

    get sides(): number[] {
        //@ts-ignore
        // 0.7.x foundryVTT
        if (this.terms) {
            //@ts-ignore
            return this.terms[0].results.map(result => result.result);
        }

        //@ts-ignore
        // 0.6.x foundryVTT
        return this.parts[0].rolls.map(roll => roll.roll);
    }

    get limit(): number {
        return this.data.limit;
    }

    get threshold(): number {
        return this.data.threshold;
    }

    //@ts-ignore // TODO: This overwrites Roll.parts with very different return types...
    get parts(): ModList<number> {
        return this.data.parts;
    }

    get explodeSixes(): boolean {
        return this.data.explodeSixes;
    }

    count(side: number): number {
        const results = this.sides;
        return results.reduce((counted, result) => result === side ? counted + 1 : counted, 0);
    }

    get hits(): number {
        return this.total || 0;
    }

    get pool(): number {
        //@ts-ignore
        // 0.7.x foundryVTT
        if (this.terms) {
            //@ts-ignore
            return this.dice[0].number;
        }

        //@ts-ignore
        // 0.6.x foundryVTT
        return this.parts[0].rolls.length;
    }

    get glitched(): boolean {
        let glitched = 0;
        SR.die.glitch.forEach(die => glitched += this.count(die));
        return glitched > Math.floor(this.pool / 2);
    }

    async toMessage(messageData?, rollMode?): Promise<ChatMessage|undefined> {
        console.error('message', this, messageData, rollMode);

        return super.toMessage(messageData, rollMode);
    }

    /**
     * Place holder for flow handling.
     * TODO: Might need complete rework or removal. Will ne args at least.
     */
    static async castByUser(): Promise<SR5Roll | undefined> {
        console.error('promptSuccessRoll');

        const roll = new SR5Roll('10d6');
        console.error('roll', roll);
        await roll.evaluate({async: true});
        console.error('evaluate', roll);
        const message = await roll.toMessage();
        console.error('message', roll, message);

        return roll;
    }
}