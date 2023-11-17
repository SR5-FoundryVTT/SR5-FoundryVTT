import { getArray } from "../importHelper/BaseParserFunctions";

export class InitiationParser {
    parseInitiation(chummerChar, system) {
        const initiationgrades = getArray(chummerChar.initiationgrade.initiationgrade);
        
        system.magic.initiation =Math.max(...initiationgrades.map(grade => grade.grade))
    }
}