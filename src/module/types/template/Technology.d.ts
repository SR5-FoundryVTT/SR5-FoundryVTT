declare namespace Shadowrun {
    export type TechnologyPartData = {
        attributes: AttributesData
        technology: TechnologyData
        matrix: MatrixTechnologyData
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

        // Network PAN/WAN master device uuid
        master: string
        networkController: string

        // These values match their named counterparts but will only ever containe
        // calculated values based on their original.
        // This is smilar to the ValueField style and is only used here for simplicity
        // to avoid migration with the legacy Migrator...
        // With DataModel Migrations we should migrate this back to their connected values
        // and transform them from simple datatypes to ValueField, also allowing for better 
        // ActiveEffect support.
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

    export type MatrixTechnologyData = {
        matrix: MatrixDeviceData
    }
}
