/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export interface ModificationData extends
        ModificationPartType,
        DescriptionPartData,
        TechnologyPartData {

    }

    export interface ModificationPartType {
        type: 'weapon' | 'armor' | '';
        mount_point: MountType;
        dice_pool: number;
        accuracy: number;
        rc: number;
    }

    export type MountType = 'barrel' | 'stock' | 'top' | 'side' | 'internal' | '';

}
