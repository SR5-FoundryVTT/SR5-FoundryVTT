declare namespace Shadowrun {
    interface CompilationData {
        sprite: {
            // Type of sprite to compile
            // TODO: Add typing to sprite types
            type: string
            // Prepared level of sprite
            level: number
            // A optional pre-created sprite actor uuid to use instead of a generic created.
            uuid: string
        }
    }
}
