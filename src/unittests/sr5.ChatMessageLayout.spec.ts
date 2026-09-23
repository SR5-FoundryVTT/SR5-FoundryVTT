import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SR5ChatMessage } from '@/module/chatMessage/SR5ChatMessage';
import { SuccessTest } from '@/module/tests/SuccessTest';
import { TestCreator } from '@/module/tests/TestCreator';

function createMessage(content: string, { whisper = false, canDelete = true } = {}): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <li class="chat-message message flexcol${whisper ? ' whisper' : ''}" data-message-id="test-message">
            <header class="message-header flexrow">
                <h4 class="message-sender">Gamemaster</h4>
                <span class="message-metadata">
                    <time class="message-timestamp">1m ago</time>
                    ${canDelete ? '<a class="message-delete"><i class="fa-solid fa-trash"></i></a>' : ''}
                </span>
                ${whisper ? '<span class="whisper-to">To: Player</span>' : ''}
            </header>
            <div class="message-content">${content}</div>
        </li>
    `;
    return wrapper.firstElementChild as HTMLElement;
}

export const shadowrunChatMessageLayoutTesting = (context: QuenchBatchContext) => {
    const { describe, it } = context;
    const assert: Chai.AssertStatic = context.assert;

    describe('SR5 chat message layout', () => {
        it('promotes the first system title and its controls into the Foundry header', () => {
            const html = createMessage(
                `
                <div class="sr5 chat-card roll-card">
                    <div class="card-title card-header card-header--title">
                        <span class="test-name">Success Test</span>
                        <span class="card-control show-description">Description</span>
                    </div>
                    <div class="card-title card-header card-header--entities">Actor</div>
                    <div class="card-main-content">Result</div>
                </div>
                <div class="sr5 chat-card roll-card">
                    <div class="card-header">Follow-up</div>
                </div>
            `,
                { whisper: true },
            );

            SR5ChatMessage._enrichSystemCardMessage(html);

            assert.isTrue(html.classList.contains('sr5-chat-message'));
            assert.isTrue(html.classList.contains('sr5-chat-message--has-system-title'));
            assert.isTrue(
                html
                    .querySelector('.message-content > .sr5.chat-card:first-child')
                    ?.classList.contains('sr5-chat-card--merged'),
            );
            assert.isFalse(
                html
                    .querySelector('.message-content > .sr5.chat-card:last-child')
                    ?.classList.contains('sr5-chat-card--merged'),
            );
            assert.equal(
                html.querySelector('.message-header > .sr5-message-system-header .test-name')?.textContent?.trim(),
                'Success Test',
            );
            const control = html.querySelector<HTMLElement>('.message-metadata > .card-control');
            assert.exists(control);
            assert.equal(control?.getAttribute('role'), 'button');
            assert.equal(control?.tabIndex, 0);
            assert.equal(control?.getAttribute('aria-label'), 'Description');

            let keyboardClicks = 0;
            control?.addEventListener('click', () => keyboardClicks++);
            control?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            assert.equal(keyboardClicks, 1);
            assert.equal(html.querySelector('.message-sender > .whisper-to')?.textContent?.trim(), 'To: Player');
            assert.equal(html.querySelectorAll('.message-content > .sr5.chat-card > .card-header').length, 2);
            assert.equal(
                html.querySelector('.message-content > .sr5.chat-card:last-child > .card-header')?.textContent?.trim(),
                'Follow-up',
            );
        });

        it('falls back to a localized label for the icon-only control shipped by the templates', () => {
            const html = createMessage(`
                <div class="sr5 chat-card roll-card">
                    <div class="card-title card-header card-header--title">
                        <span class="test-name">Success Test</span>
                        <span class="card-control clickable show-description">
                            <i class="fa-solid fa-file-lines"></i>
                        </span>
                    </div>
                </div>
            `);

            SR5ChatMessage._enrichSystemCardMessage(html);

            const control = html.querySelector<HTMLElement>('.message-metadata > .card-control');
            assert.exists(control);
            assert.equal(control?.getAttribute('aria-label'), game.i18n.localize('SR5.Description'));
        });

        it('appends promoted controls when the message carries no built-in control', () => {
            const html = createMessage(
                `
                <div class="sr5 chat-card roll-card">
                    <div class="card-title card-header card-header--title">
                        <span class="test-name">Success Test</span>
                        <span class="card-control show-description">Description</span>
                    </div>
                </div>
            `,
                { canDelete: false },
            );

            SR5ChatMessage._enrichSystemCardMessage(html);

            const metadata = html.querySelector<HTMLElement>('.message-metadata');
            assert.notExists(metadata?.querySelector('.message-delete'));
            assert.isTrue(metadata?.lastElementChild?.classList.contains('card-control'));
        });

        it('promotes initiative mode details while retaining the Foundry action title', () => {
            const html = createMessage(`
                <div class="sr5 chat-card roll-card initiative-summary-card initiative-mode-change-card">
                    <div class="card-main-content">
                        <div class="initiative-mode-change-row initiative-mode-change-row-primary">Character → Astral</div>
                        <div class="initiative-mode-change-row initiative-mode-change-row-secondary">19 + 3 = 22</div>
                    </div>
                </div>
            `);

            SR5ChatMessage._enrichSystemCardMessage(html);

            assert.isFalse(html.classList.contains('sr5-chat-message--has-system-title'));
            assert.equal(html.querySelector('.message-sender')?.textContent?.trim(), 'Gamemaster');
            assert.equal(
                html
                    .querySelector('.sr5-message-header-detail .initiative-mode-change-row-primary')
                    ?.textContent?.trim(),
                'Character → Astral',
            );
            assert.equal(
                html.querySelector('.message-content .initiative-mode-change-row-secondary')?.textContent?.trim(),
                '19 + 3 = 22',
            );
        });

        it('uses the Foundry sender as the title when the card has no system header', () => {
            const html = createMessage('<div class="sr5 chat-card rollRequest-card">Roll request</div>');

            SR5ChatMessage._enrichSystemCardMessage(html);

            assert.isTrue(html.classList.contains('sr5-chat-message'));
            assert.isFalse(html.classList.contains('sr5-chat-message--has-system-title'));
            assert.equal(html.querySelector('.message-sender')?.textContent?.trim(), 'Gamemaster');
        });

        it('leaves plain Foundry messages untouched', () => {
            const html = createMessage('<p>Plain message</p>');

            SR5ChatMessage._enrichSystemCardMessage(html);

            assert.isFalse(html.classList.contains('sr5-chat-message'));
            assert.notExists(html.querySelector('.sr5-message-system-header'));
        });

        describe('parameter modifier panels', () => {
            // Render the real card and hydrate it the way chatMessageListeners does, so these tests
            // fail if the template stops emitting the parameter band.
            const renderCard = async (test): Promise<HTMLElement> => {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = await foundry.applications.handlebars.renderTemplate(
                    'systems/shadowrun5e/dist/templates/rolls/success-test-message.hbs',
                    await test._prepareMessageTemplateData());
                await SuccessTest.hydrateValueModifierTooltipsForTest(test, wrapper, { card: true });
                return wrapper;
            };

            async function createParameters(): Promise<HTMLElement> {
                const test = TestCreator.fromPool(
                    { pool: 10, limit: 3 }, { showMessage: false, showDialog: false });

                const line = (await renderCard(test))
                    .querySelector<HTMLElement>('.card-content--parameters') as HTMLElement;
                for (const parameter of line.querySelectorAll('.test-parameter'))
                    parameter.addEventListener('click', SuccessTest._chatToggleParameterDetails);
                return line;
            }

            const detail = (line: HTMLElement, source: string) =>
                line.querySelector<HTMLElement>(`.test-parameter-detail[data-source="${source}"]`);
            const parameter = (line: HTMLElement, source: string) =>
                line.querySelector<HTMLElement>(`.test-parameter[data-tooltip-source="${source}"]`);
            it('opens the clicked parameter breakdown', async () => {
                const line = await createParameters();

                parameter(line, 'pool')?.click();

                assert.isFalse(detail(line, 'pool')?.hidden);
                assert.isTrue(detail(line, 'limit')?.hidden);
                assert.equal(parameter(line, 'pool')?.getAttribute('aria-expanded'), 'true');
            });

            it('swaps to another parameter rather than opening both', async () => {
                const line = await createParameters();

                parameter(line, 'pool')?.click();
                parameter(line, 'limit')?.click();

                assert.isTrue(detail(line, 'pool')?.hidden);
                assert.isFalse(detail(line, 'limit')?.hidden);
                assert.equal(parameter(line, 'pool')?.getAttribute('aria-expanded'), 'false');
                assert.equal(parameter(line, 'limit')?.getAttribute('aria-expanded'), 'true');
            });

            it('closes again when the open parameter is clicked twice', async () => {
                const line = await createParameters();

                parameter(line, 'pool')?.click();
                parameter(line, 'pool')?.click();

                assert.isTrue(detail(line, 'pool')?.hidden);
                assert.isTrue(detail(line, 'limit')?.hidden);
                assert.equal(parameter(line, 'pool')?.getAttribute('aria-expanded'), 'false');
            });

            // The band is rendered before we know whether a value has anything to break down.
            it('leaves a parameter without a breakdown inert', async () => {
                const test = TestCreator.fromPool({ pool: 0 }, { showMessage: false, showDialog: false });

                const card = await renderCard(test);
                const pool = card.querySelector<HTMLElement>('.test-parameter[data-tooltip-source="pool"]');

                assert.exists(pool, 'the parameter is still rendered');
                assert.notExists(card.querySelector('.test-parameter-detail'));
                assert.isNull(pool?.getAttribute('role') ?? null);
                assert.isNull(pool?.getAttribute('tabindex') ?? null);
                assert.isNull(pool?.getAttribute('aria-expanded') ?? null);
            });
        });
    });
};
