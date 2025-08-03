import { Parser } from '../Parser';
import { Echo } from '../../schema/EchoesSchema';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import EchoItemData = Shadowrun.EchoItemData;

export class EchoParser extends Parser<EchoItemData> {
    protected override parseType: string = 'echo';

    protected override async getFolder(jsonData: Echo, compendiumKey: CompendiumKey): Promise<Folder> {
        return await IH.getFolder(compendiumKey, "Echoes");
    }
}
