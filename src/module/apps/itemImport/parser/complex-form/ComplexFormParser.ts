import { Parser } from '../Parser';
import { Complexform } from '../../schema/ComplexformsSchema';
import { ImportHelper as IH } from '../../helper/ImportHelper';

export class ComplexFormParser extends Parser<'complex_form'> {
    protected parseType = 'complex_form' as const;

    protected override getSystem(jsonData: Complexform): Item.SystemOfType<'complex_form'> {
        const system = this.getBaseSystem() as Item.SystemOfType<'complex_form'>;

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
                system.target = target.toLowerCase() as Item.SystemOfType<'complex_form'>['target'];
                break;
            default:
                system.target = 'other';
                break;
        }

        return system;
    }

    protected override async getFolder(jsonData: Complexform): Promise<Folder> {
        return IH.getFolder('Magic', "Complex Forms");
    }
}
