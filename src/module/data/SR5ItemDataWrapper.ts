import { DataWrapper } from './DataWrapper';
import ConditionData = Shadowrun.ConditionData;
import ModList = Shadowrun.ModList;
import ActionRollData = Shadowrun.ActionRollData;
import SpellData = Shadowrun.SpellData;
import TechnologyData = Shadowrun.TechnologyData;
import CritterPowerRange = Shadowrun.CritterPowerRange;
import SpellRange = Shadowrun.SpellRange;
import RangeWeaponData = Shadowrun.RangeWeaponData;
import ShadowrunItemData = Shadowrun.ShadowrunItemData;
import ShadowrunItemDataData = Shadowrun.ShadowrunItemDataData;
import ModificationItemData = Shadowrun.ModificationItemData;
import ActionResultData = Shadowrun.ActionResultData;
import AmmunitionData = Shadowrun.AmmunitionData;
import WeaponData = Shadowrun.WeaponData;
import DeviceData = Shadowrun.DeviceData;
import AmmoData = Shadowrun.AmmoData;
import SpritePowerData = Shadowrun.SpritePowerData;
import CritterPowerData = Shadowrun.CritterPowerData;

export class SR5ItemDataWrapper extends DataWrapper<ShadowrunItemData> {
    getType() {
        return this.data.type;
    }
    getData(): ShadowrunItemDataData {
        return this.data.system as ShadowrunItemDataData;
    }

    isAreaOfEffect(): boolean {
        return this.isGrenade() || this.isAoESpell() || this.isAoEAmmo();
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
        if (!this.isWeapon()) return false;
        const weaponData = this.getData() as WeaponData;
        return weaponData.category === 'thrown';
    }

    isWeapon(): boolean {
        return this.data.type === 'weapon';
    }

    isModification(): boolean {
        return this.data.type === 'modification';
    }

    isWeaponModification(): boolean {
        if (!this.isModification()) return false;
        const modification = this.data as ModificationItemData;
        return modification.system.type === 'weapon';
    }

    isArmorModification(): boolean {
        if (!this.isModification()) return false;
        const modification = this.data as ModificationItemData;
        return modification.system.type === 'armor';
    }

    isVehicleModification(): boolean {
        if (!this.isModification()) return false;
        const modification = this.data as ModificationItemData;
        return modification.system.type === 'vehicle';
    }

    isDroneModification(): boolean {
        if (!this.isModification()) return false;
        const modification = this.data as ModificationItemData;
        return modification.system.type === 'drone';
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

    isAoEAmmo(): boolean {
        if (!this.isAmmo()) return false;
        const ammoData = this.getData() as AmmoData;
        return (ammoData.blast.radius ?? 0) > 0;
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
        if (!this.isSpell()) return false;
        const spellData = this.getData() as unknown as SpellData;
        return spellData.category === 'combat';
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
        // Cast as partial spell data due to conflicting .type between differing item types.
        const spellData = this.getData() as Partial<SpellData>;
        return spellData.type === 'mana';
    }

    isPhysicalSpell(): boolean {
        if (!this.isSpell()) return false;
        // Cast as partial spell data due to conflicting .type between differing item types.
        const spellData = this.getData() as Partial<SpellData>;
        return spellData.type === 'physical';
    }

    isRangedWeapon(): boolean {
        if (!this.isWeapon()) return false;
        const weaponData = this.getData() as WeaponData;
        return weaponData.category === 'range';
    }

    isSpell(): boolean {
        return this.data.type === 'spell';
    }

    isAoESpell(): boolean {
        return this.isSpell() && this.getData().range === 'los_a';
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
        if (!this.isWeapon()) return false;
        const weaponData = this.getData() as WeaponData;
        return weaponData.category === 'melee';
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

    isEnabled(): boolean {
        if(!this.isCritterPower && !this.isSpritePower) return false;
        return this.getData().enabled !== undefined ? this.getData().enabled === true : true;
    }

    canBeDisabled(): boolean {
        if(!this.isCritterPower && !this.isSpritePower) return false;
        return (this.getData().optional || 'standard') !== 'standard'
    }

    isWireless(): boolean {
        return this.getData().technology?.wireless || false;
    }

    isCyberdeck(): boolean {
        if (!this.isDevice()) return false;
        const deviceData = this.getData() as DeviceData;
        return deviceData.category === 'cyberdeck';
    }

    isRCC(): boolean {
        if (!this.isDevice()) return false;
        const deviceData = this.getData() as DeviceData;
        return deviceData.category === 'rcc';
    }

    isCommlink(): boolean {
        if (!this.isDevice()) return false;
        const deviceData = this.getData() as DeviceData;
        return deviceData.category === 'commlink';
    }

    isMatrixAction(): boolean {
        // @ts-expect-error
        return this.isAction() && this.getData().result.success.matrix.placeMarks;
    }

    isSin(): boolean {
        return this.data.type === 'sin';
    }

    isLifestyle(): boolean {
        return this.data.type === 'lifestyle';
    }

    getId(): string {
        // @ts-expect-error // TODO: Foundry Where is my foundry base data?
        return this.data._id;
    }

    get hasSource(): boolean {
        return !!this.getData().description?.source;
    }

    getSource(): string {
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

    getHardened(): boolean {
        return this.getData()?.armor?.hardened ?? false;
    }

    getArmorElements(): { [key: string]: number } {
        const { fire, electricity, cold, acid, radiation } = this.getData().armor || {};
        return { fire: fire ?? 0, electricity: electricity ?? 0, cold: cold ?? 0, acid: acid ?? 0, radiation: radiation ?? 0 };
    }

    getLinkedActorUuid(): string | undefined {
        return this.getData().linkedActor;
    }

    getName(): string {
        return this.data.name;
    }

    /**
     * Essence loss of an item is flat value and depends on the quantity of that item
     * 
     * Using quantity allows for two approaches:
     * - Add an item twice while still having book essence values
     * - Add an item with quantity 2 while also having book essence values
     * Both are valid.
     * 
     * @returns A decimal as essence modifier
     */
    getEssenceLoss(): number {
        const lossRaw = Number(this.getData()?.technology?.calculated?.essence ?? this.getData()?.essence);
        const loss = isNaN(lossRaw) ? 0 : lossRaw;
        const quantity = Number(this.getData()?.technology?.quantity) ?? 1;

        return loss * quantity
    }

    getAmmo(): AmmunitionData|undefined {
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

        // This if statement should cover all types of devices, meaning the "getRating" calls above are always overwritten
        if (this.isCyberdeck() || this.isRCC() || this.isCommlink()) {
            const atts = this.getData().atts;
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

    isUsingRangeCategory(): boolean {
        if(this.isRangedWeapon()) {
            const category = this.getData().range?.ranges?.category;

            return !!category && category !== "manual";
        }
        if(this.isThrownWeapon()) {
            const category = this.getData().thrown?.ranges?.category;

            return !!category && category !== "manual";
        }
        return false;
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
        if ("technology" in this.data.system)
            return this.data.system.technology;
    }

    getRange(): CritterPowerRange|SpellRange|RangeWeaponData|undefined {
        if (!("range" in this.data.system)) return;

        if (this.data.type === 'critter_power')
            return this.data.system.range as CritterPowerRange;

        if (this.data.type === 'spell')
            return this.data.system.range as SpellRange;

        if (this.data.type === 'weapon')
            return this.data.system.range as RangeWeaponData;
    }

    getModificationCategory(): string {
        return this.getData().modification_category ?? '';
    }

    getModificationCategorySlots(): number {
        return this.getData().slots ?? 0;
    }

    hasDefenseTest(): boolean {
        return this.getData().action?.opposed?.type === 'defense';
    }

    hasAmmo(): boolean {
        return !!this.getAmmo();
    }

    getActionResult(): ActionResultData {
        // @ts-expect-error
        return this.getData().result;
    }
}
