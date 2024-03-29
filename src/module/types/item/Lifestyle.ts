declare namespace Shadowrun {
    export interface LifestyleData extends
        LifestylePartData,
        ImportFlags,
        DescriptionPartData {

    }

    export interface LifestylePartData {
        type: string;
        comforts: number;
        security: number;
        neighborhood: number;
        guests: number;
        permanent: boolean;
        cost: number;
        mods: [];
    }
}
