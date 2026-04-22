import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { FLAGS } from '@/module/constants';
import { ensureSR5PlaceablePlanes } from '@/module/environment/placeablePlanes';
import {
    filterSR5PlaceablesByPlane,
    getSR5PlaneAwareLights,
    getSR5PlaneAwareTiles,
    isBlockedBySR5Templates,
    isBlockedBySR5Walls,
    isSR5PlaceableOnPlane,
} from '@/module/vision/losHelpers';

type WallFlags = {
    wallType?: string;
    matrixBlocked?: boolean;
    planes?: {
        physical?: boolean;
        astral?: boolean;
        matrix?: boolean;
    };
};

const createWall = (coords: [number, number, number, number], flags: WallFlags = {}) => ({
    document: {
        getFlag: (_scope: string, key: string) => {
            if (key !== FLAGS.PlaceablePlanes) {
                return undefined;
            }

            return flags.planes;
        },
        c: coords,
        flags: {
            shadowrun5e: {
                [FLAGS.WallType]: flags.wallType,
                [FLAGS.WallMatrixBlocked]: flags.matrixBlocked,
            },
        },
    },
});

type PlaceableFlags = {
    planes?: {
        physical?: boolean;
        astral?: boolean;
        matrix?: boolean;
    };
};

const createPlaceable = (flags: PlaceableFlags = {}) => ({
    document: {
        getFlag: (_scope: string, key: string) => {
            if (key !== FLAGS.PlaceablePlanes) {
                return undefined;
            }

            return flags.planes;
        },
        flags: {
            shadowrun5e: {
                [FLAGS.PlaceablePlanes]: flags.planes,
            },
        },
    },
});

type TemplateFlags = {
    isVisualSmoke?: boolean;
    isThermalSmoke?: boolean;
};

const createTemplate = (flags: TemplateFlags, contains: (point: { x: number; y: number }) => boolean) => ({
    document: {
        flags: {
            shadowrun5e: {
                [FLAGS.TemplateIsVisualSmoke]: flags.isVisualSmoke,
                [FLAGS.TemplateIsThermalSmoke]: flags.isThermalSmoke,
            },
        },
    },
    testPoint: contains,
});

export const shadowrunVisionEnvironment = (context: QuenchBatchContext) => {
    const { describe, it } = context;
    const assert: Chai.AssertStatic = context.assert;

    describe('VisionEnvironment', () => {
        it('normalizes missing placeable plane flags to defaults', () => {
            const planes = ensureSR5PlaceablePlanes(undefined);

            assert.deepEqual(planes, {
                physical: true,
                astral: true,
                matrix: false,
            });
        });

        it('keeps explicit placeable plane flags when all values are provided', () => {
            const planes = ensureSR5PlaceablePlanes({
                [FLAGS.PlanePhysical]: false,
                [FLAGS.PlaneAstral]: true,
                [FLAGS.PlaneMatrix]: true,
            });

            assert.deepEqual(planes, {
                physical: false,
                astral: true,
                matrix: true,
            });
        });

        it('applies astral wall blocking for window and mana barrier walls', () => {
            const origin = { x: 0, y: 0 };
            const target = { x: 10, y: 0 };

            const windowWall = createWall([5, -5, 5, 5], { wallType: 'window' });
            const manaWall = createWall([7, -5, 7, 5], { wallType: 'manaBarrier' });

            assert.isTrue(isBlockedBySR5Walls(origin, target, 'astral', 'astral', [windowWall]));
            assert.isTrue(isBlockedBySR5Walls(origin, target, 'astral', 'astral', [manaWall]));
        });

        it('applies physical wall blocking for standard and window walls only', () => {
            const origin = { x: 0, y: 0 };
            const target = { x: 10, y: 0 };

            const standardWall = createWall([5, -5, 5, 5], { wallType: 'standard', planes: { physical: true } });
            const windowWall = createWall([6, -5, 6, 5], { wallType: 'window', planes: { physical: true } });
            const manaBarrier = createWall([7, -5, 7, 5], { wallType: 'manaBarrier', planes: { physical: true } });
            const matrixBarrier = createWall([8, -5, 8, 5], { wallType: 'matrixBarrier', planes: { physical: true } });

            assert.isTrue(isBlockedBySR5Walls(origin, target, 'physical', 'physical', [standardWall]));
            assert.isTrue(isBlockedBySR5Walls(origin, target, 'physical', 'physical', [windowWall]));
            assert.isFalse(isBlockedBySR5Walls(origin, target, 'physical', 'physical', [manaBarrier]));
            assert.isFalse(isBlockedBySR5Walls(origin, target, 'physical', 'physical', [matrixBarrier]));
        });

        it('applies matrix wall blocking only for matrix barriers', () => {
            const origin = { x: 0, y: 0 };
            const target = { x: 10, y: 0 };

            const standardWall = createWall([5, -5, 5, 5], { wallType: 'standard' });
            const matrixBarrier = createWall([5, -5, 5, 5], { wallType: 'matrixBarrier', planes: { matrix: true } });
            const matrixBlockedFlag = createWall([5, -5, 5, 5], { matrixBlocked: true, planes: { matrix: true } });

            assert.isFalse(isBlockedBySR5Walls(origin, target, 'matrix', 'matrix', [standardWall]));
            assert.isTrue(isBlockedBySR5Walls(origin, target, 'matrix', 'matrix', [matrixBarrier]));
            assert.isTrue(isBlockedBySR5Walls(origin, target, 'matrix', 'matrix', [matrixBlockedFlag]));
        });

        it('filters wall blockers by active plane flags', () => {
            const origin = { x: 0, y: 0 };
            const target = { x: 10, y: 0 };

            const astralOnlyWall = createWall([5, -5, 5, 5], {
                wallType: 'window',
                planes: { physical: false, astral: true, matrix: false },
            });
            const matrixOnlyWall = createWall([5, -5, 5, 5], {
                wallType: 'matrixBarrier',
                planes: { physical: false, astral: false, matrix: true },
            });

            assert.isTrue(isBlockedBySR5Walls(origin, target, 'astral', 'astral', [astralOnlyWall]));
            assert.isFalse(isBlockedBySR5Walls(origin, target, 'astral', 'physical', [astralOnlyWall]));
            assert.isTrue(isBlockedBySR5Walls(origin, target, 'matrix', 'matrix', [matrixOnlyWall]));
            assert.isFalse(isBlockedBySR5Walls(origin, target, 'matrix', 'astral', [matrixOnlyWall]));
        });

        it('returns false when no SR5 blocking wall intersects the ray', () => {
            const origin = { x: 0, y: 0 };
            const target = { x: 10, y: 0 };
            const farWall = createWall([20, -5, 20, 5], { wallType: 'window' });

            assert.isFalse(isBlockedBySR5Walls(origin, target, 'astral', 'astral', [farWall]));
            assert.isFalse(isBlockedBySR5Walls(origin, target, 'matrix', 'matrix', [farWall]));
        });

        it('evaluates single placeable plane presence correctly', () => {
            const astralOnly = createPlaceable({
                planes: {
                    physical: false,
                    astral: true,
                    matrix: false,
                },
            });

            assert.isTrue(isSR5PlaceableOnPlane(astralOnly.document, 'astral'));
            assert.isFalse(isSR5PlaceableOnPlane(astralOnly.document, 'physical'));
        });

        it('filters generic placeables by plane flag', () => {
            const placeables = [
                createPlaceable({ planes: { physical: true, astral: false, matrix: false } }),
                createPlaceable({ planes: { physical: false, astral: true, matrix: false } }),
                createPlaceable({ planes: { physical: false, astral: false, matrix: true } }),
            ];

            const astralOnly = filterSR5PlaceablesByPlane(placeables, 'astral');
            const matrixOnly = filterSR5PlaceablesByPlane(placeables, 'matrix');

            assert.equal(astralOnly.length, 1);
            assert.equal(matrixOnly.length, 1);
        });

        it('filters lights and tiles by plane with defaults applied', () => {
            const physicalDefault = createPlaceable();
            const matrixOnly = createPlaceable({ planes: { physical: false, astral: false, matrix: true } });

            const astralLights = getSR5PlaneAwareLights('astral', [physicalDefault, matrixOnly]);
            const matrixTiles = getSR5PlaneAwareTiles('matrix', [physicalDefault, matrixOnly]);

            assert.equal(astralLights.length, 1);
            assert.equal(matrixTiles.length, 1);
        });

        it('blocks lowlight through visual smoke templates', () => {
            const origin = { x: 0, y: 0 };
            const target = { x: 10, y: 0 };
            const visualSmoke = createTemplate({ isVisualSmoke: true }, point => point.x >= 4 && point.x <= 6 && point.y === 0);

            assert.isTrue(isBlockedBySR5Templates(origin, target, 'lowlight', [visualSmoke]));
            assert.isFalse(isBlockedBySR5Templates(origin, target, 'thermographic', [visualSmoke]));
        });

        it('blocks thermographic through thermal smoke templates', () => {
            const origin = { x: 0, y: 0 };
            const target = { x: 10, y: 0 };
            const thermalSmoke = createTemplate({ isThermalSmoke: true }, point => point.x >= 3 && point.x <= 8 && point.y === 0);

            assert.isTrue(isBlockedBySR5Templates(origin, target, 'thermographic', [thermalSmoke]));
            assert.isFalse(isBlockedBySR5Templates(origin, target, 'matrix', [thermalSmoke]));
        });

        it('ignores smoke templates when ray does not intersect', () => {
            const origin = { x: 0, y: 0 };
            const target = { x: 10, y: 0 };
            const offPathSmoke = createTemplate({ isVisualSmoke: true, isThermalSmoke: true }, point => point.y > 2);

            assert.isFalse(isBlockedBySR5Templates(origin, target, 'lowlight', [offPathSmoke]));
            assert.isFalse(isBlockedBySR5Templates(origin, target, 'thermographic', [offPathSmoke]));
        });
    });
};
