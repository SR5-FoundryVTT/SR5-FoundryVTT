/**
 * Parses a certain class of gear (depending on the implementation).
 */
export interface GearParser {
    /**
     * Parses a gear entry and returns the corresponding foundry sr item data.
     * @param chummerGear A chummer gear entry
     */
    parse(chummerGear : any) : any
}

/**
 * Base class for all gear parsers. Parses common information across all gear.
 */
export class BaseGearParser implements GearParser {
    parse(chummerGear : any) : any {
        const parsedGear = this.getDefaultData();
        parsedGear.name = chummerGear.name;
        if (chummerGear.extra)
        {
            parsedGear.name += ` (${chummerGear.extra})`;
        }

        parsedGear.data.technology.rating = chummerGear.rating;
        parsedGear.data.technology.quantity = chummerGear.qty;
        parsedGear.data.technology.availability = chummerGear.avail;
        parsedGear.data.description =
        {
            value: '',
            chat: '',
            source: ''
        };

        if (chummerGear.source && chummerGear.page)
        {
            parsedGear.data.description.source = `${chummerGear.source} ${chummerGear.page}`;
        }

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

