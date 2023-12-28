import { getArray } from "../importHelper/BaseParserFunctions";

export class SubmersionParser {
    parseSubmersions(chummerChar, system) {
        const initiationgrades = getArray(chummerChar.initiationgrade.initiationgrade);
        
        system.technomancer.submersion = Math.max(...initiationgrades.filter(grade => grade.technomancer == "True").map(grade => grade.grade))
    }
}