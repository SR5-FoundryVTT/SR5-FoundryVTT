import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { getScatterOffset, resolveScatterRoll } from '../module/rules/ScatterRules';

export const scatterRulesTesting = (context: QuenchBatchContext) => {
    const { describe, it } = context;
    const assert: Chai.AssertStatic = context.assert;

    describe('Scatter rules', () => {
        it('resolves the direction total and reduces distance by hits', () => {
            assert.deepEqual(resolveScatterRoll(9, 5, 2), {
                direction: 9,
                rolledDistance: 5,
                hits: 2,
                distance: 3,
            });
        });

        it('allows a zero final distance after hit reduction', () => {
            assert.deepEqual(resolveScatterRoll(7, 1, 1), {
                direction: 7,
                rolledDistance: 1,
                hits: 1,
                distance: 0,
            });
        });

        it('rejects values outside the 2d6 direction result', () => {
            assert.deepEqual(resolveScatterRoll(2, 5), {
                direction: 2,
                rolledDistance: 5,
                hits: 0,
                distance: 5,
            });
            assert.isUndefined(resolveScatterRoll(1, 4));
            assert.isUndefined(resolveScatterRoll(13, 4));
            assert.isUndefined(resolveScatterRoll(2, 0));
            assert.isUndefined(resolveScatterRoll(2, 5, -1));
        });

        it('converts direction 7 to the launch direction', () => {
            const result = resolveScatterRoll(7, 2)!;
            assert.closeTo(getScatterOffset(result, 10).x, 0, 0.0001);
            assert.closeTo(getScatterOffset(result, 10).y, -20, 0.0001);
        });

        it('keeps the distance in canvas pixels', () => {
            const result = resolveScatterRoll(9, 4)!;
            const offset = getScatterOffset(result, 10);

            assert.closeTo(offset.x, 34.641, 0.001);
            assert.closeTo(offset.y, -20, 0.001);
        });

        it('follows the SR5 scatter diagram bearings for every direction, relative to the launch direction', () => {
            // Bearings in degrees, measured clockwise from the launch direction (SR5#182 scatter diagram).
            const bearings: ReadonlyArray<readonly [number, number]> = [
                [2, 180], [3, 225], [4, 270], [5, 300], [6, 330],
                [7, 0],
                [8, 30], [9, 60], [10, 90], [11, 135], [12, 180],
            ];
            const launchAngle = -Math.PI / 2;

            for (const [direction, bearing] of bearings) {
                const result = resolveScatterRoll(direction, 3)!;
                const offset = getScatterOffset(result, 10, launchAngle);

                const angle = launchAngle + ((bearing * Math.PI) / 180);
                const distance = result.distance * 10;
                assert.closeTo(offset.x, Math.cos(angle) * distance, 0.0001, `direction ${direction}`);
                assert.closeTo(offset.y, Math.sin(angle) * distance, 0.0001, `direction ${direction}`);
            }
        });

        it('scatters directly opposite the launch direction for a roll of 2 or 12', () => {
            const launchAngle = 0; // launch pointing east
            const result2 = resolveScatterRoll(2, 3)!;
            const result12 = resolveScatterRoll(12, 3)!;

            const offset2 = getScatterOffset(result2, 10, launchAngle);
            const offset12 = getScatterOffset(result12, 10, launchAngle);

            assert.closeTo(offset2.x, -30, 0.0001);
            assert.closeTo(offset2.y, 0, 0.0001);
            assert.deepEqual(offset2, offset12);
        });

        it('scatters 135 degrees clockwise of the launch direction for a roll of 11', () => {
            const launchAngle = 0; // launch pointing east
            const result = resolveScatterRoll(11, 3)!;
            const offset = getScatterOffset(result, 10, launchAngle);

            assert.closeTo(offset.x, Math.cos((135 * Math.PI) / 180) * 30, 0.0001);
            assert.closeTo(offset.y, Math.sin((135 * Math.PI) / 180) * 30, 0.0001);
        });
    });
};
