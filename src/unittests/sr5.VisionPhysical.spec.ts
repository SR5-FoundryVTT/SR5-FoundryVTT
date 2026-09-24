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

const SIGHT = foundry.canvas.perception.DetectionMode.DETECTION_TYPES.SIGHT;
const SOUND = foundry.canvas.perception.DetectionMode.DETECTION_TYPES.SOUND;

const actorData = (metatype: string, changes: Record<string, unknown> = {}): any => ({
    system: {
        metatype,
        visibilityChecks: {
            capabilities: {
                physical: { lowLight: false, thermographic: false, ultrasound: false },
                astral: { perception: false, projection: false },
                matrix: { perception: false },
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
    });
};
