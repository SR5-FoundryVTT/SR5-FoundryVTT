import { FLAGS, SYSTEM_NAME } from "@/module/constants";
import type { SR5Actor } from "@/module/actor/SR5Actor";
import type { SuccessTest } from "@/module/tests/SuccessTest";
import { SocketMessage } from "@/module/sockets";
import type { FlowNextEntry, FlowState, FlowStep } from "@/module/types/flows/FlowStep";
import { FlowPlan } from "./FlowPlan";

/**
 * Steps waiting on a before subtree, and choices made within it.
 *
 * A step with a before subtree is gated: its entries wait until a step within that subtree releases
 * them, for the branch the entry belongs to. A step releases when its outcome is in its `releases`.
 * Like a touch spells defense, waiting until the target accepted or the caster made contact.
 */
export const FlowGates = {
    getState(message: ChatMessage): FlowState | undefined {
        return message.getFlag(SYSTEM_NAME, FLAGS.Flow);
    },

    /**
     * Can the current user choose for the subject of a choice entry?
     */
    canChoose(entry: FlowNextEntry, resolveActor: (uuid: string) => SR5Actor | undefined): boolean {
        if (game.user?.isGM) return true;
        return !!resolveActor(entry.subjectUuid)?.isOwner;
    },

    /**
     * The option a choice takes by itself, if any. A target accepts whatever its own caster, or the
     * same player, does to it.
     */
    autoChoice(step: FlowStep, caster: SR5Actor | undefined, subject: SR5Actor | undefined): string | undefined {
        const options = (step.config.options ?? []) as string[];
        if (!options.includes('accept') || !caster || !subject) return undefined;
        if (caster.uuid === subject.uuid) return 'accept';

        const players = (actor: SR5Actor) => game.users.filter(user => !user.isGM && actor.testUserPermission(user, 'OWNER')).map(user => user.id);
        const casterPlayers = players(caster);
        if (casterPlayers.length && players(subject).some(id => casterPlayers.includes(id))) return 'accept';
        return undefined;
    },

    /**
     * Choose an option of a choice entry on a message. Users that can't update the message ask the GM.
     */
    async choose(message: ChatMessage, stepId: string, subjectUuid: string, option: string) {
        if (game.user && message.canUserModify(game.user, 'update')) {
            await FlowGates._choose(message, stepId, subjectUuid, option);
            return;
        }
        SocketMessage.emitForGM(FLAGS.FlowGate, { op: 'choose', messageUuid: message.uuid, stepId, subjectUuid, option });
    },

    async _choose(message: ChatMessage, stepId: string, subjectUuid: string, option: string) {
        const state = FlowGates.getState(message);
        const step = state ? FlowPlan.step(state.plan, stepId) : undefined;
        if (!state || !step) return;

        const next = foundry.utils.deepClone(state.next);
        const entry = next.find(entry => entry.stepId === stepId && entry.subjectUuid === subjectUuid);
        if (!entry || entry.status !== 'pending') return;
        if (!((step.config.options ?? []) as string[]).includes(option)) return;

        entry.status = 'done';
        entry.outcome = [option];
        const branchUuid = entry.branchUuid || entry.subjectUuid;

        // The chosen option continues the branch, the others are skipped.
        for (const child of FlowPlan.children(state.plan, stepId)) {
            const childSubject = child.actor === 'self' ? state.rootActorUuid : branchUuid;
            const allowed = FlowPlan.matchesWhen(child, undefined, [option]) && FlowPlan.matchesCondition({ step: child });
            next.push({ stepId: child.id, subjectUuid: childSubject, branchUuid, status: allowed ? 'pending' : 'skipped' });
        }

        await message.setFlag(SYSTEM_NAME, FLAGS.Flow, { ...state, next });

        const gateFor = step.config.gateFor as string | undefined;
        if (gateFor && step.releases.includes(option)) await FlowGates.release(state.chainId, gateFor, branchUuid);
    },

    /**
     * Release a gated step for a branch, wherever in the chain its entry is.
     */
    async release(chainId: string, stepId: string, branchUuid: string) {
        for (const message of game.messages ?? []) {
            const state = FlowGates.getState(message);
            if (state?.chainId !== chainId) continue;
            const entry = state.next.find(entry => entry.stepId === stepId && entry.gated && (entry.branchUuid || entry.subjectUuid) === branchUuid);
            if (!entry) continue;

            if (game.user && message.canUserModify(game.user, 'update')) {
                await FlowGates._release(message, stepId, branchUuid);
            } else {
                SocketMessage.emitForGM(FLAGS.FlowGate, { op: 'release', messageUuid: message.uuid, stepId, subjectUuid: branchUuid });
            }
        }
    },

    async _release(message: ChatMessage, stepId: string, branchUuid: string) {
        const state = FlowGates.getState(message);
        if (!state) return;
        const next = foundry.utils.deepClone(state.next);
        for (const entry of next) {
            if (entry.stepId === stepId && (entry.branchUuid || entry.subjectUuid) === branchUuid) entry.gated = false;
        }
        await message.setFlag(SYSTEM_NAME, FLAGS.Flow, { ...state, next });
    },

    /**
     * Release the gate a finished test is a step for, when its outcome is one its step releases on.
     */
    async releaseFromTest(test: SuccessTest, state: FlowState) {
        const step = FlowPlan.step(state.plan, state.stepId);
        const gateFor = step?.config.gateFor as string | undefined;
        if (!step || !gateFor || !step.releases.length) return;

        const outcomes = FlowPlan.outcomes(test);
        if (!step.releases.some(release => outcomes.includes(release))) return;
        await FlowGates.release(state.chainId, gateFor, state.branchUuid || state.subjectUuid);
    },

    /**
     * Handle users asking the GM to choose for a subject they own, or to release a gate.
     */
    async _handleSocketMessage(message: Shadowrun.SocketMessageData, senderId?: string) {
        if (!game.user?.isGM) return;
        const { op, messageUuid, stepId, subjectUuid, option } = (message.data ?? {}) as Record<string, unknown>;
        if (typeof messageUuid !== 'string' || typeof stepId !== 'string' || typeof subjectUuid !== 'string') return;

        const chatMessage = await fromUuid<ChatMessage>(messageUuid);
        if (!chatMessage) return;

        if (op === 'choose' && typeof option === 'string') {
            const sender = senderId ? game.users?.get(senderId) : undefined;
            const subject = await fromUuid(subjectUuid) as { actor?: SR5Actor } | SR5Actor | null;
            const actor = (subject && 'actor' in subject && subject.actor) ? subject.actor : subject as SR5Actor | null;
            if (!sender || !actor?.testUserPermission(sender, 'OWNER')) return;
            await FlowGates._choose(chatMessage, stepId, subjectUuid, option);
        }
        if (op === 'release') await FlowGates._release(chatMessage, stepId, subjectUuid);
    },
};
