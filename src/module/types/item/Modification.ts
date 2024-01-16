/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export interface ModificationData extends
        ModificationPartType,
        DescriptionPartData,
        ImportFlags,
        TechnologyPartData {

    }

    /**
     * Fields to modify matching parent item fields with during item preparation
     */
    export interface ModificationPartType {
        type: 'weapon' | 'armor' | 'vehicle' | ''
        mount_point: MountType
        modification_category: ModificationCategoryType
        dice_pool: number
        accuracy: number
        rc: number
        conceal: number
        slots: number
    }

    export type MountType = 'barrel' | 'stock' | 'top' | 'side' | 'internal' | '';

    export type ModificationCategoryType = 'body' | 'cosmetic' | 'electromagnetic' | 'power_train' | 'protection' | 'weapons' | '';
}
