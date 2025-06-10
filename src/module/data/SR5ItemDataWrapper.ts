import { DataWrapper } from './DataWrapper';
import ConditionData = Shadowrun.ConditionData;
import ModList = Shadowrun.ModList;
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

export class SR5ItemDataWrapper extends DataWrapper<ShadowrunItemData> {
    getData(): ShadowrunItemDataData {
        return this.data.system as ShadowrunItemDataData;
    }

    /** Will give an indicator if an item provides an armor value, without locking into only the Armor item type.
     * NOTE: Should you only care about the armor item type use isArmor instead.
     */
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

    isCombatSpell(): boolean {
        if (!this.isSpell()) return false;
        const spellData = this.getData() as unknown as SpellData;
        return spellData.category === 'combat';
    }

    isDirectCombatSpell(): boolean {
        if (!this.isCombatSpell()) return false;
        return this.getData()?.combat?.type === 'direct';
    }

    isRangedWeapon(): boolean {
        if (!this.isWeapon()) return false;
        const weaponData = this.getData() as WeaponData;
        return weaponData.category === 'range';
    }

    isSpell(): boolean {
        return this.data.type === 'spell';
    }

    isSpritePower(): boolean {
        return this.data.type === 'sprite_power';
    }

    isCritterPower(): boolean {
        return this.data.type === 'critter_power';
    }

    isMeleeWeapon(): boolean {
        if (!this.isWeapon()) return false;
        const weaponData = this.getData() as WeaponData;
        return weaponData.category === 'melee';
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

    getAmmo(): AmmunitionData|undefined {
        return this.getData().ammo;
    }

    getQuantity(): number | undefined {
        return this.getData()?.technology?.quantity || 1;
    }

    getActionDicePoolMod(): number | undefined {
        return this.getData().action?.mod;
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

    getRecoilCompensation(): number {
        if (!this.isRangedWeapon()) return 0;
        const base = this.getData()?.range?.rc.value ?? '0';
        return Number(base);
    }

    getRange(): CritterPowerRange|SpellRange|RangeWeaponData|undefined {
        if (!("range" in this.data.system)) return;

        if (this.data.type === 'critter_power')
            return this.data.system.range as CritterPowerRange;

        if (this.data.type === 'spell')
            return this.data.system.range as SpellRange;

        if (this.data.type === 'weapon')
            return this.data.system.range as RangeWeaponData;
        return;
    }

    getModificationCategory(): string {
        return this.getData().modification_category ?? '';
    }

    getModificationCategorySlots(): number {
        return this.getData().slots ?? 0;
    }

}
