declare namespace Shadowrun {
    export type Sin = SR5ItemData<SinData> & {
        type: 'sin';
    };

    export type SinData = SinPartData & DescriptionPartData & TechnologyPartData;

    export type SinPartData = {
        licenses: LicenseData[];
    };

    export type LicenseData = {
        name: string
        rtg: string
        description: string
    }
}
