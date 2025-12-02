import { VersionMigration } from "../VersionMigration";

/**
 * Migrates skill names, spirit types, and vehicle modification categories to match official book conventions.
 */
export class Version0_32_0 extends VersionMigration {
    readonly TargetVersion = "0.32.0";

    override migrateActor(_actor: any): void {
        if (_actor.system?.skills?.active) {
            const active = _actor.system.skills.active;

            if (active.pilot_water_craft) {
                _actor.system.skills.active.pilot_watercraft = _actor.system.skills.active.pilot_water_craft;
                _actor.system.skills.active.pilot_watercraft.id = "pilot_watercraft";
                delete _actor.system.skills.active.pilot_water_craft;
            }

            if (active.exotic_melee) {
                _actor.system.skills.active.exotic_melee_weapon = _actor.system.skills.active.exotic_melee;
                _actor.system.skills.active.exotic_melee_weapon.id = "exotic_melee_weapon";
                delete _actor.system.skills.active.exotic_melee;
            }

            if (active.exotic_range) {
                _actor.system.skills.active.exotic_ranged_weapon = _actor.system.skills.active.exotic_range;
                _actor.system.skills.active.exotic_ranged_weapon.id = "exotic_ranged_weapon";
                delete _actor.system.skills.active.exotic_range;
            }
        }

        const spiritTypeMap = {
            toxic_air: "noxious",
            toxic_beasts: "abomination",
            toxic_earth: "barren",
            toxic_fire: "nuclear",
            toxic_man: "plague",
            toxic_water: "sludge"
        } as const;

        if (_actor.type === "spirit" && spiritTypeMap[_actor.system.spiritType]) {
            _actor.system.spiritType = spiritTypeMap[_actor.system.spiritType];
        }

        if (_actor.type === "vehicle" && _actor.system?.modificationCategories?.power_train) {
            _actor.system.modificationCategories.powertrain = _actor.system.modificationCategories.power_train;
            delete _actor.system.modificationCategories.power_train;
        }
    }

    override handlesActiveEffect(_effect: Readonly<any>): boolean {
        return _effect?.system?.selection_skills?.length > 0;
    }

    override migrateActiveEffect(_effect: any): void {
        const skills = _effect.system?.selection_skills;

        const skillMap = {
            exotic_melee: 'exotic_melee_weapon',
            exotic_range: 'exotic_ranged_weapon',
            pilot_water_craft: 'pilot_watercraft',
        } as const;

        if (skills) {
            for (const skill of skills) {
                if (skillMap[skill.id]) {
                    skill.id = skillMap[skill.id];
                }
            }
        }
    }
}
