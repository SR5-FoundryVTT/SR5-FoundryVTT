import { SR } from "../constants";
import { CombatRules } from "../rules/CombatRules";
import { Migrator } from "../migrator/Migrator";

export class SR5Combatant extends Combatant<"base"> {
    protected override _getInitiativeFormula(): string {
        const combat = this.parent;
        const baseFormula = super._getInitiativeFormula();
        const ongoingIniPassModified = (combat.initiativePass - SR.combat.INITIAL_INI_PASS) * -SR.combat.INI_RESULT_MOD_AFTER_INI_PASS;

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

    static override migrateData(source: any): any {
        Migrator.migrate("Combatant", source);
        return super.migrateData(source);
    }

    /** Checks if the combatant can currently perform an action. */
    canAct(): boolean {
        return this.initiative != null && this.initiative > 0 && !this.system.acted;
    }

    /** Adjusts the combatant's initiative score by a given amount. */
    async adjustInitiative(adjustment: number): Promise<this | undefined> {
        const newIni = Math.max((this.initiative ?? 0) + adjustment, 0);
        return this.update({ initiative: newIni });
    }

    /** Handles updates at the start of a combatant's turn. */
    async turnUpdate(initiativePass: number): Promise<void> {
        // Clear movement history on the first initiative pass.
        if (initiativePass === SR.combat.INITIAL_INI_PASS)
            await this.clearMovementHistory();

        // Reset defense modifiers for the new action phase.
        await this.actor?.removeDefenseMultiModifier();

        // Manage progressive recoil based on whether they attacked last turn.
        if (this.system.attackedLastTurn)
            await this.actor?.clearProgressiveRecoil();
        else
            await this.update({ system: { attackedLastTurn: false } });
    }

    /** Prepares the data object for updating at the end of an initiative pass. */
    initPassUpdateData(initiativePass: number) {
        return {
            _id: this._id!,
            system: { acted: false },
            initiative: CombatRules.initAfterPass(this.initiative ?? 0),
        } as const;
    }

    /** Prepares the data object for updating at the end of a combat round. */
    roundUpdateData() {
        const passData = this.initPassUpdateData(0);
        const roundData = { _id: this._id!, system: { coinFlip: Math.random() } } as const;

        return foundry.utils.mergeObject(passData, roundData);
    }
}
