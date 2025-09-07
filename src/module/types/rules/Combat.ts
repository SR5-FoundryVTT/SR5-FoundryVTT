declare namespace Shadowrun {
    /**
     * Everything around SR5#190 'Active Defenses'
     * taM check this
     */
    export type ActiveDefenseData = Record<string, { label: any, value: number | undefined, initMod: number, weapon?: string, disabled?: boolean }>
}
