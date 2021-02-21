import { BaseGearParser } from "./BaseGearParser"

/**
 * Parses SINs and the attached licenses.
 * Licenses that are not attached to a SIN are not handled.
 */
export class SinParser extends BaseGearParser {
    parse(gearEntry : any) : any {
        const parsedGear =  super.parse(gearEntry);
        parsedGear.type = 'sin';

        // Create licenses if there are any
        if (gearEntry.children) {

            // "gear" is either  a single gear entry or an array of gear entries depending on the number of licenses
            const licenseEntries : any[] = [];
            if (!Array.isArray(gearEntry.children.gear)) {
                licenseEntries.push(gearEntry.children.gear)
            }
            else {
                licenseEntries.push(...gearEntry.children.gear);
            }

            parsedGear.data.licenses = this.parseLicenses(licenseEntries);
        }
        return parsedGear;
    }

    private parseLicenses(licenseEntries : any) : any[] {
        const parsedLicenses : any[] = []; 

        licenseEntries.forEach(licenseEntry => {
            if (licenseEntry.category === 'ID/Credsticks')
            {
                parsedLicenses.push(
                    {
                        name: licenseEntry.extra, // 'extra' holds the type of license from chummer
                        rtg: licenseEntry.rating,
                        description: ''
                    }
                );
            }
        });

        return parsedLicenses;
    }
}
