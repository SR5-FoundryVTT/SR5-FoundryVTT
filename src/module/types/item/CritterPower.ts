declare namespace Shadowrun {
    export type CritterPower = SR5ItemData<CritterPowerData> & {
        type: 'critter_power';
    };
    export type CritterPowerCategory = 'mundane' | 'paranormal' | 'weakness' | 'emergent' | 'drake' | 'shapeshifter' | 'free_spirit' | 'paranormal_infected' | 'echoes' | '';
    export type CritterPowerData = CritterPowerPartData & ActionPartData & DescriptionPartData & ArmorPartData;

    export type CritterPowerPartData = {
        category: keyof typeof CONFIG.SR5.critterPower.categories;
        powerType: keyof typeof CONFIG.SR5.critterPower.types;
        range: CritterPowerRange;
        duration: keyof typeof CONFIG.SR5.critterPower.durations;
        karma: number;
    };

    export type CritterPowerRange = keyof typeof CONFIG.SR5.critterPower.ranges;
}
