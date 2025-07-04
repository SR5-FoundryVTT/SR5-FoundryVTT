declare namespace Shadowrun {
    export interface SinData extends
        SinPartData,
        DescriptionPartData,
        ImportFlags,
        TechnologyPartData {

    }

    export interface SinPartData {
        licenses: LicenseData[]
        // List of networks this SIN has access to
        // Stored as list of uuids
        networks: string[]
    }

    export interface LicenseData {
        name: string
        rtg: string
        description: string
    }
}
