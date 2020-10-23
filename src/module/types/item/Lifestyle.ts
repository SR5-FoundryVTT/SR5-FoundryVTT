declare namespace Shadowrun {
    export type Lifestyle = SR5ItemData<LifestyleData> & {
        type: 'lifestyle';
    };

    export type LifestyleData = LifestylePartData & DescriptionPartData;

    export type LifestylePartData = {
        type: string;
        comforts: number;
        security: number;
        neighborhood: number;
        guests: number;
        permanent: boolean;
        cost: number;
        mods: [];
    };
}
