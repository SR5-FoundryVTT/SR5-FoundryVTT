declare namespace Shadowrun {
    export interface ComplexFormData extends
        ComplexFormPartData,
        DescriptionPartData,
        ActionPartData {

    }
    export type ComplexFormTarget = 'persona' | 'device' | 'file' | 'self' | 'sprite' | 'other' | '';

    export interface ComplexFormPartData {
        target: ComplexFormTarget
        duration: string
        fade: number
    }
}
