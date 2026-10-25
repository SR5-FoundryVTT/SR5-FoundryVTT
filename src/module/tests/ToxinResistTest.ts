import { SuccessTest, SuccessTestData, TestOptions } from "./SuccessTest";
import { DataDefaults } from "../data/DataDefaults";
import { ModifiableValue } from "../mods/ModifiableValue";
import { DeepPartial } from "fvtt-types/utils";
import { MinimalActionType, DamageType } from "../types/item/Action";
import type { ChemicalType } from "../types/template/Chemical";
import ModifierTypes = Shadowrun.ModifierTypes;

export interface ToxinResistTestData extends SuccessTestData {
    // The chemical being resisted, as delivered.
    payload: ChemicalType & { sourceUuid?: string };
    // The Power left after resisting. Zero means the chemical takes no effect.
    power: number;
    // The damage the remaining Power causes, if the chemical causes any.
    modifiedDamage: DamageType;
}

/**
 * Resisting a toxin, or the overdose of a drug: Body + Willpower + protective gear rating. Each hit
 * reduces the Power by 1. With Power left, the effect depends on it. SR5#409 'Toxin Resistance Test'.
 *
 * Protective gear rating is lowered by the toxins Penetration. Gear protecting against specific
 * vectors is applied through resist_toxin modifiers.
 */
export class ToxinResistTest extends SuccessTest<ToxinResistTestData> {
    override _prepareData(data: DeepPartial<ToxinResistTestData>, options: Partial<TestOptions>): ToxinResistTestData {
        const prepared = super._prepareData(data, options);
        prepared.payload = (prepared.payload ?? {}) as ToxinResistTestData['payload'];
        prepared.payload.power = Number(prepared.payload.power ?? 0);
        prepared.payload.penetration = Number(prepared.payload.penetration ?? 0);
        prepared.payload.damageType ??= 'stun';
        prepared.power = prepared.payload.power;
        prepared.modifiedDamage ??= DataDefaults.createData('damage');
        return prepared;
    }

    static override _getDefaultTestAction(): DeepPartial<MinimalActionType> {
        return { attribute: 'body', attribute2: 'willpower' };
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['resist', 'resist_toxin'];
    }

    // Wound modifiers don't apply to resisting, as with damage. SR5#170.
    override get testModifiers(): ModifierTypes[] {
        return [];
    }

    override get canBeExtended() {
        return false;
    }

    /**
     * Fully resisted, the chemical takes no effect.
     */
    override get success(): boolean {
        return this.remainingPower <= 0;
    }

    override get failure(): boolean {
        return !this.success;
    }

    override get successLabel() {
        return 'SR5.Toxin.Resisted' as const;
    }

    override get failureLabel() {
        return 'SR5.Toxin.TakesEffect' as const;
    }

    /**
     * The Power left after this tests hits.
     */
    get remainingPower(): number {
        return Math.max(0, this.data.payload.power - this.hits.value);
    }

    /**
     * Record the remaining Power and the damage it causes, as steps following read them.
     */
    override async processResults() {
        this.data.power = this.remainingPower;

        const type = this.data.payload.damageType;
        const value = type === 'none' ? 0 : this.data.power;
        this.data.modifiedDamage = DataDefaults.createData('damage', {
            base: value,
            type: { base: type === 'none' ? '' : type, value: type === 'none' ? '' : type },
        });
        ModifiableValue.calcTotal(this.data.modifiedDamage, { min: 0 });

        await super.processResults();
    }
}
