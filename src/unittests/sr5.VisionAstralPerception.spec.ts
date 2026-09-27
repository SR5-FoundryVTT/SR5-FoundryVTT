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
    shouldSuppressPhysicalLightVision,
} from '@/module/vision/astralPerception/astralVisibility';
import { SR5VisionSource } from '@/module/vision/SR5VisionSource';
import { SenseFilterResolver } from '@/module/vision/SenseFilterResolver';
import { AstralAuraFilter } from '@/module/vision/astralPerception/astralAuraFilter';
import { AstralBackgroundVisionShader } from '@/module/vision/astralPerception/astralShaders';
import { essenceBucket, getAstralTier } from '@/module/vision/astralPerception/astralSignature';
import { SR5TestFactory } from './utils';

/** A detection target whose actor has the given type, visibility targets, statuses and Essence. */
const astralTarget = (options: {
    type?: string;
    special?: string;
    physical?: boolean;
    hasAura?: boolean;
    astralActive?: boolean;
    affectedBySpell?: boolean;
    essence?: number;
    invisible?: boolean;
    actor?: boolean;
} = {}) => ({
    document: {
        actor: options.actor === false ? null : {
            type: options.type ?? 'character',
            system: {
                special: options.special ?? 'mundane',
                attributes: { essence: { value: options.essence ?? 6 } },
                visibilityChecks: {
                    targets: {
                        physical: { active: options.physical ?? true, thermographic: 'warm' },
                        astral: {
                            hasAura: options.hasAura ?? true,
                            astralActive: options.astralActive ?? false,
                            affectedBySpell: options.affectedBySpell ?? false,
                        },
                        matrix: { hasIcon: false, runningSilent: false },
                    },
                },
            },
            statuses: new Set(options.invisible ? [CONFIG.specialStatusEffects.INVISIBLE] : []),
        },
    },
}) as any;

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
                system: {
                    magic: { type: 'magician' },
                    visibilityChecks: { capabilities: { physical: { lowLight: true } } },
                },
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

            const isBlinded = Object.getOwnPropertyDescriptor(SR5VisionSource.prototype, 'isBlinded')?.get;
            assert.isFalse(isBlinded?.call({ data: { visionMode: ASTRAL_PERCEPTION_VISION_MODE } }));
            assert.strictEqual(CONFIG.Canvas.visionModes.astralPerception.canvas.shader,
                foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader);
        });

        it('renders the astral world always lit, grey and gently animated', () => {
            const visionMode = CONFIG.Canvas.visionModes.astralPerception as any;
            const { DISABLED } = foundry.canvas.perception.VisionMode.LIGHTING_VISIBILITY;
            for (const layer of ['background', 'illumination', 'coloration', 'darkness']) {
                assert.strictEqual(visionMode.lighting[layer].visibility, DISABLED, layer);
            }
            assert.isFalse(visionMode.vision.darkness.adaptive);
            assert.strictEqual(visionMode.vision.background.shader, AstralBackgroundVisionShader);
            assert.isBelow(visionMode.canvas.uniforms.saturation, 0, 'the physical world is faded');
            assert.isTrue(visionMode.animated);

            const isAnimated = Object.getOwnPropertyDescriptor(SR5VisionSource.prototype, 'isAnimated')?.get;
            // photosensitiveMode is a getter reading a client setting, so shadow it on the canvas instance.
            Object.defineProperty(canvas, 'photosensitiveMode', { value: true, configurable: true });
            try {
                assert.isFalse(isAnimated?.call({ data: { visionMode: ASTRAL_PERCEPTION_VISION_MODE } }));
            } finally {
                delete (canvas as any).photosensitiveMode;
            }
        });

        it('sorts targets into the astral tiers of SR5#312', () => {
            assert.strictEqual(getAstralTier(astralTarget({ type: 'spirit', physical: false, astralActive: true })), 'form');
            assert.strictEqual(getAstralTier(astralTarget({ astralActive: true })), 'awakened');
            assert.strictEqual(getAstralTier(astralTarget({ special: 'magic' })), 'awakened');
            assert.strictEqual(getAstralTier(astralTarget()), 'aura');
            assert.strictEqual(getAstralTier(astralTarget({ hasAura: false, affectedBySpell: true })), 'aura');
            assert.strictEqual(getAstralTier(astralTarget({ type: 'vehicle', hasAura: false })), 'shadow');
            assert.strictEqual(getAstralTier(astralTarget({ actor: false })), 'shadow', 'a token without an actor');
            assert.isNull(getAstralTier(astralTarget({ type: 'sprite', physical: false, hasAura: false })));

            assert.strictEqual(essenceBucket({ system: { attributes: { essence: { value: 1.8 } } } }), 2);
            assert.strictEqual(essenceBucket({ system: { attributes: { essence: { value: 0.1 } } } }), 1);
            assert.strictEqual(essenceBucket({ system: {} }), 6);
        });

        it('sees non-living things as shadows and auras through invisibility', () => {
            const mode = new AstralPerceptionDetectionMode({
                id: 'astralPerception',
                label: 'Astral Perception',
                type: foundry.canvas.perception.DetectionMode.DETECTION_TYPES.SIGHT,
            });
            const astral = { visionMode: { id: ASTRAL_PERCEPTION_VISION_MODE } } as any;
            const physical = { visionMode: { id: 'basic' } } as any;

            assert.isTrue((mode as any)._canDetect(astral, astralTarget({ type: 'vehicle', hasAura: false })));
            assert.isTrue((mode as any)._canDetect(astral, astralTarget({ invisible: true })));
            assert.isFalse((mode as any)._canDetect(astral, astralTarget({ type: 'sprite', physical: false, hasAura: false })));
            assert.isFalse((mode as any)._canDetect(physical, astralTarget()));
        });

        it('draws each astral tier with its own shared aura, dimmed by Essence', () => {
            const shadow = AstralAuraFilter.forSignature('shadow') as any;
            const full = AstralAuraFilter.forSignature('aura', 6) as any;
            const chromed = AstralAuraFilter.forSignature('aura', 1) as any;
            const form = AstralAuraFilter.forSignature('form', 1) as any;

            assert.strictEqual(AstralAuraFilter.forSignature('aura', 6), full, 'filters are shared');
            assert.strictEqual(form, AstralAuraFilter.forSignature('form', 6), 'astral forms have no Essence to lose');
            assert.strictEqual(shadow.outerStrength, 0, 'shadows have no aura');
            assert.isBelow(shadow.uniforms.spriteAlpha, 1, 'shadows are faded');
            assert.isBelow(chromed.outerStrength, full.outerStrength, 'cyberware thins an aura');
            assert.isAbove(chromed.outerStrength, 0, 'even a thin aura shows');
            assert.isAbove(form.outerStrength, full.outerStrength, 'astral forms outshine auras');
            assert.isAtLeast(form.padding, form.uniforms.distance, 'the halo fits its padding');

            const marker = AstralPerceptionDetectionMode.getDetectionFilter()!;
            assert.strictEqual(SenseFilterResolver.resolve(astralTarget({ essence: 1 }) as Token, marker), chromed);
            assert.strictEqual(
                SenseFilterResolver.resolve(astralTarget({ type: 'vehicle', hasAura: false }) as Token, marker),
                shadow,
            );
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
