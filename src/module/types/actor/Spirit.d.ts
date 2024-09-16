/// <reference path="../Shadowrun.d.ts" />

declare namespace Shadowrun {
    export type SpiritType = keyof typeof SR5CONFIG.spiritTypes

    type SpiritAttributes = Attributes & {
        force: AttributeField
    }
    
    export interface SpiritData extends
        CommonData,
        MagicActorData,
        TwoTrackActorData,
        ArmorActorData,
        WoundsActorData,
        MovementActorData,
        NPCActorData {
            // FoundryVTT uuid of the summoning actors spirit.
            // If no summoner is set, uuid will be empty.
            summonerUuid: string

            values: PhysicalCombatValues
            spiritType: SpiritType
            force: number
            limits: AwakendLimits
            services: number
            attributes: SpiritAttributes
            modifiers: Modifiers & CommonModifiers
    }
}
