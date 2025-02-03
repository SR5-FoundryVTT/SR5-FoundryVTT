declare namespace Shadowrun {
    export type TechnologyPartData = {
        technology: TechnologyData
    };
    export type TechnologyData = {
        rating: NumberOrEmpty
        availabilityAdjusted: boolean
        baseAvailability: string
        availability: string
        quantity: NumberOrEmpty
        costAdjusted: boolean
        baseCost: NumberOrEmpty
        cost: NumberOrEmpty
        equipped: boolean
        conceal: ModifiableValue
        condition_monitor: ConditionData
        wireless: boolean
        networkController: string
    };

}
