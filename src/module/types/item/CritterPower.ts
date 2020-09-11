declare namespace Shadowrun {
    export type CritterPower = SR5ItemType & {
        type: 'critter_power';
    };

    export type CritterPowerData = {
        action: ActionData;
        powerType: keyof typeof CONFIG.SR5.critterPower.types;
        range: keyof typeof CONFIG.SR5.critterPower.ranges;
        duration: keyof typeof CONFIG.SR5.critterPower.durations;
    };
}
