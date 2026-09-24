import { SR5Actor } from '@/module/actor/SR5Actor';
import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import { SocketMessage } from '@/module/sockets';
import { PerceptionFlow } from '@/module/vision/PerceptionFlow';
import { PerceptionResolver } from '@/module/vision/PerceptionResolver';
import { AstralPerceptionFlow } from '@/module/vision/astralPerception/AstralPerceptionFlow';
import {
    AstralProjectionBodyState,
    AstralProjectionFormState,
    AstralProjectionState,
    getProjectionBody,
    getProjectionForm,
    getProjectionState,
    isAstralForm,
} from './AstralProjectionState';

export const ASTRAL_WALK_METERS = 100;
export const ASTRAL_RUN_METERS = 5000;
export const ASTRAL_FORM_ALPHA = 0.5;

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
        return PerceptionResolver.resolve(actor).astral.projection;
    }

    static getState(token: TokenDocument): AstralProjectionState | undefined {
        return getProjectionState(token);
    }

    static isProjected(token: TokenDocument) {
        return !!this.getState(token);
    }

    /** Astral movement rates of a form in its scene's units. Other tokens use their actor's movement. */
    static getMovementRates(token: TokenDocument) {
        if (!isAstralForm(token)) return undefined;
        const units = token.parent?.grid.units ?? 'm';
        return {
            walk: PerceptionFlow.metersToSceneUnits(ASTRAL_WALK_METERS, units),
            run: PerceptionFlow.metersToSceneUnits(ASTRAL_RUN_METERS, units),
        };
    }

    static async toggle(token: TokenDocument) {
        const body = getProjectionBody(token);
        if (!body) return false;
        const action: ProjectionAction = this.isProjected(body) ? 'return' : 'project';

        if (game.user?.isGM) {
            if (action === 'return') await this.returnToBody(body);
            else await this.project(body);
            return action === 'project';
        }

        if (!this.userOwnsActor(body, game.user)) {
            ui.notifications.warn(game.i18n.localize('SR5.Vision.CannotControlAstralProjection'));
            return false;
        }
        SocketMessage.emitForGM(FLAGS.AstralProjectionOperation, { action, tokenUuid: body.uuid });
        return action === 'project';
    }

    static async handleSocketMessage(message: Shadowrun.SocketMessageData, senderId?: string) {
        if (!game.user?.isGM || !senderId) return;
        const { action, tokenUuid } = message.data ?? {};
        if ((action !== 'project' && action !== 'return') || typeof tokenUuid !== 'string') return;

        const requestingUser = game.users?.get(senderId);
        const token = fromUuidSync(tokenUuid as any);
        if (!requestingUser || !(token instanceof TokenDocument) || !this.userOwnsActor(token, requestingUser)) {
            console.warn('Shadowrun 5e | Rejected unauthorized astral projection request.', {
                senderId,
                tokenUuid,
            });
            return;
        }

        if (action === 'project') await this.project(token);
        else await this.returnToBody(token);
    }

    static async project(body: TokenDocument) {
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
            return getProjectionForm(existingActorProjection);
        }

        // A second request while the first is still running must report the form the first one creates.
        const inFlight = this.operations.get(bodyUuid);
        if (inFlight) {
            await inFlight.catch(() => undefined);
            return getProjectionForm(body);
        }

        return this.runExclusive(bodyUuid, async () => {
            const existing = this.getState(body);
            if (existing?.role === 'form') return body;
            if (existing?.role === 'body') {
                const form = getProjectionForm(body);
                if (form) return form;
                await this.restoreBody(body, existing);
            }

            const resumeAstralPerception = AstralPerceptionFlow.isActive(body);
            if (resumeAstralPerception) await AstralPerceptionFlow.disable(body);

            const source = body.toObject();
            const initiativeMode = actor.system.initiative?.perception ?? 'meatspace';
            const formId = foundry.utils.randomID();
            const bodyState: AstralProjectionBodyState = {
                role: 'body',
                formTokenId: formId,
                linkedActorId: body.actorLink ? actor.id! : undefined,
                previous: { ...AstralPerceptionFlow.captureVision(source), initiativeMode, resumeAstralPerception },
            };
            const formState: AstralProjectionFormState = {
                role: 'form',
                bodyTokenId: body.id!,
                previousInitiativeMode: initiativeMode,
            };

            await body.update({
                sight: { ...source.sight, enabled: false },
                [`flags.${SYSTEM_NAME}.${FLAGS.AstralProjection}`]: bodyState,
            });
            await actor.update({
                system: { initiative: { perception: 'astral' } },
                [`flags.${SYSTEM_NAME}.${FLAGS.AstralProjecting}`]: true,
            } as any);

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
                await this.restoreBody(body, bodyState);
                throw error;
            }
        });
    }

    static async returnToBody(token: TokenDocument) {
        const body = getProjectionBody(token);
        const state = getProjectionState(body);
        if (!body || state?.role !== 'body' || this.operations.has(body.uuid!)) return false;

        return this.runExclusive(body.uuid!, async () => {
            await getProjectionForm(body)?.delete({ sr5ProjectionReturn: true } as any);
            await this.restoreBody(body, state);
            this.focusBody(body);
            return true;
        });
    }

    static async reconcileWorld(force = false) {
        if (!force && !game.users?.activeGM?.isSelf) return;
        const projected = game.scenes.contents.flatMap(scene => scene.tokens.filter(token => this.isProjected(token)));

        // Bodies whose form is gone or doesn't project from them anymore.
        for (const body of projected) {
            const state = this.getState(body);
            if (state?.role !== 'body') continue;
            if (getProjectionBody(getProjectionForm(body)) !== body) await this.restoreBody(body, state);
        }

        // Forms whose body is gone or doesn't project into them anymore.
        for (const form of projected) {
            const state = this.getState(form);
            if (state?.role !== 'form') continue;
            if (getProjectionForm(getProjectionBody(form)) === form) continue;
            // The form resolves its actor through its own projection flag, so capture it before
            // unsetting that flag drops the alias back onto the form's throwaway delta actor.
            const actor = form.actor as SR5Actor | null;
            // Keep the form flag through _preDelete so SR5TokenDocument does not treat an
            // unlinked form's borrowed actor as an actor that is actually being deleted.
            await form.delete({ sr5ProjectionReturn: true } as any);
            await this.restoreActor(actor, state.previousInitiativeMode);
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

        return {
            ...bodySource,
            ...AstralPerceptionFlow.astralVision(body, bodySource),
            _id: formId,
            name: game.i18n.format('SR5.Vision.AstralFormName', { name: body.name }),
            alpha: ASTRAL_FORM_ALPHA,
            actorId: body.actorId,
            actorLink: body.actorLink,
            delta: body.actorLink ? undefined : foundry.utils.deepClone(bodySource.delta),
            flags,
        };
    }

    private static async restoreBody(body: TokenDocument, state: AstralProjectionBodyState) {
        await AstralPerceptionFlow.restoreVision(body, state.previous, {
            [`flags.${SYSTEM_NAME}.-=${FLAGS.AstralProjection}`]: null,
        });
        await this.restoreActor(this.projectingActor(body, state), state.previous.initiativeMode);
        if (state.previous.resumeAstralPerception) await AstralPerceptionFlow.enable(body);
    }

    private static async handleDeletedToken(token: TokenDocument, userId?: string, intentionalReturn = false) {
        if (token.id) this.pendingFocus.delete(token.id);
        const state = this.getState(token);
        if (!state) return;
        const handlesCleanup = this.handlesCleanupFor(userId);

        if (state.role === 'form') {
            const body = getProjectionBody(token);
            if (token.object?.controlled && body) this.focusBody(body);
            if (intentionalReturn || !handlesCleanup || !body) return;
            const bodyState = this.getState(body);
            if (bodyState?.role !== 'body' || this.operations.has(body.uuid!)) return;
            await this.runExclusive(body.uuid!, () => this.restoreBody(body, bodyState));
            return;
        }

        if (!handlesCleanup || this.operations.has(token.uuid!)) return;
        // Keeping the form flag through _preDelete prevents storage cleanup for the body's
        // borrowed synthetic actor. The option also prevents the form hook restoring a body
        // which is itself being deleted.
        await getProjectionForm(token)?.delete({ sr5ProjectionReturn: true } as any);
        await this.restoreActor(this.projectingActor(token, state), state.previous.initiativeMode);
    }

    private static async handleDeletedScene(scene: Scene, userId?: string) {
        if (!this.handlesCleanupFor(userId)) return;
        const restorations = new Map<SR5Actor, string>();
        for (const token of scene.tokens) {
            const state = this.getState(token);
            // A form with its body in the scene is restored through that body.
            if (!state || (state.role === 'form' && getProjectionBody(token))) continue;
            const actor = state.role === 'body' ? this.projectingActor(token, state) : token.actor as SR5Actor | null;
            if (!actor) continue;
            restorations.set(actor, state.role === 'body' ? state.previous.initiativeMode : state.previousInitiativeMode);
        }
        for (const [actor, mode] of restorations) await this.restoreActor(actor, mode);
    }

    private static focusCreatedForm(token: TokenDocument) {
        if (!isAstralForm(token) || token.parent !== canvas.scene) return;
        const body = getProjectionBody(token);
        if (body) this.focusForm(body, token);
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
        return game.scenes.contents
            .flatMap(scene => scene.tokens.contents)
            .find(token => token.actor === actor && this.getState(token)?.role === 'body');
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

    /**
     * The actor that started a body's projection.
     *
     * A linked body's token can be pointed at another actor while projecting, but the projection
     * still has to end on the world actor it started on.
     */
    private static projectingActor(body: TokenDocument, state: AstralProjectionBodyState) {
        const linked = state.linkedActorId ? game.actors.get(state.linkedActorId) : undefined;
        return (linked ?? body.actor) as SR5Actor | null;
    }

    /**
     * Put back the actor's initiative mode and end its projection.
     *
     * The synthetic actor of an unlinked token is deleted along with that token or its scene,
     * leaving nothing to restore.
     */
    private static async restoreActor(actor: SR5Actor | null, initiativeMode: string) {
        if (!actor) return;
        if (actor.isToken && !foundry.utils.fromUuidSync(actor.token!.uuid!)) return;
        const projecting = !!actor.getFlag(SYSTEM_NAME, FLAGS.AstralProjecting);
        if (!projecting && actor.system.initiative?.perception === initiativeMode) return;
        await actor.update({
            system: { initiative: { perception: initiativeMode } },
            [`flags.${SYSTEM_NAME}.-=${FLAGS.AstralProjecting}`]: null,
        } as any);
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
