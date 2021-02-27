import { parseDescription, getArray, parseTechnology, createItemData } from "./BaseParserFunctions.js"

export class CyberwareParser {
   
    parseCyberwares(chummerChar) {
        const chummerCyberwares = getArray(chummerChar.cyberwares.cyberware);
        const parsedCyberware = [];
        chummerCyberwares.forEach((chummerCyber) => {
            try {
                const itemData = this.parseCyberware(chummerCyber);
                parsedCyberware.push(itemData);
            } catch (e) {
                console.error(e);
            }
        });

        return parsedCyberware;
    }

    parseCyberware(chummerCyber) {
        const data = {};
        data.description = parseDescription(chummerCyber);
        data.technology = parseTechnology(chummerCyber);
        
        // Cyberware has no equipped flag in chummer so it cannot be parsed - we consider it as always equipped
        data.technology.equipped = true;
        data.essence = chummerCyber.ess;
        data.grade = chummerCyber.grade;

        return createItemData(chummerCyber.name, 'cyberware', data);
    }
}