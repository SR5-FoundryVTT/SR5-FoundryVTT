declare namespace Shadowrun {
    export type Technology = SR5ItemData<TechnologyPartData>;
    export type TechnologyPartData = {
        technology: {
            rating: NumberOrEmpty;
            availability: string;
            quantity: NumberOrEmpty;
            cost: NumberOrEmpty;
            equipped: boolean;
            conceal: ModifiableValue;
            condition_monitor?: ConditionData;
            wireless: boolean;
        };
    };
}
