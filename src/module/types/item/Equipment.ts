declare namespace Shadowrun {
    export type Equipment = SR5ItemData<EquipmentData> & {
        type: 'equipment';
    };

    export type EquipmentData = DescriptionPartData & TechnologyPartData;
}
