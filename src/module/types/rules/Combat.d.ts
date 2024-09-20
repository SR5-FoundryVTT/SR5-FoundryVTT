/// <reference path="Shadowrun.d.ts" />

declare namespace Shadowrun {
    /**
     * Everything around SR5#190 'Active Defenses'
     */
    export type ActiveDefenseData = Record<string, { label: Translation, value: number | undefined, initMod: number, weapon?: string, disabled?: boolean }>
}