import { FLAGS, SYSTEM_NAME } from '../constants';
import { SuccessTest } from '../tests/SuccessTest';
import { TestCreator } from '../tests/TestCreator';
import { activateOnKey } from '../utils/dom';

/**
 * The system needs a place to override default ChatMessage behaviors, making it necessary to replace the default implementation.
 *
 * If you need to add chat related features, events and listeners you should do so here.
 */
export class SR5ChatMessage extends ChatMessage<'base'> {
    override async renderHTML(options?: ChatMessage.RenderHTMLOptions): Promise<HTMLElement> {
        const html = await super.renderHTML(options);
        SR5ChatMessage._enrichSystemCardMessage(html);
        return html;
    }

    /**
     * Merge Foundry's message header with the first meaningful SR5 card header.
     * Additional card fragments remain in the message body.
     */
    static _enrichSystemCardMessage(html: HTMLElement): void {
        const messageContent = html.querySelector<HTMLElement>('.message-content');
        const firstCard = messageContent?.querySelector<HTMLElement>(':scope > .sr5.chat-card');
        const messageHeader = html.querySelector<HTMLElement>(':scope > .message-header');
        if (!messageContent || !firstCard || !messageHeader) return;

        html.classList.add('sr5-chat-message');
        firstCard.classList.add('sr5-chat-card--merged');

        this._mergeWhisperTarget(messageHeader);

        // Initiative cards carry a summary row rather than a header to promote.
        if (this._promoteInitiativeDetail(firstCard, messageHeader)) return;

        this._promoteCardHeader(html, firstCard, messageHeader);
    }

    /**
     * Move the whisper recipients under the sender, so the header's title row stays free.
     */
    private static _mergeWhisperTarget(messageHeader: HTMLElement) {
        const sender = messageHeader.querySelector<HTMLElement>(':scope > .message-sender');
        const whisperTo = messageHeader.querySelector<HTMLElement>(':scope > .whisper-to');
        if (sender && whisperTo) sender.append(whisperTo);
    }

    /**
     * Lift an initiative card's primary row into the header, leaving the detail row in the body.
     *
     * @returns Whether this card was an initiative card, handled or not.
     */
    private static _promoteInitiativeDetail(firstCard: HTMLElement, messageHeader: HTMLElement): boolean {
        if (!firstCard.classList.contains('initiative-mode-change-card')) return false;

        const primaryRow = firstCard.querySelector<HTMLElement>(
            ':scope > .card-main-content > .initiative-mode-change-row-primary',
        );
        if (!primaryRow) return true;

        const detail = firstCard.ownerDocument.createElement('div');
        detail.classList.add(
            'sr5',
            'roll-card',
            'initiative-summary-card',
            'initiative-mode-change-card',
            'sr5-message-header-detail',
        );
        detail.append(primaryRow);
        messageHeader.append(detail);

        return true;
    }

    /**
     * Use the card's own header as the message title, in place of the sender line.
     */
    private static _promoteCardHeader(html: HTMLElement, firstCard: HTMLElement, messageHeader: HTMLElement) {
        const cardHeader = firstCard.firstElementChild;
        if (!(cardHeader instanceof HTMLElement) || !cardHeader.matches('.card-header')) return;

        cardHeader.classList.add('sr5-message-system-header');
        messageHeader.prepend(cardHeader);
        html.classList.add('sr5-chat-message--has-system-title');

        const metadata = messageHeader.querySelector<HTMLElement>(':scope > .message-metadata');
        if (metadata) this._promoteCardControls(cardHeader, metadata);
    }

    /**
     * Move the promoted header's controls in among Foundry's own, ahead of the delete control.
     */
    private static _promoteCardControls(cardHeader: HTMLElement, metadata: HTMLElement) {
        const builtInControl = metadata.querySelector('.message-delete, .message-dismiss');

        for (const control of cardHeader.querySelectorAll<HTMLElement>(':scope > .card-control')) {
            control.setAttribute('role', 'button');
            control.tabIndex = 0;
            // Icon-only controls have no text to announce.
            if (!control.hasAttribute('aria-label')) {
                control.setAttribute(
                    'aria-label',
                    control.textContent?.trim() || game.i18n.localize('SR5.Description'),
                );
            }
            activateOnKey(control);
            metadata.insertBefore(control, builtInControl);
        }
    }

    get _testData(): any {
        return this.getFlag(SYSTEM_NAME, FLAGS.Test);
    }

    /**
     * Return a SuccessTest implementation for this chat message instance, if there is one.
     */
    get test(): SuccessTest | undefined {
        // Check if message contains any test data.
        const flagData = this._testData;
        if (flagData === null || flagData === undefined) return undefined;
        if (this.id === null || this.id === '') return undefined;

        return TestCreator._fromMessageTestData(flagData);
    }

    /**
     * Foundry checks by looking at it's rolls, while the system stores those within test data.
     *
     * If no test is imbeded, hand over control to Foundry to still support default roll chat messages
     * that have been manually or otherwise sent.
     */
    override get isRoll(): boolean {
        return foundry.utils.getType(this._testData) === 'Object' || super.isRoll;
    }
}
