import { WeaponRangeOverlay } from '../WeaponRangeOverlay';
import { RangesTemplateType } from '../types/template/Weapon';

const RANGE_KEYS = ['short', 'medium', 'long', 'extreme'] as const;

export const hasValidWeaponRanges = (ranges: RangesTemplateType): boolean => {
    let previousDistance = 0;

    for (const key of RANGE_KEYS) {
        const distance = ranges[key].distance;
        if (!Number.isFinite(distance) || distance < previousDistance) return false;
        previousDistance = distance;
    }

    return previousDistance > 0;
};

/**
 * General handling of transient range overlays displayed during attack tests.
 */
export const MeasuredTemplateFlow = {
    showWeaponRanges(token: TokenDocument, ranges: RangesTemplateType): WeaponRangeOverlay | undefined {
        if (!canvas.ready) return;
        if (!hasValidWeaponRanges(ranges)) {
            ui.notifications?.warn('SR5.Warnings.InvalidWeaponRanges', { localize: true });
            return;
        }

        const position = token.object?.center;
        if (!position) {
            ui.notifications?.warn('SR5.TargetingNeedsActorWithToken', { localize: true });
            return;
        }
        const origin = { x: position.x, y: position.y };

        const overlay = new WeaponRangeOverlay(ranges);

        try {
            overlay.drawAt(origin);
            return overlay;
        } catch (error) {
            if (error) console.error('Shadowrun 5e | Could not render weapon range preview', error);
            overlay.remove();
        }
    },
};