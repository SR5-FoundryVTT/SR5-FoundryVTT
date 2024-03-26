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
    
    override async populateDocuments() {
        // It's possible this test has been called without an actor but a matrix target only.
        if (this.against.data.targetUuid) {
            const item = await fromUuid(this.against.data.targetUuid) as SR5Item | undefined;
            const actor = item?.actorOwner;
            this.data.sourceItemUuid = this.against.data.targetUuid;
            this.data.sourceActorUuid = actor?.uuid;
        }

        // Otherwise, let default behavior populate the documents
        await super.populateDocuments();
    }
    
    /**
     * When failing against brute force, the decker gets a mark on the target and can deal damage.
     */
    override async processFailure() {
        // Place a mark on the target
        const marks = this.against.data.marks;
        // Either use a matrix target or the actor itself
        const target = this.against.target ?? this.actor;
        await this.against.actor.setMarks(target, marks);

        // Setup optional damage value
        const damage = Math.floor(this.againstNetHits.value / 2);
        this.data.damage = DataDefaults.damageData({base: damage, type: {base: 'matrix', value: 'matrix'}});
        Helpers.calcTotal(this.data.damage);
    }
}