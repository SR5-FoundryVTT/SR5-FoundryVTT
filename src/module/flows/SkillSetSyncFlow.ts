import { SR5Actor } from "../actor/SR5Actor";
import { SYSTEM_NAME } from "../constants";
import { PackItemFlow } from "../item/flows/PackItemFlow";
import { SR5Item } from "../item/SR5Item";

/**
 * Functionality related to synchronizing skill sets across actors using it as their skillset.
 * 
 * The main entry functions are:
 * - logDifferences
 */
export const SkillSetSyncFlow = {
    /**
     * Compare all actors using the given skill set and log differences in the console.
     * @param skillSet Skill Set to compare actors against
     */
    async logGlobalActorsDifferences(skillSet: SR5Item<'skill'>) {
        if (!skillSet.isType('skill') || skillSet.system.type !== 'set') return;

        for await (const actor of SkillSetSyncFlow.iterateGlobalActors(skillSet)) {
            await SkillSetSyncFlow.logActorDifferences(actor, skillSet);
        }
    },

    /**
     * Validate if the given actor is in sync with the given skillset.
     * 
     * TODO: this method is inefficient in mass actor comparison as it re-retrieves skillset data for each actor.
     *       Refactor it to retrieve all necessary skill set data as parameters.
     * TODO: Currently only rating differences are compared. Not skill item configuration differences.      
     * @param actor Actor to validate against the skillset
     * @param skillSet Skillset to validate the actor against
     * @returns Lists of skill and group differences between actor and skillset.
     */
    async getActorDifferences(actor: SR5Actor, skillSet: SR5Item<'skill'>) {
        const differences = {
            skills: {
                missing: [] as string[],
                extra: [] as string[],
                different: [] as string[],
            },
            groups: {
                missing: [] as string[],
                extra: [] as string[],
                different: [] as string[],
            }
        };

        if (!skillSet.isType('skill') || skillSet.system.type !== 'set') return differences;

        const setSkills = skillSet.system.set.skills;
        const setGroups = skillSet.system.set.groups;
        const setGroupItems = await PackItemFlow.getSkillGroupsForSkillSet(skillSet);

        const actorItems: SR5Item<'skill'>[] = actor.itemsForType.get('skill')  as SR5Item<'skill'>[] ?? [];
        const actorSkills = actorItems.filter(item => item.system.type === 'skill');
        const actorGroups = actorItems.filter(item => item.system.type === 'group');

        // Compare against skill set skills first, group skills later.

        // Compare expected skill state against actor and collect extra skills.
        for (const setSkill of setSkills) {
            const actorSkillIndex = actorSkills.findIndex(actorSkill => actorSkill.name === setSkill.name);
            if (actorSkillIndex === -1) {
                differences.skills.missing.push(setSkill.name);
                continue;
            }
            // Retrieve element via splice and fixed index, as we assert above that the element exists.
            const actorSkill = actorSkills.splice(actorSkillIndex, 1)[0];
            if (actorSkill.system.skill.rating !== setSkill.rating) differences.skills.different.push(setSkill.name);
        }
        
        // Compare expected group state against actor and collect extra groups.
        for (const setGroup of setGroups) {
            const actorGroupIndex = actorGroups.findIndex(actorGroup => actorGroup.name === setGroup.name);
            if (actorGroupIndex === -1) {
                differences.groups.missing.push(setGroup.name);
                continue;
            }
            // Retrieve element via splice and fixed index, as we assert above that the element exists.
            const actorGroup = actorGroups.splice(actorGroupIndex, 1)[0];
            if (actorGroup.system.group.rating !== setGroup.rating) differences.groups.different.push(setGroup.name);

            // Compare skill of this group against the actor skills.
            const groupSkillNames = setGroupItems.find(item => item.name === setGroup.name)?.system.group.skills ?? [];
            for (const groupSkillName of groupSkillNames) {
                const actorSkillIndex = actorSkills.findIndex(actorSkill => actorSkill.name === groupSkillName);
                if (actorSkillIndex === -1) {
                    differences.skills.missing.push(groupSkillName);
                    continue;
                }
                // Retrieve element via splice and fixed index, as we assert above that the element exists.
                const actorSkill = actorSkills.splice(actorSkillIndex, 1)[0];
                // NOTE: We do not care if a skill is part of multiple groups.
                if (actorSkill.system.skill.rating !== setGroup.rating) differences.skills.different.push(actorSkill.name);
            }
        }

        // Add all leftover extra groups as extras.
        for (const extraGroup of actorGroups) {
            differences.groups.extra.push(extraGroup.name);
        }
        
        // Add all leftover extra skills as extras.
        for (const extraSkill of actorSkills) {
            differences.skills.extra.push(extraSkill.name);
        }

        return differences;
    },

    /**
     * Console log differences between an actor skill set and an actual skill set.
     * @param actor Actor to validate against the skillset
     * @param skillSet Skillset to validate the actor against
     */
    async logActorDifferences(actor: SR5Actor, skillSet: SR5Item<'skill'>) {
        const differences = await SkillSetSyncFlow.getActorDifferences(actor, skillSet);

        // Only ouput actors out of sync.
        if (!Object.values(differences.skills).some(category => category.length > 0) && !Object.values(differences.groups).some(category => category.length > 0)) {
            return;
        }

        // Extra line for visual separation in console.
        console.log(' ');
        console.log(`Shadowrun 5e | Skillset differences for actor ${actor.name} (${actor.uuid}) and skillset ${skillSet.name}:`);
        if (differences.skills.missing.length > 0) console.log(`  Missing skills: ${differences.skills.missing.join(', ')}`);
        if (differences.skills.extra.length > 0) console.log(`  Extra skills: ${differences.skills.extra.join(', ')}`);
        if (differences.skills.different.length > 0) console.log(`  Different skills: ${differences.skills.different.join(', ')}`);
        if (differences.groups.missing.length > 0) console.log(`  Missing groups: ${differences.groups.missing.join(', ')}`);
        if (differences.groups.extra.length > 0) console.log(`  Extra groups: ${differences.groups.extra.join(', ')}`);
        if (differences.groups.different.length > 0) console.log(`  Different groups: ${differences.groups.different.join(', ')}`);
    },
    
    /**
     * Iteration helper for all gobal actors matching the given skill set.
     * @param skillSet Skill Set to retrieve actors for.
     */
    async *iterateGlobalActors(skillSet: SR5Item<'skill'>) {
        for (const actor of game.actors) {
            if (actor.system.skillset !== skillSet.uuid) continue;
            yield actor;
        }

        for (const scene of game.scenes) {
            for (const token of scene.tokens) {
                const actor = token.actor;
                if (!actor) continue;
                if (actor.system.skillset !== skillSet.uuid) continue;
                yield actor;
            }
        }

        for (const pack of game.packs) {
            if (pack.metadata.system !== SYSTEM_NAME && pack.documentName !== 'Actor') continue;
            const entries = await pack.getIndex();
            for (const entry of entries) {
                const actor = await pack.getDocument(entry._id) as SR5Actor | undefined;
                if (!actor) continue;
                if (actor.system.skillset !== skillSet.uuid) continue;
                yield actor;
            }
        }
    },
}