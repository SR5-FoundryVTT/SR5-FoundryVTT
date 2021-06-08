declare namespace Shadowrun {
    export type AdeptPowerData = AdeptPowerPartData & DescriptionPartData & ActionPartData & ArmorPartData;

    export type AdeptPowerPartData = {
        pp: number;
        type: string;
        drain: boolean;
        level: number;
    };
}
