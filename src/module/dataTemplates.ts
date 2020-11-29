import ActorAttribute = Shadowrun.ActorAttribute;
import DamageData = Shadowrun.DamageData;

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
    damage: {
        type: {
            value: "",
            base: ""
        },
        element: {
            value: "",
            base: ""
        },
        value: 0,
        base: 0,
        ap: {
            value: 0,
            base: 0,
            mod: []
        },
        attribute: "",
        mod: []
    } as DamageData
}