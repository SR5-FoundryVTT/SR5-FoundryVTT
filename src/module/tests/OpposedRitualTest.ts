import { PartsList } from '../parts/PartsList';
import { OpposedTest, OpposedTestData } from './OpposedTest';
import { TestDocuments, TestOptions } from './SuccessTest';
import { RitualSpellcastingTest } from './RitualSpellcastingTest';
import { Translation } from '../utils/strings';


interface OpposedRitualTestData extends OpposedTestData {

}

/**
 * The opposed test of summoning a spirit.
 * 
 * The summoner is the active actor and the spirit is the opposed actor.
 */
export class OpposedRitualTest extends OpposedTest<OpposedRitualTestData> {
    public override against: RitualSpellcastingTest

    constructor(data, documents?: TestDocuments, options?: TestOptions) {
        super(data, documents, options);       

        this._assertCorrectAgainst();
    }

    /**
     * Prohibit opposing any other test than SpellCastingTest
     */
    _assertCorrectAgainst() {
        if (this.against.type !== 'RitualSpellcastingTest') throw new Error(`${this.constructor.name} can only oppose RitualSpellcastingTest but is opposing a ${this.against.type}`);
    }

    override get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/rolls/success-test-message.html'
    }

    /**
     * When ritual casting the opposing ritual test triggers the DrainTest.
     * Since we can expect this test to be within GM context, we can't auto cast DrainTest.
     */
    override get autoExecuteFollowupTest() {
        return false;
    }

    /**
     * Other than force there shouldn't be any other pool parts.
     */
    override applyPoolModifiers() {
        // NOTE: We don't have an actor, therefore don't need to call document modifiers.
        PartsList.AddUniquePart(this.data.pool.mod, 'SR5.Force', this.against.data.force);
        PartsList.AddPart(this.data.pool.mod, 'SR5.Force', this.against.data.force);
    }

    /**
     * A failure for the ritual is a success for the summoner.
     */
    override async processFailure() {
        await this.updateRitualTestForFollowup();
    }

    /**
     * A success of the ritual is a failure for the summoner.
     */
    override async processSuccess() {
        await this.updateRitualTestForFollowup();
        await this.cleanupAfterExecutionCancel();
    }

    override get successLabel(): Translation {
        return 'SR5.TestResults.RitualFailure';
    }

    override get failureLabel(): Translation {
        return 'SR5.TestResults.RitualSuccess';
    }

    async updateRitualTestForFollowup() {
        // Finalize the original test values.
        let opposingHits = this.hits.value

        this.against.calcDrain(opposingHits);
        await this.against.saveToMessage();
    }
}
