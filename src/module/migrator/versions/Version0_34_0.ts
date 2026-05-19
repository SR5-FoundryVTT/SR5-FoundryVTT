import { SR } from "@/module/constants";
import { VersionMigration } from "../VersionMigration";

const { hasProperty, setProperty, getProperty } = foundry.utils;

/**
 * Migrate initiative to have a blitz field, and vehicle stats to have off-road acceleration.
 * Also migrate combat flags for tracking initiative pass and if a combatant attacked last turn.
 * Also add knowledge type to skills if not present.
 */
export class Version0_34_0 extends VersionMigration {
    readonly TargetVersion = "0.34.0";

    override handlesItem(item: Readonly<any>): boolean {
        return item.system?.armor !== undefined || item.type === 'modification' || item.type === 'skill';
    }

    override migrateItem(item: any): void {
        if (item.type === 'skill' && !getProperty(item, "system.skill.knowledgeType")) {
            setProperty(item, "system.skill.knowledgeType", "academic");
        }

        if (item.system?.armor !== undefined) {
            const armor = item.system.armor;
            const elements = ['acid', 'cold', 'electricity', 'fire', 'radiation'];

            if (armor.mod !== undefined) {
                armor.accessory = armor.mod;
                delete armor.mod;
            }

            if (armor.hardened !== undefined) {
                armor.is_hardened = Boolean(armor.hardened);
                delete armor.hardened;
            }

            for (const el of elements) {
                if (armor[el] !== undefined) {
                    setProperty(armor, `elements.${el}.base`, armor[el] ?? 0);
                    delete armor[el];
                }
            }
        }

        if (item.type === 'modification' && item.system !== undefined) {
            const legacyToNew: Array<[string, string]> = [
                ['mount_point', 'mod_weapon.mount_point'],
                ['dice_pool', 'mod_weapon.dice_pool'],
                ['accuracy', 'mod_weapon.accuracy'],
                ['rc', 'mod_weapon.rc'],
                ['conceal', 'mod_weapon.conceal'],
            ];

            for (const [legacyKey, newKey] of legacyToNew) {
                const oldValue = getProperty(item.system, legacyKey);
                if (oldValue !== undefined) {
                    setProperty(item.system, newKey, oldValue);
                    delete item.system[legacyKey];
                }
            }
        }
    }

    override handlesActiveEffect(effect: Readonly<any>) {
        return (effect.changes as any[]).some(change => (change.key as string).includes('system.armor'));
    }

    override migrateActiveEffect(effect: { changes: { key: string }[] }): void {
        const armorKeyMap: Record<string, string> = {
            'system.armor': 'system.armor.rating',
            'system.armor.base': 'system.armor.rating',
            'system.armor.value': 'system.armor.rating',
            'system.armor.mod': 'system.armor.accessory',
            'system.armor.acid': 'system.armor.elements.acid',
            'system.armor.cold': 'system.armor.elements.cold',
            'system.armor.electricity': 'system.armor.elements.electricity',
            'system.armor.fire': 'system.armor.elements.fire',
            'system.armor.radiation': 'system.armor.elements.radiation',
        };

        for (const change of effect.changes) {
            change.key = armorKeyMap[change.key] ?? change.key;
        }
    }

    override migrateActor(actor: any): void {
        const system = actor.system;
        if (hasProperty(system as any, "initiative"))
            system.initiative.blitz = system.initiative.edge;

        if (actor.type === "vehicle" && hasProperty(system as any, "vehicle_stats")) {
            const acceleration = getProperty(system, "vehicle_stats.acceleration.base");
            setProperty(system, "vehicle_stats.off_road_acceleration.base", acceleration);
        }
    }

    override migrateCombat(combat: any) {
        const initiativePass = combat.flags.shadowrun5e?.combatInitiativePass ?? SR.combat.FIRST_PASS;
        setProperty(combat, "system.pass", Math.max(initiativePass, SR.combat.FIRST_PASS));
    }

    override migrateCombatant(combatant: any): void {
        if (combatant.flags.shadowrun5e?.turnsSinceLastAttack)
            combatant.system.attackedLastTurn = true;
    }
}
