import { getArray } from "../importHelper/BaseParserFunctions";
import { SR5Actor } from "src/module/actor/SR5Actor";
import { ActorSchema } from "../../ActorSchema";

export class SubmersionParser {
    parseSubmersions(chummerChar: ActorSchema, system: SR5Actor<'character'>['system']) {
        const initiationgrades = getArray(chummerChar.initiationgrade!.initiationgrade);
        
        system.technomancer.submersion = Math.max(...initiationgrades.filter(grade => grade.technomancer === "True").map(grade => Number(grade.grade)));
    }
}
