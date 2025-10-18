import { VersionMigration } from "../VersionMigration";

/**
 * Update attribute limits to their correct values.
 */
export class Version0_31_0 extends VersionMigration {
    readonly TargetVersion = "0.31.0";

    override migrateCombat(combat: Combat.Implementation) {
        combat.system.initiativePass = combat.flags.shadowrun5e?.combatInitiativePass ?? 0;
    }

    override migrateCombatant(combatant: Combatant.Implementation): void {
        if (combatant.flags.shadowrun5e?.turnsSinceLastAttack)
            combatant.system.attackedLastTurn = true;
    }
}
