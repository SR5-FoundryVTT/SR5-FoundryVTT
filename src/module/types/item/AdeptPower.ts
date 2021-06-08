declare namespace Shadowrun {
    export interface AdeptPowerData extends AdeptPowerPartData, DescriptionPartData, ActionPartData, ArmorPartData {

    }

    export interface AdeptPowerPartData {
        pp: number;
        type: string;
        drain: boolean;
        level: number;
    }
}
