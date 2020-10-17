/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type Device = SR5ItemData<DeviceData> & {
        type: 'device';
    };

    export type DeviceData = DevicePartData & DescriptionPartData & TechnologyPartData;

    export type DeviceCategory = 'commlink' | 'cyberdeck';

    export type DevicePartData = {
        category: DeviceCategory;
        atts: {
            att1: DeviceAttribute;
            att2: DeviceAttribute;
            att3: DeviceAttribute;
            att4: DeviceAttribute;
        };
    };

    export type DeviceAttribute = {
        value: number;
        att: MatrixAttribute;
    };
}
