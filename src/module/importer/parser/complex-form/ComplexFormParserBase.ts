import ComplexForm = Shadowrun.ComplexForm;
import { ImportHelper } from '../../helper/ImportHelper';
import { ItemParserBase } from '../item/ItemParserBase';
import ComplexFormTarget = Shadowrun.ComplexFormTarget;

export class ComplexFormParserBase extends ItemParserBase<ComplexForm> {
    Parse(jsonData: object, data: Shadowrun.ComplexForm, jsonTranslation?: object): Shadowrun.ComplexForm {
        data.name = ImportHelper.StringValue(jsonData, 'name');

        data.data.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.StringValue(jsonData, 'page')}`;

        let fade = ImportHelper.StringValue(jsonData, 'fv');
        if (fade.includes('+') || fade.includes('-')) {
            data.data.fade = parseInt(fade.substring(1, fade.length));
        }

        let duration = ImportHelper.StringValue(jsonData, 'duration');
        if (duration === 'I') {
            data.data.duration = 'instant';
        } else if (duration === 'S') {
            data.data.duration = 'sustained';
        } else if (duration === 'P') {
            data.data.duration = 'permanent';
        }

        let target = ImportHelper.StringValue(jsonData, 'target');
        switch (target) {
            case 'Device':
            case 'File':
            case 'Host':
            case 'Persona':
            case 'Self':
            case 'Sprite':
                data.data.target = target.toLowerCase() as ComplexFormTarget;
                break;
            default:
                data.data.target = 'other';
                break;
        }

        if (jsonTranslation) {
            const origName = ImportHelper.StringValue(jsonData, 'name');
            data.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
            data.data.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
        }

        return data;
    }
}
