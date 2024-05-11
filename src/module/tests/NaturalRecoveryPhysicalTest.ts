import {SuccessTest} from "./SuccessTest";
import {PartsList} from "../parts/PartsList";

export class NaturalRecoveryPhysicalTest extends SuccessTest {
    override async execute(): Promise<this> {
        if (!this.actor) return this;
        if (!this.actor.canRecoverPhysicalDamage) {
            ui.notifications?.warn(game.i18n.localize('SR5.Warnings.CantRecoverPhysicalWithStunDamage'));
            return this;
        }

        return super.execute();
    }

    override prepareBaseValues() {
        super.prepareBaseValues();
        this.prepareThreshold();
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['recovery', 'recovery_physical']
    }

    /**
     * A recovery test has its damage track as a threshold.
     */
    prepareThreshold() {
        if (!this.actor) return;

        const track = this.actor.getPhysicalTrack();
        const boxes = track?.value || 0;

        const threshold = new PartsList(this.threshold.mod);
        threshold.addUniquePart('SR5.PhysicalTrack', boxes)
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

        await this.actor.healPhysicalDamage(this.hits.value);
    }
}