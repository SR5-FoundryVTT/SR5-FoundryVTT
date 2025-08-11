import { Parser } from '../Parser';
import { Echo } from '../../schema/EchoesSchema';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';

export class EchoParser extends Parser<'echo'> {
    protected readonly parseType = 'echo';

    protected override async getFolder(jsonData: Echo, compendiumKey: CompendiumKey): Promise<Folder> {
        const folder = game.i18n.localize("SR5.ActorType.Echo");
        return IH.getFolder(compendiumKey, folder);
    }
}
