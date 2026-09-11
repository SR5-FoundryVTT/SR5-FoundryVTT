import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { DataDefaults } from '@/module/data/DataDefaults';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import { TestCreator } from '@/module/tests/TestCreator';
import { AttributeOnlyTest } from '@/module/tests/AttributeOnlyTest';
import { PerceptionFlow } from '@/module/vision/PerceptionFlow';
import {
    ASTRAL_PERCEPTION_STATUS,
    ASTRAL_PERCEPTION_VISION_MODE,
    AstralPerceptionFlow,
} from '@/module/vision/astralPerception/AstralPerceptionFlow';
import AstralPerceptionDetectionMode from '@/module/vision/astralPerception/astralPerceptionDetectionMode';
import {
    AstralVisionSource,
    shouldSuppressPhysicalLightVision,
} from '@/module/vision/astralPerception/astralVisibility';
import { SR5TestFactory } from './utils';

export const shadowrunVisionAstralPerception = (context: QuenchBatchContext) => {
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;
    const factory = new SR5TestFactory({ skipDefaultSkills: true });

    after(async () => { await factory.destroy(); });

    describe('Astral perception', () => {
        it('uses resolved eligibility, including GM overrides', async () => {
            const magician = await factory.createActor({
                type: 'character',
                system: { magic: { type: 'magician' } },
            });
            const mundane = await factory.createActor({
                type: 'character',
                system: { magic: { type: 'mundane' } },
            });
            const overridden = await factory.createActor({
                type: 'character',
                system: { magic: { type: 'mundane', astralPerceptionOverride: 'allow' } },
            });

            assert.isTrue(AstralPerceptionFlow.canPerceive(magician));
            assert.isFalse(AstralPerceptionFlow.canPerceive(mundane));
            assert.isTrue(AstralPerceptionFlow.canPerceive(overridden));
        });

        it('enables astral rendering and makes the actor dual-natured', async () => {
            const actor = await factory.createActor({
                type: 'character',
                system: { magic: { type: 'magician' } },
            });
            const scene = await factory.createScene({});
            const [token] = await scene.createEmbeddedDocuments('Token', [{
                actorId: actor.id,
                actorLink: true,
                sight: { enabled: false, visionMode: 'basic', range: 12, color: '#112233' },
                detectionModes: { customSense: { enabled: true, range: 7 } },
            }]);

            assert.isTrue(await AstralPerceptionFlow.enable(token));
            assert.isTrue(AstralPerceptionFlow.isActive(token));
            assert.strictEqual(token.sight.visionMode, ASTRAL_PERCEPTION_VISION_MODE);
            assert.isTrue(token.sight.enabled);
            assert.isTrue(token.detectionModes.astralPerception.enabled);
            assert.isFalse(token.detectionModes.basicSight.enabled);
            assert.isTrue(actor.statuses.has(ASTRAL_PERCEPTION_STATUS));
            assert.isTrue(actor.system.visibilityChecks.targets.astral.astralActive);
        });

        it('restores prior vision and then reconciles current automatic senses', async () => {
            const actor = await factory.createActor({
                type: 'character',
                system: { metatype: 'elf', magic: { type: 'magician' } },
            });
            const scene = await factory.createScene({});
            const [token] = await scene.createEmbeddedDocuments('Token', [{
                actorId: actor.id,
                actorLink: true,
                sight: { enabled: false, visionMode: 'basic', range: 23, color: '#334455' },
                detectionModes: { customSense: { enabled: true, range: 9 } },
            }]);

            await AstralPerceptionFlow.enable(token);
            assert.isFalse(await AstralPerceptionFlow.disable(token));

            assert.isFalse(token.sight.enabled);
            assert.strictEqual(token.sight.visionMode, 'basic');
            assert.strictEqual(token.sight.range, 23);
            assert.strictEqual(token.sight.color?.toString(), '#334455');
            assert.isTrue(token.detectionModes.customSense.enabled);
            assert.isTrue(token.detectionModes.lowlight.enabled);
            assert.isUndefined(token.detectionModes.astralPerception);
            assert.isFalse(actor.statuses.has(ASTRAL_PERCEPTION_STATUS));
            assert.isFalse(actor.system.visibilityChecks.targets.astral.astralActive);
        });

        it('applies the -2 penalty to physical actions but excludes Matrix actions', async () => {
            const actor = await factory.createActor({
                type: 'character',
                system: {
                    magic: { type: 'magician' },
                    attributes: { body: { base: 5 } },
                },
            });
            await actor.toggleStatusEffect(ASTRAL_PERCEPTION_STATUS, { active: true });

            const poolFor = async (categories: Shadowrun.ActionCategories[]) => {
                const action = DataDefaults.createData('action_roll', {
                    test: AttributeOnlyTest.name,
                    attribute: 'body',
                    categories,
                });
                const test = await TestCreator.fromAction(action, actor, { showDialog: false, showMessage: false });
                if (!test) throw new Error('Failed to create astral perception penalty test.');
                test.prepareTestCategories();
                test.effects.applyAllEffects();
                ModifiableValue.calcTotal(test.pool, { min: 0 });
                return test.pool.value;
            };

            assert.strictEqual(await poolFor([]), 3);
            assert.strictEqual(await poolFor(['matrix']), 5);
        });

        it('uses astral rendering independently of darkness and optical blindness', async () => {
            const mode = new AstralPerceptionDetectionMode({
                id: 'astralPerception',
                label: 'Astral Perception',
                walls: true,
                type: foundry.canvas.perception.DetectionMode.DETECTION_TYPES.SIGHT,
            });
            const source = { visionMode: { id: ASTRAL_PERCEPTION_VISION_MODE }, blinded: { darkness: true, blind: true } } as any;
            const actor = await factory.createActor({ type: 'character' });
            const scene = await factory.createScene({});
            const [token] = await scene.createEmbeddedDocuments('Token', [{ actorId: actor.id, actorLink: true }]);
            assert.isTrue((mode as any)._canDetect(source, { document: token }));
            assert.isTrue(mode.walls);

            const isBlinded = Object.getOwnPropertyDescriptor(AstralVisionSource.prototype, 'isBlinded')?.get;
            assert.isFalse(isBlinded?.call({ data: { visionMode: ASTRAL_PERCEPTION_VISION_MODE } }));
            assert.strictEqual(CONFIG.Canvas.visionModes.astralPerception.canvas.shader,
                foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader);
        });

        it('suppresses physical light shortcuts for astral-only vision', () => {
            const astralSource = { active: true, visionMode: { id: ASTRAL_PERCEPTION_VISION_MODE } } as any;
            const physicalSource = { active: true, visionMode: { id: 'basic' } } as any;
            assert.isTrue(shouldSuppressPhysicalLightVision(null, [astralSource]));
            assert.isFalse(shouldSuppressPhysicalLightVision(null, [astralSource, physicalSource]));

            const modes = PerceptionFlow.reconcileAstralDetectionModes({
                basicSight: { enabled: true, range: 30 },
                ultrasound: { enabled: true, range: 50 },
                customSense: { enabled: true, range: 12 },
            }, 10000);
            assert.isFalse(modes.basicSight.enabled);
            assert.isUndefined(modes.ultrasound);
            assert.isTrue(modes.astralPerception.enabled);
            assert.isTrue(modes.customSense.enabled);
        });
    });
};
