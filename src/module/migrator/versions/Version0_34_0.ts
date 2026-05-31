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
        return item.system?.armor !== undefined || item.type === 'modification' || item.type === 'skill' || item.type === 'bioware' || item.type === 'cyberware';
    }

    override migrateItem(item: any): void {
        if (item.type === 'skill' && !getProperty(item, "system.skill.knowledgeType")) {
            setProperty(item, "system.skill.knowledgeType", "academic");
        }

        if (item.system?.armor !== undefined) {
            const armor = item.system.armor;
            const elements = ['acid', 'cold', 'electricity', 'fire', 'radiation'];

            setProperty(armor, 'base', getProperty(armor, 'value'));

            if (armor.mod !== undefined)
                armor.accessory = armor.mod;

            if (armor.hardened !== undefined) {
                armor.is_hardened = Boolean(armor.hardened);
                delete armor.hardened;
            }

            for (const el of elements) {
                if (armor[el] !== undefined)
                    setProperty(armor, `elements.${el}.base`, armor[el] ?? 0);
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
                if (oldValue !== undefined)
                    setProperty(item.system, newKey, oldValue);
            }
        }

        if ((item.type === 'bioware' || item.type === 'cyberware') && item.system !== undefined) {
            const oldCapacity = getProperty(item.system, 'capacity');

            // Remove the legacy numeric "capacity" before setting the new object structure,
            // otherwise code that checks `in` will fail on a number.
            delete item.system.capacity;
            setProperty(item.system, 'capacity.total', oldCapacity);
        }
    }

    override migrateActiveEffect(effect: { system: { changes: { key: string }[] }}): void {
        const keyMap: Record<string, string> = {
            'system.armor': 'system.armor.rating',
            'system.armor.base': 'system.armor.rating',
            'system.armor.value': 'system.armor.rating',
            'system.armor.mod': 'system.armor.accessory',
            'system.armor.acid': 'system.armor.elements.acid',
            'system.armor.cold': 'system.armor.elements.cold',
            'system.armor.electricity': 'system.armor.elements.electricity',
            'system.armor.fire': 'system.armor.elements.fire',
            'system.armor.radiation': 'system.armor.elements.radiation',

            // legacy migration key, because we didn't update change.value before (0.31.5)
            'system.force': 'system.attributes.force',
        };

        const valueMap: Record<string, string> = {
            'system.armor': 'system.armor.rating.value',
            'system.armor.base': 'system.armor.rating.base',
            'system.armor.value': 'system.armor.rating.value',
            'system.armor.acid': 'system.armor.elements.acid.value',
            'system.armor.cold': 'system.armor.elements.cold.value',
            'system.armor.electricity': 'system.armor.elements.electricity.value',
            'system.armor.fire': 'system.armor.elements.fire.value',
            'system.armor.radiation': 'system.armor.elements.radiation.value',
            'system.accuracy': 'system.mod_weapon.accuracy',
            'system.dice_pool': 'system.mod_weapon.dice_pool',
            'system.rc': 'system.mod_weapon.rc',
            'system.conceal': 'system.mod_weapon.conceal',
            'system.mount_point': 'system.mod_weapon.mount_point',

            // legacy migration key, because we didn't update change.value before (0.31.5)
            'system.force': 'system.attributes.force',
        };

        this.migrateEffectChanges(effect, keyMap, valueMap);
    }

    override migrateActor(actor: any): void {
        const system = actor.system;
        if (hasProperty(system as any, "initiative"))
            system.initiative.blitz = system.initiative.edge;

        if (actor.type === "vehicle" && hasProperty(system as any, "vehicle_stats")) {
            const acceleration = getProperty(system, "vehicle_stats.acceleration.base");
            setProperty(system, "vehicle_stats.off_road_acceleration.base", acceleration);
        }

        if ('armor' in system)
            this.migrateActorArmor(system);
    }

    private migrateActorArmor(system: any): void {
        const armor = system?.armor;
        if (!armor || typeof armor !== 'object') return;

        const legacyRating = getProperty(armor, 'base');
        if (legacyRating) setProperty(armor, 'rating.base', legacyRating);

        const elements = ['acid', 'cold', 'electricity', 'fire', 'radiation'];
        for (const el of elements) {
            if (armor[el] !== undefined)
                setProperty(armor, `elements.${el}.base`, armor[el] ?? 0);
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
