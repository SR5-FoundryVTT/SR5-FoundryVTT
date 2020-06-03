/// <reference path="Shadowrun.ts" />
declare namespace Shadowrun {
    export type Item = {
        name: string,
        folder: string | null,
        type: string,
        data: ItemData,
        permission: {
            default: 2
        }
    }

    type ItemData = {
        description: DescriptionData;
        technology: TechnologyData;
        condition_monitor: ConditionData;
    }

    /**
     * Technology data for an item.
     */
    export type TechnologyData = {
        rating: NumberOrEmpty;
        availability: string;
        quantity: NumberOrEmpty;
        cost: NumberOrEmpty;
        equipped: boolean;
        conceal: ModifiableValue
    };

    /**
     * Condition data for an item.
     */
    export type ConditionData = ValueMaxPair<number>;

    /**
     * Description data for an item.
     */
    export type DescriptionData = {
        value: string;
        chat: string;
        source: string
    };
}