import { Parser } from '../Parser';
import { Echo } from '../../schema/EchoesSchema';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import EchoItemData = Shadowrun.EchoItemData;

export class EchoParser extends Parser<EchoItemData> {
    protected override parseType: string = 'echo';

    protected override getSystem(jsonData: Echo): EchoItemData['system'] {
        return this.getBaseSystem('Item');
    }

    protected override async getFolder(jsonData: Echo): Promise<Folder> {
        return IH.getFolder('Trait', "Echoes");
    }
}
