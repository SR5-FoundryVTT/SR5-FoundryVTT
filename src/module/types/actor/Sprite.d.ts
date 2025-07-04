/// <reference path="../Shadowrun.d.ts" />

declare namespace Shadowrun {
    export type SpriteType = keyof typeof SR5CONFIG.spriteTypes;

    export interface SpriteData extends
        CommonData,
        ImportFlags,
        MatrixActorData {
            level: number;
            services: number;
            registered: boolean;
            spriteType: SpriteType;
            modifiers: Modifiers & CommonModifiers;

            // FoundryVTT uuid of the compiling technomancer of this sprite.
            technomancerUuid: string;
    }
}
