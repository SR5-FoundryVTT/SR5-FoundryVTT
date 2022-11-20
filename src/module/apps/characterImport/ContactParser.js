import { parseDescription, getArray, createItemData } from "./BaseParserFunctions.js"

export class ContactParser {
    parseContacts(chummerChar) {
        
        const chummerContacts = getArray(chummerChar.contacts.contact);
        const parsedContacts = [];

        chummerContacts.forEach((chummerContact) => {
            try {
                const itemData = this.parseContact(chummerContact);
                parsedContacts.push(itemData);
            } catch (e) {
                console.error(e);
            }
        });

        return parsedContacts;
    }

    parseContact(chummerContact) {
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
        const itemData = createItemData(itemName, 'contact', system);
        return itemData;
    }
}