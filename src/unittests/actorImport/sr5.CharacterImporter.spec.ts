import { SR5Item } from '@/module/item/SR5Item';
import { testActor } from './Examples/TestActor';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { PackItemFlow } from '@/module/item/flows/PackItemFlow';
import { SkillItemFlow } from '@/module/item/flows/SkillItemFlow';
import { SR5TestFactory } from 'src/unittests/utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { ImportHelper as IH } from '@/module/apps/itemImport/helper/ImportHelper';
import { CharacterImporter as CI, importOptionsType } from '../../module/apps/actorImport/characterImporter/CharacterImporter';

export const characterImporterTesting = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    let actor: SR5Actor<'character'> | null;
    let vehicles: SR5Actor<'vehicle'>[] = [];
    const character = testActor.characters.character;

    after(async () => { await factory.destroy(); });

    const importOptions = {
        armor: true,
        contacts: true,
        cyberware: true,
        equipment: true,
        lifestyles: true,
        metamagics: true,
        powers: true,
        qualities: true,
        rituals: true,
        spells: true,
        vehicles: true,
        weapons: true,
    } satisfies importOptionsType;

    describe('Character Importer', () => {
        it('Should import a chummer character', async () => {
            [actor, ...vehicles] = await CI.import(character, importOptions);
            assert.notEqual(actor, null, 'Actor not created');
            factory.actors.push(actor, ...vehicles);
            assert.lengthOf(vehicles, 1, 'Vehicle not created');
        });

        it('Should have the correct attributes and limits', async () => {
            if (!actor) throw new Error('No actor created');

            assert.strictEqual(actor.name, character.name, 'Name');
            assert.strictEqual(actor.system.limits.physical.value, Number(character.limitphysical), 'Physical Limit');
            assert.strictEqual(actor.system.limits.mental.value, Number(character.limitmental), 'Mental Limit');
            assert.strictEqual(actor.system.limits.social.value, Number(character.limitsocial), 'Social Limit');
            assert.strictEqual(actor.system.limits.astral.value, Number(character.limitastral), 'Astral Limit');

            for (const attr of Object.values(character.attributes[1].attribute)) {
                const parsedName = CI.parseAttName(attr.name_english);
                if (!parsedName) continue;

                console.log(parsedName, actor.system.attributes[parsedName], attr.total);
                assert.strictEqual(actor.system.attributes[parsedName].value, Number(attr.total), `Attribute ${parsedName}`);
            }
        });

        it('Should have the correct skills', async () => {
            if (!actor) throw new Error('No actor created');

            const skills = IH.getArray(character.skills.skill);
            const languageSkills: typeof skills = [];
            const knowledgeSkills: typeof skills = [];
            const activeSkills: typeof skills = [];

            for (const skill of skills) {
                if (skill.islanguage === 'True') {
                    languageSkills.push(skill);
                } else if (skill.knowledge === 'True') {
                    knowledgeSkills.push(skill);
                } else {
                    activeSkills.push(skill);
                }
            }

            for (const skill of activeSkills) {
                const skillName = CI.parseSkillName(skill.name_english);
                const parsedSkill = actor.system.skills.active[skillName];
                assert.strictEqual(parsedSkill.value, Number(skill.rating), `Error Active Skill ${skill.name_english}`);
                assert.lengthOf(parsedSkill.specs, IH.getArray(skill.skillspecializations).length);
            }

            for (const skill of languageSkills) {
                const skillName = skill.name;
                const parsedSkill = Object.values(actor.system.skills.language).find(s => s.name === skillName)!;
                const expectedRating = String(skill.isnativelanguage) === 'True' ? 12 : Number(skill.rating);
                assert.strictEqual(parsedSkill.value, expectedRating, `Error Language Skill ${skill.name_english}`);
                assert.lengthOf(parsedSkill.specs, IH.getArray(skill.skillspecializations).length);
            }

            for (const skill of knowledgeSkills) {
                const skillName = skill.name;
                const skillGroupName = skill.skillcategory_english.toLowerCase() as keyof SR5Actor['system']['skills']['knowledge'];
                const skillGroup = actor.system.skills.knowledge[skillGroupName];
                if (!skillGroup) continue;

                const parsedSkill = Object.values(skillGroup).find(s => s.name === skillName)!;
                assert.strictEqual(parsedSkill.value, Number(skill.rating), `Error Knowledge Skill ${skill.name_english}`);
                assert.lengthOf(parsedSkill.specs, IH.getArray(skill.skillspecializations).length);
            }
        });

        it('Should have the correct item number', async () => {
            if (!actor) throw new Error('No actor created');

            const skills = IH.getArray(character.skills.skill);
            const skillGroups = IH.getArray(character.skills.skillgroup).filter(group => String(group.isbroken) !== 'True');
            const importedSkillSet = await fromUuid(actor.system.skillset) as SR5Item<'skill'> | null;

            let seededSkillCount = 0;
            let seededGroupCount = 0;
            const seededSkillKeys = new Set<string>();
            const seededGroupNames = new Set<string>();
            if (importedSkillSet) {
                const seededSkills = await PackItemFlow.prepareSkillsForSkillSet(importedSkillSet);
                const seededGroups = await PackItemFlow.prepareSkillGroupsForSkillSet(importedSkillSet);

                seededSkillCount = seededSkills.length;
                seededGroupCount = seededGroups.length;

                for (const seededSkill of seededSkills) {
                    const seededCategory = foundry.utils.getProperty(seededSkill, 'system.skill.category') as string | undefined;
                    const seededKey = SkillItemFlow.skillNameByCategoryKey(seededSkill.name ?? '', seededCategory);
                    if (seededKey) seededSkillKeys.add(seededKey);
                }

                for (const seededGroup of seededGroups) {
                    if (seededGroup.name) seededGroupNames.add(seededGroup.name.trim().toLowerCase());
                }
            }

            const extraImportedSkills = (skills as Array<{
                islanguage?: string;
                knowledge?: string;
                name?: string;
                name_english?: string;
            }>).filter(skill => {
                let category: 'active' | 'language' | 'knowledge' = 'active';
                let skillName = skill.name_english ?? skill.name ?? '';

                if (skill.islanguage === 'True') {
                    category = 'language';
                    skillName = skill.name ?? skill.name_english ?? '';
                } else if (skill.knowledge === 'True') {
                    category = 'knowledge';
                    skillName = skill.name ?? skill.name_english ?? '';
                }

                const skillKey = SkillItemFlow.skillNameByCategoryKey(skillName, category);
                return !skillKey || !seededSkillKeys.has(skillKey);
            }).length;

            const extraImportedGroups = skillGroups.filter(group => {
                const groupName = (group.name_english || group.name).trim().toLowerCase();
                return !seededGroupNames.has(groupName);
            }).length;

            const itemCount = IH.getArray(character.qualities.quality).length
                            + IH.getArray(character.contacts.contact).length
                            + IH.getArray(character.weapons.weapon).length
                            + IH.getArray(character.gears.gear).length
                            + IH.getArray(character.armors.armor).length
                            + IH.getArray(character.cyberwares.cyberware).length
                            + IH.getArray(character.spells.spell).length
                            + IH.getArray(character.powers.power).length
                            + IH.getArray(character.lifestyles.lifestyle).length
                            + IH.getArray(character.complexforms.complexform).length
                            + seededGroupCount
                            + seededSkillCount
                            + extraImportedGroups
                            + extraImportedSkills;
            
            assert.strictEqual(actor.items.size, itemCount, 'Item count');
        });

        it('Should have the correct weapon', async () => {
            if (!actor) throw new Error('No actor created');
            const weapon = actor.items.find(i => i.name === 'Ruger Super Warhawk') as SR5Item<'weapon'>;
            if (!weapon) throw new Error('Weapon not found');

            //general info
            assert.strictEqual(weapon.type, 'weapon');

            //action
            assert.strictEqual(weapon.system.action.attribute, 'agility');
            assert.strictEqual(weapon.system.action.damage.base, 9);
            assert.strictEqual(weapon.system.action.damage.ap.base, -2);
            assert.strictEqual(weapon.system.action.damage.type.base, 'physical');
            assert.strictEqual(weapon.system.action.limit.base, 5);
            assert.strictEqual(weapon.system.action.type, 'varies');

            //category
            assert.strictEqual(weapon.system.category, 'range');

            //import flags
            assert.strictEqual(weapon.system.importFlags?.isFreshImport, true);

            //range
            assert.strictEqual(weapon.system.range.ranges.extreme, 60);
            assert.strictEqual(weapon.system.range.ranges.long, 40);
            assert.strictEqual(weapon.system.range.ranges.medium, 20);
            assert.strictEqual(weapon.system.range.ranges.short, 5);
            assert.strictEqual(weapon.system.range.modes.single_shot, true);

            //embedded items
            assert.strictEqual(IH.getArray(weapon.flags.shadowrun5e?.embeddedItems).length, 1);
        });

        it('Should have the correct vehicles', async () => {
            const vehicle = vehicles[0];
            if (!vehicle) throw new Error('No vehicle created');

            assert.strictEqual(vehicle.name, 'Evo Falcon-EX', 'Name');
            assert.strictEqual(vehicle.system.vehicle_stats.pilot.value, 1, 'Pilot');
            assert.strictEqual(vehicle.system.vehicle_stats.handling.value, 3, 'Handling');
            assert.strictEqual(vehicle.system.vehicle_stats.off_road_handling.value, 5, 'Off-road Handling');
            assert.strictEqual(vehicle.system.vehicle_stats.speed.value, 2, 'Speed');
            assert.strictEqual(vehicle.system.vehicle_stats.off_road_speed.value, 3, 'Off-road Speed');
            assert.strictEqual(vehicle.system.vehicle_stats.acceleration.value, 1, 'Acceleration');
            assert.strictEqual(vehicle.system.attributes.body.value, 7, 'Body');
            assert.strictEqual(vehicle.system.armor.value, 9, 'Armor');
            assert.strictEqual(vehicle.system.vehicle_stats.sensor.value, 1, 'Sensor');
            assert.strictEqual(vehicle.system.vehicle_stats.seats.value, 2, 'Seats');

            const nonSkillItems = vehicle.items.filter(item => !item.isType('skill'));
            assert.strictEqual(nonSkillItems.length, 2, 'Non-skill item count');
        });
    });
};
