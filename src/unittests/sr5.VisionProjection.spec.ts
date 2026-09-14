import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import {
    ASTRAL_FORM_ALPHA,
    ASTRAL_RUN_METERS,
    ASTRAL_WALK_METERS,
    AstralProjectionFlow,
} from '@/module/vision/astralProjection/AstralProjectionFlow';
import { SR5TestFactory } from './utils';
import { hasPhysicalPresence } from '@/module/vision/physicalVision/physicalDetectionMode';
import AstralPerceptionDetectionMode from '@/module/vision/astralPerception/astralPerceptionDetectionMode';
import { ActorRollDataFlow } from '@/module/actor/flows/ActorRollDataFlow';
import { StorageFlow } from '@/module/flows/StorageFlow';

const waitFor = async (predicate: () => boolean, timeout = 1500) => {
    const started = Date.now();
    while (!predicate()) {
        if (Date.now() - started > timeout) throw new Error('Timed out waiting for projection cleanup.');
        await new Promise((resolve) => setTimeout(resolve, 20));
    }
};

export const shadowrunVisionProjection = (context: QuenchBatchContext) => {
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;
    const factory = new SR5TestFactory({ skipDefaultSkills: true });

    after(async () => {
        await factory.destroy();
    });

    const createMagician = (system: Record<string, unknown> = {}) =>
        factory.createActor({
            type: 'character',
            system: {
                magic: { type: 'magician' },
                initiative: { perception: 'meatspace' },
                ...system,
            },
        });

    const createBody = async (actor: Actor.Stored<'character'>, actorLink = true) => {
        const scene = await factory.createScene({
            grid: { type: CONST.GRID_TYPES.SQUARE, size: 100, distance: 5, units: 'm' },
        });
        const [body] = await scene.createEmbeddedDocuments('Token', [
            {
                actorId: actor.id,
                actorLink,
                x: 200,
                y: 300,
                elevation: 10,
                sight: { enabled: true, range: 23, visionMode: 'basic', color: '#334455' },
                detectionModes: {
                    basicSight: { enabled: true, range: 23 },
                    customSense: { enabled: true, range: 9 },
                },
            },
        ]);
        return { scene, body };
    };

    describe('Astral projection', () => {
        it('allows full magicians and explicit overrides only', async () => {
            const magician = await createMagician();
            const aspected = await factory.createActor({
                type: 'character',
                system: { magic: { type: 'aspected_magician' } },
            });
            const overridden = await factory.createActor({
                type: 'character',
                system: { magic: { type: 'mundane', astralProjectionOverride: 'allow' } },
            });

            assert.isTrue(AstralProjectionFlow.canProject(magician));
            assert.isFalse(AstralProjectionFlow.canProject(aspected));
            assert.isTrue(AstralProjectionFlow.canProject(overridden));
        });

        it('creates a linked translucent form and gives it astral context', async () => {
            const actor = await createMagician({
                attributes: {
                    agility: { base: 1 },
                    reaction: { base: 2 },
                    strength: { base: 3 },
                    body: { base: 4 },
                    logic: { base: 6 },
                    intuition: { base: 5 },
                    charisma: { base: 7 },
                    willpower: { base: 8 },
                },
            });
            const { scene, body } = await createBody(actor);
            assert.strictEqual(actor.system.attributes.agility.value, 1);

            const form = await AstralProjectionFlow.project(body);
            assert.exists(form);
            if (!form) return;

            assert.strictEqual(scene.tokens.size, 2, 'the body remains in the scene');
            assert.strictEqual(form.actor, actor, 'the linked form uses the authoritative actor');
            assert.strictEqual(form.actorId, body.actorId);
            assert.isTrue(form.actorLink);
            assert.strictEqual(form.alpha, ASTRAL_FORM_ALPHA);
            assert.strictEqual(form.x, body.x);
            assert.strictEqual(form.y, body.y);
            assert.strictEqual(form.elevation, body.elevation, 'the form starts at the body elevation');
            assert.isFalse(body.sight.enabled, 'the body stops contributing vision');
            assert.isTrue(form.sight.enabled);
            assert.strictEqual(form.sight.visionMode, 'astralPerception');
            assert.isTrue(form.detectionModes.astralPerception.enabled);
            assert.isFalse(hasPhysicalPresence({ document: form } as any));
            const astralDetection = new AstralPerceptionDetectionMode({
                id: 'astralPerception',
                label: 'Astral Perception',
                type: foundry.canvas.perception.DetectionMode.DETECTION_TYPES.SIGHT,
            });
            assert.isTrue(
                (astralDetection as any)._canDetect({ visionMode: { id: 'astralPerception' } }, { document: form }),
            );
            assert.deepEqual(AstralProjectionFlow.getMovementRates(form), {
                walk: ASTRAL_WALK_METERS,
                run: ASTRAL_RUN_METERS,
            });
            assert.strictEqual(actor.system.initiative.perception, 'astral');
            const rollData = actor.getRollData({ copySystem: true });
            assert.strictEqual(rollData.attributes.agility.value, actor.system.attributes.logic.value);
            assert.strictEqual(rollData.attributes.reaction.value, actor.system.attributes.intuition.value);
            assert.strictEqual(rollData.attributes.strength.value, actor.system.attributes.charisma.value);
            assert.strictEqual(rollData.attributes.body.value, actor.system.attributes.willpower.value);
            assert.strictEqual(actor.system.attributes.agility.value, 1, 'the stored physical attribute is unchanged');

            await AstralProjectionFlow.returnToBody(form);
        });

        it('returns to the body and restores its prior vision and initiative', async () => {
            const actor = await createMagician({ metatype: 'elf' });
            const { scene, body } = await createBody(actor);
            const form = await AstralProjectionFlow.project(body);
            assert.exists(form);

            assert.isTrue(await AstralProjectionFlow.returnToBody(body));
            assert.strictEqual(scene.tokens.size, 1);
            assert.isUndefined(AstralProjectionFlow.getState(body));
            assert.isTrue(body.sight.enabled);
            assert.strictEqual(body.sight.range, 23);
            assert.strictEqual(body.sight.visionMode, 'basic');
            assert.strictEqual(body.sight.color?.css, '#334455');
            assert.isTrue(body.detectionModes.customSense.enabled);
            assert.isTrue(body.detectionModes.lowlight.enabled, 'current automatic senses are reconciled');
            assert.strictEqual(actor.system.initiative.perception, 'meatspace');
        });

        it('shares the body synthetic actor when projecting from an unlinked token', async () => {
            const actor = await createMagician();
            const { body } = await createBody(actor, false);
            const bodyActor = body.actor;

            const form = await AstralProjectionFlow.project(body);
            assert.exists(form);
            if (!form) return;

            assert.isFalse(form.actorLink);
            assert.strictEqual(form.actor, bodyActor);
            assert.strictEqual(form.actor, body.actor);
            assert.isTrue(ActorRollDataFlow.isAstrallyProjecting(bodyActor as any));

            // Synthetic actor preparation must not read either token's actor getter. Doing so while
            // Foundry lazily constructs an ActorDelta causes an infinite body/form recursion.
            const originalFormActor = Object.getOwnPropertyDescriptor(form, 'actor');
            Object.defineProperty(form, 'actor', {
                configurable: true,
                get: () => { throw new Error('projection lookup read form.actor'); },
            });
            try {
                assert.isTrue(ActorRollDataFlow.isAstrallyProjecting(bodyActor as any));
            } finally {
                if (originalFormActor) Object.defineProperty(form, 'actor', originalFormActor);
                else delete (form as any).actor;
            }
            await AstralProjectionFlow.returnToBody(body);
        });

        it('swaps in mental attributes while projecting, but not for the body soaking damage', async () => {
            const actor = await createMagician({
                attributes: {
                    body: { base: 3 },
                    strength: { base: 2 },
                    willpower: { base: 6 },
                    charisma: { base: 5 },
                },
            });
            const { body } = await createBody(actor);

            const form = await AstralProjectionFlow.project(body);
            assert.exists(form);
            if (!form) return;

            // SR5#315 astral attributes table: Body becomes Willpower, Strength becomes Charisma.
            const astral = actor.getRollData({ copySystem: true });
            assert.strictEqual(astral.attributes.body.value, astral.attributes.willpower.value);
            assert.strictEqual(astral.attributes.strength.value, astral.attributes.charisma.value);

            // SR5#313 the body is left behind in a coma-like state, but it is still a physical body
            // and physical damage can only ever reach it. It soaks with its own Body.
            const soak = actor.getRollData({ copySystem: true, action: { test: 'PhysicalResistTest' } as any });
            assert.strictEqual(soak.attributes.body.value, actor.system.attributes.body.value);
            assert.notStrictEqual(soak.attributes.body.value, soak.attributes.willpower.value);

            await AstralProjectionFlow.returnToBody(body);
        });

        it('cleans up the body when the form is manually deleted', async () => {
            const actor = await createMagician();
            const { body } = await createBody(actor);
            const form = await AstralProjectionFlow.project(body);
            assert.exists(form);
            if (!form) return;

            await form.delete();
            await waitFor(() => !AstralProjectionFlow.getState(body));

            assert.isTrue(body.sight.enabled);
            assert.strictEqual(actor.system.initiative.perception, 'meatspace');
        });

        it('removes the form and restores initiative when the body is deleted', async () => {
            const actor = await createMagician();
            const { scene, body } = await createBody(actor);
            const form = await AstralProjectionFlow.project(body);
            assert.exists(form);

            await body.delete();
            await waitFor(() => scene.tokens.size === 0 && actor.system.initiative.perception === 'meatspace');

            assert.strictEqual(actor.system.initiative.perception, 'meatspace');
        });

        it('does not clean storage references when deleting an unlinked projected form', async () => {
            const actor = await createMagician();
            const { scene, body } = await createBody(actor, false);
            const form = await AstralProjectionFlow.project(body);
            assert.exists(form);
            if (!form) return;

            const originalCleanup = StorageFlow.deleteStorageReferences;
            let cleanupCalls = 0;
            StorageFlow.deleteStorageReferences = async () => { cleanupCalls += 1; };
            try {
                await body.delete();
                await waitFor(() => scene.tokens.size === 0);
            } finally {
                StorageFlow.deleteStorageReferences = originalCleanup;
            }

            assert.strictEqual(cleanupCalls, 1, 'only the deleted body cleans its actor storage');
        });

        it('invalidates linked projection membership when a token changes actors', async () => {
            const firstActor = await createMagician();
            const secondActor = await createMagician();
            const { body } = await createBody(firstActor);
            await body.setFlag(SYSTEM_NAME, FLAGS.AstralProjection, {
                role: 'body',
                requestId: 'actor-change',
                formTokenUuid: `${body.parent?.uuid}.Token.missing-form`,
                previous: {
                    sight: {},
                    detectionModes: {},
                    initiativeMode: 'meatspace',
                    resumeAstralPerception: false,
                },
            });

            assert.isTrue(ActorRollDataFlow.isAstrallyProjecting(firstActor as any));
            assert.isFalse(ActorRollDataFlow.isAstrallyProjecting(secondActor as any));

            await body.update({ actorId: secondActor.id });

            assert.isFalse(ActorRollDataFlow.isAstrallyProjecting(firstActor as any));
            assert.isTrue(ActorRollDataFlow.isAstrallyProjecting(secondActor as any));
        });

        it('keeps duplicate projection requests idempotent', async () => {
            const actor = await createMagician();
            const { scene, body } = await createBody(actor);

            const first = await AstralProjectionFlow.project(body, 'same-request');
            const second = await AstralProjectionFlow.project(body, 'same-request');

            assert.strictEqual(second, first);
            assert.strictEqual(scene.tokens.size, 2);
            await AstralProjectionFlow.returnToBody(body);
        });

        it('handles projection operations through the GM socket entry point', async () => {
            const actor = await createMagician();
            const { body } = await createBody(actor);

            await AstralProjectionFlow.handleSocketMessage(
                {
                    type: FLAGS.AstralProjectionOperation,
                    data: { action: 'project', tokenUuid: body.uuid, requestId: 'socket-request' },
                },
                game.user.id,
            );

            assert.strictEqual(AstralProjectionFlow.getState(body)?.role, 'body');
            await AstralProjectionFlow.returnToBody(body);
        });

        it('repairs an orphaned body during reload reconciliation', async () => {
            const actor = await createMagician();
            const { body } = await createBody(actor);
            const form = await AstralProjectionFlow.project(body);
            assert.exists(form);
            if (!form) return;

            await form.unsetFlag(SYSTEM_NAME, FLAGS.AstralProjection);
            await form.delete();
            await AstralProjectionFlow.reconcileWorld(true);

            assert.isUndefined(AstralProjectionFlow.getState(body));
            assert.isTrue(body.sight.enabled);
            assert.strictEqual(actor.system.initiative.perception, 'meatspace');
        });

        it('removes an orphaned form during reload reconciliation', async () => {
            const actor = await createMagician();
            const { scene, body } = await createBody(actor);
            const form = await AstralProjectionFlow.project(body);
            assert.exists(form);

            await body.unsetFlag(SYSTEM_NAME, FLAGS.AstralProjection);
            await body.delete();
            await AstralProjectionFlow.reconcileWorld(true);

            assert.strictEqual(scene.tokens.size, 0);
            assert.strictEqual(actor.system.initiative.perception, 'meatspace');
        });

        it('restores initiative when a projected scene is deleted', async () => {
            const actor = await createMagician();
            const { scene, body } = await createBody(actor);
            const form = await AstralProjectionFlow.project(body);
            assert.exists(form);

            await scene.delete();
            factory.scenes.splice(factory.scenes.indexOf(scene), 1);
            await waitFor(() => actor.system.initiative.perception === 'meatspace');

            assert.strictEqual(actor.system.initiative.perception, 'meatspace');
        });

        it('rolls back body state if form creation fails', async () => {
            const actor = await createMagician();
            const { scene, body } = await createBody(actor);
            const originalCreate = scene.createEmbeddedDocuments;
            (scene as any).createEmbeddedDocuments = async () => {
                throw new Error('Expected projection creation failure');
            };

            let rejected = false;
            try {
                await AstralProjectionFlow.project(body);
            } catch {
                rejected = true;
            } finally {
                (scene as any).createEmbeddedDocuments = originalCreate;
            }

            assert.isTrue(rejected);
            assert.isUndefined(body.getFlag(SYSTEM_NAME, FLAGS.AstralProjection));
            assert.isTrue(body.sight.enabled);
            assert.strictEqual(actor.system.initiative.perception, 'meatspace');
        });
    });
};
