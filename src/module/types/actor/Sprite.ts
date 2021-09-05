/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type SpriteType = keyof typeof SR5CONFIG.spriteTypes;

    export interface SpriteData extends
        CommonData,
        MatrixActorData {
            level: number;
            services: number;
            registered: boolean;
            spriteType: SpriteType;
    }
}
