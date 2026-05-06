import { SR } from "@/module/constants";
import { VersionMigration } from "../VersionMigration";

const { hasProperty } = foundry.utils;

/**
 * Migrate initiative to have a blitz field, and vehicle stats to have off-road acceleration.
 * Also migrate combat flags for tracking initiative pass and if a combatant attacked last turn.
 */
export class Version0_34_0 extends VersionMigration {
    readonly TargetVersion = "0.34.0";

    override migrateActor(actor: any): void {
        const system = actor.system;
        if (hasProperty(system as any, "initiative"))
            system.initiative.blitz = system.initiative.edge;

        if (actor.type === "vehicle" && hasProperty(system as any, "vehicle_stats"))
            system.vehicle_stats.off_road_acceleration.base = system.vehicle_stats.acceleration.base;
    }

    override migrateCombat(combat: any) {
        const initiativePass = combat.flags.shadowrun5e?.combatInitiativePass ?? SR.combat.FIRST_PASS;

        if (hasProperty(combat, "system.pass"))
            combat.system.pass = Math.max(initiativePass, SR.combat.FIRST_PASS);
    }

    override migrateCombatant(combatant: any): void {
        if (combatant.flags.shadowrun5e?.turnsSinceLastAttack)
            combatant.system.attackedLastTurn = true;
    }
}
