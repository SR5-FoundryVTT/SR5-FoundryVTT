import { SR5Actor } from "../actor/SR5Actor";
import { MatrixTest } from "./MatrixTest";
import { MarkPlacementFlow, MatrixPlacementData } from "./flows/MarkPlacementFlow";
import { MatrixTargetingFlow } from '@/module/flows/MatrixTargetingFlow';
import { SR5Item } from '@/module/item/SR5Item';

export type InviteMarkTestData = MatrixPlacementData & {
    targetPersonaUuid: string;
}

/**
 * Invite Mark Test implements the Invite Mark action on SR5#240
 * - it's a stretch to call this a "Test" but I think it's the best way to hook into everything
 */
export class InviteMarkTest extends MatrixTest<InviteMarkTestData> {
    declare actor: SR5Actor;
    declare personas: Record<string, string>;
    declare targetPersona: SR5Actor;

    override _prepareData(data: MatrixPlacementData, options): any {
        data = super._prepareData(data, options);
        data = MarkPlacementFlow._prepareData(data);
        return data;
    }

    override get autoSuccess(): boolean {
        return true;
    }

    // do not send a message for this
    override async toMessage(): Promise<ChatMessage | undefined> {
        if (this.data.targetPersonaUuid) {
            this.targetPersona = await fromUuid(this.data.targetPersonaUuid) as SR5Actor;
        }
        if (this.data.iconUuid) {
            this.icon = await fromUuid(this.data.iconUuid) as (SR5Actor | SR5Item);
        }
        return super.toMessage();
    }

    static override async chatMessageListeners(message: ChatMessage, html, data) {
        $(html).find('div.button[data-action="invite-mark-accept"]').on('click', InviteMarkTest._acceptInviteMark.bind(this));
    }

    static async _acceptInviteMark(event) {
        event.preventDefault();
        event.stopPropagation();
        const target = await fromUuid(event.currentTarget.dataset.targetId);
        if (!target || !(target instanceof SR5Actor)) return;
        const source = await fromUuid(event.currentTarget.dataset.sourceId);
        if (!source || (!(source instanceof SR5Actor) && !(source instanceof SR5Item))) return;
        const marks = event.currentTarget.dataset.marks;
        if (!marks) return;
        await target.setMarks(source, marks);
    }

    /**
     * Brute Force is a matrix action.
     */
    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['matrix', 'invite_mark'];
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/invite-mark-test-dialog.hbs';
    }

    override get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/chat/invite-mark-message.hbs';
    }

    override async populateDocuments(): Promise<void> {
        await super.populateDocuments();
        const {targets} = MatrixTargetingFlow.getTargets(this.actor);
        this.personas = targets.reduce((acc, p) => {
            acc[`${p.document.uuid}`] = p.name;
            return acc;
        }, {});
    }

    override validateBaseValues() {
        super.validateBaseValues();

        MarkPlacementFlow.validateBaseValues(this);
    }
}
