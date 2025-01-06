import { Parser } from '../Parser';
import { ImportHelper } from '../../helper/ImportHelper';
import { SR5Actor } from '../../../../actor/SR5Actor';
import ShadowrunActorData = Shadowrun.ShadowrunActorData;

export abstract class ActorParserBase<TResult extends ShadowrunActorData> extends Parser<TResult> {
    abstract override Parse(jsonData: object, item: TResult, jsonTranslation?: object): TResult;
}
