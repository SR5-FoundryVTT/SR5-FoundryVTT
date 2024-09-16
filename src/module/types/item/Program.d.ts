declare namespace Shadowrun {
    export interface ProgramData extends
        ProgramPartData,
        DescriptionPartData,
        ImportFlags,
        TechnologyPartData {

    }

    export interface ProgramPartData {
        type: ProgramTypes;
    }

    export type ProgramTypes = 'common_program' | 'hacking_program' | '';
}
