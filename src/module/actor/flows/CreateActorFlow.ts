import { PackItemFlow } from '@/module/item/flows/PackItemFlow';
import { SkillItemFlow } from '@/module/item/flows/SkillItemFlow';
import { SR5Actor } from '../SR5Actor';
import { SkillSetFlow } from './SkillSetFlow';
import type { PreparedSkillSetItems } from './SkillSetFlow';

interface PreparedDefaultSkillSet {
    uuid: string;
    items: PreparedSkillSetItems;
}

/**
 * SR5 specific options understood while an actor document is created.
 *
 * They're passed as part of the create operation and reach the document through
 * its _preCreate options:
 * `SR5Actor.create(data, { skipDefaultSkills: true })`
 */
export interface SR5ActorCreateOptions {
    /** Skip applying the default skill set configured for the created actor type. */
    skipDefaultSkills?: boolean;
}

/**
 * Handles actor initialization concerns that only apply during document creation.
 *
 * This flow is intentionally narrow: it prepares newly created actors with any
 * default embedded data that should exist but can't be part of DataModel schema initials.
 */
export const CreateActorFlow = {
    /**
     * Applies the first matching default skill set for the actor type being created.
     *
     * This runs during actor creation so the initial actor state already contains
     * the configured baseline skills instead of relying on a later migration or
     * manual setup step.
     *
     * @param actor Actor to add skill items to.
     * @param data Creation data containing the actor type used for skill set selection.
     */
    async addDefaultActorSkillset(actor: SR5Actor, data: Actor.CreateData) {
        const skillSet = await this.getDefaultSkillSet(data.type);
        if (!skillSet) return;

        await SkillSetFlow.applySkillSetToActor(actor, skillSet, { useSource: true });

        console.debug(`Shadowrun 5e | Added skill set ${skillSet.name} to actor source data`);
    },

    /** Get the default skill set for an actor type. */
    async getDefaultSkillSet(actorType?: string) {
        const skillSets = await PackItemFlow.getAllPackSkillSets();
        const skillSet = skillSets.find(skillSet => {
            if (!skillSet.system.set.default.type) return false;
            return skillSet.system.set.default.type === actorType;
        });

        if (!skillSet) {
            console.debug(`Shadowrun 5e | No default skill set found for actor type ${actorType}, skipping default skill set application`);
            return;
        }

        return skillSet;
    },

    /** Add each actor type's default skill set to its creation sources. */
    async addDefaultSkillsetsToSources(actorSources: Actor.CreateData[]) {
        // Cache misses as null to avoid repeat lookups.
        const skillSetsByActorType = new Map<string, PreparedDefaultSkillSet | null>();

        for (const source of actorSources) {
            // Preserve skill sets assigned by import data.
            if (foundry.utils.getProperty(source, 'system.skillset')) continue;

            let skillSetData = skillSetsByActorType.get(source.type);
            if (skillSetData === undefined) {
                const skillSet = await this.getDefaultSkillSet(source.type);
                skillSetData = skillSet?.uuid
                    ? { uuid: skillSet.uuid, items: await SkillSetFlow.prepareSkillSetItems(skillSet) }
                    : null;

                skillSetsByActorType.set(source.type, skillSetData);
            }

            if (!skillSetData) continue;

            // Normalize keyed and list item sources.
            const existingItems = Object.values(source.items ?? {}) as Item.CreateData[];
            const items = SkillSetFlow.selectMissingSkillSetItems(skillSetData.items, SkillItemFlow.skillKeys(existingItems));

            // Prepared items are shared by actor type.
            source.items = [...existingItems, ...foundry.utils.deepClone(items)];
            foundry.utils.setProperty(source, 'system.skillset', skillSetData.uuid);
        }
    }
};
