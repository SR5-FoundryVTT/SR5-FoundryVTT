declare namespace Shadowrun {
    export type SpritePower = SR5ItemType & {
        type: 'critter_power';
    };

    export type SpritePowerData = {
        action: ActionData;
    };
}
