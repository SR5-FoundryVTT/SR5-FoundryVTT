import { getArray } from "../importHelper/BaseParserFunctions";
import { ActorSchema } from "../../ActorSchema";

export class InitiationParser {
    parseInitiation(chummerChar: ActorSchema, system: Actor.SystemOfType<'character'>) {
        const initiationgrades = getArray(chummerChar.initiationgrade?.initiationgrade);
        system.magic.initiation = Math.max(...initiationgrades.filter(grade => grade.technomancer === "False").map(grade => Number(grade.grade) || 0))
    }
}
