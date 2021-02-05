import { DataWrapper } from '../dataWrappers/DataWrapper';
import SR5ItemType = Shadowrun.SR5ItemType;
import ConditionData = Shadowrun.ConditionData;
import ModList = Shadowrun.ModList;
import SR5ItemDataPartial = Shadowrun.SR5ItemDataPartial;
import ActionRollData = Shadowrun.ActionRollData;
import SpellData = Shadowrun.SpellData;
import SinData = Shadowrun.SinData;
import Sin = Shadowrun.Sin;
import SR5ItemData = Shadowrun.SR5ItemData;
import ActionPartData = Shadowrun.ActionPartData;
import Weapon = Shadowrun.Weapon;
import Modification = Shadowrun.Modification;
import TechnologyData = Shadowrun.TechnologyData;
import CritterPowerRange = Shadowrun.CritterPowerRange;
import SpellRange = Shadowrun.SpellRange;
import RangeWeaponData = Shadowrun.RangeWeaponData;

export class SR5ItemDataWrapper extends DataWrapper<SR5ItemType> {
    getType() {
        return this.data.type;
    }
    getData(): SR5ItemDataPartial {
        return (this.data.data as unknown) as SR5ItemDataPartial;
    }

    isAreaOfEffect(): boolean {
        // TODO figure out how to detect explosive ammo
        return this.isGrenade() || (this.isSpell() && this.getData().range === 'los_a'); //|| this.hasExplosiveAmmo();
    }

    /** Should only be used to check for actual armor item type.
     * NOTE: Should you only care about a possible armor value use couldHaveArmor instead.
     */
    isArmor(): boolean {
        return this.data.type === 'armor';
    }

    /** Will give an indicator if an item provides an armor value, without locking into only the Armor item type.
     * NOTE: Should you only care about the armor item type use isArmor instead.
     */
    couldHaveArmor(): boolean {
        const armor = this.getData().armor;
        return this.isArmor() || armor !== undefined;
    }

    hasArmorBase(): boolean {
        return this.hasArmor() && !this.getData().armor?.mod;
    }

    hasArmorAccessory(): boolean {
        return this.hasArmor() && (this.getData().armor?.mod ?? false);
    }

    hasArmor(): boolean {
        return this.getArmorValue() > 0;
    }

    isGrenade(): boolean {
        return this.isThrownWeapon() && (this.getData().thrown?.blast.radius ?? 0) > 0;
    }

    isThrownWeapon(): boolean {
        return this.isWeapon() && this.getData().category === 'thrown';
    }

    isWeapon(): boolean {
        return this.data.type === 'weapon';
    }

    isModification(): boolean {
        return this.data.type === 'modification';
    }

    isWeaponModification(): boolean {
        if (!this.isModification()) return false;
        const modification = this.data as Modification;
        return modification.data.type === 'weapon';
    }

    isArmorModification(): boolean {
        if (!this.isModification()) return false;
        const modification = this.data as Modification;
        return modification.data.type === 'armor';
    }

    isProgram(): boolean {
        return this.data.type === 'program';
    }

    isQuality(): boolean {
        return this.data.type === 'quality';
    }

    isAmmo(): boolean {
        return this.data.type === 'ammo';
    }

    isCyberware(): boolean {
        return this.data.type === 'cyberware';
    }

    isBioware(): boolean {
        return this.data.type === 'bioware';
    }

    isBodyware(): boolean {
        return this.isCyberware() || this.isBioware();
    }

    isCombatSpell(): boolean {
        return this.isSpell() && this.getData().category === 'combat';
    }

    isDirectCombatSpell(): boolean {
        if (!this.isCombatSpell()) return false;
        return this.getData()?.combat?.type === 'direct';
    }

    isIndirectCombatSpell(): boolean {
        if (!this.isCombatSpell()) return false;
        return this.getData()?.combat?.type === 'indirect';
    }

    isManaSpell(): boolean {
        if (!this.isSpell()) return false;
        // Cast as partial spelldata due to conflicting .type between differing item types.
        const spellData = this.getData() as Partial<SpellData>;
        return spellData.type === 'mana';
    }

    isPhysicalSpell(): boolean {
        if (!this.isSpell()) return false;
        // Cast as partial spelldata due to conflicting .type between differing item types.
        const spellData = this.getData() as Partial<SpellData>;
        return spellData.type === 'physical';
    }

    isRangedWeapon(): boolean {
        return this.isWeapon() && this.getData().category === 'range';
    }

    isSpell(): boolean {
        return this.data.type === 'spell';
    }

    isSpritePower(): boolean {
        return this.data.type === 'sprite_power';
    }

    isComplexForm(): boolean {
        return this.data.type === 'complex_form';
    }

    isContact(): boolean {
        return this.data.type === 'contact';
    }

    isCritterPower(): boolean {
        return this.data.type === 'critter_power';
    }

    isMeleeWeapon(): boolean {
        return this.data.type === 'weapon' && this.getData().category === 'melee';
    }

    isDevice(): boolean {
        return this.data.type === 'device';
    }

    isEquipment(): boolean {
        return this.data.type === 'equipment';
    }

    isEquipped(): boolean {
        return this.getData().technology?.equipped || false;
    }

    isCyberdeck(): boolean {
        return this.isDevice() && this.getData().category === 'cyberdeck';
    }

    isSin(): boolean {
        return this.data.type === 'sin';
    }

    isLifestyle(): boolean {
        return this.data.type === 'lifestyle';
    }

    getId(): string {
        return this.data._id;
    }

    getBookSource(): string {
        return this.getData().description?.source ?? '';
    }

    getConditionMonitor(): ConditionData {
        return this.getData().technology?.condition_monitor ?? { value: 0, max: 0, label: '' };
    }

    getRating(): number {
        return this.getData().technology?.rating || 0;
    }

    getArmorValue(): number {
        return this.getData()?.armor?.value ?? 0;
    }

    getArmorElements(): { [key: string]: number } {
        // TODO clean this up
        const { fire, electricity, cold, acid } = this.getData().armor || {};
        return { fire: fire ?? 0, electricity: electricity ?? 0, cold: cold ?? 0, acid: acid ?? 0 };
    }

    getName(): string {
        return this.data.name;
    }

    getEssenceLoss(): number {
        return this.getData()?.essence ?? 0;
    }

    getAmmo() {
        return this.getData().ammo;
    }

    getASDF() {
        if (!this.isDevice()) return undefined;

        // matrix attributes are set up as an object
        const matrix = {
            attack: {
                value: 0,
                device_att: '',
            },
            sleaze: {
                value: 0,
                device_att: '',
            },
            data_processing: {
                value: this.getRating(),
                device_att: '',
            },
            firewall: {
                value: this.getRating(),
                device_att: '',
            },
        };

        if (this.isCyberdeck()) {
            /**
             * {
             *     attN: {
             *         value: number,
             *         att: string (the ASDF attribute)
             *     }
             * }
             */
            const atts: { [key: string]: { value: number; att: string } } | undefined = this.getData().atts;
            if (atts) {
                for (let [key, att] of Object.entries(atts)) {
                    matrix[att.att].value = att.value;
                    matrix[att.att].device_att = key;
                }
            }
        }

        return matrix;
    }

    getQuantity(): number | undefined {
        return this.getData()?.technology?.quantity || 1;
    }

    isAction(): boolean {
        return this.data.type === 'action';
    }

    getAction(): ActionRollData|undefined {
        return this.getData().action;
    }

    getActionDicePoolMod(): number | undefined {
        return this.getData().action?.mod;
    }

    getLimitAttribute(): string | undefined {
        return this.getData().action?.limit?.attribute;
    }

    getActionSkill(): string | undefined {
        return this.getData().action?.skill;
    }

    getActionAttribute(): string | undefined {
        return this.getData().action?.attribute;
    }

    getActionAttribute2(): string | undefined {
        return this.getData().action?.attribute2;
    }

    getActionLimit(): number | undefined {
        return this.getData().action?.limit?.value;
    }

    getModifierList(): ModList<number> {
        return this.getData().action?.dice_pool_mod || [];
    }

    getActionSpecialization(): string | undefined {
        if (this.getData().action?.spec) return 'SR5.Specialization';
        return undefined;
    }

    getDrain(): number {
        return this.getData().drain || 0;
    }

    getFade(): number {
        return this.getData().fade || 0;
    }

    getRecoilCompensation(): number {
        if (!this.isRangedWeapon()) return 0;
        const base = this.getData()?.range?.rc.value ?? '0';
        return Number(base);
    }

    getReach(): number {
        if (this.isMeleeWeapon()) {
            return this.getData().melee?.reach ?? 0;
        }
        return 0;
    }

    getTechnology(): TechnologyData|undefined {
        if ("technology" in this.data.data)
            return this.data.data.technology;
    }

    getRange(): CritterPowerRange|SpellRange|RangeWeaponData|undefined {
        if (!("range" in this.data.data)) return;

        if (this.data.type === 'critter_power')
            return this.data.data.range as CritterPowerRange;

        if (this.data.type === 'spell')
            return this.data.data.range as SpellRange;

        if (this.data.type === 'weapon')
            return this.data.data.range as RangeWeaponData;
    }

    hasDefenseTest(): boolean {
        return this.getData().action?.opposed?.type === 'defense';
    }

    hasAmmo(): boolean {
        const ammo = this.getAmmo();
        return !!ammo
    }
}
