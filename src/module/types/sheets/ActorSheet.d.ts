declare namespace Shadowrun {
    export interface SR5ActorSheetData {
        config: typeof SR5CONFIG
        system: ShadowrunActorDataData
        filters: SR5SheetFilters
        isCharacter: boolean
        isSpirit: boolean
        isCritter: boolean
        isVehicle: boolean
        awakened: boolean
        emerged: boolean
        woundTolerance: number
        vehicle: SR5VehicleSheetData
        hasSkills: boolean
        canAlterSpecial: boolean
        hasFullDefense: boolean
        effects: any[]
    }

    type AllEnabledEffectsSheetData = any[];

    export interface SR5SheetFilters {
        skills: string
        showUntrainedSkills
    }

    // Describe a targeted FoundryVTT document.
    export interface TargetedDocument {
        // Name of the document or manually entered by user.
        name: string
        // The Foundry Document marked.
        document: Shadowrun.NetworkDevice
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
        type: Translation

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

    /**
     * Designed to work with Item.toObject() but it's not fully implementing all ItemData fields.
     */
    interface SheetItemData {
        type: string,
        name: string,
        data: Shadowrun.ShadowrunItemDataData
        system: Shadowrun.ShadowrunItemDataData
        properties: any,
        description: any
    }

    interface InventorySheetDataByType {
        type: string;
        label: string;
        isOpen: boolean;
        items: SheetItemData[];
    }

    interface InventorySheetData {
        name: string,
        label: string,
        types: Record<string, InventorySheetDataByType>
    }

    type InventoriesSheetData = Record<string, InventorySheetData>;
}
