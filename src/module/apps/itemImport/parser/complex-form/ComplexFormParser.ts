import { Parser, SystemType } from '../Parser';
import { CompendiumKey } from '../../importer/Constants';
import { Complexform } from '../../schema/ComplexformsSchema';
import { ImportHelper as IH } from '../../helper/ImportHelper';

export class ComplexFormParser extends Parser<'complex_form'> {
    protected readonly parseType = 'complex_form';

    protected override getSystem(jsonData: Complexform) {
        const system = this.getBaseSystem();

        system.action.type = 'complex';
        system.action.attribute = 'resonance';
        system.action.skill = 'compiling';

        const fade = jsonData.fv._TEXT;
        if (fade.includes('+') || fade.includes('-'))
            system.fade = parseInt(fade.substring(1, fade.length));

        const duration = jsonData.duration._TEXT;
        if (duration === 'I')
            system.duration = 'instant';
        else if (duration === 'S')
            system.duration = 'sustained';
        else if (duration === 'P')
            system.duration = 'permanent';

        const target = jsonData.target._TEXT;
        switch (target) {
            case 'Device':
            case 'File':
            case 'Host':
            case 'Persona':
            case 'Self':
            case 'Sprite':
                system.target = target.toLowerCase() as SystemType<'complex_form'>['target'];
                break;
            default:
                system.target = 'other';
                break;
        }

        return system;
    }

    protected override async getFolder(jsonData: Complexform, compendiumKey: CompendiumKey): Promise<Folder> {
        const folder = game.i18n.localize("SR5.ItemTypes.ComplexForm");
        return IH.getFolder(compendiumKey, folder);
    }
}
