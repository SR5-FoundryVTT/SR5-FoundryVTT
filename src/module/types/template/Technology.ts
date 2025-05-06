declare namespace Shadowrun {
    export type TechnologyPartData = {
        technology: TechnologyData
    };
    export type TechnologyData = {
        rating: NumberOrEmpty
        availability: string
        quantity: NumberOrEmpty
        cost: NumberOrEmpty
        equipped: boolean
        conceal: ModifiableValue
        condition_monitor: ConditionData
        wireless: boolean
        networkController: string
        calculated: {
            essence: {
                value: NumberOrEmpty
                adjusted: boolean
            }
            availability: {
                value: string
                adjusted: boolean
            }
            cost: {
                value: NumberOrEmpty
                adjusted: boolean
            }
        };
    };

}
