import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import {
    ASTRAL_BARRIER_REGION_BEHAVIOR,
    ASTRAL_WARD_REGION_BEHAVIOR,
} from '@/module/vision/astralRegions/AstralRegionBehavior';
import { AstralRegionFlow } from '@/module/vision/astralRegions/AstralRegionFlow';
import { DataDefaults } from '@/module/data/DataDefaults';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import { SR5TestFactory } from './utils';

type AstralBoundaryType = typeof ASTRAL_BARRIER_REGION_BEHAVIOR | typeof ASTRAL_WARD_REGION_BEHAVIOR;

const rectangle = (x: number, y: number, width: number, height: number, hole = false) => ({
    type: 'rectangle' as const,
    x,
    y,
    width,
    height,
    rotation: 0,
    hole,
});

export const shadowrunVisionAstralRegions = (context: QuenchBatchContext) => {
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;
    const factory = new SR5TestFactory({ skipDefaultSkills: true });

    after(async () => factory.destroy());

    const createScene = () => factory.createScene({
        width: 1000,
        height: 1000,
        grid: { type: CONST.GRID_TYPES.SQUARE, size: 100, distance: 5, units: 'm' },
    });

    const createBoundary = async (
        scene: Scene.Stored,
        type: AstralBoundaryType = ASTRAL_BARRIER_REGION_BEHAVIOR,
        system: Partial<{ blockSight: boolean; blockMovement: boolean; force: number; allowedActors: string[] }> = {},
        shapes: RegionDocument.CreateData['shapes'] = [rectangle(300, 0, 200, 800)],
        elevation = { bottom: 0, top: 20 },
    ) => {
        const [region] = await scene.createEmbeddedDocuments('Region', [{ name: '#QUENCH', shapes, elevation }]);
        const [behavior] = await region.createEmbeddedDocuments('RegionBehavior', [{ type, system }]);
        return { region, behavior };
    };

    const createToken = async (scene: Scene.Stored, x: number, y: number, astral = false) => {
        const actor = await factory.createActor({ type: 'character', system: {} });
        const [token] = await scene.createEmbeddedDocuments('Token', [{ actorId: actor.id, actorLink: true, x, y }]);
        if (astral) {
            await token.setFlag(SYSTEM_NAME, FLAGS.AstralProjection, {
                role: 'form',
                bodyTokenId: 'missing-body',
                previousInitiativeMode: 'meatspace',
            });
        }
        return token;
    };

    describe('Astral Regions', () => {
        it('registers barriers and wards that block movement but not sight by default', async () => {
            assert.exists(CONFIG.RegionBehavior.dataModels[ASTRAL_BARRIER_REGION_BEHAVIOR]);
            assert.exists(CONFIG.RegionBehavior.dataModels[ASTRAL_WARD_REGION_BEHAVIOR]);

            const scene = await createScene();
            for (const type of [ASTRAL_BARRIER_REGION_BEHAVIOR, ASTRAL_WARD_REGION_BEHAVIOR] as const) {
                const { behavior } = await createBoundary(scene, type);
                const system = behavior.system as any;
                assert.isFalse(system.blockSight);
                assert.isTrue(system.blockMovement);
                assert.strictEqual(system.force, 1);
                assert.strictEqual(system.allowedActors.size, 0);
            }
        });

        it('applies sight and movement switches independently and immediately after edits', async () => {
            const scene = await createScene();
            const { behavior } = await createBoundary(scene, ASTRAL_BARRIER_REGION_BEHAVIOR, {
                blockSight: true,
                blockMovement: false,
            });
            const origin = { x: 100, y: 100, elevation: 10 };
            const destination = { x: 700, y: 100, elevation: 10 };
            assert.isTrue(AstralRegionFlow.blocksSight(scene, origin, destination));

            const unblockedForm = await createToken(scene, 100, 100, true);
            assert.isTrue(await unblockedForm.move({ x: 700, y: 100 }));
            assert.strictEqual(unblockedForm.x, 700);

            await behavior.update({ system: { blockSight: false, blockMovement: true } });
            assert.isFalse(AstralRegionFlow.blocksSight(scene, origin, destination));

            const form = await createToken(scene, 100, 100, true);
            assert.isFalse(await form.move({ x: 700, y: 100 }));
            assert.strictEqual(form.x, 100);
        });

        it('blocks astral boundary crossings but allows movement wholly inside', async () => {
            const scene = await createScene();
            await createBoundary(scene);
            const crossingForm = await createToken(scene, 100, 100, true);
            const interiorForm = await createToken(scene, 320, 300, true);

            assert.isFalse(await crossingForm.move({ x: 700, y: 100 }));
            assert.strictEqual(crossingForm.x, 100);
            assert.isTrue(await interiorForm.move({ x: 380, y: 300 }));
            assert.strictEqual(interiorForm.x, 380);
        });

        it('does not constrain physical token movement', async () => {
            const scene = await createScene();
            await createBoundary(scene);
            const physical = await createToken(scene, 100, 100);

            assert.isTrue(await physical.move({ x: 700, y: 100 }));
            assert.strictEqual(physical.x, 700);
        });

        it('respects holes and elevation', async () => {
            const scene = await createScene();
            await createBoundary(
                scene,
                ASTRAL_WARD_REGION_BEHAVIOR,
                { blockSight: true },
                [rectangle(200, 0, 500, 700), rectangle(300, 100, 300, 300, true)],
                { bottom: 10, top: 20 },
            );

            assert.isFalse(AstralRegionFlow.blocksSight(
                scene,
                { x: 350, y: 200, elevation: 15 },
                { x: 550, y: 200, elevation: 15 },
            ), 'sight contained within a hole does not cross the ward');
            assert.isFalse(AstralRegionFlow.blocksSight(
                scene,
                { x: 100, y: 500, elevation: 5 },
                { x: 800, y: 500, elevation: 5 },
            ), 'sight outside the elevation range ignores the ward');
            assert.isTrue(AstralRegionFlow.blocksSight(
                scene,
                { x: 100, y: 500, elevation: 15 },
                { x: 800, y: 500, elevation: 15 },
            ));
        });

        it('ignores disabled behaviors and uses edited Region geometry', async () => {
            const scene = await createScene();
            const { region, behavior } = await createBoundary(scene, ASTRAL_BARRIER_REGION_BEHAVIOR, { blockSight: true });
            const origin = { x: 100, y: 700, elevation: 10 };
            const destination = { x: 800, y: 700, elevation: 10 };
            assert.isTrue(AstralRegionFlow.blocksSight(scene, origin, destination));

            await behavior.update({ disabled: true });
            assert.isFalse(AstralRegionFlow.blocksSight(scene, origin, destination));

            await behavior.update({ disabled: false });
            await region.update({ shapes: [rectangle(300, 0, 200, 200)] });
            assert.isFalse(AstralRegionFlow.blocksSight(scene, origin, destination));
        });

        it('blocks teleporting movement actions that hop over a boundary', async () => {
            const scene = await createScene();
            await createBoundary(scene);
            const form = await createToken(scene, 100, 100, true);

            assert.isFalse(await form.move({ x: 700, y: 100, action: 'blink' }));
            assert.strictEqual(form.x, 100);
        });

        it('lets unconstrained movement through, the same as walls', async () => {
            const scene = await createScene();
            await createBoundary(scene);
            const form = await createToken(scene, 100, 100, true);

            assert.isTrue(await form.move({ x: 700, y: 100 }, { constrainOptions: { ignoreWalls: true } } as any));
            assert.strictEqual(form.x, 700);
        });

        it('lets allowed actors see and move through a boundary', async () => {
            const scene = await createScene();
            const creator = await createToken(scene, 100, 100, true);
            const stranger = await createToken(scene, 100, 300, true);
            await createBoundary(scene, ASTRAL_WARD_REGION_BEHAVIOR, {
                blockSight: true,
                allowedActors: [creator.baseActor!.uuid],
            });
            const origin = { x: 150, y: 150, elevation: 0 };
            const destination = { x: 750, y: 150, elevation: 0 };

            assert.isFalse(AstralRegionFlow.blocksSight(scene, origin, destination, creator));
            assert.isTrue(AstralRegionFlow.blocksSight(scene, origin, destination, stranger));
            assert.strictEqual(AstralRegionFlow.sightPenalty(scene, origin, destination, creator), 0);
            assert.isTrue(await creator.move({ x: 700, y: 100 }));
            assert.isFalse(await stranger.move({ x: 700, y: 300 }));
        });

        it('blocks spirits and other purely astral actors', async () => {
            const scene = await createScene();
            await createBoundary(scene);
            const spiritActor = await factory.createActor({ type: 'spirit', system: {} });
            const [spirit] = await scene.createEmbeddedDocuments('Token', [{
                actorId: spiritActor.id,
                actorLink: true,
                x: 100,
                y: 100,
            }]);

            assert.isTrue(spirit.actor!.system.visibilityChecks.targets.astral.astralActive);
            assert.isFalse(spirit.actor!.system.visibilityChecks.targets.physical.active);
            assert.isFalse(await spirit.move({ x: 700, y: 100 }));
            assert.strictEqual(spirit.x, 100);
        });

        it('does not block a physically present dual-natured actor', async () => {
            const scene = await createScene();
            await createBoundary(scene);
            const dualNatured = await createToken(scene, 100, 100);
            await dualNatured.actor!.update({
                'system.visibilityChecks.targets.astral.astralActive': true,
            } as any);

            assert.isTrue(dualNatured.actor!.system.visibilityChecks.targets.physical.active);
            assert.isTrue(dualNatured.actor!.system.visibilityChecks.targets.astral.astralActive);
            assert.isTrue(await dualNatured.move({ x: 700, y: 100 }));
            assert.strictEqual(dualNatured.x, 700);
        });

        it('applies crossed barrier Force to targeted Assensing tests', async () => {
            const scene = await createScene();
            await createBoundary(scene, ASTRAL_BARRIER_REGION_BEHAVIOR, { force: 3 });
            await createBoundary(
                scene,
                ASTRAL_WARD_REGION_BEHAVIOR,
                { force: 2 },
                [rectangle(600, 0, 100, 800)],
            );
            const viewer = await createToken(scene, 100, 100, true);
            const target = await createToken(scene, 800, 100, true);
            const origin = { x: 150, y: 150, elevation: 0 };
            const destination = { x: 850, y: 150, elevation: 0 };

            assert.strictEqual(AstralRegionFlow.sightPenalty(scene, origin, destination, viewer), 5);
            assert.isFalse(AstralRegionFlow.blocksSight(scene, origin, destination, viewer),
                'Force applies even when complete sight blocking is disabled');

            const pool = DataDefaults.createData('value_field', { base: 10, label: 'Assensing' });
            AstralRegionFlow.applyAstralSightPenalty({
                actor: { getToken: () => viewer },
                targets: [target],
                data: { action: { skill: 'assensing' }, pool },
            } as any);
            assert.strictEqual(ModifiableValue.calcTotal(pool), 5);
            const forceChange = pool.changes.find(change =>
                change.name === 'SR5.Vision.AstralRegions.ForcePenalty');
            assert.exists(forceChange);
            assert.strictEqual(forceChange!.value, -5);
            assert.strictEqual(forceChange!.source, 'SR5 315');
        });

        it('tests detection from the vision source origin to the target point', async () => {
            const scene = await createScene();
            await createBoundary(scene, ASTRAL_BARRIER_REGION_BEHAVIOR, { blockSight: true });
            const viewer = await createToken(scene, 100, 100);
            const target = await createToken(scene, 700, 100);
            await target.update({ elevation: 100 });
            const visionSource = { object: { document: viewer }, origin: { x: 150, y: 150, elevation: 10 } } as any;
            const detect = (point: Record<string, number>) => AstralRegionFlow.blocksDetection(
                visionSource,
                { document: target } as any,
                { point } as any,
            );

            assert.isTrue(detect({ x: 750, y: 150, elevation: 10 }));
            assert.isFalse(detect({ x: 750, y: 150 }), 'a point without elevation uses the target elevation');
            assert.isFalse(AstralRegionFlow.blocksDetection(
                { object: null, origin: { x: 150, y: 150 } } as any,
                { document: target } as any,
                { point: { x: 750, y: 150, elevation: 10 } } as any,
            ), 'sources without a token are not constrained');
        });

        it('cuts movement paths short in front of a boundary', async () => {
            const scene = await createScene();
            await createBoundary(scene);
            const form = await createToken(scene, 100, 100, true);
            const path = [
                { x: 100, y: 100, elevation: 0 },
                { x: 700, y: 100, elevation: 0 },
            ] as any[];

            const constrained = AstralRegionFlow.constrainMovementPath(form, path);
            assert.exists(constrained);
            if (!constrained) return;
            assert.lengthOf(constrained, 2);
            const stop = constrained[1];
            // The token center crosses the boundary at x = 300, which is a top left x of 250.
            assert.isAbove(stop.x, 200);
            assert.isBelow(stop.x, 250);
            assert.isNull(AstralRegionFlow.constrainMovementPath(form, constrained));
            assert.isNull(AstralRegionFlow.constrainMovementPath(form, [path[0], { x: 200, y: 100, elevation: 0 }]));
        });
    });
};
