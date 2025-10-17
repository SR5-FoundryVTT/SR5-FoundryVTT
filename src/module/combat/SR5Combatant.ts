import { SR } from "../constants";

export class SR5Combatant extends Combatant<"base"> {
    protected override _getInitiativeFormula() {
        const combat = this.parent;
        const baseFormula = super._getInitiativeFormula();
        const initiativePass = combat.initiativePass > 1 ? combat.initiativePass : 1;
        const ongoingIniPassModified = (initiativePass - 1) * -SR.combat.INI_RESULT_MOD_AFTER_INI_PASS;
        return `max(${baseFormula} - ${ongoingIniPassModified}[Pass], 0)`;
    }

    async adjustInitiative(adjustment: number) {
        const newIni = Math.max((this.initiative ?? 0) + adjustment, 0);
        return this.update({ initiative: newIni });
    }

    override async _preUpdate(
        changed: Combatant.UpdateData,
        options: Combatant.Database.PreUpdateOptions,
        user: User.Implementation,
    ) {
        if (changed.initiative) changed.initiative = Math.max(changed.initiative, 0);
        return super._preUpdate(changed, options, user);
    }

    async turnUpdate(initiativePass: number) {
        // Clear movement history on the first initiative pass.
        if (initiativePass === SR.combat.INITIAL_INI_PASS)
            await this.clearMovementHistory();

        // Defense modifiers reset on a new action phase.
        await this.actor?.removeDefenseMultiModifier();

        if (this.system.attackedLastTurn) {
            await this.actor?.clearProgressiveRecoil();
        } else {
            await this.update({ system: { attackedLastTurn: false } });
        }
    }

    canAct() {
        return this.initiative && this.initiative > 0 && !this.system.acted;
    }

    async initiativePassUpdate(initiativePass: number) {
        return this.update({ system: { acted: false } });
    }

    async roundUpdate() {
        await this.initiativePassUpdate(0);
        return this.update({ system: { coinFlip: Math.random() } });
    }
}
