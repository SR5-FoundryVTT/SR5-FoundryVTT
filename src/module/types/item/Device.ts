/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export interface DeviceData extends
        DevicePartData,
        DescriptionPartData,
        TechnologyPartData {

    }

    export type DeviceCategory = 'commlink' | 'cyberdeck';

    export interface DevicePartData {
        category: DeviceCategory;
        atts: {
            att1: DeviceAttribute;
            att2: DeviceAttribute;
            att3: DeviceAttribute;
            att4: DeviceAttribute;
        };
    }

    export interface DeviceAttribute {
        value: number;
        att: MatrixAttribute;
    }
}
