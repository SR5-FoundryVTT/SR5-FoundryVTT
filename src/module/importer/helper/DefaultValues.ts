import DamageData = Shadowrun.DamageData;

/**
 * TODO: Add unittesting to DefaultValues helper.
 */
export class DefaultValues {
    /**
     *
     * @param partialDamageData give partial DamageData fields to overwrite default values
     */
    static damageData(partialDamageData: Partial<DamageData> = {}): DamageData {
        return mergeObject({
            type: {
                base: 'physical',
                value: 'physical',
            },
            element: {
                base: '',
                value: '',
            },
            base: 0,
            value: 0,
            ap: {
                base: 0,
                value: 0,
                mod: [],
            },
            attribute: '',
            mod: [],
            base_formula_operator: 'add'
        }, partialDamageData) as DamageData;
    }
}