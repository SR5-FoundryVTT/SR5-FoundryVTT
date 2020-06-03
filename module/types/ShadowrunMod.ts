/// <reference path="Shadowrun.ts" />
declare namespace Shadowrun {
    export type Mod = Item & {
        type: "modification",
        data: {
            type: "weapon"|"armor"|""
            mount_point: MountType,
            dice_pool: number,
            accuracy: number,
            rc: number
        }
    }

    export type MountType = "barrel"|"stock"|"top"|"side"|"internal"|"";
}
