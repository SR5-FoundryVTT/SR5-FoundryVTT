import { parseDescription, getArray, createItemData, formatAsSlug, genImportFlags } from "../importHelper/BaseParserFunctions";
import * as IconAssign from '../../../../iconAssigner/iconAssign';
import { ActorSchema } from "../../ActorSchema";
import { Unwrap } from "../ItemsParser";

export class ContactParser {

    async parseContacts(chummerChar: ActorSchema, assignIcons: boolean) {

        const chummerContacts = getArray(chummerChar.contacts?.contact);
        const parsedContacts: Shadowrun.ContactItemData[] = [];
        const iconList = await IconAssign.getIconFiles();

        for (const chummerContact of chummerContacts) {
            try {
                const itemData = this.parseContact(chummerContact);

                // Assign the icon if enabled
                if (assignIcons)
                    itemData.img = IconAssign.iconAssign(itemData.system.importFlags, iconList, itemData.system);

                parsedContacts.push(itemData);
            } catch (e) {
                console.error(e);
            }
        };

        return parsedContacts;
    }

    parseContact(chummerContact: Unwrap<NonNullable<ActorSchema['contacts']>['contact']>) {
        const parserType = 'contact';
        const system = {} as Shadowrun.ContactData;
        system.type = chummerContact.role || '';

        // Group contacts are stored in chummer as 'Group(connectionRating)', e.g. 'Group(5)'
        // We handle group contacts as normal contacts until they are supported in the codebase.
        if (chummerContact.connection.toLowerCase().includes('group')) {
            system.connection = Number(chummerContact.connection
                .toLowerCase()
                .replace('group(', '')
                .replace(')', '')) || 0;
        }
        else {
            system.connection = Number(chummerContact.connection) || 0;
        }

        system.loyalty = Number(chummerContact.loyalty) || 0;
        system.family = chummerContact.family === 'True';
        system.blackmail = chummerContact.blackmail === 'True';
        system.description = parseDescription(chummerContact);

        const itemName = chummerContact.name ? chummerContact.name : '[Unnamed connection]';

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(itemName), parserType);

        const itemData = createItemData(itemName, 'contact', system);
        return itemData;
    }
}
