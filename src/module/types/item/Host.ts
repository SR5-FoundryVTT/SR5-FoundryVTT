/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type Host = SR5ItemData<HostData> & {
        type: 'host'
    }

    export type HostData = DevicePartData & DescriptionPartData & {
        rating: number,
        owners: ActorIDField[],
        spiders: ActorIDField[],
        ic: ActorIDField[]
    };
}