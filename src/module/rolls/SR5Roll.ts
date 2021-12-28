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

interface ShadowrunChatMessageData {
    title?: String
    content?: String
    roll?: SR5Roll
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
    data: ShadowrunRollData

    static CHAT_TEMPLATE = 'systems/shadowrun5e/dist/templates/rolls/success-test.html';

    toJSON(): any {
        // TODO: Check if data includes custom ShadowrunRollData
        const data = super.toJSON();
        // add class Roll to the json so dice-so-nice works
        // TODO: Check if this is still necessary.
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
        // 0.7.x > FoundryVTT
        if (this.terms) {
            //@ts-ignore
            return this.dice[0].number;
        }

        //@ts-ignore
        // till 0.6.x FoundryVTT
        return this.parts[0].rolls.length;
    }

    get glitched(): boolean {
        let glitched = 0;
        SR.die.glitch.forEach(die => glitched += this.count(die));
        return glitched > Math.floor(this.pool / 2);
    }

    /**
     * Overwrite default toMessage for custom message content.
     *
     * @param messageData
     * @param options
     */
    async toMessage(messageData: ShadowrunChatMessageData = {}, options?): Promise<ChatMessage|undefined> {
        console.error('message', this, messageData, options);

        // Replace default chat message content.
        // This content follows FoundryVTT rollMode visibility rules.
        messageData.content = messageData.content ?? await renderTemplate(SR5Roll.CHAT_TEMPLATE, messageData);
        messageData.roll = this;
        return super.toMessage(messageData, options);
    }

    /**
     * Place holder for flow handling.
     * TODO: Might need complete rework or removal. Will need args at least.
     */
    static async castByUser(): Promise<SR5Roll | undefined> {
        console.error('promptSuccessRoll');

        const roll = new SR5Roll('10d6');
        console.error('roll', roll);
        await roll.evaluate({async: true});
        console.error('evaluate', roll);
        const message = await roll.toMessage({title: 'Test'});
        console.error('message', roll, message);

        return roll;
    }
}