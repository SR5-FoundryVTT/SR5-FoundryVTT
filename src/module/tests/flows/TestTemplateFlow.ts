import { TestDialogLike, TestDialogListener } from '../../apps/dialogs/TestDialog';
import { SR5Actor } from '../../actor/SR5Actor';
import { SR5Item } from '../../item/SR5Item';
import Template from '../../template';
import { TestCreator } from '../TestCreator';

interface TestTemplateFlowHost {
    actor: SR5Actor | undefined
    item: SR5Item | undefined
    data: {
        targetUuids: string[]
        targetActorsUuid: string[]
    }
    targets: (SR5Actor | SR5Item | TokenDocument)[]
}

interface TestTemplateFlowOptions {
    getBlastData?: () => { radius: number, dropoff: number } | undefined
    prepareTargetData?: () => void
}

interface TestWithTemplateFlow extends TestTemplateFlowHost {
    templateFlow?: TestTemplateFlow
    populateDocuments(): Promise<void>
}

/**
 * Handles item area-template previews for tests that opt into this behavior.
 */
export class TestTemplateFlow {
    #template?: Template;
    #positionSelected = false;

    constructor(
        private readonly test: TestTemplateFlowHost,
        private readonly options: TestTemplateFlowOptions = {}
    ) { }

    get canPlace(): boolean {
        return this.test.item?.hasBlastTemplate ?? false;
    }

    dialogListeners(): TestDialogListener[] {
        return [{
            query: '#show-blast-template',
            on: 'click',
            callback: this.showPreview.bind(this)
        }];
    }

    showPreview(event: JQuery.Event, dialog: TestDialogLike) {
        event.preventDefault();
        event.stopPropagation();

        if (this.#template) {
            void this.cancelPreview();
            return;
        }

        dialog.applyFormData?.();
        const item = this.test.item;
        if (!item || !this.canPlace) return;

        const template = Template.fromItem(item, undefined, this.blastData);
        if (!template) return;

        this.#template = template;
        this.#positionSelected = false;
        void template.drawPreview({
            persistOnConfirm: false,
            onPositionSelected: (_position, token) => {
                this.#positionSelected = true;
                if (token) this.selectTarget(token, dialog);
            }
        });
    }

    private selectTarget(token: TokenDocument, dialog: TestDialogLike) {
        if (!token.uuid) return;

        this.test.data.targetUuids = [token.uuid];
        this.test.data.targetActorsUuid = token.actor?.uuid ? [token.actor.uuid] : [];
        this.test.targets = [token];
        this.options.prepareTargetData?.();
        void dialog.render({force: true});
    }

    async cancelPreview() {
        await this.#template?.cancelPreview();
        this.#template = undefined;
        this.#positionSelected = false;
    }

    async finalizePreview() {
        if (!this.#template) return;

        if (this.#positionSelected)
            await this.#template.place();
        else
            await this.#template.cancelPreview();

        this.#template = undefined;
        this.#positionSelected = false;
    }

    async drawChatPreview() {
        const item = this.test.item;
        if (!item || !this.canPlace) return;

        const template = Template.fromItem(item, undefined, this.blastData);
        if (!template) return;
        await template.drawPreview();
    }

    static async drawChatPreviewFromMessage(event: Event) {
        event.preventDefault();
        event.stopPropagation();

        const element = $(event.currentTarget as HTMLElement);
        const card = element.closest<HTMLElement>('.chat-message');
        const messageId = card.data('messageId');
        const test = await TestCreator.fromMessage(messageId) as TestWithTemplateFlow | undefined;
        if (!test) return;

        await test.populateDocuments();
        await test.templateFlow?.drawChatPreview();
    }

    static chatMessageListeners(html: HTMLElement | JQuery) {
        $(html).find('.place-template').on('click', this.drawChatPreviewFromMessage);
    }

    get blastData() {
        return this.options.getBlastData?.() ?? this.test.item?.getBlastData();
    }
}
