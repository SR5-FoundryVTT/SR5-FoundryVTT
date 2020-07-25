/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type SR5ItemType = {
        name: string;
        _id: string;
        folder: string | null;
        type: string;
        data: SR5ItemData;
        flags: object;
        permission: {
            default: number;
        };
    };

    type SR5ItemData = Partial<TechnologyData> &
        Partial<ArmorData> &
        Partial<ActionData> &
        Partial<CyberwareData> &
        Partial<DeviceData> &
        Partial<WeaponData> &
        Partial<SpellData> &
        Partial<ComplexFormData> & {
            description: DescriptionData;
        };

    /**
     * Technology data for an item.
     */
    export type TechnologyData = {
        technology: {
            rating: NumberOrEmpty;
            availability: string;
            quantity: NumberOrEmpty;
            cost: NumberOrEmpty;
            equipped: boolean;
            conceal: ModifiableValue;
            condition_monitor?: ConditionData;
        };
    };

    /**
     * Condition data for an item.
     */
    export type ConditionData = ValueMaxPair<number> & LabelField;

    /**
     * Description data for an item.
     */
    export type DescriptionData = {
        value: string;
        chat: string;
        source: string;
    };
}
