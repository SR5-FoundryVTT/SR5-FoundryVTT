import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { DataDefaults } from '@/module/data/DataDefaults';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import { TestCreator } from '@/module/tests/TestCreator';
import { AttributeOnlyTest } from '@/module/tests/AttributeOnlyTest';
import { PerceptionFlow } from '@/module/vision/PerceptionFlow';
import { AstralPerceptionFlow } from '@/module/vision/astralPerception/AstralPerceptionFlow';
import {
    ASTRAL_PERCEPTION_STATUS,
    ASTRAL_PERCEPTION_VISION_MODE,
    ASTRAL_PROJECTION_VISION_MODE,
} from '@/module/vision/astralPerception/astralVisionModes';
import AstralPerceptionDetectionMode from '@/module/vision/astralPerception/astralPerceptionDetectionMode';
import {
    shouldSuppressPhysicalLightVision,
} from '@/module/vision/astralPerception/astralVisibility';
import { SR5VisionSource } from '@/module/vision/SR5VisionSource';
import { SenseFilterResolver } from '@/module/vision/SenseFilterResolver';
import { AccessibleAstralAuraFilter, AstralAuraFilter } from '@/module/vision/astralPerception/astralAuraFilter';
import {
    AstralBackgroundVisionShader,
    AstralPerceptionBackgroundVisionShader,
} from '@/module/vision/astralPerception/astralShaders';
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
            // SR5#312 the astral plane is overlaid on the physical one, so physical sight stays as it was.
            assert.isTrue(token.detectionModes.basicSight.enabled, 'physical sight keeps working');
            assert.strictEqual(token.sight.range, 12, 'without seeing farther in the dark');
            assert.isTrue(token.detectionModes.customSense.enabled);
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
            const actor = await factory.createActor({ type: 'character' });
            const scene = await factory.createScene({});
            const [token] = await scene.createEmbeddedDocuments('Token', [{ actorId: actor.id, actorLink: true }]);
            const isBlinded = Object.getOwnPropertyDescriptor(SR5VisionSource.prototype, 'isBlinded')?.get;
            for (const id of [ASTRAL_PERCEPTION_VISION_MODE, ASTRAL_PROJECTION_VISION_MODE]) {
                const source = { visionMode: { id }, blinded: { darkness: true, blind: true } } as any;
                assert.isTrue((mode as any)._canDetect(source, { document: token }), id);
                assert.isFalse(isBlinded?.call({ data: { visionMode: id } }), id);
            }
            assert.isTrue(mode.walls);
        });

        it('overlays the astral plane on the lit, colored physical world while perceiving', () => {
            const visionMode = CONFIG.Canvas.visionModes.astralPerception as any;
            const { ENABLED } = foundry.canvas.perception.VisionMode.LIGHTING_VISIBILITY;
            for (const layer of ['background', 'illumination', 'coloration', 'darkness']) {
                assert.strictEqual(visionMode.lighting[layer].visibility, ENABLED, layer);
            }
            assert.isFalse(visionMode.vision.darkness.adaptive, 'the fade shows in any light');
            assert.strictEqual(visionMode.vision.background.shader, AstralPerceptionBackgroundVisionShader);
            assert.isBelow(visionMode.canvas.uniforms.saturation, 0, 'the physical world is faded');
            assert.isAbove(
                visionMode.canvas.uniforms.saturation,
                (CONFIG.Canvas.visionModes.astralProjection as any).canvas.uniforms.saturation,
                'but keeps more color than the astral world alone',
            );
            assert.isTrue(visionMode.animated);
        });

        it('renders the astral world always lit, grey and gently animated while projecting', () => {
            const visionMode = CONFIG.Canvas.visionModes.astralProjection as any;
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
                assert.isFalse(isAnimated?.call({ data: { visionMode: ASTRAL_PROJECTION_VISION_MODE } }));
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
            const astral = { visionMode: { id: ASTRAL_PROJECTION_VISION_MODE } } as any;
            const physical = { visionMode: { id: 'basic' } } as any;

            assert.isTrue((mode as any)._canDetect(astral, astralTarget({ type: 'vehicle', hasAura: false })));
            assert.isTrue((mode as any)._canDetect(astral, astralTarget({ invisible: true })));
            assert.isFalse((mode as any)._canDetect(astral, astralTarget({ type: 'sprite', physical: false, hasAura: false })));
            assert.isFalse((mode as any)._canDetect(physical, astralTarget()));
        });

        it('draws each astral tier with its own shared aura, dimmed by Essence', () => {
            const classic = { accessible: false };
            const shadow = AstralAuraFilter.forSignature('shadow', 6, classic) as any;
            const full = AstralAuraFilter.forSignature('aura', 6, classic) as any;
            const chromed = AstralAuraFilter.forSignature('aura', 1, classic) as any;
            const awakened = AstralAuraFilter.forSignature('awakened', 6, classic) as any;
            const form = AstralAuraFilter.forSignature('form', 1, classic) as any;

            assert.notInstanceOf(full, AccessibleAstralAuraFilter);
            assert.strictEqual(AstralAuraFilter.forSignature('aura', 6, classic), full, 'filters are shared');
            assert.strictEqual(form, AstralAuraFilter.forSignature('form', 6, classic), 'astral forms have no Essence to lose');
            assert.strictEqual(shadow.outerStrength, 0, 'shadows have no aura');
            assert.isBelow(shadow.uniforms.spriteAlpha, 1, 'shadows are faded');
            assert.isBelow(chromed.outerStrength, full.outerStrength, 'cyberware thins an aura');
            assert.isAbove(chromed.outerStrength, 0, 'even a thin aura shows');
            assert.isAbove(form.outerStrength, full.outerStrength, 'astral forms outshine auras');
            assert.isAtLeast(form.padding, form.uniforms.distance, 'the halo fits its padding');
            assert.strictEqual(full.uniforms.rimStrength, 0, 'a living aura has no rim');
            assert.isAbove(awakened.uniforms.rimStrength, 0, 'Awakened auras carry a rim');
            assert.isAbove(form.uniforms.rimStrength, 0, 'astral forms carry a rim');

            const overlay = AstralAuraFilter.forSignature('aura', 6, { ...classic, overlay: true }) as any;
            assert.notStrictEqual(overlay, full, 'the overlay has its own filter');
            assert.isTrue(overlay.overlay);
            assert.strictEqual(overlay.uniforms.spriteAlpha, 0, 'the overlay leaves the physical sprite alone');
            assert.strictEqual(overlay.uniforms.distance, full.uniforms.distance, 'with the same aura');

            const marker = AstralPerceptionDetectionMode.getDetectionFilter()!;
            assert.strictEqual(
                SenseFilterResolver.resolve(astralTarget({ essence: 1 }) as Token, marker),
                AstralAuraFilter.forSignature('aura', 1),
            );
            assert.strictEqual(
                SenseFilterResolver.resolve(astralTarget({ type: 'vehicle', hasAura: false }) as Token, marker),
                AstralAuraFilter.forSignature('shadow'),
            );
        });

        it('tells astral tiers apart without color in photosensitive mode', () => {
            const accessible = { accessible: true };
            const full = AstralAuraFilter.forSignature('aura', 6, accessible) as any;
            const chromed = AstralAuraFilter.forSignature('aura', 1, accessible) as any;
            const awakened = AstralAuraFilter.forSignature('awakened', 6, accessible) as any;
            const form = AstralAuraFilter.forSignature('form', 6, accessible) as any;

            assert.instanceOf(full, AccessibleAstralAuraFilter);
            assert.notStrictEqual(full, AstralAuraFilter.forSignature('aura', 6, { accessible: false }), 'each look has its own filter');
            // Each tier above a plain aura adds a ring.
            assert.deepEqual([full, awakened, form].map(filter => filter.uniforms.rings), [0, 1, 2]);
            assert.isBelow(chromed.uniforms.distance, full.uniforms.distance, 'cyberware narrows the halo too');
            assert.isBelow(chromed.outerStrength, full.outerStrength, 'and dims it');
            assert.isAtLeast(form.padding, form.uniforms.distance, 'the halo fits its padding');

            const overlay = AstralAuraFilter.forSignature('aura', 6, { ...accessible, overlay: true }) as any;
            assert.instanceOf(overlay, AccessibleAstralAuraFilter);
            assert.strictEqual(overlay.uniforms.spriteAlpha, 0, 'the overlay leaves the physical sprite alone');
        });

        it('draws auras over tokens a perceiving viewer sees physically', function () {
            if (!canvas.ready) this.skip();

            const effects = canvas.effects as any;
            const originalSources = effects.visionSources;
            const astral = CONFIG.Canvas.detectionModes.astralPerception as any;
            let astrallyVisible = true;
            astral.testVisibility = () => astrallyVisible;
            const perceiving = (enabled = true) => ({
                active: true,
                visionMode: { id: ASTRAL_PERCEPTION_VISION_MODE },
                object: { document: { detectionModes: { astralPerception: { enabled, range: 10000 } } } },
            });
            const token = (options: Parameters<typeof astralTarget>[0] = {}) => {
                const target = astralTarget(options);
                target.document.getVisibilityTestPoints = () => [{ x: 0, y: 0, elevation: 0 }];
                return target as Token;
            };
            const overlays = (target: Token, primary: PIXI.Filter | null = null) =>
                SenseFilterResolver.collectOverlays(target, primary, []);

            try {
                effects.visionSources = [perceiving()];
                assert.deepEqual(overlays(token()), [AstralAuraFilter.forSignature('aura', 6, { overlay: true })]);
                assert.deepEqual(
                    overlays(token({ special: 'magic' })),
                    [AstralAuraFilter.forSignature('awakened', 6, { overlay: true })],
                );
                assert.isEmpty(overlays(token({ type: 'vehicle', hasAura: false })), 'no shadow over physical things');

                const aura = AstralAuraFilter.forSignature('aura');
                assert.isEmpty(overlays(token(), aura), 'a token seen only astrally already shows its aura');

                astrallyVisible = false;
                assert.isEmpty(overlays(token()), 'an astral boundary hides the aura');
                astrallyVisible = true;

                effects.visionSources = [perceiving(false)];
                assert.isEmpty(overlays(token()), 'without the astral sense');
                effects.visionSources = [{ active: true, visionMode: { id: 'basic' } }];
                assert.isEmpty(overlays(token()), 'nor to physical viewers');
            } finally {
                effects.visionSources = originalSources;
                delete astral.testVisibility;
            }
        });

        it('suppresses physical light shortcuts for projected vision only', () => {
            const astralSource = { active: true, visionMode: { id: ASTRAL_PROJECTION_VISION_MODE } } as any;
            const perceivingSource = { active: true, visionMode: { id: ASTRAL_PERCEPTION_VISION_MODE } } as any;
            const physicalSource = { active: true, visionMode: { id: 'basic' } } as any;
            assert.isTrue(shouldSuppressPhysicalLightVision(null, [astralSource]));
            assert.isFalse(shouldSuppressPhysicalLightVision(null, [astralSource, physicalSource]));
            assert.isFalse(shouldSuppressPhysicalLightVision(null, [perceivingSource]), 'perceiving still sees by light');

            const perceivingModes = PerceptionFlow.reconcilePerceivingDetectionModes({
                basicSight: { enabled: true, range: 30 },
                ultrasound: { enabled: true, range: 50 },
            }, 10000);
            assert.isTrue(perceivingModes.basicSight.enabled, 'a perceiving body keeps its physical senses');
            assert.isTrue(perceivingModes.ultrasound.enabled);
            assert.isTrue(perceivingModes.astralPerception.enabled);

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
