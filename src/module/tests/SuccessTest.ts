import { SR5Actor } from "../actor/SR5Actor";
import { SR } from "../constants";
import { SR5Item } from "../item/SR5Item";
import {SR5Roll} from "../rolls/SR5Roll";

interface SuccessTestData {
    values: Record<string, number|null>
    threshold?: number
}

interface SuccessTestOptions {
    skipDialog?: boolean // skip dialog when given true.
}

/**
 * General handling of Shadowrun 5e success tests.
 *
 * This class handles all Shadowrun 5 rules surround success tests,
 * except for the dice rolling itself as well the flow handling of multi roll tests.
 *
 * TODO: Check if Actor.getRollData() can be used to better implement this
 * TODO: Add unittesting.
 */
export class SuccessTest {
    public data: SuccessTestData;
    public actor: SR5Actor;
    public roll: SR5Roll;

    static CHAT_TEMPLATE = 'systems/shadowrun5e/dist/templates/rolls/success-test.html';

    // TODO: include modifiers
    constructor(data, actor, options?: SuccessTestOptions) {
        this.data = data;
        this.actor = actor;
        this.roll = this.createRoll();
    }

    /**
     * A helper method to create a SuccessTest from action items.
     *
     * @param item Any item type that defines an action.
     * @param actor The actor to use for the resulting SR5Roll,
     *              will default to the items parent otherwise.
     * @param options See SuccessTestOptions documentation.
     *
     * @returns Tries to create a SuccessTest from given action item or undefined if it failed.
     */
    static fromAction(item: SR5Item, actor?: SR5Actor, options?: SuccessTestOptions): SuccessTest|undefined {
        //@ts-ignore
        if (!actor) actor = item.parent;
        if (!(actor instanceof SR5Actor)) {
            console.warn("Shadowrun 5e | A SuccessTest can only be created with an explicit Actor or Item with an actor parent.")
            return;
        }

        // Any action item will return a list of values to create the test pool from.
        const values = item.getTestValues();
        const data = {values};

        // Let the test handle value resolution for actor values.
        return new SuccessTest(data, actor);
    }

    /**
     * Get the lowest side for a Shadowrun 5 die to count as a success
     * TODO: Implement edge rules.
     */
    static get lowestSuccessSide(): number {
        return Math.min(...SR.die.success);
    }

    /**
     * Get the lowest side for a Shadowrun 5 die to count as a glitch.
     * TODO: Implement edge rules.
     */
    static get lowestGlitchSide(): number {
        return Math.min(...SR.die.glitch);
    }

    /**
     * Create a Shadowrun 5 pool formula which will count all hits.
     *
     * FoundryVTT documentation:
     *  Dice:       https://foundryvtt.com/article/dice-advanced/
     *  Modifiers:  https://foundryvtt.com/article/dice-modifiers/
     * Shadowrun5e: SR5#44
     *
     * TODO: If edge is used use the rr6 modifier
     */
    get formula(): string {
        const terms = Object.entries(this.data.values).map(([name, value]) => value ? value : `@${name}`);
        const formulaTerms = terms.join(' + ');
        return `(${formulaTerms})d6cs>=${SuccessTest.lowestSuccessSide}`;
    }

    /**
     * Helper method to create the internal SR5Roll.
     * @private
     */
    private createRoll(): SR5Roll {
        const rollData = this.actor.getRollData();
        // TODO: Add typing for rolls?
        // @ts-ignore
        return new SR5Roll(this.formula, rollData) as unknown as SR5Roll;
    }

    /**
     * Helper method to evaluate the internal SR5Roll.
     *
     */
    async evaluate(): Promise<SuccessTest> {
        if (!this.evaluated)
            await this.roll.evaluate({async: true});
        return this;
    }

    /**
     * Has the SuccessTest roll been evaluated.
     *
     * @returns true when the underlying roll has been evaluated.
     */
    get evaluated(): boolean {
        // @ts-ignore  // foundry-vtt-types _evaluated is missing.
        return this.roll._evaluated;
    }

    async toMessage(): Promise<ChatMessage|undefined> {
        if (!this.evaluated)
            await this.roll.evaluate({async: true});

        // TODO: Make this a global setting to show the roll card. (or not)
        // await this.roll.toMessage();

        const templateData = {
            title: 'Success Test (TODO)',
            roll: this.roll
        }

        console.error('MessageTemplateData', templateData);
        const content = await renderTemplate(SuccessTest.CHAT_TEMPLATE, templateData);

        console.error('MessageContent', content);
        // TODO: The actual fully detailed SuccessTest card message.
        const message = await ChatMessage.create({
            user: game.user?.id,
            speaker: {
                actor: this.actor.id,
                alias: game.user?.name
                // token: this.actor.
            },
            // TODO: message.isRoll reports as false. Do we need ChatMessage to be roll type?
            // type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            content,
            roll: this.roll.toJSON()

        });

        console.error('Message', message);

        return message;
    }

    /**
     * Register listeners for ChatMessage html created by a SuccessTest.
     *
     * This listener needs to be registered to the 'renderChatMessage' FoundryVTT hook.
     *
     * @param message
     * @param html
     * @param data
     */
    static chatMessageListeners(message: ChatMessage, html, data) {
        html.find('.card-main-content').on('click', (event) => SuccessTest._chatToggleCardRolls(event, html));
    }

    static _chatToggleCardRolls(event, html) {
        const element = html.find('.dice-rolls');
        if (element.is(':visible')) element.slideUp(200);
        else element.slideDown(200);
    }
}