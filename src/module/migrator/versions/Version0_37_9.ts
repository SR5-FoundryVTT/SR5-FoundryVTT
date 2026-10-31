import { SkillGroupFlow } from '@/module/actor/flows/SkillGroupFlow';
import { SkillNamingFlow } from '@/module/flows/SkillNamingFlow';
import { UpdateActionFlow } from '../../item/flows/UpdateActionFlow';
import { VersionMigration } from '../VersionMigration';

/**
 * Repair items embedded in new actors, which held schema default action tests.
 * Clear imported skill groups the actor doesn't own, as they lock the skill rating on sheets.
 */
export class Version0_37_9 extends VersionMigration {
    readonly TargetVersion = '0.37.9';

    override migrateItem(item: any): void {
        const opposed = item?.system?.action?.opposed;
        if (item?.type === 'weapon' && opposed?.resist?.test === 'PhysicalDefenseTest') {
            opposed.resist.test = 'PhysicalResistTest';
        }

        UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
    }

    override handlesActor(actor: Readonly<any>) {
        return this.getSkillsWithoutOwnedGroup(actor).length > 0;
    }

    override migrateActor(actor: any): void {
        for (const skill of this.getSkillsWithoutOwnedGroup(actor)) {
            skill.system.skill.group = '';
        }
    }

    private getSkillsWithoutOwnedGroup(actor: Readonly<any>): any[] {
        const items: any[] = actor.items ?? [];
        const groupedSkills = SkillGroupFlow.buildGroupedSkillIndex(items);

        return items.filter(item => item.type === 'skill'
            && item.system?.type === 'skill'
            && item.system.skill?.group
            && !groupedSkills.has(SkillNamingFlow.nameToKey(item.name)));
    }
}
