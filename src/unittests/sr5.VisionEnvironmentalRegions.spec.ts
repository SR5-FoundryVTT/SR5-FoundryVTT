import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import {
    ENVIRONMENT_REGION_BEHAVIOR,
    type EnvironmentalRegionType,
} from '@/module/types/regionBehavior/Environmental';
import { EnvironmentalRegionFlow } from '@/module/vision/environmentalRegions/EnvironmentalRegionFlow';
import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import { SuccessTest } from '@/module/tests/SuccessTest';
import { SR5TestFactory } from './utils';

const rectangle = (x: number, y: number, width: number, height: number, hole = false) => ({
    type: 'rectangle' as const,
    x,
    y,
    width,
    height,
    rotation: 0,
    hole,
});

const environment = (
    overrides: Partial<EnvironmentalRegionType> = {},
): EnvironmentalRegionType => ({
    backgroundCount: 0,
    matrixNoise: 0,
    visibility: 'none',
    light: 'none',
    glare: 'none',
    wind: 'none',
    ...overrides,
});

export const shadowrunVisionEnvironmentalRegions = (context: QuenchBatchContext) => {
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;
    const factory = new SR5TestFactory({ skipDefaultSkills: true });

    after(async () => factory.destroy());

    const createScene = () => factory.createScene({
        width: 1200,
        height: 1000,
        grid: { type: CONST.GRID_TYPES.SQUARE, size: 100, distance: 5, units: 'm' },
    });

    const createRegion = async (
        scene: Scene.Stored,
        system: Partial<EnvironmentalRegionType> = {},
        shapes: RegionDocument.CreateData['shapes'] = [rectangle(0, 0, 600, 600)],
        elevation = { bottom: 0, top: 20 },
        levels: string[] = [],
    ) => {
        const [region] = await scene.createEmbeddedDocuments('Region', [{ name: '#QUENCH', shapes, elevation, levels }]);
        const [behavior] = await region.createEmbeddedDocuments('RegionBehavior', [{
            type: ENVIRONMENT_REGION_BEHAVIOR,
            system,
        }]);
        return { region, behavior };
    };

    const createToken = async (
        scene: Scene.Stored,
        actorId: string,
        x: number,
        y: number,
        elevation = 0,
        actorLink = true,
    ) => {
        const [token] = await scene.createEmbeddedDocuments('Token', [{ actorId, actorLink, x, y, elevation }]);
        return token;
    };

    describe('Environmental Regions', () => {
        it('registers one behavior with safe defaults and constrained fields', async () => {
            assert.exists(CONFIG.RegionBehavior.dataModels[ENVIRONMENT_REGION_BEHAVIOR]);

            const scene = await createScene();
            const { region, behavior } = await createRegion(scene);
            assert.deepInclude(behavior.system as any, environment());

            const [constrained] = await region.createEmbeddedDocuments('RegionBehavior', [{
                type: ENVIRONMENT_REGION_BEHAVIOR,
                system: environment({ backgroundCount: -1, matrixNoise: 1.5 }),
            }]);
            const data = constrained.system as any;
            assert.strictEqual(data.backgroundCount, 0);
            assert.isTrue(Number.isInteger(data.matrixNoise));

            const invalid = await region.createEmbeddedDocuments('RegionBehavior', [{
                type: ENVIRONMENT_REGION_BEHAVIOR,
                system: environment({ visibility: 'invalid' as any }),
            }]);
            assert.isEmpty(invalid, 'unknown physical condition levels are rejected');
        });

        it('uses one behavior for all environmental fields and their distinct overlap rules', async () => {
            const scene = await createScene();
            const actor = await factory.createActor({ type: 'character', system: {} });
            const token = await createToken(scene, actor.id, 100, 100);
            await createRegion(scene, environment({
                backgroundCount: 2,
                matrixNoise: 3,
                visibility: 'moderate',
                light: 'light',
            }));
            await createRegion(scene, environment({
                backgroundCount: 5,
                matrixNoise: 4,
                visibility: 'light',
                wind: 'heavy',
            }));

            assert.deepEqual(EnvironmentalRegionFlow.ratingsAtToken(token), {
                backgroundCount: 5,
                matrixNoise: 7,
                physical: { visibility: -3, light: -1, glare: 0, wind: -6 },
            });
        });

        it('combines regional physical conditions through the existing SR5 environmental table', async () => {
            const scene = await createScene();
            const actor = await factory.createActor({
                type: 'character',
                system: { situation_modifiers: { environmental: { active: { visibility: -1, wind: -3 } } } },
            });
            const token = await createToken(scene, actor.id, 100, 100);
            await createRegion(scene, environment({ visibility: 'moderate', light: 'light', wind: 'light' }));

            const modifiers = actor.getSituationModifiers(token);
            assert.strictEqual(modifiers.getTotalFor('environmental', { reapply: true }), -6);
            assert.deepInclude(modifiers.environmental.applied.active, { visibility: -3, light: -1, wind: -3 });
            assert.notProperty(modifiers.source.environmental.active, 'region');
            assert.notProperty(actor.system.situation_modifiers.environmental.active, 'region');
        });

        it('lets existing sense effects compensate regional physical conditions', async () => {
            const scene = await createScene();
            const actor = await factory.createActor({ type: 'character', system: {} });
            const token = await createToken(scene, actor.id, 100, 100);
            await createRegion(scene, environment({ light: 'moderate' }));
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: '#QUENCH Low Light Vision',
                system: {
                    targets: [{ id: 'm', applyTo: 'modifier' }],
                    changes: [{ key: 'environmental.low_light_vision', value: '1', type: 'custom', target: 'm' }],
                },
            }]);

            const modifiers = actor.getSituationModifiers(token);
            assert.strictEqual(modifiers.getTotalFor('environmental', { reapply: true }), 0);
            assert.strictEqual(modifiers.environmental.applied.active.light, 0);
        });

        it('lets senses compensate regional light but not glare', async () => {
            const scene = await createScene();
            const actor = await factory.createActor({
                type: 'character',
                system: { visibilityChecks: { capabilities: { physical: { lowLight: true } } } },
            });
            const token = await createToken(scene, actor.id, 100, 100);
            const { behavior } = await createRegion(scene, environment({ light: 'moderate' }));

            const modifiers = actor.getSituationModifiers(token);
            assert.strictEqual(modifiers.getTotalFor('environmental', { reapply: true }), 0, 'low-light vision compensates dim light');

            await behavior.update({ system: { light: 'none', glare: 'moderate' } });
            assert.strictEqual(modifiers.getTotalFor('environmental', { reapply: true }), -3, 'low-light does not help against glare');
            assert.strictEqual(modifiers.environmental.applied.active.glare, -3);
        });

        it('uses the exact source token and does not persist ratings to a linked actor', async () => {
            const scene = await createScene();
            const actor = await factory.createActor({
                type: 'character',
                system: {
                    situation_modifiers: {
                        background_count: { active: { value: -1 } },
                        noise: { active: { value: -2 } },
                    },
                },
            });
            const inside = await createToken(scene, actor.id, 100, 100);
            const outside = await createToken(scene, actor.id, 800, 100);
            await createRegion(scene, environment({ backgroundCount: 3, matrixNoise: 4 }));

            const insideModifiers = actor.getSituationModifiers(inside);
            insideModifiers.applyAll();
            const outsideModifiers = actor.getSituationModifiers(outside);
            outsideModifiers.applyAll();

            assert.strictEqual(insideModifiers.background_count.total, -4);
            assert.strictEqual(insideModifiers.noise.total, -6);
            assert.strictEqual(outsideModifiers.background_count.total, -1);
            assert.strictEqual(outsideModifiers.noise.total, -2);
            assert.notProperty(actor.system.situation_modifiers.background_count.active, 'region');
            assert.notProperty(actor.system.situation_modifiers.noise.active, 'region');
        });

        it('updates an existing modifier context after token, behavior, and Region changes', async () => {
            const scene = await createScene();
            const actor = await factory.createActor({ type: 'character', system: {} });
            const token = await createToken(scene, actor.id, 100, 100);
            const { region, behavior } = await createRegion(scene, environment({ matrixNoise: 2 }));
            const modifiers = actor.getSituationModifiers(token);

            assert.strictEqual(modifiers.getTotalFor('noise'), -2);
            await behavior.update({ system: { matrixNoise: 5 } });
            assert.strictEqual(modifiers.getTotalFor('noise'), -5);
            await token.update({ x: 800 });
            assert.strictEqual(modifiers.getTotalFor('noise'), 0);
            await token.update({ x: 100 });
            await behavior.update({ disabled: true });
            assert.strictEqual(modifiers.getTotalFor('noise'), 0);
            await behavior.update({ disabled: false });
            assert.strictEqual(modifiers.getTotalFor('noise'), -5);
            await region.delete();
            assert.strictEqual(modifiers.getTotalFor('noise'), 0);
        });

        it('uses the token captured by a test through the normal actor modifier flow', async () => {
            const scene = await createScene();
            const actor = await factory.createActor({ type: 'character', system: {} });
            const inside = await createToken(scene, actor.id, 100, 100);
            await createToken(scene, actor.id, 800, 100);
            await createRegion(scene, environment({ matrixNoise: 3 }));

            const test = new SuccessTest({ sourceTokenUuid: inside.uuid! }, { actor });
            assert.strictEqual(test.sourceToken, inside);
            assert.strictEqual(actor.modifiers.totalFor('noise', { test, reapply: true }), -3);
        });

        it('measures background count at the astral form and noise at the body', async () => {
            const scene = await createScene();
            const actor = await factory.createActor({ type: 'character', system: {} });
            const body = await createToken(scene, actor.id, 100, 100);
            const form = await createToken(scene, actor.id, 800, 800);
            const source = body.toObject();
            await body.setFlag(SYSTEM_NAME, FLAGS.AstralProjection, {
                role: 'body', formTokenId: form.id!,
                previous: {
                    sight: source.sight as Record<string, unknown>, detectionModes: source.detectionModes,
                    initiativeMode: 'meatspace', resumeAstralPerception: false,
                },
            });
            await form.setFlag(SYSTEM_NAME, FLAGS.AstralProjection, {
                role: 'form', bodyTokenId: body.id!, previousInitiativeMode: 'meatspace',
            });
            await createRegion(scene, environment({ matrixNoise: 4 }), [rectangle(0, 0, 400, 400)]);
            await createRegion(scene, environment({ backgroundCount: 6 }), [rectangle(700, 700, 400, 300)]);

            assert.deepInclude(EnvironmentalRegionFlow.ratingsAtToken(body), { backgroundCount: 6, matrixNoise: 4 });
            assert.deepInclude(EnvironmentalRegionFlow.ratingsAtToken(form), { backgroundCount: 6, matrixNoise: 4 });
        });

        it('respects Levels, Region holes, and elevation', async () => {
            const scene = await createScene();
            const [upper] = await scene.createEmbeddedDocuments('Level', [{
                name: '#QUENCH upper', elevation: { bottom: 0, top: 20 },
            }] as any);
            const actor = await factory.createActor({ type: 'character', system: {} });
            const onBaseLevel = await createToken(scene, actor.id, 50, 50, 15);
            assert.notStrictEqual(onBaseLevel.level, upper.id);
            await createRegion(scene, environment({ matrixNoise: 4 }), undefined, undefined, [upper.id!]);
            assert.strictEqual(EnvironmentalRegionFlow.ratingsAtToken(onBaseLevel).matrixNoise, 0);

            await createRegion(
                scene,
                environment({ backgroundCount: 4, visibility: 'heavy' }),
                [rectangle(0, 0, 700, 700), rectangle(200, 200, 300, 300, true)],
                { bottom: 10, top: 20 },
            );
            const inHole = await createToken(scene, actor.id, 250, 250, 15);
            const belowRegion = await createToken(scene, actor.id, 50, 50, 5);

            assert.deepInclude(EnvironmentalRegionFlow.ratingsAtToken(onBaseLevel), {
                backgroundCount: 4,
                physical: { visibility: -6, light: 0, glare: 0, wind: 0 },
            });
            assert.strictEqual(EnvironmentalRegionFlow.ratingsAtToken(inHole).backgroundCount, 0);
            assert.strictEqual(EnvironmentalRegionFlow.ratingsAtToken(belowRegion).backgroundCount, 0);
        });
    });
};
