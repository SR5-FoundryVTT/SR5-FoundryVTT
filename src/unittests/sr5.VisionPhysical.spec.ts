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
import AstralPerceptionDetectionMode from '@/module/vision/astralPerception/astralPerceptionDetectionMode';
import { SR5Token } from '@/module/token/SR5Token';

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
                physical: { active: true, thermographic: 'warm' },
                astral: { hasAura: true, astralActive: false, affectedBySpell: false },
                matrix: { hasIcon: true, runningSilent: false },
            },
        },
        ...changes,
    },
    effects: [],
    items: [],
});

const target = (active = true, invisible = false, thermographic = 'warm') =>
    ({
        document: {
            actor: {
                system: {
                    visibilityChecks: {
                        targets: { physical: { active, thermographic } },
                    },
                },
                statuses: new Set(invisible ? [CONFIG.specialStatusEffects.INVISIBLE] : []),
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
        it('derives only the canonical metatype senses', () => {
            for (const metatype of ['elf', 'ork']) {
                const senses = PerceptionResolver.resolve(actorData(metatype)).physical;
                assert.isTrue(senses.lowLight, metatype);
                assert.isFalse(senses.thermographic, metatype);
            }
            for (const metatype of ['dwarf', 'troll']) {
                const senses = PerceptionResolver.resolve(actorData(metatype)).physical;
                assert.isFalse(senses.lowLight, metatype);
                assert.isTrue(senses.thermographic, metatype);
            }

            const custom = PerceptionResolver.resolve(actorData('custom')).physical;
            assert.deepEqual(custom, { lowLight: false, thermographic: false, ultrasound: false });
        });

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

        it('outlines tokens that astral perception or ultrasound vision would leave unlit', function () {
            if (!canvas.ready) this.skip();

            const effects = canvas.effects as any;
            const originalSources = effects.visionSources;
            const sources = (...modes: string[]) => {
                effects.visionSources = modes.map(id => ({ active: true, visionMode: { id } }));
            };
            const filter = () => (SR5Token as any).nonOpticalSenseFilter();

            try {
                sources('ultrasound');
                assert.strictEqual(filter(), UltrasoundDetectionMode.getDetectionFilter());
                sources('astralPerception', 'astralPerception');
                assert.strictEqual(filter(), AstralPerceptionDetectionMode.getDetectionFilter());
                sources('basic');
                assert.isNull(filter(), 'normal vision renders tokens lit');
                sources('ultrasound', 'basic');
                assert.isNull(filter(), 'another source still lights the scene');
                sources();
                assert.isNull(filter());
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
            const expectedColors = {
                cold: [0.25, 0.5, 1, 1],
                warm: [1, 0.55, 0, 1],
                hot: [1, 0.1, 0, 1],
            };

            for (const [signature, color] of Object.entries(expectedColors)) {
                assert.isTrue((mode as any)._canDetect(visionSource(), target(true, false, signature)));
                const filter = ThermographicVisionDetectionMode.getDetectionFilter() as any;
                assert.instanceOf(filter, foundry.canvas.rendering.filters.GlowOverlayFilter);
                assert.deepEqual(Array.from(filter.uniforms.glowColor), color, signature);
            }

            assert.isFalse((mode as any)._canDetect(visionSource(), target(true, false, 'none')));
            assert.isUndefined(ThermographicVisionDetectionMode.getDetectionFilter());
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
};
