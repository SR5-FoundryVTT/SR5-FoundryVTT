import { DataDefaults } from '../data/DataDefaults';
import { Helpers } from '../helpers';
import { BruteForceTest } from './BruteForceTest';
import { OpposedTest } from "./OpposedTest";

export class OpposedBruteForceTest extends OpposedTest {
    override against: BruteForceTest;
    override get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/rolls/opposing-mark-test-message.html';
    }
    /**
     * When failing against brute force, the decker gets a mark on the target.
     */
    override async processFailure() {
        if (!this.actor || !this.against.actor) return;

        // Place a mark on the target
        const marks = this.against.data.marks;
        await this.against.actor.setMarks(this.actor, marks);

        // Setup optional damage value
        const damage = Math.floor(this.againstNetHits.value / 2);
        this.data.damage = DataDefaults.damageData({base: damage, type: {base: 'matrix', value: 'matrix'}});
        Helpers.calcTotal(this.data.damage);
    }
}