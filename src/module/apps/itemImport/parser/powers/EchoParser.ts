import { Parser } from '../Parser';
import { Echo } from '../../schema/EchoesSchema';
import { ImportHelper as IH } from '../../helper/ImportHelper';

export class EchoParser extends Parser<'echo'> {
    protected parseType = 'echo' as const;

    protected override async getFolder(jsonData: Echo): Promise<Folder> {
        return IH.getFolder('Trait', "Echoes");
    }
}
