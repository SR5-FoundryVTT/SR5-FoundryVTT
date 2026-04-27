import { Parser } from '../Parser';
import { Skill } from '../../schema/SkillsSchema';
import { Constants } from '../../importer/Constants';
import { CompendiumKey } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';

export class SkillParser extends Parser<'skill'> {
    protected readonly parseType = 'skill';

    constructor(private existingItems: Item.Stored<'skill'>[]) {
        super();
    }

    override async Parse(jsonData: Skill, compendiumKey: CompendiumKey) {
        const item = await super.Parse(jsonData, compendiumKey) as Item.Stored<'skill'>;

        if (jsonData.category._TEXT.includes("Active")) {
            const existing = this.existingItems.find(i => i.name === jsonData.name._TEXT);

            if (existing) {
                item.img = existing.img;
                item.system.skill.action = foundry.utils.deepClone(existing.system.skill.action);
            }
        }

        return item as Item.CreateData;
    }

    protected override getSystem(jsonData: Skill) {
        const system = this.getBaseSystem();
        const skill = system.skill;

        skill.attribute = Constants.attributeTable[jsonData.attribute._TEXT];
        skill.defaulting = jsonData.default._TEXT === "True";

        const category = jsonData.category._TEXT;
        if (category === "Language")
            skill.category = "language";
        else if (category.includes("Active"))
            skill.category = "active";
        else {
            skill.category = "knowledge";
            skill.knowledgeType = category.toLowerCase() as typeof skill.knowledgeType;
        }

        if (skill.attribute === 'magic' || category.includes("Magical"))
            skill.requirement = 'magic';
        else if (skill.attribute === 'resonance')
            skill.requirement = 'resonance';

        skill.group = jsonData.skillgroup?._TEXT ?? "";

        return system;
    }
    
    protected override async getFolder(jsonData: Skill, compendiumKey: CompendiumKey): Promise<Folder> {
        const category = jsonData.category._TEXT;
        let folderName: string;
        if (category === "Language")
            folderName = "Skills (Language)";
        else if (category.includes("Active"))
            folderName = "Skills (Active)";
        else
            folderName = "Skills (Knowledge)";

        return IH.getFolder(compendiumKey, folderName);
    }
}
