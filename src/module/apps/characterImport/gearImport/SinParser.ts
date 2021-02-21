import { BaseGearParser } from "./BaseGearParser"

/**
 * Parses SINs and the attached licenses.
 * Licenses that are not attached to a SIN are not handled.
 */
export class SinParser extends BaseGearParser {
    parse(chummerGear : any) : any {
        const parsedGear =  super.parse(chummerGear);
        parsedGear.type = 'sin';

        // Create licenses if there are any
        if (chummerGear.children) {

            // "gear" is either  a single gear entry or an array of gear entries depending on the number of licenses
            const chummerLicenses : any[] = [];
            if (!Array.isArray(chummerGear.children.gear)) {
                chummerLicenses.push(chummerGear.children.gear)
            }
            else {
                chummerLicenses.push(...chummerGear.children.gear);
            }

            parsedGear.data.licenses = this.parseLicenses(chummerLicenses);
        }
        return parsedGear;
    }

    private parseLicenses(chummerLicenses : any) : any[] {
        const parsedLicenses : any[] = []; 

        chummerLicenses.forEach(chummerLicense => {
            if (chummerLicense.category === 'ID/Credsticks')
            {
                parsedLicenses.push(
                    {
                        name: chummerLicense.extra, // 'extra' holds the type of license from chummer
                        rtg: chummerLicense.rating,
                        description: ''
                    }
                );
            }
        });

        return parsedLicenses;
    }
}
