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
        condition_monitor?: ConditionData
        wireless: boolean
        networkController: string
    };

}
