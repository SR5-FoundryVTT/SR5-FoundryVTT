declare namespace Shadowrun {
    export type AdeptPower = SR5ItemData<AdeptPowerData> & {
        type: 'adept_power';
    };

    export type AdeptPowerData = AdeptPowerPartData & DescriptionPartData & ActionPartData & ArmorPartData;

    export type AdeptPowerPartData = {
        pp: number;
        type: string;
        drain: boolean;
        level: number;
    };
}
