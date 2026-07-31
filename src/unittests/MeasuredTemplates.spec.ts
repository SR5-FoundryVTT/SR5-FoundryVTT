import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { getWeaponRangeCircleLayout } from '../module/WeaponRangeMeasuredTemplate';
import { hasValidWeaponRanges } from '../module/flows/MeasuredTemplateFlow';
import { RangesTemplateType } from '../module/types/template/Weapon';

export const measuredTemplateTesting = (context: QuenchBatchContext) => {
    const { describe, it } = context;
    const assert: Chai.AssertStatic = context.assert;

    describe('Weapon range template layout', () => {
        const ranges: RangesTemplateType = {
            short: { label: 'Short', distance: 5, modifier: 0 },
            medium: { label: 'Medium', distance: 10, modifier: -1 },
            long: { label: 'Long', distance: 20, modifier: -3 },
            extreme: { label: 'Extreme', distance: 40, modifier: -6 },
        };

        it('places each weapon range and modifier at all four corners', () => {
            const layout = getWeaponRangeCircleLayout(ranges, 10, 'm');

            assert.deepEqual(layout.map(circle => circle.radius), [50, 100, 200, 400]);
            assert.deepEqual(layout.map(circle => circle.borderLabel), [
                'Short: 5 m',
                'Medium: 10 m',
                'Long: 20 m',
                'Extreme: 40 m',
            ]);
            assert.deepEqual(layout.map(circle => circle.modifierLabel), ['0', '-1', '-3', '-6']);
            assert.deepEqual(layout.map(circle => circle.borderPositions.length), [4, 4, 4, 4]);
            assert.deepEqual(layout.map(circle => circle.modifierPositions.length), [4, 4, 4, 4]);
            assert.approximately(Math.hypot(layout[0].borderPositions[0].x, layout[0].borderPositions[0].y), 50, 0.001);
            assert.approximately(Math.hypot(layout[0].borderPositions[3].x, layout[0].borderPositions[3].y), 50, 0.001);
            assert.approximately(Math.hypot(layout[0].modifierPositions[0].x, layout[0].modifierPositions[0].y), 25, 0.001);
            assert.approximately(Math.hypot(layout[1].modifierPositions[1].x, layout[1].modifierPositions[1].y), 75, 0.001);
            assert.approximately(Math.hypot(layout[2].modifierPositions[2].x, layout[2].modifierPositions[2].y), 150, 0.001);
            assert.approximately(Math.hypot(layout[3].modifierPositions[3].x, layout[3].modifierPositions[3].y), 300, 0.001);
        });

        it('accepts ascending, non-zero weapon ranges only', () => {
            assert.isTrue(hasValidWeaponRanges(ranges));
            assert.isFalse(hasValidWeaponRanges({
                ...ranges,
                long: { ...ranges.long, distance: 8 },
            }));
            assert.isFalse(hasValidWeaponRanges({
                ...ranges,
                extreme: { ...ranges.extreme, distance: 0 },
            }));
        });
    });
};
