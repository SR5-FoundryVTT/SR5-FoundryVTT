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
        const data = {};
        data.description = parseDescription(chummerPower);

        data.level = parseInt(chummerPower.rating);
        data.pp = parseFloat(chummerPower.totalpoints);
        const itemData = createItemData(chummerPower.fullname, 'adept_power', data);
        return itemData;
    }
}