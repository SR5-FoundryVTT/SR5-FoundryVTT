declare namespace Shadowrun {
    export type CritterPowerCategory = 'mundane' | 'paranormal' | 'weakness' | 'emergent' | 'drake' | 'shapeshifter' | 'free_spirit' | 'paranormal_infected' | 'echoes' | '';
    export type CritterPowerData =
        CritterPowerPartData &
        ActionPartData &
        DescriptionPartData &
        ArmorPartData;

    export type CritterPowerPartData = {
        category: keyof typeof SR5CONFIG.critterPower.categories;
        powerType: keyof typeof SR5CONFIG.critterPower.types;
        range: CritterPowerRange;
        duration: keyof typeof SR5CONFIG.critterPower.durations;
        karma: number;
    };

    export type CritterPowerRange = keyof typeof SR5CONFIG.critterPower.ranges;
}
