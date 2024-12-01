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

    // Use to target a specific owned item anywhere in Foundry.
    export interface TargetedDocument {
        // Name of the document or manually entered by user.
        name: string
        target: any | null // The Foundry Document marked.
    }

    // Use to display Matrix Marks which Foundry Document their placed on.
    export interface MarkedDocument extends TargetedDocument {
        marks: number // The amount of marks placed.
        markId: string | null // For example <sceneId>/<targetId>/<itemId>. See Helpers.buildMarkId
        network: string // The host, grid or persona name the target is in
        type: Translation // The type of matrix icon
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
