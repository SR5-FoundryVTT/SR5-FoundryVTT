import { parseDescription, getArray, createItemData } from "./BaseParserFunctions.js"
import {SR5} from "../../config"

export class LifestyleParser {
    parseLifestyles(chummerChar) {
        
        const chummerLifestyle = getArray(chummerChar.lifestyles.lifestyle);
        const parsedLifestyle = [];

        chummerLifestyle.forEach((chummerLifestyle) => {
            try {
                const itemData = this.parseLifestyle(chummerLifestyle);
                parsedLifestyle.push(itemData);
            }
             catch (e) {
                console.error(e);
            }
        });

        return parsedLifestyle;
    }

    parseLifestyle(chummerLifestyle) {
        const data = {};

        // Advanced lifestyles and lifestyle qualities are not supported at the moment
        // Map the chummer lifestyle type to our sr5 foundry type. 
        const chummerLifestyleType = chummerLifestyle.baselifestyle.toLowerCase();
        if ((chummerLifestyleType in SR5.lifestyleTypes)) {
            data.type = chummerLifestyleType;
        }
        else {
            // This is necessary because of a typo in SR5 config.
            if (chummerLifestyleType === 'luxury') {
                data.type = 'luxory';
            }
            else {
                data.type = 'other';
            }
        }

        data.cost = chummerLifestyle.totalmonthlycost;
        data.permanent = chummerLifestyle.purchased;
        data.description = parseDescription(chummerLifestyle);

        // The name of the lifestyle is optional, so we use a fallback here.
        const itemName = chummerLifestyle.name ? chummerLifestyle.name : chummerLifestyle.baselifestyle;
        const itemData = createItemData(itemName, 'lifestyle', data);
        return itemData;
    }
}