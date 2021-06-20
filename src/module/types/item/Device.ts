/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export interface DeviceData extends
        DevicePartData,
        DescriptionPartData,
        TechnologyPartData {

    }

    // This category is used for both Device and Host item types to differentiate attribute handling.
    export type DeviceCategory = 'commlink' | 'cyberdeck' | 'host' | '';

    export interface DevicePartData {
        category: DeviceCategory;
        // A interchangeable list of device attributes.
        atts: {
            att1: DeviceAttribute;
            att2: DeviceAttribute;
            att3: DeviceAttribute;
            att4: DeviceAttribute;
        };
    }

    export interface DeviceAttribute {
        // The actual value of the device attribute.
        value: number;
        // The attribute name of the device attribute.
        att: MatrixAttribute;
        // Is used to determine if a device attribute should be editable on the sheet.
        editable: boolean
    }
}
