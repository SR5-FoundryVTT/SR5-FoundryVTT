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
        const system = {};
        system.description = parseDescription(chummerCyber);
        system.technology = parseTechnology(chummerCyber);
        
        // Cyberware has no equipped flag in chummer so it cannot be parsed - we consider it as always equipped
        system.technology.equipped = true;
        system.essence = chummerCyber.ess;
        system.grade = chummerCyber.grade;

        return createItemData(chummerCyber.name, 'cyberware', system);
    }
}