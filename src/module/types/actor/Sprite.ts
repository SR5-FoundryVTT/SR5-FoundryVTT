/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type SpriteType = keyof typeof CONFIG.SR5.spriteTypes;

    export type SR5SpriteType = SR5ActorBase & {
        data: SpriteActorData;
        type: 'sprite';
    };
    export type SpriteActorData = CommonActorData & MatrixActorData & {
        level: number;
        services: number;
        registered: boolean;
        spriteType: SpriteType;
    };

}
