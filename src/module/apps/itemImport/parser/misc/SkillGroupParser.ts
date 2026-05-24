import { Parser } from '../Parser';
import { SkillGroup } from '../Types';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';

const normalizeGroupName = (name: string) => name.trim().toLowerCase();

export class SkillGroupParser extends Parser<'skill'> {
    protected readonly parseType = 'skill';

    constructor(
        private readonly groupMembersByName: Map<string, string[]>,
        private readonly existingGroups: Item.Stored<'skill'>[]
    ) {
        super();
    }

    override async Parse(jsonData: SkillGroup, compendiumKey: CompendiumKey) {
        const item = await super.Parse(jsonData, compendiumKey) as Item.Stored<'skill'>;

        const existing = this.existingGroups.find(i => i.name === jsonData.name._TEXT);

        if (existing) {
            item.img = existing.img;
        }

        return item as Item.CreateData;
    }

    protected override getSystem(jsonData: SkillGroup) {
        const system = this.getBaseSystem();
        const groupName = jsonData.name._TEXT;
        const groupKey = normalizeGroupName(groupName);

        system.type = 'group';
        system.group.skills = [...(this.groupMembersByName.get(groupKey) ?? [])];

        return system;
    }

    protected override async getFolder(_jsonData: SkillGroup, compendiumKey: CompendiumKey): Promise<Folder> {
        return IH.getFolder(compendiumKey, 'Skills (Group)');
    }
}
