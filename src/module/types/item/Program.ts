declare namespace Shadowrun {
    export type ProgramData =
        ProgramPartData &
        DescriptionPartData &
        TechnologyPartData;

    export type ProgramPartData = {
        type: ProgramTypes;
    };

    export type ProgramTypes = 'common_program' | 'hacking_program' | '';
}
