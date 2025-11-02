import { ExtractItemType } from '../Parser';
import { SimpleParser } from './SimpleParser';
import { SinParser } from '../bioImport/SinParser';
import { AmmoParser } from '../weaponImport/AmmoParser';
import { DeviceParser } from '../matrixImport/DeviceParser';
import { ProgramParser } from '../matrixImport/ProgramParser';
import { ImportHelper as IH } from '@/module/apps/itemImport/helper/ImportHelper';

type ItemType = ExtractItemType<'gears', 'gear'>[] | ExtractItemType<'gears', 'gear'> | undefined;

export class GearsParser {
    async parseItems(itemsData: ItemType) {
        const allGears = IH.getArray(itemsData);
        const devices: typeof allGears = [];
        const sins: typeof allGears = [];
        const ammos: typeof allGears = [];
        const programs: typeof allGears = [];
        const gears: typeof allGears = [];

        const programCategories = ['Common Programs', 'Hacking Programs', 'Software'] as const;
        const excludedNames = ['grenade', 'minigrenade', 'rocket'] as const;

        for (const g of allGears) {
            if (excludedNames.some(prefix => (g.name_english || '').toLowerCase().startsWith(prefix))) continue;

            if (g.iscommlink === "True")
                devices.push(g);
            else if (g.issin === "True")
                sins.push(g);
            else if (g.isammo === "True")
                ammos.push(g);
            else if (programCategories.includes(g.category_english as any))
                programs.push(g);
            else
                gears.push(g);
        }

        return [
            ...(await new AmmoParser().parseItems(ammos)),
            ...(await new DeviceParser().parseItems(devices)),
            ...(await new SinParser().parseItems(sins)),
            ...(await new ProgramParser().parseItems(programs)),
            ...(await new SimpleParser('equipment').parseItems(gears)),
        ];
    }
}
