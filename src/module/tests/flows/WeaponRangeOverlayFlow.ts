import { TestDialogLike, TestDialogListener } from '../../apps/dialogs/TestDialog';
import { MeasuredTemplateFlow } from '../../flows/MeasuredTemplateFlow';
import { SR5Actor } from '../../actor/SR5Actor';
import { RangesTemplateType } from '../../types/template/Weapon';
import { WeaponRangeOverlay } from '../../regions/WeaponRangeOverlay';

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

        this.#overlay = MeasuredTemplateFlow.showWeaponRanges(token, this.test.data.ranges);
    }

    remove() {
        this.#overlay?.remove();
        this.#overlay = undefined;
    }
}
