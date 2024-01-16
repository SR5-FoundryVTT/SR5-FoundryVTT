/// <reference path="./Shadowrun.ts" />
// NOTE: See https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/%5B0.8.x%5D-Actors-and-Items for reference
/**
 * Types for Actor and actor.system with foundry-vtt-types pattern used:
 * https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/%5B0.7.x%5D-Actors-and-Items
 *
 * The naming pattern is as follows:
 * - Actor => XYZActorData (CharacterData)
 * - actor.system => XYZData (CharacterData)
 *
 * * Don't put property definitions here. Keep the top level definitions clean.
 *
 */
declare namespace Shadowrun {
    // Register your global ActorData types here. Try sorting your ActorData types alphabetically.
    export type ShadowrunActorData =
        | CharacterActorData
        | CritterActorData
        | ICActorData
        | SpiritActorData
        | SpriteActorData
        | VehicleActorData;

    export type ShadowrunActorDataData =
        | CharacterData
        | CritterData
        | ICData
        | SpiritData
        | SpriteData
        | VehicleData;

    // Setup your global ActorData types below here. Try sorting your ActorData types alphabetically.
    export interface CharacterActorData {
        type: 'character';
        data: CharacterData; // TODO: foundry-vtt-type v10
        system: CharacterData;
    }
    export interface CritterActorData {
        type: 'critter';
        data: CritterData; // TODO: foundry-vtt-type v10
        system: CritterData;
    }
    export interface ICActorData {
        type: 'ic';
        data: ICData; // TODO: foundry-vtt-type v10
        system: ICData;
    }
    export interface SpiritActorData {
        type: 'spirit';
        data: SpiritData; // TODO: foundry-vtt-type v10
        system: SpiritData;
    }
    export interface SpriteActorData {
        type: 'sprite';
        data: SpriteData; // TODO: foundry-vtt-type v10
        system: SpriteData;
    }
    export interface VehicleActorData {
        type: 'vehicle';
        data: VehicleData; // TODO: foundry-vtt-type v10
        system: VehicleData;
    }
}