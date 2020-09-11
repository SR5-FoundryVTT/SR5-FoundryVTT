/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type SpritePower = SR5ItemType & {
        type: 'sprite_power';
    };

    export type SpritePowerData = {
        action: ActionData;
    };
}
