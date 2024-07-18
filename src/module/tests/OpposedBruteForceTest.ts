import { SR5Actor } from '../actor/SR5Actor';
import { DataDefaults } from '../data/DataDefaults';
import { Helpers } from '../helpers';
import { SR5Item } from '../item/SR5Item';
import { NetworkDevice } from '../item/flows/MatrixNetworkFlow';
import { Translation } from '../utils/strings';
import { BruteForceTest } from './BruteForceTest';
import { OpposedTest } from "./OpposedTest";
import { MarkPlacementFlow } from './flows/MarkPlacementFlow';

export class OpposedBruteForceTest extends OpposedTest {
    override against: BruteForceTest;
    icon: NetworkDevice;
    persona: SR5Actor;

    override _prepareData(data: any, options?: any) {
        data = super._prepareData(data, options);
        return MarkPlacementFlow._prepareOpposedData(data, options);
    }

    override get _dialogTemplate() {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/opposing-mark-test-dialog.html';
    }

    override get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/rolls/opposing-mark-test-message.html';
    }

    override get successLabel(): Translation {
        return "SR5.TestResults.BruteForceFailure";
    }

    override get failureLabel(): Translation {
        return "SR5.TestResults.BruteForceSuccess";
    }

    override async populateDocuments() {
        if (this.against.data.iconUuid) {
            this.icon = await fromUuid(this.against.data.iconUuid) as SR5Item;
        }
    }
    
    /**
     * When failing against brute force, the decker gets a mark on the target and can deal damage.
     */
    override async processFailure() {
        // Prepare marks and target icon.
        const marks = this.against.data.marks;
        const target = this.icon;

        if (!target) {
            console.error('Shadowrun 5e | Expected a target icon to be set.');
            return;
        }

        await this.against.persona.setMarks(target, marks);

        // Setup optional damage value
        const damage = Math.floor(this.againstNetHits.value / 2);
        this.data.damage = DataDefaults.damageData({base: damage, type: {base: 'matrix', value: 'matrix'}});
        Helpers.calcTotal(this.data.damage);
    }
}