/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type Modification = SR5ItemData<ModificationData> & {
        type: 'modification';
    };

    export type ModificationData = ModificationPartType & DescriptionPartData & TechnologyPartData;

    export type MountType = 'barrel' | 'stock' | 'top' | 'side' | 'internal' | '';
    export type ModificationPartType = {
        type: 'weapon' | 'armor' | '';
        mount_point: MountType;
        dice_pool: number;
        accuracy: number;
        rc: number;
    };
}
