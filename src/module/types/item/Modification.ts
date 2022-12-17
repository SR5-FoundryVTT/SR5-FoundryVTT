/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export interface ModificationData extends
        ModificationPartType,
        DescriptionPartData,
        TechnologyPartData {

    }

    /**
     * Fields to modify matching parent item fields with during item preparation
     */
    export interface ModificationPartType {
        type: 'weapon' | 'armor' | ''
        mount_point: MountType
        dice_pool: number
        accuracy: number
        rc: number
        conceal: number
    }

    export type MountType = 'barrel' | 'stock' | 'top' | 'side' | 'internal' | '';
}
