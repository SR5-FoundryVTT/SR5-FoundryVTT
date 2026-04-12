import { SR } from "../constants";
import { Migrator } from "../migrator/Migrator";
import { CombatRules } from "../rules/CombatRules";

export class SR5Combatant extends Combatant<"base"> {
    protected override _getInitiativeFormula(): string {
        const combat = this.parent;
        const baseFormula = super._getInitiativeFormula();
        const initPassed = combat.pass - SR.combat.INITIAL_INI_PASS;
        const ongoingIniPassModified = initPassed * -SR.combat.INI_RESULT_MOD_AFTER_INI_PASS;

        return `max(${baseFormula} - ${ongoingIniPassModified}[Pass], 0)`;
    }

    override async _preUpdate(
        changed: Combatant.UpdateData,
        options: Combatant.Database.PreUpdateOptions,
        user: User.Implementation,
    ) {
        if (changed.initiative)
            changed.initiative = Math.max(changed.initiative, 0);
        return super._preUpdate(changed, options, user);
    }

    static override migrateData(source: any) {
        Migrator.migrate("Combatant", source);
        return super.migrateData(source);
    }

    /** Checks if the combatant can perform an action. */
    canAct(): boolean {
        return this.initiative != null && this.initiative > 0;
    }

    acted(): boolean {
        return this.system.acted;
    }

    /** Adjusts the combatant's initiative score by a given amount. */
    async adjustInitiative(adjustment: number): Promise<this | undefined> {
        const newIni = Math.max((this.initiative ?? 0) + adjustment, 0);
        return this.update({ initiative: newIni });
    }

    /** Handles updates at the start of a combatant's turn. */
    async turnUpdate(pass: number): Promise<void> {
        // Clear movement history on the first initiative pass.
        if (pass === SR.combat.INITIAL_INI_PASS)
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
