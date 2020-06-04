/// <reference path="Shadowrun.ts" />
declare namespace Shadowrun {
    export type Item = {
        name: string;
        folder: string | null;
        type: string;
        data: ItemData;
        permission: {
            default: 2;
        };
    };

    type ItemData = Partial<TechnologyData> &
        Partial<ArmorData> &
        Partial<ActionData> &
        Partial<CyberwareData> &
        Partial<DeviceData> & {
            description: DescriptionData;
            condition_monitor?: ConditionData;
        };

    export type TechnologyData = {
        technology: TechnologyMetaData;
    };

    /**
     * Technology data for an item.
     */
    export type TechnologyMetaData = {
        rating: NumberOrEmpty;
        availability: string;
        quantity: NumberOrEmpty;
        cost: NumberOrEmpty;
        equipped: boolean;
        conceal: ModifiableValue;
    };

    /**
     * Condition data for an item.
     */
    export type ConditionData = ValueMaxPair<number>;

    /**
     * Description data for an item.
     */
    export type DescriptionData = {
        description: {
            value: string;
            chat: string;
            source: string;
        };
    };
}
