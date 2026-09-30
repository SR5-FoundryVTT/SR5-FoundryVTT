import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { PerceptionFlow } from '@/module/vision/PerceptionFlow';
import { PerceptionResolver } from '@/module/vision/PerceptionResolver';
import LowlightVisionDetectionMode from '@/module/vision/lowlightVision/lowlightDetectionMode';
import ThermographicVisionDetectionMode from '@/module/vision/thermographicVision/thermographicDetectionMode';
import UltrasoundDetectionMode, {
    ULTRASOUND_RANGE_METERS,
} from '@/module/vision/ultrasoundVision/ultrasoundDetectionMode';
import { PhysicalSightDetectionMode } from '@/module/vision/physicalVision/physicalDetectionMode';
import { SR5TestFactory } from './utils';
import { BonusHelper } from '@/module/apps/itemImport/helper/BonusHelper';
import { SR5VisionSource } from '@/module/vision/SR5VisionSource';
import { ULTRASOUND_COLOR } from '@/module/vision/ultrasoundVision/ultrasoundShaders';
import { SenseFilterResolver } from '@/module/vision/SenseFilterResolver';
import { AstralAuraFilter } from '@/module/vision/astralPerception/astralAuraFilter';
import {
    ACCESSIBLE_HEAT_GLOWS,
    AccessibleHeatSignatureFilter,
    HEAT_GLOWS,
    type HeatSignature,
    HeatSignatureFilter,
} from '@/module/vision/thermographicVision/heatSignatureFilter';
import AugmentedRealityVisionDetectionMode, {
    AUGMENTED_REALITY_RANGE_METERS,
} from '@/module/vision/augmentedReality/arDetectionMode';
import AugmentedRealityFilter, { noiseBucket } from '@/module/vision/augmentedReality/arFilter';
import { getMatrixIconState } from '@/module/vision/augmentedReality/matrixIcon';
import { MatrixTraceFlow } from '@/module/vision/augmentedReality/MatrixTraceFlow';
import {
    PhysicalAllDetectionMode,
    PhysicalInvisibilityDetectionMode,
    PhysicalTremorDetectionMode,
} from '@/module/vision/physicalVision/coreDetectionModes';
import { shouldSuppressPhysicalLightVision } from '@/module/vision/astralPerception/astralVisibility';
import { MANIFEST_STATUS } from '@/module/vision/astralProjection/ManifestationState';

const SIGHT = foundry.canvas.perception.DetectionMode.DETECTION_TYPES.SIGHT;
const SOUND = foundry.canvas.perception.DetectionMode.DETECTION_TYPES.SOUND;

const actorData = (metatype: string, changes: Record<string, unknown> = {}): any => ({
    system: {
        metatype,
        visibilityChecks: {
            capabilities: {
                physical: { lowLight: false, thermographic: false, ultrasound: false },
                astral: { perception: false, projection: false },
            },
            targets: {
                physical: { hasBody: true, heatSignature: 'warm' },
                astral: { hasAura: true, astralActive: false, affectedBySpell: false },
                matrix: { hasIcon: true, runningSilent: false },
            },
        },
        ...changes,
    },
    effects: [],
    items: [],
});

const target = (hasBody = true, invisible = false, heatSignature = 'warm', manifesting = false) =>
    ({
        document: {
            actor: {
                system: {
                    visibilityChecks: {
                        targets: {
                            physical: { hasBody, heatSignature },
                            matrix: { hasIcon: true, runningSilent: false },
                        },
                    },
                },
                statuses: new Set([
                    ...(invisible ? [CONFIG.specialStatusEffects.INVISIBLE] : []),
                    ...(manifesting ? [MANIFEST_STATUS] : []),
                ]),
            },
        },
    }) as any;

/** An equipped item with the given wireless mode, like a commlink or smartgun. */
const wirelessItem = (wireless: string, type = 'device', category = 'commlink', equipped = true) =>
    ({ type, system: { category, technology: { equipped, wireless } } });

/** An actor carrying the given items, to work out its Matrix icon from. */
const iconActor = (
    items: unknown[],
    options: { type?: string; special?: string; matrix?: object; silent?: boolean } = {},
) => ({
    type: options.type ?? 'character',
    system: {
        special: options.special ?? 'mundane',
        matrix: { running_silent: !!options.silent },
        visibilityChecks: { targets: { matrix: { hasIcon: true, runningSilent: false, ...options.matrix } } },
    },
    items,
}) as any;

/** A persona with marks on, and traces of, the given icon uuids. */
const tracer = (traced: string[], marked: string[] = traced) => {
    const flags: Record<string, unknown> = { tracedIcons: traced };
    return {
        getFlag: (_scope: string, key: string) => flags[key],
        setFlag: async (_scope: string, key: string, value: unknown) => { flags[key] = value; },
        getMarksPlaced: (uuid: string) => marked.includes(uuid) ? 1 : 0,
        flags,
    };
};

/** A detection target carrying its persona on a commlink. */
const deviceTarget = (options: { invisible?: boolean; hasBody?: boolean } = {}) => ({
    document: {
        actor: {
            uuid: 'Actor.runner',
            hasActorPersona: () => false,
            getMatrixDevice: () => ({ uuid: 'Actor.runner.Item.commlink' }),
            system: {
                visibilityChecks: {
                    targets: {
                        physical: { hasBody: options.hasBody ?? true, heatSignature: 'warm' },
                        matrix: { hasIcon: true, runningSilent: false },
                    },
                },
            },
            statuses: new Set(options.invisible ? [CONFIG.specialStatusEffects.INVISIBLE] : []),
        },
    },
}) as any;

const visionSource = (darkness = false) =>
    ({
        blinded: { darkness },
        object: { document: { hasStatusEffect: () => false }, getLightRadius: (range: number) => range },
        visionMode: { id: 'basic' },
        data: { x: 0, y: 0, elevation: 0, angle: 360, rotation: 0, externalRadius: 0 },
        los: { config: { type: 'sight', angle: 360 } },
    }) as any;

export const shadowrunVisionPhysical = (context: QuenchBatchContext) => {
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;
    const factory = new SR5TestFactory({ skipDefaultSkills: true });

    after(async () => {
        await factory.destroy();
    });

    describe('Physical vision', () => {
        it('uses equipped item grants and ignores disabled effects and unequipped items', async () => {
            const actor = await factory.createActor({ type: 'character', system: { metatype: 'human' } });
            const [effect] = await actor.createEmbeddedDocuments('ActiveEffect', [
                {
                    name: '#QUENCH Disabled Ultrasound',
                    disabled: true,
                    system: {
                        targets: [{ id: 'actor', name: 'Actor', applyTo: 'actor' }],
                        changes: [
                            {
                                key: 'system.visibilityChecks.capabilities.physical.ultrasound',
                                type: 'override',
                                value: true,
                                target: 'actor',
                            },
                        ],
                    },
                },
            ]);
            const [item] = await actor.createEmbeddedDocuments('Item', [
                {
                    name: '#QUENCH Vision Equipment',
                    type: 'equipment',
                    system: { technology: { equipped: true } },
                    effects: [
                        {
                            name: '#QUENCH Optical Grants',
                            system: {
                                onlyForEquipped: true,
                                targets: [{ id: 'actor', name: 'Actor', applyTo: 'actor' }],
                                changes: [
                                    {
                                        key: 'system.visibilityChecks.capabilities.physical.lowLight',
                                        type: 'override',
                                        value: true,
                                        target: 'actor',
                                    },
                                    {
                                        key: 'system.visibilityChecks.capabilities.physical.thermographic',
                                        type: 'override',
                                        value: true,
                                        target: 'actor',
                                    },
                                ],
                            },
                        },
                    ],
                },
            ]);

            let senses = PerceptionResolver.resolve(actor).physical;
            assert.deepEqual(senses, { lowLight: true, thermographic: true, ultrasound: false });

            await effect.update({ disabled: false });
            senses = PerceptionResolver.resolve(actor).physical;
            assert.isTrue(senses.ultrasound);

            await item.update({ system: { technology: { equipped: false } } });
            senses = PerceptionResolver.resolve(actor).physical;
            assert.deepEqual(senses, { lowLight: false, thermographic: false, ultrasound: true });
        });

        it('grants senses from imported Chummer items, ware and gear only while equipped', async () => {
            const cyberware: any = { name: '#QUENCH Low-Light Vision', type: 'cyberware', system: { technology: { equipped: true } } };
            const quality: any = { name: '#QUENCH Thermographic Vision (SURGE)', type: 'quality', system: {} };
            const datajack: any = { name: '#QUENCH Datajack', type: 'cyberware', system: { technology: { equipped: true } } };
            BonusHelper.addSense(cyberware, '97910ef7-dc30-4a87-8314-d1e0021dc39c');
            BonusHelper.addSense(quality, 'fd346177-3791-44c0-af8c-7cf176fc9aa3');
            BonusHelper.addSense(datajack, '4ad2c7c3-8ae3-4e07-94e0-5ad0f1bb4cc6');
            assert.notProperty(datajack, 'effects', 'items without a sense get no effect');

            const actor = await factory.createActor({ type: 'character', system: { metatype: 'human' } });
            await actor.createEmbeddedDocuments('Item', [cyberware, quality]);
            // createEmbeddedDocuments doesn't return documents in request order.
            const ware = actor.items.getName(cyberware.name)!;
            let senses = PerceptionResolver.resolve(actor).physical;
            assert.isTrue(senses.lowLight);
            assert.isTrue(senses.thermographic);

            await ware.update({ system: { technology: { equipped: false } } });
            senses = PerceptionResolver.resolve(actor).physical;
            assert.isFalse(senses.lowLight, 'unequipped ware stops granting its sense');
            assert.isTrue(senses.thermographic, 'qualities always grant their sense');
        });

        it('registers a colorless ultrasound vision mode that ignores light', () => {
            const mode = CONFIG.Canvas.visionModes.ultrasound;
            assert.exists(mode);
            assert.isFalse(mode.perceivesLight);
            assert.strictEqual(mode.canvas.uniforms.saturation, -1);
            // Foundry's tremorsense wave shaders default to magenta.
            assert.deepEqual((mode.vision.background.shader as any).defaultUniforms.colorTint, ULTRASOUND_COLOR);
            assert.deepEqual((mode.vision.coloration.shader as any).defaultUniforms.colorEffect, ULTRASOUND_COLOR);

            const isBlinded = Object.getOwnPropertyDescriptor(SR5VisionSource.prototype, 'isBlinded')?.get;
            assert.isFalse(isBlinded?.call({ data: { visionMode: 'ultrasound' } }));

            const isAnimated = Object.getOwnPropertyDescriptor(SR5VisionSource.prototype, 'isAnimated')?.get;
            // photosensitiveMode is a getter reading a client setting, so shadow it on the canvas instance.
            Object.defineProperty(canvas, 'photosensitiveMode', { value: true, configurable: true });
            try {
                assert.isFalse(isAnimated?.call({ data: { visionMode: 'ultrasound' } }), 'sonar pings hold still');
            } finally {
                delete (canvas as any).photosensitiveMode;
            }
        });

        it('keeps the vision range for ultrasound vision and lets glass stop it', function () {
            if (!canvas.ready || !canvas.dimensions || !canvas.scene) this.skip();

            const source = (visionMode: string, radius: number) => {
                const vision = new SR5VisionSource() as any;
                Object.assign(vision.data, { x: 0, y: 0, elevation: 0, radius, externalRadius: 0, lightRadius: 0, visionMode });
                vision._initialize({});
                return vision;
            };
            // The GM sets how far the ultrasound view reaches through the token's vision range.
            const range = PerceptionFlow.metersToSceneUnits(500, canvas.scene!.grid.units) * canvas.dimensions!.distancePixels;
            const ultrasound = source('ultrasound', range);
            const basic = source('basic', range);

            assert.strictEqual(ultrasound.data.radius, range);
            assert.strictEqual(basic.data.radius, range);
            // Glass blocks movement but not sight, so ultrasound collides like movement does.
            assert.strictEqual(ultrasound._getPolygonConfiguration().type, 'move');
            assert.strictEqual(basic._getPolygonConfiguration().type, 'sight');
        });

        it('applies darkness and invisibility according to each physical sense', () => {
            const lowLight = new LowlightVisionDetectionMode({ id: 'lowlight', label: 'Low-Light', type: SIGHT });
            const thermographic = new ThermographicVisionDetectionMode({
                id: 'thermographic',
                label: 'Thermographic',
                type: SIGHT,
            });
            const ultrasound = new UltrasoundDetectionMode({ id: 'ultrasound', label: 'Ultrasound', type: SOUND });

            assert.isFalse((lowLight as any)._canDetect(visionSource(true), target()), 'low-light needs some light');
            assert.isTrue(
                (thermographic as any)._canDetect(visionSource(true), target()),
                'thermographic ignores darkness',
            );
            assert.isTrue((ultrasound as any)._canDetect(visionSource(true), target()), 'ultrasound ignores darkness');

            assert.isFalse(
                (lowLight as any)._canDetect(visionSource(), target(true, true)),
                'low-light cannot bypass invisibility',
            );
            assert.isFalse(
                (thermographic as any)._canDetect(visionSource(), target(true, true)),
                'thermographic cannot bypass invisibility',
            );
            assert.isTrue(
                (ultrasound as any)._canDetect(visionSource(), target(true, true)),
                'ultrasound detects physical shape',
            );
        });

        it('lets low-light vision see in any light short of total darkness', function () {
            if (!canvas.ready) this.skip();

            const lowLight = new LowlightVisionDetectionMode({ id: 'lowlight', label: 'Low-Light', type: SIGHT });
            const base = foundry.canvas.perception.DetectionMode.prototype as any;
            const effects = canvas.effects as any;
            const originalTestPoint = base._testPoint;
            let lit = false;
            let darkness = 1;
            base._testPoint = () => true;
            effects.testInsideLight = () => lit;
            effects.getDarknessLevel = () => darkness;
            const detects = () => (lowLight as any)._testPoint(visionSource(), {}, target(), {
                point: { x: 0, y: 0, elevation: 0 },
            });

            try {
                assert.isFalse(detects(), 'total darkness');
                darkness = 0.8;
                assert.isTrue(detects(), 'partial darkness');
                darkness = 1;
                lit = true;
                assert.isTrue(detects(), 'inside a light source');
            } finally {
                base._testPoint = originalTestPoint;
                delete effects.testInsideLight;
                delete effects.getDarknessLevel;
            }
        });

        it('draws tokens that astral projection or ultrasound vision would leave unlit', function () {
            if (!canvas.ready) this.skip();

            const effects = canvas.effects as any;
            const originalSources = effects.visionSources;
            const sources = (...modes: string[]) => {
                effects.visionSources = modes.map(id => ({ active: true, visionMode: { id } }));
            };
            const resolve = (detected: PIXI.Filter | null = null) => SenseFilterResolver.resolve(target(), detected);

            try {
                sources('ultrasound');
                assert.strictEqual(resolve(), UltrasoundDetectionMode.getDetectionFilter());
                sources('astralProjection', 'astralProjection');
                assert.strictEqual(resolve(), AstralAuraFilter.forSignature('shadow'), 'unlit things are grey shadows');
                sources('astralPerception');
                assert.isNull(resolve(), 'a perceiving body still sees the lit physical world');
                sources('basic');
                assert.isNull(resolve(), 'normal vision renders tokens lit');
                sources('ultrasound', 'basic');
                assert.isNull(resolve(), 'another source still lights the scene');
                sources('ultrasound', 'astralProjection');
                assert.isNull(resolve(), 'mixed non-optical senses share no look');
                sources();
                assert.isNull(resolve());

                const outline = UltrasoundDetectionMode.getDetectionFilter()!;
                sources('astralProjection');
                assert.strictEqual(resolve(outline), outline, 'a filter of another sense is kept');
            } finally {
                effects.visionSources = originalSources;
            }
        });

        it('uses signature-specific glow overlays for thermographic targets', () => {
            const mode = new ThermographicVisionDetectionMode({
                id: 'thermographic',
                label: 'Thermographic',
                type: SIGHT,
            });
            const marker = ThermographicVisionDetectionMode.getDetectionFilter();
            const signatures: HeatSignature[] = ['cold', 'warm', 'hot'];

            for (const signature of signatures) {
                const heatTarget = target(true, false, signature);
                assert.isTrue((mode as any)._canDetect(visionSource(), heatTarget));
                const filter = SenseFilterResolver.resolve(heatTarget, marker);
                assert.instanceOf(filter, HeatSignatureFilter);
                assert.strictEqual(filter, HeatSignatureFilter.forSignature(signature), `${signature} filter is shared`);
            }

            const [cold, warm, hot] = signatures.map(signature => HeatSignatureFilter.forSignature(signature, false)) as any[];
            for (const [index, signature] of signatures.entries()) {
                const filter = [cold, warm, hot][index];
                assert.notInstanceOf(filter, AccessibleHeatSignatureFilter, signature);
                assert.deepEqual(Array.from(filter.uniforms.glowColor), HEAT_GLOWS[signature].color, signature);
                assert.isTrue(filter.uniforms.knockout, `${signature} hides the art`);
                assert.isAtLeast(filter.padding, filter.uniforms.distance, `${signature} halo fits its padding`);
            }
            assert.isBelow(cold.uniforms.distance, warm.uniforms.distance, 'warm halo is wider than cold');
            assert.isBelow(warm.uniforms.distance, hot.uniforms.distance, 'hot halo is wider than warm');
            assert.isBelow(cold.outerStrength, warm.outerStrength, 'warm glows brighter than cold');
            assert.isBelow(warm.outerStrength, hot.outerStrength, 'hot glows brighter than warm');
            assert.isFalse(cold.animated, 'cold glow is steady');
            assert.isNull(cold.pulse);
            assert.isTrue(warm.animated && hot.animated, 'warm and hot glows pulse');
            assert.isBelow(hot.pulse.period, warm.pulse.period, 'hot pulses faster than warm');

            assert.isFalse((mode as any)._canDetect(visionSource(), target(true, false, 'none')));
            assert.isNull(HeatSignatureFilter.forTarget(target(true, false, 'none')));
        });

        it('reads thermographic signatures without color in photosensitive mode', () => {
            const signatures: HeatSignature[] = ['cold', 'warm', 'hot'];
            const [cold, warm, hot] = signatures.map(signature => HeatSignatureFilter.forSignature(signature, true)) as any[];

            for (const [index, signature] of signatures.entries()) {
                const filter = [cold, warm, hot][index];
                assert.instanceOf(filter, AccessibleHeatSignatureFilter, signature);
                assert.notStrictEqual(filter, HeatSignatureFilter.forSignature(signature, false), `${signature} has its own filter`);
                assert.deepEqual(Array.from(filter.uniforms.glowColor), ACCESSIBLE_HEAT_GLOWS[signature].color, signature);
                assert.isFalse(filter.animated, `${signature} is steady`);
                assert.isAtLeast(filter.padding, filter.uniforms.distance, `${signature} halo fits its padding`);
            }

            // More isotherms and a brighter color the hotter the signature.
            assert.deepEqual([cold, warm, hot].map(filter => filter.uniforms.bands), [1, 2, 3]);
            const luminance = (filter: any) => {
                const [r, g, b] = filter.uniforms.glowColor;
                return 0.2126 * r + 0.7152 * g + 0.0722 * b;
            };
            assert.isBelow(luminance(cold), luminance(warm), 'warm is brighter than cold');
            assert.isBelow(luminance(warm), luminance(hot), 'hot is brighter than warm');
        });

        it('uses a pulsing gray wave outline for ultrasound targets', () => {
            const filter = UltrasoundDetectionMode.getDetectionFilter() as any;

            assert.instanceOf(filter, foundry.canvas.rendering.filters.OutlineOverlayFilter);
            assert.deepEqual(Array.from(filter.uniforms.outlineColor), [0.75, 0.75, 0.75, 1]);
            assert.isTrue(filter.uniforms.knockout);
            assert.isTrue(filter.uniforms.wave);
            assert.isTrue(filter.animated);
        });

        it('prevents every physical mode from detecting a purely astral form', () => {
            const astralTarget = target(false, false, 'hot');
            const modes = [
                new PhysicalSightDetectionMode({ id: 'basicSight', label: 'Basic Sight', type: SIGHT }),
                new LowlightVisionDetectionMode({ id: 'lowlight', label: 'Low-Light', type: SIGHT }),
                new ThermographicVisionDetectionMode({ id: 'thermographic', label: 'Thermographic', type: SIGHT }),
                new UltrasoundDetectionMode({ id: 'ultrasound', label: 'Ultrasound', type: SOUND }),
            ];

            for (const mode of modes) assert.isFalse((mode as any)._canDetect(visionSource(), astralTarget), mode.id);
        });

        it("keeps augmented reality and Foundry's other senses off the astral plane", () => {
            const astralTarget = target(false, true);
            const physicalTarget = target(true, true);
            const astralViewer = { ...visionSource(), visionMode: { id: 'astralProjection' } };
            const tracingViewer = { ...visionSource(), object: { actor: tracer(['Actor.runner.Item.commlink']) } };
            const astralTracingViewer = { ...tracingViewer, visionMode: { id: 'astralProjection' } };
            const perceivingTracingViewer = { ...tracingViewer, visionMode: { id: 'astralPerception' } };
            const ar = new AugmentedRealityVisionDetectionMode({ id: 'augmentedReality', label: 'AR', type: SIGHT });
            const modes = [
                ar,
                new PhysicalInvisibilityDetectionMode({ id: 'seeInvisibility', label: 'See', type: SIGHT }),
                new PhysicalAllDetectionMode({ id: 'seeAll', label: 'All', type: SIGHT }),
                new PhysicalTremorDetectionMode({ id: 'feelTremor', label: 'Tremor', type: SIGHT }),
            ];

            assert.isTrue((ar as any)._canDetect(tracingViewer, deviceTarget()), 'AR shows a traced physical icon');
            assert.isFalse((ar as any)._canDetect(astralTracingViewer, deviceTarget()), 'not to a projected viewer');
            assert.isTrue(
                (ar as any)._canDetect(perceivingTracingViewer, deviceTarget()),
                'a perceiving viewer keeps its augmented reality',
            );
            assert.isFalse((ar as any)._canDetect(tracingViewer, deviceTarget({ hasBody: false })), 'nor off the plane');
            for (const mode of modes) {
                assert.isFalse((mode as any)._canDetect(visionSource(), astralTarget), mode.id);
                assert.isFalse((mode as any)._canDetect(astralViewer, physicalTarget), `${mode.id} astral viewer`);
            }
        });

        it('shows a manifesting being to eyes but not to technology', () => {
            const manifest = target(false, false, 'warm', true);
            const detects = (mode: foundry.canvas.perception.DetectionMode) =>
                (mode as any)._canDetect(visionSource(), manifest);

            assert.isTrue(detects(new PhysicalSightDetectionMode({ id: 'basicSight', label: 'Sight', type: SIGHT })));
            assert.isTrue(detects(new LowlightVisionDetectionMode({ id: 'lowlight', label: 'Low-Light', type: SIGHT })));
            assert.isFalse(detects(new ThermographicVisionDetectionMode({ id: 'thermographic', label: 'Thermo', type: SIGHT })));
            assert.isFalse(detects(new UltrasoundDetectionMode({ id: 'ultrasound', label: 'Ultrasound', type: SOUND })));
            assert.isFalse(detects(new AugmentedRealityVisionDetectionMode({ id: 'augmentedReality', label: 'AR', type: SIGHT })));
        });

        it('lets lights reveal a manifesting being', () => {
            const token = (manifesting: boolean) => Object.assign(
                Object.create(foundry.canvas.placeables.Token.prototype),
                target(false, false, 'warm', manifesting),
            );
            const physicalSource = { active: true, visionMode: { id: 'basic' } } as any;

            assert.isFalse(shouldSuppressPhysicalLightVision(token(true), [physicalSource]));
            assert.isTrue(shouldSuppressPhysicalLightVision(token(false), [physicalSource]));
        });

        it('uses a wall-aware, angle-independent physical collision for ultrasound', () => {
            const mode = new UltrasoundDetectionMode({
                id: 'ultrasound',
                label: 'Ultrasound',
                walls: true,
                angle: false,
                type: SOUND,
            });
            const originalCollision = (UltrasoundDetectionMode as any)._testCollision;
            let collisionConfig: Record<string, unknown> | undefined;
            (UltrasoundDetectionMode as any)._testCollision = (
                _source: unknown,
                _test: unknown,
                config: Record<string, unknown>,
            ) => {
                collisionConfig = config;
                return true;
            };

            try {
                assert.isFalse((mode as any)._testLOS(visionSource(), {}, target(), { point: { x: 10, y: 0 } }));
                assert.strictEqual(collisionConfig?.type, 'move', 'movement collision makes glass block ultrasound');
                assert.strictEqual(collisionConfig?.angle, 360);
                assert.isTrue(mode.walls);
                assert.isFalse(mode.angle);
            } finally {
                (UltrasoundDetectionMode as any)._testCollision = originalCollision;
            }
        });

        it('sets ultrasound to 50 m and honors the exact native range boundary', () => {
            const capabilities = PerceptionResolver.resolve(actorData('human'));
            capabilities.physical.ultrasound = true;
            const modes = PerceptionFlow.reconcileDetectionModes({}, capabilities, 10000, 'm');
            assert.deepEqual(modes.ultrasound, { enabled: true, range: ULTRASOUND_RANGE_METERS });
            assert.strictEqual(PerceptionFlow.metersToSceneUnits(50, 'km'), 0.05);

            const mode = new UltrasoundDetectionMode({ id: 'ultrasound', label: 'Ultrasound', type: SOUND });
            const config = { enabled: true, range: 50 };
            assert.isTrue(
                (mode as any)._testRange(visionSource(), config, target(), { point: { x: 50, y: 0, elevation: 0 } }),
            );
            assert.isFalse(
                (mode as any)._testRange(visionSource(), config, target(), { point: { x: 50.01, y: 0, elevation: 0 } }),
            );
        });

        it('keeps an ultrasound range the GM set on the token', () => {
            const capabilities = PerceptionResolver.resolve(actorData('human'));
            capabilities.physical.ultrasound = true;
            const reconcile = (ultrasound: { enabled: boolean; range: number | null }) =>
                PerceptionFlow.reconcileDetectionModes({ ultrasound }, capabilities, 10000, 'm').ultrasound;

            assert.deepEqual(reconcile({ enabled: true, range: 80 }), { enabled: true, range: 80 });
            assert.deepEqual(reconcile({ enabled: false, range: 80 }), { enabled: true, range: 80 });
            assert.deepEqual(reconcile({ enabled: true, range: null }), { enabled: true, range: ULTRASOUND_RANGE_METERS });
        });
    });

    describe('Augmented reality', () => {
        it('works out the Matrix icon from wireless devices, with the visibility targets as overrides', () => {
            const commlink = (wireless: string, equipped = true) => wirelessItem(wireless, 'device', 'commlink', equipped);
            const smartgun = wirelessItem('online', 'weapon', '');

            assert.strictEqual(getMatrixIconState(iconActor([])), 'none', 'nothing wireless, nothing in the Matrix');
            assert.strictEqual(getMatrixIconState(iconActor([commlink('online')])), 'visible');
            assert.strictEqual(getMatrixIconState(iconActor([commlink('silent')])), 'silent');
            assert.strictEqual(getMatrixIconState(iconActor([commlink('offline')])), 'none');
            assert.strictEqual(getMatrixIconState(iconActor([commlink('online', false)])), 'none', 'unequipped');
            assert.strictEqual(
                getMatrixIconState(iconActor([commlink('silent'), smartgun])),
                'visible',
                'a wireless weapon shows up apart from a silent PAN',
            );

            assert.strictEqual(getMatrixIconState(iconActor([commlink('online')], { matrix: { hasIcon: false } })), 'none');
            assert.strictEqual(
                getMatrixIconState(iconActor([commlink('online')], { matrix: { runningSilent: true } })),
                'silent',
            );

            assert.strictEqual(getMatrixIconState(iconActor([], { type: 'vehicle' })), 'visible', 'a vehicle is a device');
            assert.strictEqual(getMatrixIconState(iconActor([], { type: 'vehicle', silent: true })), 'silent');
            assert.strictEqual(getMatrixIconState(iconActor([], { special: 'resonance' })), 'visible', 'a living persona');
        });

        it('gives augmented reality to wireless commlink, cyberdeck and RCC users and technomancers', () => {
            const resolve = (items: unknown[], special = 'mundane') =>
                PerceptionResolver.resolve({ ...actorData('human', { special }), items }).matrix.augmentedReality;

            assert.isFalse(resolve([]));
            assert.isTrue(resolve([wirelessItem('online', 'device', 'commlink')]));
            assert.isTrue(resolve([wirelessItem('silent', 'device', 'cyberdeck')]));
            assert.isTrue(resolve([wirelessItem('online', 'device', 'rcc')]));
            assert.isFalse(resolve([wirelessItem('offline', 'device', 'commlink')]), 'wireless off');
            assert.isFalse(resolve([wirelessItem('online', 'device', 'commlink', false)]), 'not equipped');
            assert.isFalse(resolve([wirelessItem('online', 'weapon', '')]), 'a smartgun is no display');
            assert.isTrue(resolve([], 'resonance'));

            const granted = actorData('human');
            granted.system.visibilityChecks.capabilities.matrix = { augmentedReality: true };
            assert.isTrue(PerceptionResolver.resolve(granted).matrix.augmentedReality, 'an effect can grant it');
        });

        it('gives augmented reality a 100 m range the GM can change', () => {
            const capabilities = PerceptionResolver.resolve(actorData('human'));
            capabilities.matrix.augmentedReality = true;
            const reconcile = (existing: Record<string, { enabled: boolean; range: number | null }>) =>
                PerceptionFlow.reconcileDetectionModes(existing, capabilities, 10000, 'm').augmentedReality;

            assert.deepEqual(reconcile({}), { enabled: true, range: AUGMENTED_REALITY_RANGE_METERS });
            assert.deepEqual(reconcile({ augmentedReality: { enabled: true, range: 30 } }), { enabled: true, range: 30 });

            capabilities.matrix.augmentedReality = false;
            assert.notProperty(
                PerceptionFlow.reconcileDetectionModes({ augmentedReality: { enabled: true, range: 30 } }, capabilities, 10000),
                'augmentedReality',
            );
        });

        it('locates only traced icons, as long as a mark remains, through invisibility and at any range', () => {
            const ar = new AugmentedRealityVisionDetectionMode({ id: 'augmentedReality', label: 'AR', type: SIGHT });
            const viewer = (persona: ReturnType<typeof tracer>) => ({ ...visionSource(), object: { actor: persona } });
            const device = 'Actor.runner.Item.commlink';

            assert.isFalse((ar as any)._canDetect(viewer(tracer([])), deviceTarget()), 'spotting reveals no location');
            assert.isTrue((ar as any)._canDetect(viewer(tracer([device])), deviceTarget({ invisible: true })));
            assert.isFalse((ar as any)._canDetect(viewer(tracer([device], [])), deviceTarget()), 'without a mark');
            assert.isTrue((ar as any)._testRange(), 'a trace has no range');
            assert.strictEqual(AugmentedRealityVisionDetectionMode.getDetectionFilter(), AugmentedRealityFilter.located());
            assert.isTrue(AugmentedRealityFilter.located().locatesOnly, 'a located token shows as its marker');
        });

        it('stores traces on the icon marks land on and ends them with the last mark', async () => {
            const persona = tracer([], ['Actor.runner.Item.commlink', 'Actor.drone']);
            await MatrixTraceFlow.trace(persona, deviceTarget().document.actor);
            await MatrixTraceFlow.trace(persona, { uuid: 'Actor.drone' });
            assert.deepEqual(persona.flags.tracedIcons, ['Actor.runner.Item.commlink', 'Actor.drone']);

            const drone = { uuid: 'Actor.drone', hasActorPersona: () => true, getMatrixDevice: () => undefined };
            assert.isTrue(MatrixTraceFlow.isTraced(persona, drone));

            assert.deepEqual(
                MatrixTraceFlow.pruneUpdate(persona, [{ uuid: 'Actor.drone', marks: 2 }]),
                { 'flags.shadowrun5e.tracedIcons': ['Actor.drone'] },
            );
            assert.deepEqual(MatrixTraceFlow.pruneUpdate(persona, [
                { uuid: 'Actor.drone', marks: 1 },
                { uuid: 'Actor.runner.Item.commlink', marks: 3 },
            ]), {}, 'nothing to prune');
            assert.deepEqual(MatrixTraceFlow.pruneUpdate(tracer([]), []), {}, 'no traces, no update');
        });

        it('dims icon brackets with distance and garbles them with Matrix noise', () => {
            const near = AugmentedRealityFilter.forDistance(0) as any;
            const far = AugmentedRealityFilter.forDistance(1) as any;
            assert.strictEqual(AugmentedRealityFilter.forDistance(0.1), near, 'filters are shared');
            assert.isBelow(far.uniforms.intensity, near.uniforms.intensity);
            assert.isAbove(far.uniforms.intensity, 0);
            assert.isFalse(near.locatesOnly, 'brackets go over a token the viewer sees');
            assert.strictEqual(near.uniforms.silhouette, 1, 'the icon outlines its owner');
            assert.strictEqual(near.uniforms.crosshair, 0);
            assert.strictEqual(near.uniforms.dropout, 0, 'no noise, no dropout');
            assert.isFalse(near.animated, 'a clean icon holds still');

            const noisy = AugmentedRealityFilter.forDistance(0, noiseBucket(5)) as any;
            assert.notStrictEqual(noisy, near, 'noise has its own filter');
            assert.isAbove(noisy.uniforms.dropout, 0);
            assert.isTrue(noisy.animated);
            assert.deepEqual([0, 1, 3, 4, 6, 7, 20].map(noiseBucket), [0, 1, 1, 2, 2, 3, 3]);

            const locator = AugmentedRealityFilter.located() as any;
            assert.strictEqual(locator.uniforms.crosshair, 1, 'a traced icon shows a crosshair');
            assert.strictEqual(locator.uniforms.silhouette, 0, 'without its owner');
            assert.isAtLeast(locator.padding, locator.uniforms.pad, 'the brackets fit the padding');
        });

        it('stacks the icon brackets over the look of another sense', function () {
            if (!canvas.ready) this.skip();

            const effects = canvas.effects as any;
            const originalSources = effects.visionSources;
            const heatTarget = { ...deviceTarget(), center: { x: 0, y: 0 } };
            heatTarget.document.actor.type = 'character';
            heatTarget.document.actor.items = [wirelessItem('online')];
            const viewer = {
                actor: tracer([]),
                document: {
                    detectionModes: { augmentedReality: { enabled: true, range: null } },
                    getFlag: () => undefined,
                },
            };
            effects.visionSources = [{ active: true, visionMode: { id: 'basic' }, object: viewer, x: 0, y: 0 }];

            try {
                const heat = HeatSignatureFilter.forSignature('warm');
                const overlays = SenseFilterResolver.collectOverlays(heatTarget, heat, []);
                assert.deepEqual(overlays, [AugmentedRealityFilter.forDistance(0)], 'brackets go on top of the heat');

                const locator = AugmentedRealityFilter.located();
                assert.isEmpty(SenseFilterResolver.collectOverlays(heatTarget, locator, []), 'a locator stands alone');
            } finally {
                effects.visionSources = originalSources;
            }
        });
    });
};
