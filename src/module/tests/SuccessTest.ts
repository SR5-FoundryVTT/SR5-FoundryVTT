import { SR5Actor } from "../actor/SR5Actor";
import { SR, SYSTEM_NAME, FLAGS } from "../constants";
import { DefaultValues } from "../data/DataDefaults";
import { Helpers } from "../helpers";
import { SR5Item } from "../item/SR5Item";
import {SR5Roll} from "../rolls/SR5Roll";
import ValueField = Shadowrun.ValueField;
import {PartsList} from "../parts/PartsList";
import {ShadowrunTestDialog} from "../apps/dialogs/ShadowrunTestDialog";

export interface SuccessTestData {
    title?: string
    type?: string // TODO: implement typing method to apply effects to and for ations.

    // Shadowrun 5 related test values.
    // TODO: Think about moving these into general values. This would allow ActiveEffects to only target .values
    pool: ValueField
    threshold: ValueField
    limit: ValueField
    values: Record<string, ValueField>

    // Documents the test might have been derived from.
    sourceItemUuid?: string
    sourceActorUuid?: string
}

export interface SuccessTestOptions {
    skipDialog?: boolean // skip dialog when given true.
    roll?: SR5Roll
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
    public actor: SR5Actor|undefined;
    public item: SR5Item|undefined;
    public roll: SR5Roll;

    static CHAT_TEMPLATE = 'systems/shadowrun5e/dist/templates/rolls/success-test.html';

    // TODO: include modifiers
    // TODO: store options in data for later re roll with same options?
    constructor(data: SuccessTestData, documents?: {actor?: SR5Actor, item?: SR5Item}, options?: SuccessTestOptions) {
        this.data = this._prepareData(data);

        // Store given document uuids to be fetched during evaluation.
        // TODO: Include all necessary sepaker / token info in SuccessTestData to allow items to be deleted.
        data.sourceActorUuid = data.sourceActorUuid || documents?.actor?.uuid;
        data.sourceItemUuid = data.sourceItemUuid || documents?.item?.uuid;

        // Store given documents to avoid later fetching.
        this.actor = documents?.actor;
        this.item = documents?.item;

        // Prepare general test information.
        this.data.title = this.data.title || 'SR5.Tests.SuccessTest';

        // Reuse an old roll or create a new one.
        this.roll = options?.roll || this.createRoll();
    }

    /**
     * Give subclasses a way to alter default test data
     * @param data
     */
    _prepareData(data: SuccessTestData) {
        return data;
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
        // @ts-ignore // Get test class from registry to allow custom module tests.
        const cls = game.shadowrun5e.tests[item.getAction().test];

        const data = cls.getTestData(item, actor);
        return new cls(data, {item, actor}, options);
    }

    /**
     * Helper method to create a SuccessTest from given data.
     *
     * @param data
     * @param options
     */
    static fromTestData(data: SuccessTestData, options?: SuccessTestOptions): SuccessTest {
        // Before used documents would be fetched during evaluation.
        return new SuccessTest(data, {}, options);
    }

    /**
     * A helper method to create a SuccessTest from a simple pool value, without
     * actor / item involvement.
     *
     * @param pool
     * @param threshold
     * @param limit
     * @param options
     */
    static fromPool(pool: number, threshold: number = 0, limit: number = 0, options?: SuccessTestOptions): SuccessTest {
        const testData = {
            pool: DefaultValues.valueData({label: 'SR5.DicePool', base: pool}),
            threshold: DefaultValues.valueData({label: 'SR5.Threshold', base: threshold}),
            limit: DefaultValues.valueData({label: 'SR5.Limit', base: limit}),
            values: {}
        };

        return new SuccessTest(testData);
    }

    static fromMessage(id: string): SuccessTest|undefined {
        const message = game.messages?.get(id);
        if (!message) return;

        const testData = message.getFlag(SYSTEM_NAME, FLAGS.Test) as SuccessTestData;
        if (!testData) return;

        const roll = message.roll as SR5Roll;
        return SuccessTest.fromTestData(testData, {roll});
    }

    /**
     *
     */
    static async fromDialog(): Promise<SuccessTest|undefined> {
        // Ask user for additional, general success test role modifiers.
        const testDialogOptions = {
            // TODO: move to SuccessTest.label
            title: game.i18n.localize('SR5.Tests.SuccessTest'),
            limit: DefaultValues.valueData({label: 'SR5.Limit', value: 1}),
            threshold: DefaultValues.valueData({label: 'SR5.Threshold', value: 1}),
        };

        // Get the last used pool size for simple SuccessTestDialogs
        const lastPoolValue = game.user?.getFlag(SYSTEM_NAME, FLAGS.LastRollPromptValue) || 0;
        // Prepare any predefined pool values.

        const pool = DefaultValues.valueData();
        // @ts-ignore // unkown[] vs number[]
        pool.mod = PartsList.AddUniquePart(pool.mod, 'SR5.LastRoll', lastPoolValue);
        const testDialog = await ShadowrunTestDialog.create(
            undefined,
            testDialogOptions,
            pool.mod);

        const dialogData = await testDialog.select();

        if (testDialog.canceled) return;

        console.error(dialogData);

        // Extract simple test data from dialog user selection.
        pool.mod = dialogData.parts.list;
        pool.value = Helpers.calcTotal(pool, {min: 0});
        const thresholdValue = dialogData.threshold.value || 0;
        const limitValue = dialogData.limit.value || 0;

        // Create and display SuccessTest.
        const test = SuccessTest.fromPool(pool.value, thresholdValue, limitValue);
        await test.toMessage();

        // Store the last used pool size for the next simple SuccessTest
        await game.user?.setFlag(SYSTEM_NAME, FLAGS.LastRollPromptValue, pool.value);

        return test;
    }

    toJSON() {
        return this.data;
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
     * Test Data is structured around Values that can be modified.
     */
    static getTestData(item: SR5Item, actor: SR5Actor): SuccessTestData {
        // Prepare general data structure with labeling.
        const data = {
            pool: DefaultValues.valueData({label: 'SR5.DicePool'}),
            limit: DefaultValues.valueData({label: 'SR5.Limit'}),
            threshold: DefaultValues.valueData({label: 'SR5.Threshold'}),
            values: {}
        };

        // Try fetching the items action data.
        const action = item.getAction();
        if (!action || !actor) return data;

        // Prepare pool values.
        // TODO: Check if knowledge / language skills can be used for actions.
        if (action.skill) {
            const skill = actor.getSkill(action.skill);
            if (skill) data.pool.mod = PartsList.AddUniquePart(data.pool.mod, skill.label, skill.value, false);
            // TODO: Check if this is actuall skill specialization and for a +2 config for it instead of MagicValue.
            if (action.spec) data.pool.mod = PartsList.AddUniquePart(data.pool.mod, 'SR5.Specialization', 2);
        }
        // The first attribute is either used for skill or attribute only tests.
        if (action.attribute) {
            const attribute = actor.getAttribute(action.attribute);
            if (attribute) data.pool.mod = PartsList.AddUniquePart(data.pool.mod, attribute.label, attribute.value, false);
        }
        // The second attribute is only used for attribute only tests.
        if (!action.skill && action.attribute2) {
            const attribute = actor.getAttribute(action.attribute2);
            if (attribute) data.pool.mod = PartsList.AddUniquePart(data.pool.mod, attribute.label, attribute.value, false);
        }
        if (action.mod) {
            data.pool.base = Number(action.mod);
        }

        // Prepare limit values...
        if (action.limit.attribute) {
            const limit = actor.getLimit(action.limit.attribute);
            if (limit) data.limit.mod = PartsList.AddUniquePart(data.limit.mod, limit.label, limit.value, false);
        }
        if (action.limit.base || action.limit.value) {
            data.limit.base = Number(action.limit.value);
        }

        // Prepare threshold values...
        if (action.threshold.base || action.threshold.value) {
            data.threshold.base = Number(action.threshold.value);
        }

        return data;
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
        const pool = Helpers.calcTotal(this.data.pool);
        return `(${pool})d6cs>=${SuccessTest.lowestSuccessSide}`;
    }

    /**
     * Helper method to create the internal SR5Roll.
     * @private
     */
    private createRoll(): SR5Roll {
        // TODO: Add typing for rolls?
        // @ts-ignore
        return new SR5Roll(this.formula) as unknown as SR5Roll;
    }

    /**
     * Helper method to evaluate the internal SR5Roll and SuccessTest values.
     *
     */
    async evaluate(): Promise<SuccessTest> {
        // @ts-ignore // foundry-vtt-types is missing _evaluated.
        if (!this.roll._evaluated)
            await this.roll.evaluate({async: true});

        // Fetch documents, when no reference has been made yet.
        if (!this.actor && this.data.sourceActorUuid)
            this.actor = await fromUuid(this.data.sourceActorUuid) as SR5Actor || undefined;
        if (!this.item && this.data.sourceItemUuid)
            this.item = await fromUuid(this.data.sourceItemUuid) as SR5Item || undefined;

        // Calculate test values.
        this.data.pool.value = Helpers.calcTotal(this.data.pool, {min: 0});
        this.data.threshold.value = Helpers.calcTotal(this.data.threshold, {min: 0});
        this.data.limit.value = Helpers.calcTotal(this.data.limit, {min: 0});

        // Calculate all dynamics values.
        Object.values(this.data.values).forEach(field => {
            // It's likely that most fields will lower out at zero.
            field.value = Helpers.calcTotal(field, {min: 0})
        });

        return this;
    }

    /**
     * Helper to get the pool value for this success test.
     */
    get pool(): ValueField {
        return this.data.pool;
    }

    /**
     * Helper to get the total limit value for this success test.
     */
    get limit(): ValueField {
        return this.data.limit;
    }

    /**
     * Helper to determine if this success test uses a limit.
     */
    get hasLimit(): boolean {
        return this.limit.value > 0;
    }

    /**
     * Helper to determine if the hits have been lowered by the limit.
     *
     * This will compare actual roll hits, without applied limit.
     */
    get hasReducedHits(): boolean {
        return this.roll.hits > this.limit.value;
    }

    /**
     * Helper to get the total threshold value for this success test.
     */
    get threshold(): ValueField {
        return this.data.threshold;
    }

    /**
     * Helper to determine if this success test uses a threshold.
     */
    get hasThreshold(): boolean {
        return this.threshold.value > 0;
    }

    /**
     * Helper to get the net hits value for this success test with a possible threshold.
     */
    get netHits(): ValueField {
        // Maybe lower hits by threshold to get the actual net hits.
        const base = this.hasThreshold ?
            Math.max(this.hits.value - this.threshold.value, 0) :
            this.hits.value;

        // Calculate a ValueField for standardisation.
        const netHits = DefaultValues.valueData({
            label: "SR5.NetHits",
            base
        });
        netHits.value = Helpers.calcTotal(netHits, {min: 0});

        return netHits;
    }

    /**
     * Helper to get the hits value for this success test with a possible limit.
     */
    get hits(): ValueField {
        const hits = DefaultValues.valueData({
            label: "SR5.Hits",
            base: this.hasLimit ?
                Math.min(this.limit.value, this.roll.hits) :
                this.roll.hits});
        hits.value = Helpers.calcTotal(hits, {min: 0});

        return hits;
    }

    /**
     * Helper to get the glitches values for this success test.
     */
    get glitches(): ValueField {
        const glitches = DefaultValues.valueData({
            label: "SR5.Glitches",
            base: this.roll.glitches
        })
        glitches.value = Helpers.calcTotal(glitches, {min: 0});

        return glitches;
    }

    /**
     * Helper to check if the current test state is glitched.
     */
    get glitched(): boolean {
        return this.roll.glitched;
    }

    /**
     * Helper to check if the current test state is critically glitched.
     */
    get criticalGlitched(): boolean {
        return !this.success && this.glitched;
    }

    /**
     * Helper to check if the current test state is successful.
     *
     * Since a test can only really be a success when some threshold is met,
     * only report success when there is one.
     */
    get success(): boolean {
        return this.hasThreshold && this.netHits.value > 0;
    }

    /**
     * TODO: This method results in an ugly description.
     *
     */
    get description(): string {
        const poolPart = this.pool.value;
        const thresholdPart = this.hasThreshold ? `(${this.threshold.value})` : '';
        const limitPart = this.hasLimit ? `[${this.limit.value}]` : '';
        return `${poolPart} ${thresholdPart} ${limitPart}`
    }

    /**
     * Post this success test as a message to the chat log.
     */
    async toMessage(): Promise<ChatMessage|undefined> {
        await this.evaluate();

        // Prepare message content.
        const templateData = this._prepareTemplateData();
        const content = await renderTemplate(SuccessTest.CHAT_TEMPLATE, templateData);

        // Prepare the actual message.
        const messageData = this._prepareMessageData(content);
        const message = await ChatMessage.create(messageData);

        // Prepare reuse of test data on subsequent tests after this one.
        await message?.setFlag(SYSTEM_NAME, FLAGS.Test, this.toJSON());

        return message;
    }

    /**
     * Prepare chat message content data for this success test card.
     *
     * @returns Chat Message template data.
     */
    _prepareTemplateData() {
        // Either get the linked token by collection or synthetic actor.
        // Unlinked collection actors will return multiple tokens and can't be resolved to a token.
        const linkedTokens = this.actor?.getActiveTokens(true) || [];
        const token = linkedTokens.length === 1 ? linkedTokens[0].id : undefined;

        return {
            title: this.data.title,
            test: this,
            roll: this.roll,
            // Note: While ChatData uses ids, this uses full documents.
            speaker: {
                actor: this.actor,
                token: token
            },
            item: this.item
        }
    }

    /**
     * Prepare chat message data for this success test card.
     *
     * @param content Pre rendered template content.
     */
    _prepareMessageData(content: string) {
        // Either get the linked token by collection or synthetic actor.
        // Unlinked collection actors will return multiple tokens and can't be resolved to a token.
        const linkedTokens = this.actor?.getActiveTokens(true) || [];
        const token = linkedTokens.length === 1 ? linkedTokens[0].id : undefined;

        const actor = this.actor?.id;
        const alias = game.user?.name;

        return {
            user: game.user?.id,
            speaker: {
                actor,
                alias,
                token
            },
            // TODO: message.isRoll reports as false. Do we need ChatMessage to be roll type?
            // type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            content,
            roll: JSON.stringify(this.roll.toJSON())
        }
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

    /**
     * By default roll results are hidden in a chat card.
     *
     * This will hide / show them, when called with a card event.
     *
     * @param event Called from within a card html element.
     * @param html A chat card html element.
     */
    static _chatToggleCardRolls(event, html) {
        event.preventDefault();

        const element = html.find('.dice-rolls');
        if (element.is(':visible')) element.slideUp(200);
        else element.slideDown(200);
    }
}
