import { SR } from "../constants";
import { Migrator } from "../migrator/Migrator";
import { CombatRules } from "../rules/CombatRules";

export class SR5Combatant extends Combatant<"base"> {
    static override migrateData(source: any) {
        Migrator.migrate("Combatant", source);
        return super.migrateData(source);
    }

    /** Checks if the combatant can perform an action. */
    canAct(): boolean {
        return this.initiative !== null && this.initiative > 0;
    }

    /** Checks if the combatant has already acted in the current pass. */
    acted(): boolean {
        return this.system.acted;
    }

    protected override _getInitiativeFormula(): string {
        const baseFormula = super._getInitiativeFormula();
        const passesCompleted = this.parent.pass - SR.combat.FIRST_PASS;

        if (passesCompleted <= 0) return baseFormula;

        const penalty = Math.abs(passesCompleted * SR.combat.PASS_PENALTY);
        return `${baseFormula} - ${penalty}[Pass]`;
    }

    protected override async _preDelete(...args: Parameters<Combatant["_preDelete"]>) {
        await this.deleteFlow();
        return super._preDelete(...args);
    }

    /**
     * Cleans up combat-specific state and modifiers from the actor when they 
     * are removed from the combat encounter or when the combat ends.
     */
    async deleteFlow() {
        await this.actor?.clearProgressiveRecoil();
        await this.actor?.removeDefenseMultiModifier();
    }

    /** Adjusts the combatant's initiative score by a given amount. */
    async adjustInitiative(adjustment: number): Promise<this | undefined> {
        if (this.initiative === null) return this;
        return this.update({ initiative: this.initiative + adjustment });
    }

    /** Handles updates at the start of a combatant's turn. */
    async turnUpdate(pass: number): Promise<void> {
        // Clear movement history on the first initiative pass.
        if (pass === SR.combat.FIRST_PASS)
            await this.clearMovementHistory();

        // Reset defense modifiers for the new action phase.
        await this.actor?.removeDefenseMultiModifier();

        // Manage progressive recoil based on whether they attacked last turn.
        if (!this.system.attackedLastTurn)
            await this.actor?.clearProgressiveRecoil();

        await this.update({ system: { attackedLastTurn: false } });
    }

    /** Prepares the data object for updating at the end of an initiative pass. */
    initPassUpdateData() {
        return {
            _id: this._id!,
            system: { acted: false },
            initiative: CombatRules.initAfterPass(this.initiative),
        } as const;
    }

    /** Prepares the data object for updating at the end of a combat round. */
    roundUpdateData() {
        return {
            _id: this._id!,
            system: {
                acted: false,
                seize: false,
                coinFlip: Math.random(),
            }
        } as const;
    }
}
