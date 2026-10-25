import { Helpers } from "../../helpers";
import { SR5Item } from "../../item/SR5Item";
import { SR5Roll } from "../../rolls/SR5Roll";
import { TestCreator } from "../TestCreator";
import { FLAGS, SYSTEM_NAME } from "../../constants";
import { SheetFlow } from "../../flows/SheetFlow";
import { DamageApplicationFlow } from '../../actor/flows/DamageApplicationFlow';
import { ActionResultFlow } from "../../item/flows/ActionResultFlow";
import { GmOnlyMessageContentFlow } from '../../actor/flows/GmOnlyMessageContentFlow';
import { LinksHelpers } from '../../utils/links';
import { activateOnKey } from '../../utils/dom';
import { ValueFieldType } from '../../types/template/Base';
import type { SuccessTest } from "../SuccessTest";

export interface ValueModifierTooltipOptions {
    card?: boolean;
}

/** Entry of the chat message context menu, using the name based format Foundry hooks still provide. */
export interface ChatMessageContextOption {
    name: string
    callback: (li: unknown) => unknown
    condition: boolean | ((li: unknown) => boolean)
    icon: string
}

/**
 * Chat message handling of success tests: creating and saving their message, Dice So Nice,
 * listeners, modifier tooltips and the chat message context menu.
 *
 * What a message shows stays with the test (SuccessTest._prepareMessageTemplateData and its parts),
 * as test implementations change it.
 */
export class TestChatFlow {
    /**
     * DiceSoNice must be implemented locally to avoid showing dice on gmOnlyContent throws while also using
     * FoundryVTT ChatMessage of type roll for their content visibility behavior.
     * 
     * https://gitlab.com/riccisi/foundryvtt-dice-so-nice/-/wikis/Integration
     */
    static rollDiceSoNice(test: SuccessTest) {
        const dice3d = game.dice3d;
        if (!dice3d) return;

        // Only roll the last dice rolled.
        // This necessary when a test has been recast with second chance,
        // and should only the re-rolled dice instead of all.
        const roll = test.rolls[test.rolls.length - 1];

        // Limit users to show dice to...
        let whisper: User[] | null = null;

        // ...for gmOnlyContent check permissions
        if (test.actor && GmOnlyMessageContentFlow.applyGmOnlyContent(test.actor)) {
            whisper = game.users.filter(user => test.actor?.testUserPermission(user, 'OWNER') === true);
        }

        const rollMode = test.data.options?.rollMode;

        // ...for rollMode include GM when GM roll
        if (rollMode === 'gm' || rollMode === "blind") {
            whisper = [...game.users.filter(user => user.isGM), ...(whisper || [])];
        }

        // Don't show dice to a user casting blind.
        const blind = rollMode === 'blind';
        const synchronize = rollMode === 'public' || rollMode === 'ic';

        void dice3d.showForRoll(roll, game.user, synchronize, whisper, blind, test.data.messageUuid);
    }

    /**
     * Post this success test as a message to the chat log.
     */
    static async toMessage(test: SuccessTest): Promise<ChatMessage | undefined> {
        if (!test.data.options?.showMessage) return;

        // Prepare message content.
        const templateData = await test._prepareMessageTemplateData();
        const content = await foundry.applications.handlebars.renderTemplate(test._chatMessageTemplate, templateData);
        // Prepare the actual message.
        const messageData = await test._prepareMessageData(content);

        // Let Foundry apply the message visibility mode, instead of applying whisper ids manually.
        const message = await ChatMessage.create(messageData, { messageMode: test._rollMode });

        if (!message) return;

        // Store message id for future use.
        test.data.messageUuid = message.uuid;
        await test.saveToMessage();

        test.rollDiceSoNice();

        return message;
    }

    /**
     * Prepare chat message data for this success test card.
     *
     * @param content Pre rendered template content.
     */
    static async prepareMessageData(test: SuccessTest, content: string) {
        // Either get the linked token by collection or synthetic actor.
        // Unlinked collection actors will return multiple tokens and can't be resolved to a token.
        const linkedTokens = test.actor?.getActiveTokens(true) || [];
        const token = linkedTokens.length === 1 ? linkedTokens[0].id : undefined;

        const actor = test.actor?.id;
        const alias = game.user?.name;

        const formula = `0ds`;
        const roll = new SR5Roll(formula);
        // evaluation is necessary for Roll DataModel validation.
        await roll.evaluate();

        const messageData = {
            user: game.user?.id,
            // Use type roll, for Foundry built in content visibility.
            speaker: {
                actor,
                alias,
                token
            },
            roll,
            content,
            // Manually build flag data to give renderChatMessage hook flag access.
            // This test data is needed for all subsequent testing based on this chat messages.
            flags: {
                // Add test data to message to allow ChatMessage hooks to access it.
                [SYSTEM_NAME]: {[FLAGS.Test]: test.toJSON()},
                'core.canPopout': true
            },
            sound: CONFIG.sounds.dice,
        }

        return messageData;
    }

    /**
     * Save this test to the given message uuid
     */
    static async saveToMessage(test: SuccessTest, uuid: string | undefined = test.data.messageUuid) {
        if (!uuid) return;

        const message = await fromUuid(uuid) as ChatMessage;

        await message?.setFlag(SYSTEM_NAME, FLAGS.Test, test.toJSON());
    }

    /**
     * Register listeners for ChatMessage html created by a SuccessTest.
     *
     * This listener needs to be registered to the 'renderChatMessage' FoundryVTT hook.
     */
    static async chatMessageListeners(message: ChatMessage, html) {
        await this._hydrateValueModifierTooltips(message, html);

        $(html).find('.test-parameter').on('click', this._chatToggleParameterDetails.bind(this));
        $(html).find('.modifier-source-link').on('click', this._chatOpenModifierSource.bind(this));
        for (const element of $(html).find<HTMLElement>('.test-parameter, .modifier-source-link').toArray())
            activateOnKey(element);

        $(html).find('.show-roll').on('click', this._chatToggleCardRolls.bind(this));
        $(html).find('.show-description').on('click', this._chatToggleCardDescription.bind(this));
        $(html).find('.chat-document-link').on('click', Helpers.renderEntityLinkSheet.bind(Helpers));
        $(html).find('.result-action').on('click', this._castResultAction.bind(this));
        $(html).find('.chat-select-link').on('click', this._selectSceneToken.bind(this));
        $(html).find('.test-action').on('click', this._castTestAction.bind(this));

        DamageApplicationFlow.handleRenderChatMessage(message, html);

        await GmOnlyMessageContentFlow.chatMessageListeners(message, html);
    }

    static async _hydrateValueModifierTooltips(message: ChatMessage, html: HTMLElement | JQuery) {
        if (!message.id) return;

        const test = await TestCreator.fromMessage(message.id);
        if (!test) return;

        await this.hydrateValueModifierTooltipsForTest(test, html, { card: true });
    }

    static async hydrateValueModifierTooltipsForTest(
        test: SuccessTest,
        html: HTMLElement | JQuery,
        options: ValueModifierTooltipOptions = {}
    ) {
        const valuesBySource = this._valueModifierSourcesForTest(test);
        const tooltipsBySource = await this._buildValueModifierTooltipsBySource(test, options);

        const valueModifiers = $(html).find<HTMLElement>('[data-tooltip-source]').toArray();

        for (const valueMod of valueModifiers) {
            const source = valueMod.dataset.tooltipSource;
            if (!source) continue;

            if (valueMod.classList.contains('test-parameter')) {
                await this._prepareParameterDetail(
                    valueMod, test, valuesBySource[source], source, tooltipsBySource, options);
                continue;
            }

            this._applyValueModifierTooltip(valueMod, tooltipsBySource[source]);
        }
    }

    private static _applyValueModifierTooltip(element: HTMLElement, tooltipHtml?: string) {
        if (!tooltipHtml) return;

        element.dataset.tooltipHtml = tooltipHtml;
        element.dataset.tooltipClass = 'sr5v2';
    }

    /** Remove button semantics when hydration finds no breakdown. */
    private static _disableParameter(parameter: HTMLElement) {
        parameter.removeAttribute('role');
        parameter.removeAttribute('tabindex');
        parameter.removeAttribute('aria-expanded');
    }

    private static async _prepareParameterDetail(
        parameter: HTMLElement,
        test: SuccessTest,
        value: ValueFieldType | undefined,
        source: string,
        tooltipsBySource: Record<string, string | undefined>,
        options: ValueModifierTooltipOptions = {}
    ) {
        const container = parameter.closest('.card-content--parameters')
            ?.querySelector<HTMLElement>('.test-parameter-details');
        if (!value || !container) return this._disableParameter(parameter);

        const traceSources = value.changes.map(change => test.traceSourceForChange(change));

        const html = await this._buildValueModifierPanelHtml(value, options, traceSources);
        if (!html) return this._disableParameter(parameter);

        // Rehydration replaces the previous panel.
        container.querySelector(`.test-parameter-detail[data-source="${source}"]`)?.remove();

        const detail = container.ownerDocument.createElement('div');
        detail.classList.add('test-parameter-detail');
        detail.dataset.source = source;
        detail.hidden = true;
        detail.innerHTML = html;

        for (const row of detail.querySelectorAll<HTMLElement>('[data-tooltip-source]'))
            this._applyValueModifierTooltip(row, tooltipsBySource[row.dataset.tooltipSource ?? '']);

        container.append(detail);
    }

    private static _valueModifierSourcesForTest(test: SuccessTest): Record<string, ValueFieldType | undefined> {
        const tooltipValues: Record<string, ValueFieldType | undefined> = { hits: test.outcomeHits };

        for (const parameter of test.cardParameters)
            tooltipValues[parameter.source] = parameter.value;

        const traces = test.data.codeTermTraces ?? [];
        for (const trace of traces)
            tooltipValues[trace.tooltipSource] = trace.valueField;

        return tooltipValues;
    }

    private static async _buildValueModifierTooltipsBySource(
        test: SuccessTest,
        options: ValueModifierTooltipOptions = {}
    ): Promise<Record<string, string | undefined>> {
        const tooltipValues = this._valueModifierSourcesForTest(test);

        const entries = await Promise.all(Object.entries(tooltipValues).map(async ([source, value]) => {
            return [source, value ? await this._buildValueModifierTooltipHtml(value, options) : undefined] as const;
        }));

        return Object.fromEntries(entries);
    }

    static async _buildValueModifierTooltipHtml(
        value: ValueFieldType,
        options: ValueModifierTooltipOptions = {}
    ): Promise<string | undefined> {
        return this._renderValueModifiers('common/modifiers-tooltip', value, options);
    }

    static async _buildValueModifierPanelHtml(
        value: ValueFieldType,
        options: ValueModifierTooltipOptions = {},
        traceSources: (string | undefined)[] = []
    ): Promise<string | undefined> {
        return this._renderValueModifiers('common/value-modifiers-panel', value, options, traceSources);
    }

    /** Render shared modifier rows, or return nothing for an empty breakdown. */
    private static async _renderValueModifiers(
        template: string,
        value: ValueFieldType,
        options: ValueModifierTooltipOptions = {},
        traceSources: (string | undefined)[] = []
    ): Promise<string | undefined> {
        const html = await foundry.applications.handlebars.renderTemplate(
            SheetFlow.templateBase(template),
            { value, card: options.card, traceSources }
        );

        const content = html.trim();
        // The wrapper always renders; only a row carries a name.
        if (!content.includes('value-modifier-name')) return undefined;

        return content;
    }


    /** 
     * Select a Token on the current scene based on the link id.
     * @params event Any user PointerEvent
    */
    static _selectSceneToken(event: Event | JQuery.ClickEvent) {
        event.preventDefault();
        event.stopPropagation();

        if (!game?.ready || !canvas?.ready) return;

        const selectLink = $(event.currentTarget as HTMLElement);
        const tokenId = selectLink.data('tokenId');
        const token = canvas.tokens?.get(tokenId);

        if (token instanceof foundry.canvas.placeables.Token) {
            token.control();
        } else {
            ui.notifications?.warn(game.i18n.localize('SR5.NoSelectableToken'))
        }
    }

    /**
     * Cast a item action from a chat message.
     * 
     * @param event Any pointer event
     */
    static async _castTestAction(event: JQuery.TriggeredEvent) {
        event.preventDefault();

        const element = $(event.currentTarget as HTMLElement);
        // Grab item uuid or fallback to empty string for foundry
        const uuid = element.data('uuid') ?? '';
        const item = await fromUuid(uuid) as SR5Item | undefined;

        if (!item) return console.error("Shadowrun 5e | Item doesn't exist for uuid", uuid);

        void item.castAction(event as unknown as Event);
    }

    /**
     * Foundry ChatMessage context options (right click) used for all test types.
     * @param app The ChatLog application. 
     * @param options The list of options to be shown in the context menu.
     */
    static chatMessageContextOptions(app, options: ChatMessageContextOption[]) {
        const pushTheLimit = async (li) => {
            const messageId = $(li).data().messageId;
            const test = await TestCreator.fromMessage(messageId);
            if (!test) return console.error('Shadowrun 5e | Could not restore test from message');

            await test.executeWithPushTheLimit();
        }

        const secondChance = async (li) => {
            const messageId = $(li).data().messageId;
            const test = await TestCreator.fromMessage(messageId);
            if (!test) return console.error('Shadowrun 5e | Could not restore test from message');

            await test.executeWithSecondChance();
        };

        const extendTest = async (li) => {
            const messageId = $(li).data().messageId;
            const test = await TestCreator.fromMessage(messageId);
            if (!test) return console.error('Shadowrun 5e | Could not restore test from message');

            if (!test.canBeExtended) {
                return ui.notifications?.warn('SR5.Warnings.CantExtendTest', { localize: true });
            }

            // Managed extended tests roll through their record, keeping its state current.
            if (test.data.extendedManagedId) {
                // Avoid a module cycle: ExtendedTestFlow already imports SuccessTest.
                const { ExtendedTestFlow } = await import('../../flows/ExtendedTestFlow');
                await ExtendedTestFlow.roll(test.data.extendedManagedId);
                return;
            }

            // Keep legacy auto-chain behavior for extended tests from before managed records.
            await test.executeAsExtended();
        };

        // Keep Foundry delete option at the context menus bottom.
        const deleteOption = options.pop() as ChatMessageContextOption;

        options.push({
            name: game.i18n.localize('SR5.PushTheLimit'),
            callback: pushTheLimit,
            condition: true,
            icon: '<i class="fas fa-meteor"></i>'
        })

        options.push({
            name: game.i18n.localize('SR5.SecondChance'),
            callback: secondChance,
            condition: true,
            icon: '<i class="fas fa-meteor"></i>'
        });

        options.push({
            name: game.i18n.localize('SR5.Extend'),
            callback: extendTest,
            condition: true,
            icon: '<i class="fas fa-clock"></i>'
        })

        // Reinsert Foundry delete option last.
        options.push(deleteOption);

        return options;
    }

    static _chatToggleParameterDetails(event: Event | JQuery.ClickEvent) {
        event.preventDefault();
        event.stopPropagation();

        const parameter = event.currentTarget as HTMLElement;
        const line = parameter.closest<HTMLElement>('.card-content--parameters');
        const container = line?.querySelector<HTMLElement>('.test-parameter-details');
        const source = parameter.dataset.tooltipSource;
        if (!line || !container || !source) return;

        const detail = container.querySelector<HTMLElement>(`.test-parameter-detail[data-source="${source}"]`);
        if (!detail) return;

        const expand = detail.hidden;

        for (const open of container.querySelectorAll<HTMLElement>('.test-parameter-detail')) open.hidden = true;
        for (const other of line.querySelectorAll<HTMLElement>('.test-parameter'))
            other.setAttribute('aria-expanded', 'false');

        detail.hidden = !expand;
        parameter.setAttribute('aria-expanded', String(expand));
    }

    static async _chatOpenModifierSource(event: Event | JQuery.ClickEvent) {
        event.preventDefault();
        event.stopPropagation();

        const source = (event.currentTarget as HTMLElement).dataset.source;
        await LinksHelpers.openSource(source);
    }

    static _chatToggleCardRolls(event: Event | JQuery.ClickEvent) {
        event.preventDefault();
        event.stopPropagation();

        const currentTarget = event.currentTarget as HTMLElement;
        const card = $(currentTarget).closest('.chat-card');
        const cardRolls = card.find('.card-rolls').first();

        if (cardRolls.length > 0) {
            const hasRollContent = cardRolls.find('.dice-rolls, .dice-roll-content').length > 0;
            if (!hasRollContent) return;

            if (cardRolls.is(':visible')) {
                cardRolls.slideUp(200);
            } else {
                const diceRolls = cardRolls.find('.dice-rolls');
                if (diceRolls.length > 0) {
                    diceRolls.css('display', 'flex');
                }
                cardRolls.stop(true, true).hide().css('display', 'block').slideDown(200);
            }

            return;
        }

        const legacyRolls = card.find('.dice-rolls');
        if (legacyRolls.is(':visible')) legacyRolls.slideUp(200);
        else legacyRolls.css('display', 'flex').hide().slideDown(200);
    }

    /**
     * By default, item descriptions are hidden in a chat card.
     *
     * This will hide / show them, when called with a card event.
     */
    static _chatToggleCardDescription(event: Event | JQuery.ClickEvent) {
        event.preventDefault();
        event.stopPropagation();

        const currentTarget = event.currentTarget as HTMLElement;
        const target = $(currentTarget);
        const containingCard = target.closest('.sr5.chat-card');
        const card = containingCard.length
            ? containingCard
            : target.closest('.chat-message').find('.sr5-chat-card--merged').first();
        const element = card.find('.card-description');
        if (element.is(':visible')) element.slideUp(200);
        else element.slideDown(200);
    }

    /**
     * A test message initiated an action for a test result, extract information from message and execute action.
     *
     * @param event A PointerEvent by user-interaction
     */
    static async _castResultAction(event: JQuery.TriggeredEvent) {
        event.preventDefault();
        event.stopPropagation();

        const element = $(event.currentTarget as HTMLElement)
        const messageId = element.closest('.chat-message').data('messageId');
        const resultAction = element.data('action');

        await ActionResultFlow.executeResult(resultAction, {event: event as unknown as Event, element, messageId});
    }
}
