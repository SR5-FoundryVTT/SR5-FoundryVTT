import { SR5Actor } from '@/module/actor/SR5Actor';
import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import { SocketMessage } from '@/module/sockets';
import { PerceptionFlow } from '@/module/vision/PerceptionFlow';
import { PerceptionResolver } from '@/module/vision/PerceptionResolver';
import {
    ASTRAL_PERCEPTION_VISION_MODE,
    AstralPerceptionFlow,
    PreviousTokenVision,
} from '@/module/vision/astralPerception/AstralPerceptionFlow';

export const ASTRAL_WALK_METERS = 100;
export const ASTRAL_RUN_METERS = 5000;
export const ASTRAL_FORM_ALPHA = 0.5;

interface ProjectionRestorationState extends PreviousTokenVision {
    initiativeMode: string;
    resumeAstralPerception: boolean;
}

export interface AstralProjectionBodyState {
    role: 'body';
    requestId: string;
    formTokenUuid: string;
    previous: ProjectionRestorationState;
}

export interface AstralProjectionFormState {
    role: 'form';
    requestId: string;
    bodyTokenUuid: string;
    previousInitiativeMode: string;
    movement: { walk: number; run: number };
    initiativeMode: 'astral';
}

export type AstralProjectionState = AstralProjectionBodyState | AstralProjectionFormState;

type ProjectionAction = 'project' | 'return';

export class AstralProjectionFlow {
    private static operations = new Map<string, Promise<unknown>>();
    /** Form tokens awaiting their placeable to be drawn before control can be moved onto them. */
    private static pendingFocus = new Set<string>();

    static registerHooks() {
        Hooks.on('createToken', (token) => this.focusCreatedForm(token));
        Hooks.on('drawToken', (token) => this.focusPendingForm(token.document));
        Hooks.on('deleteToken', (token, options, userId) => {
            void this.handleDeletedToken(
                token,
                userId,
                !!(options as { sr5ProjectionReturn?: boolean }).sr5ProjectionReturn,
            );
        });
        Hooks.on('deleteScene', (scene, _options, userId) => {
            void this.handleDeletedScene(scene, userId);
        });
        Hooks.on('ready', () => {
            void this.reconcileWorld();
        });
    }

    static canProject(actor: SR5Actor) {
        return PerceptionResolver.resolve(actor).capabilities.astral.projection;
    }

    static getState(token: TokenDocument): AstralProjectionState | undefined {
        const state = token.getFlag(SYSTEM_NAME, FLAGS.AstralProjection) as AstralProjectionState | undefined;
        if (!state || (state.role !== 'body' && state.role !== 'form')) return undefined;
        return state;
    }

    static isForm(token: TokenDocument) {
        return this.getState(token)?.role === 'form';
    }

    static isProjected(token: TokenDocument) {
        return !!this.getState(token);
    }

    static getMovementRates(token: TokenDocument) {
        const state = this.getState(token);
        return state?.role === 'form' ? state.movement : undefined;
    }

    static async toggle(token: TokenDocument) {
        const state = this.getState(token);
        const body = state?.role === 'form' ? await this.resolveToken(state.bodyTokenUuid) : token;
        if (!body) return false;
        const action: ProjectionAction = this.getState(body)?.role === 'body' ? 'return' : 'project';

        if (game.user?.isGM) {
            if (action === 'return') await this.returnToBody(body);
            else await this.project(body);
            return action === 'project';
        }

        if (!this.userOwnsActor(body, game.user)) {
            ui.notifications.warn(game.i18n.localize('SR5.Vision.CannotControlAstralProjection'));
            return false;
        }
        SocketMessage.emitForGM(FLAGS.AstralProjectionOperation, {
            action,
            tokenUuid: body.uuid,
            requestId: foundry.utils.randomID(),
        });
        return action === 'project';
    }

    static async handleSocketMessage(message: Shadowrun.SocketMessageData, senderId?: string) {
        if (!game.user?.isGM || !senderId) return;
        const { action, tokenUuid } = message.data ?? {};
        if ((action !== 'project' && action !== 'return') || typeof tokenUuid !== 'string') return;

        const requestingUser = game.users?.get(senderId);
        const token = await this.resolveToken(tokenUuid);
        if (!requestingUser || !token || !this.userOwnsActor(token, requestingUser)) {
            console.warn('Shadowrun 5e | Rejected unauthorized astral projection request.', {
                senderId,
                tokenUuid,
            });
            return;
        }

        if (action === 'project') await this.project(token, message.data.requestId);
        else await this.returnToBody(token);
    }

    static async project(body: TokenDocument, requestId = foundry.utils.randomID()) {
        const actor = body.actor as SR5Actor | null;
        const scene = body.parent;
        if (!actor || !(scene instanceof Scene) || !this.canProject(actor)) {
            ui.notifications.warn(game.i18n.localize('SR5.Vision.CannotProjectAstrally'));
            return null;
        }
        const bodyUuid = body.uuid!;

        const existingActorProjection = this.projectedBodyForActor(actor);
        if (existingActorProjection && existingActorProjection !== body) {
            ui.notifications.warn(game.i18n.localize('SR5.Vision.AlreadyProjectingAstrally'));
            return this.resolveForm(existingActorProjection);
        }

        // A second request while the first is still running must report the form the first one creates.
        const inFlight = this.operations.get(bodyUuid);
        if (inFlight) {
            await inFlight.catch(() => undefined);
            return this.resolveForm(body);
        }

        return this.runExclusive(bodyUuid, async () => {
            const existing = this.getState(body);
            if (existing?.role === 'body') {
                const form = await this.resolveToken(existing.formTokenUuid);
                if (form) return form;
                await this.restoreBody(body, existing, true);
            } else if (existing?.role === 'form') {
                return body;
            }

            const resumeAstralPerception = AstralPerceptionFlow.isActive(body);
            if (resumeAstralPerception) await AstralPerceptionFlow.disable(body);

            const source = body.toObject();
            const previous: ProjectionRestorationState = {
                sight: foundry.utils.deepClone(source.sight) as Record<string, unknown>,
                detectionModes: foundry.utils.deepClone(source.detectionModes),
                initiativeMode: actor.system.initiative?.perception ?? 'meatspace',
                resumeAstralPerception,
            };
            const formId = foundry.utils.randomID();
            const formTokenUuid = `${scene.uuid}.Token.${formId}`;
            const bodyState: AstralProjectionBodyState = {
                role: 'body',
                requestId,
                formTokenUuid,
                previous,
            };
            const formState: AstralProjectionFormState = {
                role: 'form',
                requestId,
                bodyTokenUuid: bodyUuid,
                previousInitiativeMode: previous.initiativeMode,
                movement: {
                    walk: PerceptionFlow.metersToSceneUnits(ASTRAL_WALK_METERS, scene.grid.units),
                    run: PerceptionFlow.metersToSceneUnits(ASTRAL_RUN_METERS, scene.grid.units),
                },
                initiativeMode: 'astral',
            };

            await body.update({
                sight: { ...source.sight, enabled: false },
                [`flags.${SYSTEM_NAME}.${FLAGS.AstralProjection}`]: bodyState,
            });
            await actor.update({ system: { initiative: { perception: 'astral' } } } as any);

            try {
                const [form] = await scene.createEmbeddedDocuments(
                    'Token',
                    [this.formTokenData(body, source, formId, formState)],
                    { keepId: true },
                );
                if (!form) throw new Error('Astral form token creation returned no document.');
                this.focusForm(body, form);
                return form;
            } catch (error) {
                await this.restoreBody(body, bodyState, true);
                throw error;
            }
        });
    }

    static async returnToBody(token: TokenDocument) {
        const initial = this.getState(token);
        const body = initial?.role === 'form' ? await this.resolveToken(initial.bodyTokenUuid) : token;
        if (!body) return false;
        const bodyUuid = body.uuid!;
        if (this.operations.has(bodyUuid)) return false;

        const state = this.getState(body);
        if (state?.role !== 'body') return false;
        return this.runExclusive(bodyUuid, async () => {
            const form = await this.resolveToken(state.formTokenUuid);
            if (form) {
                await form.delete({ sr5ProjectionReturn: true } as any);
            }
            await this.restoreBody(body, state, true);
            this.focusBody(body);
            return true;
        });
    }

    static async reconcileWorld(force = false) {
        if (!force && !game.users?.activeGM?.isSelf) return;
        const projected = Array.from(game.scenes).flatMap((scene) =>
            Array.from(scene.tokens).filter((token) => this.isProjected(token)),
        );

        for (const token of projected) {
            const state = this.getState(token);
            if (state?.role !== 'body') continue;
            const form = await this.resolveToken(state.formTokenUuid);
            const formState = form && this.getState(form);
            if (!form || formState?.role !== 'form' || formState.bodyTokenUuid !== token.uuid) {
                await this.restoreBody(token, state, true);
            }
        }

        for (const token of projected) {
            const state = this.getState(token);
            if (state?.role !== 'form') continue;
            const body = await this.resolveToken(state.bodyTokenUuid);
            const bodyState = body && this.getState(body);
            if (bodyState?.role === 'body' && bodyState.formTokenUuid === token.uuid) continue;
            // The form resolves its actor through its own projection flag, so capture it before
            // unsetting that flag drops the alias back onto the form's throwaway delta actor.
            const actor = token.actor as SR5Actor | null;
            // Keep the form flag through _preDelete so SR5TokenDocument does not treat an
            // unlinked form's borrowed actor as an actor that is actually being deleted.
            await token.delete({ sr5ProjectionReturn: true } as any);
            await this.restoreInitiative(actor, state.previousInitiativeMode);
        }
    }

    private static formTokenData(
        body: TokenDocument,
        bodySource: Token.Source,
        formId: string,
        state: AstralProjectionFormState,
    ): Record<string, any> {
        const flags = foundry.utils.deepClone(bodySource.flags) as Record<string, any>;
        flags[SYSTEM_NAME] ??= {};
        delete flags[SYSTEM_NAME][FLAGS.AstralPerceptionVision];
        flags[SYSTEM_NAME][FLAGS.AstralProjection] = state;
        const range = Math.max(body.sight.range ?? 0, 10000);

        return {
            ...bodySource,
            _id: formId,
            name: game.i18n.format('SR5.Vision.AstralFormName', { name: body.name }),
            alpha: ASTRAL_FORM_ALPHA,
            actorId: body.actorId,
            actorLink: body.actorLink,
            delta: body.actorLink ? undefined : foundry.utils.deepClone(bodySource.delta),
            sight: {
                ...bodySource.sight,
                enabled: true,
                range,
                visionMode: ASTRAL_PERCEPTION_VISION_MODE,
            },
            detectionModes: PerceptionFlow.reconcileAstralDetectionModes(bodySource.detectionModes, range),
            flags,
        };
    }

    private static async restoreBody(body: TokenDocument, state: AstralProjectionBodyState, resumePerception: boolean) {
        await body.update({
            sight: state.previous.sight,
            detectionModes: PerceptionFlow.detectionModeUpdate(
                body.toObject().detectionModes,
                state.previous.detectionModes,
            ) as any,
            [`flags.${SYSTEM_NAME}.-=${FLAGS.AstralProjection}`]: null,
        });
        await this.restoreInitiative(body.actor as SR5Actor | null, state.previous.initiativeMode);
        PerceptionFlow.refreshTokenSource(body);
        if (resumePerception && state.previous.resumeAstralPerception) {
            await AstralPerceptionFlow.enable(body);
        }
    }

    private static async handleDeletedToken(token: TokenDocument, userId?: string, intentionalReturn = false) {
        if (token.id) this.pendingFocus.delete(token.id);
        const state = this.getState(token);
        if (!state) return;
        const handlesCleanup = this.handlesCleanupFor(userId);

        if (state.role === 'form') {
            const body = await this.resolveToken(state.bodyTokenUuid);
            if (token.object?.controlled && body) this.focusBody(body);
            if (intentionalReturn) return;
            if (!handlesCleanup || !body) return;
            const bodyUuid = body.uuid!;
            if (this.operations.has(bodyUuid)) return;
            const bodyState = this.getState(body);
            if (bodyState?.role !== 'body') return;
            await this.runExclusive(bodyUuid, () => this.restoreBody(body, bodyState, true));
            return;
        }

        if (!handlesCleanup || this.operations.has(token.uuid!)) return;
        const form = await this.resolveToken(state.formTokenUuid);
        if (form) {
            // Keeping the form flag through _preDelete prevents storage cleanup for the body's
            // borrowed synthetic actor. The option also prevents the form hook restoring a body
            // which is itself being deleted.
            await form.delete({ sr5ProjectionReturn: true } as any);
        }
        await this.restoreInitiative(token.actor as SR5Actor | null, state.previous.initiativeMode);
    }

    private static async handleDeletedScene(scene: Scene, userId?: string) {
        if (!this.handlesCleanupFor(userId)) return;
        const restorations = new Map<SR5Actor, string>();
        for (const token of scene.tokens) {
            const state = this.getState(token);
            const actor = token.actor as SR5Actor | null;
            if (!state || !actor) continue;
            const previousMode = state.role === 'body' ? state.previous.initiativeMode : state.previousInitiativeMode;
            restorations.set(actor, previousMode);
        }
        for (const [actor, mode] of restorations) await this.restoreInitiative(actor, mode);
    }

    private static focusCreatedForm(token: TokenDocument) {
        const state = this.getState(token);
        if (state?.role !== 'form' || token.parent !== canvas.scene) return;
        const body = fromUuidSync(state.bodyTokenUuid);
        if (body?.documentName === 'Token') this.focusForm(body as TokenDocument, token);
    }

    /**
     * Move control onto a form whose placeable had not been drawn yet when its creation was handled.
     * Only forms queued by focusForm are eligible, so unrelated redraws never steal control.
     */
    private static focusPendingForm(form: TokenDocument) {
        if (!form.id || !this.pendingFocus.delete(form.id)) return;
        this.focusCreatedForm(form);
    }

    private static focusForm(body: TokenDocument, form: TokenDocument) {
        if (form.parent !== canvas.scene || !body.object?.controlled) return;
        // createToken fires before the canvas draws the placeable. Keep the body controlled until
        // then, otherwise releasing it here leaves nothing selected at all.
        if (!form.object) {
            if (form.id) this.pendingFocus.add(form.id);
            return;
        }
        body.object.release();
        form.object.control({ releaseOthers: true });
        void canvas.animatePan(form.object.center);
    }

    private static focusBody(body: TokenDocument) {
        if (body.parent !== canvas.scene) return;
        body.object?.control({ releaseOthers: true });
        if (body.object) void canvas.animatePan(body.object.center);
    }

    private static projectedBodyForActor(actor: SR5Actor) {
        return Array.from(game.scenes)
            .flatMap((scene) => Array.from(scene.tokens))
            .find((token) => token.actor === actor && this.getState(token)?.role === 'body');
    }

    /**
     * Run an operation for a body token, blocking concurrent operations on the same body and
     * exposing the running promise so callers can await its result instead of racing it.
     */
    private static runExclusive<T>(bodyUuid: string, operation: () => Promise<T>): Promise<T> {
        const running = operation();
        this.operations.set(bodyUuid, running);
        return running.finally(() => {
            if (this.operations.get(bodyUuid) === running) this.operations.delete(bodyUuid);
        });
    }

    private static async resolveForm(body: TokenDocument) {
        const state = this.getState(body);
        return state?.role === 'body' ? this.resolveToken(state.formTokenUuid) : null;
    }

    private static async resolveToken(uuid: string) {
        const match = /^Scene\.([^.]+)\.Token\.([^.]+)$/.exec(uuid);
        if (match) {
            const token = game.scenes?.get(match[1])?.tokens.get(match[2]);
            if (token) return token;
        }
        const document = await fromUuid(uuid as any);
        return document?.documentName === 'Token' ? (document as TokenDocument) : null;
    }

    private static async restoreInitiative(actor: SR5Actor | null, mode: string) {
        if (actor && actor.system.initiative?.perception !== mode) {
            await actor.update({ system: { initiative: { perception: mode } } } as any);
        }
    }

    private static userOwnsActor(token: TokenDocument, user: User | null | undefined) {
        return !!user && !!token.actor?.testUserPermission(user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER);
    }

    private static handlesCleanupFor(userId?: string) {
        const deletingUser = userId ? game.users?.get(userId) : null;
        return (
            !!game.user?.isGM && (game.user.id === userId || (!deletingUser?.isGM && !!game.users?.activeGM?.isSelf))
        );
    }
}
