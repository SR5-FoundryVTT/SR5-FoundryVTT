/**
 * Parses a certain class of gear (depending on the implementation).
 */
export interface GearParser {
    /**
     * Parses a gear entry and returns the corresponding foundry sr item data.
     * @param g A chummer gear entry
     */
    parse(g : any) : any
}

/**
 * Base class for all gear parsers. Parses common information across all gear.
 */
export class BaseGearParser implements GearParser {
    parse(g : any) : any {
        const parsedGear = this.getDefaultData();
        parsedGear.name = g.name;
        if (g.extra)
        {
            parsedGear.name += ` (${g.extra})`;
        }

        parsedGear.data.technology.rating = g.rating;
        parsedGear.data.technology.quantity = g.qty;
        parsedGear.data.description =
        {
            value: '',
            chat: '',
            source: `${g.source} ${g.page}`
        };

        return parsedGear;
    }

    private getDefaultData() {
        return {
            name: '',
            _id: '',
            folder: '',
            flags: {},
            type: 'equipment',
            data: {
                description: {
                    value: '',
                    chat: '',
                    source: '',
                },
                technology: {
                    rating: 1,
                    availability: '',
                    quantity: 1,
                    cost: 0,
                    equipped: false,
                    conceal: {
                        base: 0,
                        value: 0,
                        mod: [],
                    },
                    condition_monitor: {
                        label: '',
                        value: 0,
                        max: 0,
                    },
                }
            },
            permission: {
                default: 2,
            },
        };
    }
}

