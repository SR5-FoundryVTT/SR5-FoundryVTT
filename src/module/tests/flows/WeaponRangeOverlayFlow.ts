import { TestDialogLike, TestDialogListener } from '../../apps/dialogs/TestDialog';
import { SR5Actor } from '../../actor/SR5Actor';
import { RangesTemplateType } from '../../types/template/Weapon';
import { WeaponRangeOverlay } from '../../regions/WeaponRangeOverlay';

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

interface WeaponRangeOverlayFlowHost {
    actor: SR5Actor | undefined
    data: {
        ranges: RangesTemplateType
    }
}

/**
 * Handles the transient weapon-range overlay shown from ranged attack dialogs.
 */
export class WeaponRangeOverlayFlow {
    #overlay?: WeaponRangeOverlay;

    constructor(private readonly test: WeaponRangeOverlayFlowHost) { }

    dialogListeners(): TestDialogListener[] {
        return [{
            query: '#show-weapon-ranges',
            on: 'click',
            callback: this.show.bind(this)
        }];
    }

    show(event: JQuery.Event, dialog: TestDialogLike) {
        event.preventDefault();
        event.stopPropagation();

        if (this.#overlay && !this.#overlay.destroyed) {
            this.remove();
            return;
        }
        this.#overlay = undefined;

        dialog.applyFormData?.();
        const token = this.test.actor?.getToken();
        if (!token) {
            ui.notifications?.warn('SR5.TargetingNeedsActorWithToken', { localize: true });
            return;
        }

        this.#overlay = WeaponRangeOverlayFlow.showWeaponRanges(token, this.test.data.ranges);
    }

    static showWeaponRanges(token: TokenDocument, ranges: RangesTemplateType): WeaponRangeOverlay | undefined {
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

        const overlay = new WeaponRangeOverlay(ranges);

        try {
            overlay.drawAt({ x: position.x, y: position.y });
            return overlay;
        } catch (error) {
            if (error) console.error('Shadowrun 5e | Could not render weapon range preview', error);
            overlay.remove();
        }
    }

    remove() {
        this.#overlay?.remove();
        this.#overlay = undefined;
    }
}
