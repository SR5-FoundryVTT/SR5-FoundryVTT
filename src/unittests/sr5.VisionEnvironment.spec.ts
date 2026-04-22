import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { FLAGS } from '@/module/constants';
import { isBlockedBySR5Templates, isBlockedBySR5Walls } from '@/module/vision/losHelpers';

type WallFlags = {
    wallType?: string;
    matrixBlocked?: boolean;
};

const createWall = (coords: [number, number, number, number], flags: WallFlags = {}) => ({
    document: {
        c: coords,
        flags: {
            shadowrun5e: {
                [FLAGS.WallType]: flags.wallType,
                [FLAGS.WallMatrixBlocked]: flags.matrixBlocked,
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
        it('applies astral wall blocking for window and mana barrier walls', () => {
            const origin = { x: 0, y: 0 };
            const target = { x: 10, y: 0 };

            const windowWall = createWall([5, -5, 5, 5], { wallType: 'window' });
            const manaWall = createWall([7, -5, 7, 5], { wallType: 'manaBarrier' });

            assert.isTrue(isBlockedBySR5Walls(origin, target, 'astral', [windowWall]));
            assert.isTrue(isBlockedBySR5Walls(origin, target, 'astral', [manaWall]));
        });

        it('applies matrix wall blocking only for matrix barriers', () => {
            const origin = { x: 0, y: 0 };
            const target = { x: 10, y: 0 };

            const standardWall = createWall([5, -5, 5, 5], { wallType: 'standard' });
            const matrixBarrier = createWall([5, -5, 5, 5], { wallType: 'matrixBarrier' });
            const matrixBlockedFlag = createWall([5, -5, 5, 5], { matrixBlocked: true });

            assert.isFalse(isBlockedBySR5Walls(origin, target, 'matrix', [standardWall]));
            assert.isTrue(isBlockedBySR5Walls(origin, target, 'matrix', [matrixBarrier]));
            assert.isTrue(isBlockedBySR5Walls(origin, target, 'matrix', [matrixBlockedFlag]));
        });

        it('applies ultrasound wall blocking for standard and window walls only', () => {
            const origin = { x: 0, y: 0 };
            const target = { x: 10, y: 0 };

            const standardWall = createWall([5, -5, 5, 5], { wallType: 'standard' });
            const windowWall = createWall([6, -5, 6, 5], { wallType: 'window' });
            const manaWall = createWall([7, -5, 7, 5], { wallType: 'manaBarrier' });

            assert.isTrue(isBlockedBySR5Walls(origin, target, 'ultrasound', [standardWall]));
            assert.isTrue(isBlockedBySR5Walls(origin, target, 'ultrasound', [windowWall]));
            assert.isFalse(isBlockedBySR5Walls(origin, target, 'ultrasound', [manaWall]));
        });

        it('returns false when no SR5 blocking wall intersects the ray', () => {
            const origin = { x: 0, y: 0 };
            const target = { x: 10, y: 0 };
            const farWall = createWall([20, -5, 20, 5], { wallType: 'window' });

            assert.isFalse(isBlockedBySR5Walls(origin, target, 'astral', [farWall]));
            assert.isFalse(isBlockedBySR5Walls(origin, target, 'matrix', [farWall]));
            assert.isFalse(isBlockedBySR5Walls(origin, target, 'ultrasound', [farWall]));
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
            assert.isFalse(isBlockedBySR5Templates(origin, target, 'ultrasound', [thermalSmoke]));
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
