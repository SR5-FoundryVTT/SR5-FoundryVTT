declare namespace Shadowrun {
    interface SummoningData
        {
            spirit: {
                // What type of spirit should be created.
                // TODO: Add typing to spirit types
                type: string
                // What force the spirit should have.
                force: number
                // A pre-created spirit actor uuid to use instead of a generic type / force creation.
                uuid: string
            }
        }
}