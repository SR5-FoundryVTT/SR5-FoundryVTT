/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type Device = Item & {
        type: 'device';
        data: DeviceData;
    };

    export type DeviceCategory = 'commlink' | 'cyberdeck';

    export type DeviceData = TechnologyData & {
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
