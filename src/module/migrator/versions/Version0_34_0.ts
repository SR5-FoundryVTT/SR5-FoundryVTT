import { SR } from "@/module/constants";
import { VersionMigration } from "../VersionMigration";

/**
 * Update attribute limits to their correct values.
 */
export class Version0_34_0 extends VersionMigration {
    readonly TargetVersion = "0.34.0";

    override migrateActor(actor: any): void {
        actor.system.initiative.blitz = actor.system.initiative.edge;
    }

    override migrateCombat(combat: any) {
        const initiativePass = combat.flags.shadowrun5e?.combatInitiativePass ?? SR.combat.FIRST_PASS;
        combat.system.pass = Math.max(initiativePass, SR.combat.FIRST_PASS);
    }

    override migrateCombatant(combatant: any): void {
        if (combatant.flags.shadowrun5e?.turnsSinceLastAttack)
            combatant.system.attackedLastTurn = true;
    }
}
