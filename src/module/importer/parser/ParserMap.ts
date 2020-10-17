import { Parser } from './Parser';
import { ImportHelper } from '../helper/ImportHelper';

export class ParserMap<TResult> extends Parser<TResult> {
    private readonly m_BranchKey: string | BranchFunc<TResult>;
    private readonly m_Map: Map<string, Parser<TResult>>;

    public constructor(branchKey: string | BranchFunc<TResult>, elements: CArg<TResult>[]) {
        super();

        this.m_BranchKey = branchKey;

        this.m_Map = new Map();
        for (const { key, value } of elements) {
            this.m_Map.set(key, value);
        }
    }

    public Parse(jsonData: object, data: TResult, jsonTranslation?: object): TResult {
        let key;
        if (typeof this.m_BranchKey === 'function') {
            key = this.m_BranchKey(jsonData);
        } else {
            key = this.m_BranchKey;
            key = ImportHelper.StringValue(jsonData, key);
        }

        const parser = this.m_Map.get(key);
        if (parser === undefined) {
            console.warn(`Could not find mapped parser for category ${key}.`);
            return data;
        }
        return parser.Parse(jsonData, data, jsonTranslation);
    }
}

type CArg<TResult> = {
    key: string;
    value: Parser<TResult>;
};
type BranchFunc<TResult> = (TResult) => string;
