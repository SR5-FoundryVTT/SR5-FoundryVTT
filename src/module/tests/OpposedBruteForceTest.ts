import { SR5Item } from './../item/SR5Item';
import { SR5Actor } from '../actor/SR5Actor';
import { DataDefaults } from '../data/DataDefaults';
import { Helpers } from '../helpers';
import { Translation } from '../utils/strings';
import { BruteForceTest } from './BruteForceTest';
import { OpposedTest } from "./OpposedTest";
import { TestOptions } from './SuccessTest';
import { TestCreator } from './TestCreator';
import { MarkPlacementFlow, MatrixPlacementData } from './flows/MarkPlacementFlow';

/**
 * Implement the opposing test for Brute Force action. See SR5#238 'Brute Force'
 */
export class OpposedBruteForceTest extends OpposedTest {
    declare against: BruteForceTest;
    // The target icon to place a mark on.
    declare icon: SR5Actor | SR5Item;
    // The target icon, if it's representing a device.
    declare device: SR5Item;
    // The target icon, if it's representing a persona.
    declare persona: SR5Actor;

    override _prepareData(data: any, options?: any) {
        data = super._prepareData(data, options);
        return MarkPlacementFlow._prepareOpposedData(data);
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
        MarkPlacementFlow.populateOpposedDocuments(this);
    }
    
    /**
     * When failing against brute force, the decker gets a mark on the target and can deal damage.
     */
    override async processFailure() {
        // Prepare marks and target icon.
        const marks = this.against.data.marks;
        const icon = this.icon;

        if (!icon) {
            console.error('Shadowrun 5e | Expected a target icon to be set.');
            return;
        }

        await this.against.actor.setMarks(icon, marks);

        // Setup optional damage value
        const damage = Math.floor(this.againstNetHits.value / 2);
        this.data.damage = DataDefaults.createData('damage', {base: damage, type: {base: 'matrix', value: 'matrix'}});
        Helpers.calcTotal(this.data.damage);
    }

    /**
     * Allow users to resist against possible matrix damage taken.
     */
    override async afterFailure() {
        await super.afterFailure();

        // Don't resist if no damage was taken.
        if (this.data.damage.value === 0) return;
        const test = await TestCreator.fromOpposedTestResistTest(this, this.data.options);
        if (!test) return;
        await test.execute();
    }

    static override async executeMessageAction(againstData: MatrixPlacementData, messageId: string, options: TestOptions): Promise<void> {
        await MarkPlacementFlow.executeMessageAction(this, againstData, messageId, options);
    }
}
