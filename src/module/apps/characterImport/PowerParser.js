import { parseDescription, getArray, createItemData } from "./BaseParserFunctions.js"

export class PowerParser {

    parsePowers(chummerChar) {
        const powers = getArray(chummerChar.powers.power);
        const parsedPowers = [];

        powers.forEach((chummerPower) => {
            const itemData = this.parsePower(chummerPower);
            parsedPowers.push(itemData);
        });

        return parsedPowers;
    }

    parsePower(chummerPower) {
        const system = {};
        system.description = parseDescription(chummerPower);

        system.level = parseInt(chummerPower.rating);
        system.pp = parseFloat(chummerPower.totalpoints);
        return createItemData(chummerPower.fullname, 'adept_power', system);
    }
}