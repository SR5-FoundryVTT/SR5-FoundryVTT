import { VersionMigration } from "../VersionMigration";

/**
 * - Updates action skill references and vehicle modification categories to match official book conventions.
 * - Converts range and duration fields in critter powers to lowercase.
 */
export class Version0_32_1 extends VersionMigration {
    readonly TargetVersion = "0.32.1";

    readonly skillMap = {
        exotic_melee: 'exotic_melee_weapon',
        exotic_range: 'exotic_ranged_weapon',
        pilot_water_craft: 'pilot_watercraft',
    } as const;

    override handlesItem(_item: any): boolean {
        if (_item.type === 'critter_power' && _item.system) {
            return true;
        }

        const action = _item.system?.action;

        if (action) {
            if (this.skillMap[action.skill])
                return true;
            else if (this.skillMap[action.followed?.skill])
                return true;
            else if (this.skillMap[action.opposed?.skill])
                return true;
            else if (this.skillMap[action.opposed?.resist?.skill])
                return true;
        } else if (_item.system?.modification_category === 'power_train') {
            return true;
        }

        return false;
    }

    override migrateItem(_item: any): void {
        if (_item.type === 'critter_power' && _item.system) {
            const system = _item.system;

            const range = system.range ?? '';
            system.range = range === 'T'
                ? 'touch'
                : range.toLowerCase()
                    .replace(/\s+/g, '_')
                    .replace(/[()]/g, '') as any;

            const duration = (system.duration ?? '').toLowerCase();
            if (duration === 's')
                system.duration = 'sustained';
            else if (duration === 'i')
                system.duration = 'instant';
            else if (duration === 'p')
                system.duration = 'permanent';
        }

        const action = _item.system?.action;

        if (action) {
            if (this.skillMap[action.skill]) {
                action.skill = this.skillMap[action.skill];
            }

            if (this.skillMap[action.followed?.skill]) {
                action.followed.skill = this.skillMap[action.followed.skill];
            }

            if (this.skillMap[action.opposed?.skill]) {
                action.opposed.skill = this.skillMap[action.opposed.skill];
            }

            if (this.skillMap[action.opposed?.resist?.skill]) {
                action.opposed.resist.skill = this.skillMap[action.opposed.resist.skill];
            }
        }

        if (_item.system?.modification_category === 'power_train') {
            _item.system.modification_category = 'powertrain';
        }
    }
}
