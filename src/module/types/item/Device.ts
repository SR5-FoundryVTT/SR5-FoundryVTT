/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export interface DeviceData extends
        DevicePartData,
        DescriptionPartData,
        ImportFlags,
        TechnologyPartData {

    }

    // This category is used for both Device and Host item types to differentiate attribute handling.
    export type DeviceCategory = 'commlink' | 'cyberdeck' | 'rcc' | 'host' | '';

    export interface DevicePartData {
        category: DeviceCategory
        atts: any // MatrixAttributes
        networkDevices: string[]
    }

    export interface DeviceAttribute {
        // The actual value of the device attribute.
        value: number;
        // The attribute name of the device attribute.
        att: MatrixAttribute;
        // Is used to determine if a device attribute should be editable on the sheet.
        editable: boolean
    }

    // PAN / WAN networking
    export type NetworkDeviceType = 'Token' | 'Actor' | 'Host';
    export interface NetworkDeviceLink {
        sceneId: string|undefined,
        ownerId: string|undefined,
        targetId: string,
        type: NetworkDeviceType
    }
}
