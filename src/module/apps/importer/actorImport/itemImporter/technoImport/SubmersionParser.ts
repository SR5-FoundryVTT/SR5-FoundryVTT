import { getArray } from "../importHelper/BaseParserFunctions";
import { ActorSchema } from "../../ActorSchema";

export class SubmersionParser {
    parseSubmersions(chummerChar: ActorSchema, system: Shadowrun.CharacterData) {
        const initiationgrades = getArray(chummerChar.initiationgrade?.initiationgrade);
        
        system.technomancer.submersion = Math.max(...initiationgrades.filter(grade => grade.technomancer === "True").map(grade => Number(grade.grade)));
    }
}