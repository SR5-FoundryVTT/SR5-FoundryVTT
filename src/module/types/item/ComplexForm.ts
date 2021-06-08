declare namespace Shadowrun {
    export type ComplexFormData =
        ComplexFormPartData &
        DescriptionPartData &
        ActionPartData;
    export type ComplexFormTarget = 'persona' | 'device' | 'file' | 'self' | 'sprite' | 'other' | '';

    export type ComplexFormPartData = {
        target: ComplexFormTarget
        duration: string
        fade: number
    };
}
