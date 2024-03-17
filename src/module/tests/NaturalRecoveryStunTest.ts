import {SuccessTest} from "./SuccessTest";
import {PartsList} from "../parts/PartsList";

export class NaturalRecoveryStunTest extends SuccessTest {
    override prepareBaseValues() {
        super.prepareBaseValues();
        this.prepareThreshold();
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['action_recovery', 'action_recovery_stun']
    }

    /**
     * A recovery test has its damage track as a threshold.
     */
    prepareThreshold() {
        if (!this.actor) return;

        const track = this.actor.getStunTrack();
        const boxes = track?.value || 0;

        const threshold = new PartsList(this.threshold.mod);
        threshold.addUniquePart('SR5.StunTrack', boxes)
    }

    /**
     * A recovery test will heal on each test iteration
     */
    override async processResults() {
        await super.processResults();

        // Don't bother healing if the actor can't.
        if (!this.actor) return;
        if (!this.actor.hasNaturalRecovery) return;

        // Don't bother healing without hits.
        if (this.hits.value === 0) return;

        await this.actor.healStunDamage(this.hits.value);
    }
}