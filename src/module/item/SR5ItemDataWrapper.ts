import { DataWrapper } from '../dataWrappers/DataWrapper';
import SR5ItemType = Shadowrun.SR5ItemType;
import ConditionData = Shadowrun.ConditionData;
import ModList = Shadowrun.ModList;
import SR5ItemData = Shadowrun.SR5ItemData;

export class SR5ItemDataWrapper extends DataWrapper<SR5ItemType> {
    getData(): SR5ItemData {
        return this.data.data;
    }

    isAreaOfEffect(): boolean {
        // TODO figure out how to detect explosive ammo
        return this.isGrenade() || (this.isSpell() && this.data.data.range === 'los_a'); //|| this.hasExplosiveAmmo();
    }

    isArmor(): boolean {
        return this.data.type === 'armor';
    }

    hasArmorBase(): boolean {
        return this.hasArmor() && !this.data.data.armor?.mod;
    }

    hasArmorAccessory(): boolean {
        return this.hasArmor() && (this.data.data.armor?.mod ?? false);
    }

    hasArmor(): boolean {
        return this.getArmorValue() > 0;
    }

    isGrenade(): boolean {
        return this.isThrownWeapon() && (this.data.data.thrown?.blast.radius ?? 0) > 0;
    }

    isThrownWeapon(): boolean {
        return this.isWeapon() && this.data.data.category === 'thrown';
    }

    isWeapon(): boolean {
        return this.data.type === 'weapon';
    }

    isCyberware(): boolean {
        return this.data.type === 'cyberware';
    }

    isCombatSpell(): boolean {
        return this.isSpell() && this.data.data.category === 'combat';
    }

    isRangedWeapon(): boolean {
        return this.isWeapon() && this.data.data.category === 'range';
    }

    isSpell(): boolean {
        return this.data.type === 'spell';
    }

    isComplexForm(): boolean {
        return this.data.type === 'complex_form';
    }

    isMeleeWeapon(): boolean {
        return this.data.type === 'weapon' && this.data.data.category === 'melee';
    }

    isDevice(): boolean {
        return this.data.type === 'device';
    }

    isEquipped(): boolean {
        return this.data.data.technology?.equipped || false;
    }

    isCyberdeck(): boolean {
        return this.isDevice() && this.data.data.category === 'cyberdeck';
    }

    getId(): string {
        return this.data._id;
    }

    getBookSource(): string {
        return this.data.data.description.source;
    }

    getConditionMonitor(): ConditionData {
        return this.data.data.technology?.condition_monitor ?? { value: 0, max: 0 };
    }

    getRating(): number {
        return this.data.data.technology?.rating || 0;
    }

    getArmorValue(): number {
        return this.data.data?.armor?.value ?? 0;
    }

    getArmorElements(): { [key: string]: number } {
        // TODO clean this up
        const { fire, electricity, cold, acid } = this.data.data.armor || {};
        return { fire: fire ?? 0, electricity: electricity ?? 0, cold: cold ?? 0, acid: acid ?? 0 };
    }

    getName(): string {
        return this.data.name;
    }

    getEssenceLoss(): number {
        return this.data.data?.essence ?? 0;
    }

    getAmmo() {
        return this.data.data.ammo;
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
            const atts: { [key: string]: { value: number; att: string } } | undefined = this.data.data.atts;
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
        return this.data.data?.technology?.quantity || 1;
    }

    getActionDicePoolMod(): number | undefined {
        return this.data.data.action?.mod;
    }

    getLimitAttribute(): string | undefined {
        return this.data.data.action?.limit?.attribute;
    }

    getActionSkill(): string | undefined {
        return this.data.data.action?.skill;
    }

    getActionAttribute(): string | undefined {
        return this.data.data.action?.attribute;
    }

    getActionAttribute2(): string | undefined {
        return this.data.data.action?.attribute2;
    }

    getActionLimit(): number | undefined {
        return this.data.data.action?.limit?.value;
    }

    getModifierList(): ModList<number> {
        return this.data.data.action?.dice_pool_mod || [];
    }

    getActionSpecialization(): string | undefined {
        if (this.data.data.action?.spec) return 'SR5.Specialization';
        return undefined;
    }

    getDrain(): number {
        return this.data.data.drain || 0;
    }

    getFade(): number {
        return this.data.data.fade || 0;
    }

    getRecoilCompensation(): number {
        if (!this.isRangedWeapon()) return 0;
        const base = this.data.data?.range?.rc.value ?? '0';
        return Number(base);
    }

    getReach(): number {
        if (this.isMeleeWeapon()) {
            return this.data.data.melee?.reach ?? 0;
        }
        return 0;
    }

    hasDefenseTest(): boolean {
        return this.data.data.action?.opposed?.type === 'defense';
    }
}
