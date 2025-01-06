import { Parser } from '../Parser';
import ShadowrunActorData = Shadowrun.ShadowrunActorData;

export abstract class ActorParserBase<TResult extends ShadowrunActorData> extends Parser<TResult> {
    abstract override Parse(jsonData: object, item: TResult, jsonTranslation?: object): TResult;
}
