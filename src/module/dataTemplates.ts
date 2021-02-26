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

export const DataTemplates = {
    grunt: {
        metatype_modifiers: {
            elf: {
                attributes: {
                    agility: +1,
                    charisma: +2,
                    edge: -1
                }
            },
            ork: {
                attributes: {
                    body: +3,
                    strength: +2,
                    logic: -1,
                    charisma: -1,
                    edge: -1
                }
            },
            troll: {
                attributes: {
                    body: +4,
                    agility: -1,
                    strength: +4,
                    logic: -1,
                    intuition: -1,
                    charisma: -2,
                    edge: -1,
                },
                general: {
                    armor: +1
                }
            },
            dwarf: {
                attributes: {
                    body: +2,
                    reaction: -1,
                    strength: +2,
                    willpower: +1,
                    edge: -1
                }
            }
        }
    },
    damage: DefaultValues.damageData({type: {base: '', value: ''}}),
}