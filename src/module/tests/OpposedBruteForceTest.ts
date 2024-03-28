import { DataDefaults } from '../data/DataDefaults';
import { Helpers } from '../helpers';
import { SR5Item } from '../item/SR5Item';
import { Translation } from '../utils/strings';
import { BruteForceTest } from './BruteForceTest';
import { OpposedTest } from "./OpposedTest";

export class OpposedBruteForceTest extends OpposedTest {
    override against: BruteForceTest;
    override get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/rolls/opposing-mark-test-message.html';
    }

    override get successLabel(): Translation {
        return "SR5.TestResults.BruteForceFailure";
    }

    override get failureLabel(): Translation {
        return "SR5.TestResults.BruteForceSuccess";
    }
    
    /**
     * When failing against brute force, the decker gets a mark on the target and can deal damage.
     */
    override async processFailure() {
        // How many marks did the user want to place?
        const marks = this.against.data.marks;
        // Either use a matrix target or the actor itself
        const target = this.against.icon ?? this.actor;
        await this.against.actor.setMarks(target, marks);

        // Setup optional damage value
        const damage = Math.floor(this.againstNetHits.value / 2);
        this.data.damage = DataDefaults.damageData({base: damage, type: {base: 'matrix', value: 'matrix'}});
        Helpers.calcTotal(this.data.damage);
    }
}