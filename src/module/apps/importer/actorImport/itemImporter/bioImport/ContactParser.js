import { parseDescription, getArray, createItemData, formatAsSlug, genImportFlags } from "../importHelper/BaseParserFunctions.js"
import * as IconAssign from '../../../../iconAssigner/iconAssign.js';

export class ContactParser {

    async parseContacts(chummerChar, assignIcons) {

        const chummerContacts = getArray(chummerChar.contacts.contact);
        const parsedContacts = [];
        const iconList = await IconAssign.getIconFiles();

        chummerContacts.forEach(async (chummerContact) => {
            try {
                const itemData = this.parseContact(chummerContact);

                // Assign the icon if enabled
                if (assignIcons) {itemData.img = await IconAssign.iconAssign(itemData.system.importFlags, iconList, itemData.system)};

                parsedContacts.push(itemData);
            } catch (e) {
                console.error(e);
            }
        });

        return parsedContacts;
    }

    parseContact(chummerContact) {
        const parserType = 'contact';
        const system = {};
        system.type = chummerContact.role;

        // Group contacts are stored in chummer as 'Group(connectionRating)', e.g. 'Group(5)'
        // We handle group contacts as normal contacts until they are supported in the codebase.
        if (chummerContact.connection.toLowerCase().includes('group')) {
            system.connection = chummerContact.connection
                .toLowerCase()
                .replace('group(', '')
                .replace(')', '');
        }
        else {
            system.connection = chummerContact.connection;
        }

        system.loyalty = chummerContact.loyalty;
        system.family = (chummerContact.family.toLowerCase() === 'true');
        system.blackmail = (chummerContact.blackmail.toLowerCase() === 'true');
        system.description = parseDescription(chummerContact);

        const itemName = chummerContact.name ? chummerContact.name : '[Unnamed connection]';

        // Assign import flags
        system.importFlags = genImportFlags(formatAsSlug(itemName), parserType);

        const itemData = createItemData(itemName, 'contact', system);
        return itemData;
    }
}