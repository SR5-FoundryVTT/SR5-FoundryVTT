declare namespace Shadowrun {
    /**
     * Call In Action can be used to create different types of actors.
     *
     * This is used for summoning spirits and compiling sprites.
     */
    export interface CallInActionData extends
        DescriptionPartData,
        ActionPartData,
        SummoningData,
        ImportFlags,
        CompilationData
        {
            // Define actor type to create. Should default to empty string.
            actor_type: '' | 'sprite' | 'spirit'
        }
}