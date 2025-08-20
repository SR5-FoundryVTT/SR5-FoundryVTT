import { getValues, formatAsSlug, genImportFlags, setSubType } from "../importHelper/BaseParserFunctions";
import { DamageTypeType } from "src/module/types/item/Action";
import { DataDefaults } from "src/module/data/DataDefaults";
import { ActorSchema } from "../../ActorSchema";
import { Unwrap } from "../ItemsParser";
import { BlankItem, ExtractItemType, Parser } from "../Parser";
import { ImportHelper as IH } from "@/module/apps/itemImport/helper/ImportHelper";
import { AccessoryParser } from "./AccessoryParser";
import { ClipParser } from "./ClipParser";

export class WeaponParser extends Parser<'weapon'> {
    protected readonly parseType = 'weapon';
    protected readonly compKey = 'Weapon';

    private parseDamage(val: string) {
        const damage = {
            damage: 0,
            type: '' as DamageTypeType,
            radius: 0,
            dropoff: 0,
        };

        const split = val.split(' ');

        if (split.length > 0) {
            const l = split[0].match(/(\d+)(\w+)/);
            
            if (l?.[1]) {
                damage.damage = parseInt(l[1]);
            }

            if (l?.[2]) {
                damage.type = l[2] === 'P' ? 'physical' : 'stun';
            }
        }

        for (let i = 1; i < split.length; i++) {
            const l = split[i].match(/(-?\d+)(.*)/);
            if (l?.[2]) {
                if (l[2].toLowerCase().includes('/m')) { 
                    damage.dropoff = parseInt(l[1]);
                    damage.radius = damage.damage / Math.abs(damage.dropoff)
                }
                else {
                    damage.radius = parseInt(l[1]);
                }
            }
        }

        return damage;
    };

    async parseWeapons(chummerChar: ActorSchema | Unwrap<NonNullable<ActorSchema['vehicles']>['vehicle']>, assignIcons: boolean = false) {
        return this.parseItems(IH.getArray(chummerChar.weapons?.weapon))
    }

    parseItem(item: BlankItem<'weapon'>, itemData: ExtractItemType<'weapons', 'weapon'>) {
        const system = item.system;

        const action = system.action;
        const damage = system.action.damage;

        damage.ap.base = Number(getValues(itemData.rawap)[0]) || 0;

        action.type = 'varies';

        // Transform Chummer skill naming schema to shadowrun5e naming schema.
        // NOTE: chummerWeapon.skill CAN be null. Don't rely on it.
        if (itemData.skill) {
            action.skill = itemData.skill.toLowerCase().replace(/\s/g, '_');
        // Instead of direct skill, rely on a category mapping by the rules.
        } else if (itemData.category?.toLowerCase().includes('exotic')) {
            action.skill = itemData.category
                .toLowerCase()
                .replace(' weapons', '')
                .replace(/\s/g, '_');
        } else if (itemData.category?.toLowerCase().includes('laser weapons')) {
            action.skill = 'exotic_range';
        }

        if (action.skill.includes('exotic')) {
            action.skill = action.skill.replace('_weapon', '');
        }

        action.attribute = 'agility';
        action.limit.base = Number(getValues(itemData.rawaccuracy)[0]) || 0;

        if (itemData.type.toLowerCase() === 'melee') {
            this.handleMeleeWeapon(system, itemData)
        } 

        if (itemData.type.toLowerCase() === 'ranged') {
            this.handledRangedWeapon(system, itemData)
        } else if (itemData.type.toLowerCase() === 'thrown') {
            system.category = 'thrown';
            const ranges = IH.getArray(itemData.ranges)[0];
            if (ranges?.short && ranges.medium && ranges.long && ranges.extreme) {
                system.thrown = {
                    ...system.thrown,
                    ranges: {
                        short: parseInt(ranges.short.split('-')[1]),
                        medium: parseInt(ranges.medium.split('-')[1]),
                        long: parseInt(ranges.long.split('-')[1]),
                        extreme: parseInt(ranges.extreme.split('-')[1]),
                        category: 'manual',
                        attribute: '',
                    }
                };
            }
        }

        {
            //TODO change this to 'rawdamage' when mods can have damage value
            const chummerDamage = this.parseDamage(itemData.damage_noammo_english);
            damage.base = chummerDamage.damage;
            damage.type.base = chummerDamage.type;
            if (chummerDamage.dropoff || chummerDamage.radius) {
                system.thrown = {
                    ...system.thrown,
                    blast: {
                        radius: chummerDamage.radius,
                        dropoff: chummerDamage.dropoff,
                    },
                };
            }
        }

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(itemData.name_english), this.parseType);

        // Assign item subtype
        let subType = '';
        // range/melee/thrown
        if (system.category) {
            subType = formatAsSlug(system.category);
        }
        // exception for thrown weapons and explosives
        const weaponCategory = formatAsSlug(itemData.category_english);
        if (!(subType && ( weaponCategory === 'gear'))) {
            subType = weaponCategory;
        }
        // deal with explosives
        if (weaponCategory === 'gear' && itemData.name_english.includes(':')) {
            subType = formatAsSlug(itemData.name_english.split(':')[0]);
        }

        setSubType(system, this.parseType, subType);
    }

    override async getEmbeddedItems(itemData: ExtractItemType<'weapons', 'weapon'>): Promise<Item.Source[]> {
        return [
            ...(await new AccessoryParser().parseItems(itemData.accessories?.accessory)),
            ...(await new ClipParser(itemData).parseItems(itemData.clips?.clip)),
        ] as Item.Source[];
    }

    handleMeleeWeapon(system: BlankItem<'weapon'>['system'], itemData: ExtractItemType<'weapons', 'weapon'>) {
        system.action.type = 'complex';
        system.category = 'melee';
        system.melee.reach = Number(itemData.reach) || 0;
    }

    handledRangedWeapon(system: BlankItem<'weapon'>['system'], itemData: ExtractItemType<'weapons', 'weapon'>) {
        system.category = 'range';

        if (system.action.skill.toLowerCase().includes('throw')) {
            system.category = 'thrown';
        }

        const range = DataDefaults.createData('range_weapon');
        system.range = range;
        range.rc.base = Number(getValues(itemData.rawrc)[0]) || 0;

        if (itemData.mode) {
            // HeroLab export doesn't have mode
            const modes = itemData.mode_noammo!.toLowerCase();
            range.modes = {
                single_shot: modes.includes('ss'),
                semi_auto: modes.includes('sa'),
                burst_fire: modes.includes('bf'),
                full_auto: modes.includes('fa'),
            };
        }

        if (itemData.clips?.clip != null) {
            const ammo = system.ammo;
            
            // HeroLab export doesn't have clips
            const chummerClips = IH.getArray(itemData.clips.clip);
            const clips = chummerClips.filter(clip => !clip.name.toLowerCase().includes("inter"))

            ammo.spare_clips = {
                max: (clips?.length || 1) - 1,
                value: (clips?.length || 1) - 1
            }

            const loadedClip = clips.filter(clip => clip.location === "loaded")[0]

            ammo.current = {
                max: Number(loadedClip?.count) || 0,
                value: Number(loadedClip?.count) || 0
            }
        }

        const ranges = IH.getArray(itemData.ranges)[0]
        if (ranges?.short && ranges.medium && ranges.long && ranges.extreme) {
            const rangeData = {
                short: parseInt(ranges.short.split('-')[1]),
                medium: parseInt(ranges.medium.split('-')[1]),
                long: parseInt(ranges.long.split('-')[1]),
                extreme: parseInt(ranges.extreme.split('-')[1]),
                category: 'manual',
                attribute: ''
            };
            if(system.category === "range") {
                range.ranges = rangeData;
            }
            if(system.category === "thrown") {
                system.thrown = {
                    ...system.thrown,
                    ranges: rangeData,
                };
            }
        }

    }
}
