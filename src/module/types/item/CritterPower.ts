declare namespace Shadowrun {
    export type CritterPower = SR5ItemData<CritterPowerData> & {
        type: 'critter_power';
    };

    export type CritterPowerData = CritterPowerPartData & ActionPartData & DescriptionPartData & ArmorPartData;

    export type CritterPowerPartData = {
        powerType: keyof typeof CONFIG.SR5.critterPower.types;
        range: keyof typeof CONFIG.SR5.critterPower.ranges;
        duration: keyof typeof CONFIG.SR5.critterPower.durations;
    };
}
