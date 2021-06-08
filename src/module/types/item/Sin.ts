declare namespace Shadowrun {
    export interface SinData extends
        SinPartData,
        DescriptionPartData,
        TechnologyPartData {

    }

    export interface SinPartData {
        licenses: LicenseData[];
    }

    export interface LicenseData {
        name: string
        rtg: string
        description: string
    }
}
