/// <reference path="../Shadowrun.ts" />

/**
 * Types for Actor.data and Actor.data.data with foundry-vtt-types pattern used:
 * https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/%5B0.7.x%5D-Actors-and-Items
 *
 * The naming pattern is as follows:
 * - Actor.data => XYZActorData (CharacterData)
 * - Actor.data.data => XYZData (CharacterData)
 *
 * * Don't put property definitions here. Keep the top level definitions clean.
 *
 * TODO: Remove all none foundry-vtt-types with naming collision to the interfaces like CharacterActorData2
 * TODO: Remove all 2 names
 */
declare namespace Shadowrun {
    // Register your global ActorData types here. Try sorting your ActorData types alphabetically.
    export type ShadowrunActorData =
        CharacterActorData |
        CritterActorData |
        SpiritActorData |
        SpriteActorData |
        VehicleActorData;

    export type ActorTypesData =
        CharacterData |
        CritterData |
        SpiritData |
        SpriteData |
        VehicleData;

    // Replaced this: TODO: Maybe the typing order with | is relevant?
    // export type SR5ActorData =
    //         SpiritData
    //         | CharacterData
    //         | SpriteData
    //         | VehicleData
    //         | CritterData;


    // Setup your global ActorData types below here. Try sorting your ActorData types alphabetically.
    export interface CharacterActorData extends Actor.Data<CharacterData, ShadowrunItemData> {
        type: 'character';
    }
    export interface CritterActorData extends Actor.Data<CritterData, ShadowrunItemData> {
        type: 'critter';
    }
    export interface SpiritActorData extends Actor.Data<SpiritData, ShadowrunItemData> {
        type: 'spirit';
    }
    export interface SpriteActorData extends Actor.Data<SpriteData, ShadowrunItemData> {
        type: 'sprite';
    }
    export interface VehicleActorData extends Actor.Data<VehicleData, ShadowrunItemData> {
        type: 'vehicle';
    }
}