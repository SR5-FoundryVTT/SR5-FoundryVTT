/// <reference path="Shadowrun.d.ts" />

declare namespace Shadowrun {
    /**
     * Any document that can be part of a matrix network
     * - SR5Item => Equipment / Device
     * - SR5Actor => Vehicle
     */
    export type NetworkDevice = SR5Actor | SR5Item;
}