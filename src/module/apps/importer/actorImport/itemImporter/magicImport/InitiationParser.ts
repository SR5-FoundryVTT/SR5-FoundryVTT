import { SR5Actor } from "src/module/actor/SR5Actor";
import { ActorSchema } from "../../ActorSchema";
import { getArray } from "../importHelper/BaseParserFunctions";

export class InitiationParser {
    parseInitiation(chummerChar: ActorSchema, system: SR5Actor<'character'>['system']) {
        const initiationgrades = getArray(chummerChar.initiationgrade!.initiationgrade);
        
        system.magic.initiation = Math.max(...initiationgrades.filter(grade => grade.technomancer === "False").map(grade => Number(grade.grade) || 0))
    }
}
