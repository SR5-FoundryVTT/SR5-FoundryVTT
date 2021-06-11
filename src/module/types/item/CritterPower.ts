declare namespace Shadowrun {
    export interface CritterPowerData extends
        CritterPowerPartData,
        ActionPartData,
        DescriptionPartData,
        ArmorPartData {

    }

    export interface CritterPowerPartData {
        category: keyof typeof SR5CONFIG.critterPower.categories;
        powerType: keyof typeof SR5CONFIG.critterPower.types;
        range: CritterPowerRange;
        duration: keyof typeof SR5CONFIG.critterPower.durations;
        karma: number;
    }

    export type CritterPowerCategory = 'mundane' | 'paranormal' | 'weakness' | 'emergent' | 'drake' | 'shapeshifter' | 'free_spirit' | 'paranormal_infected' | 'echoes' | '';
    export type CritterPowerRange = keyof typeof SR5CONFIG.critterPower.ranges;
}
