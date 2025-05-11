import { Parser } from '../Parser';
import { Complexform } from '../../schema/ComplexformsSchema';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import ComplexFormTarget = Shadowrun.ComplexFormTarget;
import ComplexFormItemData = Shadowrun.ComplexFormItemData;

export class ComplexFormParser extends Parser<ComplexFormItemData> {
    protected override parseType: string = 'complex_form';

    protected override getSystem(jsonData: Complexform): ComplexFormItemData['system'] {
        const system = this.getBaseSystem(
            'Item',
            {action: {type: 'complex', attribute: 'resonance', skill: 'compiling'}} as Shadowrun.ComplexFormData
        );

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
                system.target = target.toLowerCase() as ComplexFormTarget;
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
