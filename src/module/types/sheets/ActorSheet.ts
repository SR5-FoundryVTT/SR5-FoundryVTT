declare namespace Shadowrun {

    type AllEnabledEffectsSheetData = any[];

    // Describe a targeted FoundryVTT document.
    export interface TargetedDocument {
        // Name of the document or manually entered by user.
        name: string
        // The Foundry Document marked.
        document: Actor.Implementation | Item.Implementation
        // Optional token for those documents having them.
        token: TokenDocument | null
    }

    // Describe a target FoundryVTT document for the Shadowrun Matrix.
    export interface MatrixTargetDocument extends TargetedDocument {
        // The network name of the document.
        network: string
        // Indicates if the target is running silent.
        runningSilent: boolean
        // The type of matrix icon
        type: string

        // These properties are mostly used for optional sheet display.
        // The icons connected to this target.
        icons: MarkedDocument[]
        // Indicates if this target has been selected as a matrix action target.
        selected?: boolean
    }

    // Use to display Matrix Marks which Foundry Document their placed on.
    export interface MarkedDocument extends MatrixTargetDocument {
        marks: number // The amount of marks placed.
        markId: string | null // A foundryvtt uuid.
    }
}
