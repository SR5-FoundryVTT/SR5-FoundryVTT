import { VersionMigration } from "../VersionMigration";

/**
 * Update attribute limits to their correct values.
 */
export class Version0_32_0 extends VersionMigration {
    readonly TargetVersion = "0.32.0";

    override migrateActor(actor: any): void {
        actor.system.initiative.blitz = actor.system.initiative.edge;
    }

    override migrateCombat(combat: any) {
        combat.system.initiativePass = combat.flags.shadowrun5e?.combatInitiativePass ?? 0;
    }

    override migrateCombatant(combatant: any): void {
        if (combatant.flags.shadowrun5e?.turnsSinceLastAttack)
            combatant.system.attackedLastTurn = true;
    }
}
