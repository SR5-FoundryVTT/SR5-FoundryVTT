import { formatAsSlug, genImportFlags, getArray, parseDescription, parseTechnology } from "../importHelper/BaseParserFunctions"
import { BaseGearParser } from "../importHelper/BaseGearParser"
import { DataDefaults } from "src/module/data/DataDefaults";
import { ActorSchema } from "../../ActorSchema";
import { Unwrap } from "../ItemsParser";

/**
 * Parses SINs and the attached licenses.
 * Licenses that are not attached to a SIN are not handled.
 */
export class SinParser extends BaseGearParser {
    override parse(chummerGear: Unwrap<NonNullable<ActorSchema['gears']>['gear']>): Item.CreateData {
        const parserType = 'sin';
        const parsedGear = {
            name: chummerGear.name || 'Unnamed',
            type: parserType,
            system: DataDefaults.baseSystemData(parserType)
        } satisfies Item.CreateData;

        const system = parsedGear.system;

        system.technology = parseTechnology(chummerGear);
        system.description = parseDescription(chummerGear);

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(chummerGear.name), parserType);

        // Create licenses if there are any
        if (chummerGear.children) {
            parsedGear.system.licenses = this.parseLicenses(getArray(chummerGear.children));
        }

        // Assign import flags
        parsedGear.system.importFlags = genImportFlags(formatAsSlug(chummerGear.name_english), parserType);

        return parsedGear;
    }

    private parseLicenses(chummerLicenses : any) : any[] {
        const parsedLicenses : any[] = [];

        chummerLicenses.forEach(chummerLicense => {
            if (chummerLicense.category_english === 'ID/Credsticks')
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
