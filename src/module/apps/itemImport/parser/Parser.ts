export abstract class Parser<TResult> {
    public abstract Parse(jsonData: object, item: TResult, jsonTranslation?: object): TResult;
}
