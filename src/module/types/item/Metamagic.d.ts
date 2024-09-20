declare namespace Shadowrun {
    export interface MetamagicData extends
        MetamagicPartData,
        ActionPartData,
        ImportFlags,
        DescriptionPartData {

    }

    // Placeholder type for similarity to other item types.
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface MetamagicPartData {}
}
