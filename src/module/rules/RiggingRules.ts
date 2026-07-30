import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5Item } from '@/module/item/SR5Item';
import { AttributeRules } from '@/module/rules/AttributeRules';
import { SkillRules } from '@/module/rules/SkillRules';
import { SuccessTestData } from '@/module/tests/SuccessTest';

const { fromUuidSync } = foundry.utils;

export class RiggingRules {
    /**
     * Modify the roll data by using the Driver's data
     * @param driver - the Actor that is driving
     * @param rollData
     */
    static modifyRollDataForDriver(driver: SR5Actor, rollData: SR5Actor['system']) {
        const injectAttributes = ['intuition', 'reaction', 'logic', 'agility'];
        AttributeRules.injectAttributes(injectAttributes, driver, rollData, { bigger: false });

        const injectSkills = ['perception', 'sneaking', 'gunnery', ...this.PilotSkills];
        SkillRules.injectSkills(injectSkills, driver, rollData, { bigger: false });
    }

    static readonly PilotSkills = [
        'pilot_aerospace',
        'pilot_aircraft',
        'pilot_exotic_vehicle',
        'pilot_ground_craft',
        'pilot_walker',
        'pilot_watercraft'
    ] as const;

    /**
     * Determine if the provided testData should be considered a matrix action when a Rigger is jumped in
     * Defined in SR5 pg #266 "VR AND RIGGING"
     * @param testData
     */
    static isConsideredMatrixAction(testData: SuccessTestData): boolean {
        if (testData.categories.includes('rigging')) return true;
        if (['sensor', 'handling', 'speed'].includes(testData.action.limit.attribute)) return true;
        if (['gunnery', ...this.PilotSkills].includes(testData.action.skill)) return true;
        return false;
    }

    /**
     * Calculate maximum local autosoft slots for a drone.
     * SR5 CRB pg 269: Drones have autosoft program slots equal to ceil(Device Rating / 2) [or ceil(Pilot / 2)].
     */
    static getMaxAutosoftSlots(drone: SR5Actor): number {
        if (!drone.isType('vehicle')) return 0;
        const pilot = drone.system.vehicle_stats?.pilot?.value || 1;
        return Math.ceil(pilot / 2);
    }

    /**
     * Get running/equipped local autosofts on a drone actor.
     */
    static getRunningLocalAutosofts(drone: SR5Actor): SR5Item[] {
        if (!drone.isType('vehicle')) return [];
        const programs = drone.itemsForType.get('program') || [];
        return programs.filter(item => {
            const system = item.system as any;
            return system.type === 'autosoft' && item.isEquipped();
        });
    }

    /**
     * Get loaded/equipped autosofts from an RCC device.
     */
    static getLoadedRCCAutosofts(rccItem: SR5Item): SR5Item[] {
        if (!rccItem || rccItem.system.category !== 'rcc') return [];

        const owner = rccItem.actorOwner;
        if (!owner) return [];

        const programs = owner.itemsForType.get('program') || [];
        return programs.filter(item => {
            const system = item.system as any;
            return system.type === 'autosoft' && item.isEquipped();
        });
    }

    /**
     * Calculate RCC Sharing vs Noise Reduction state and soft warnings.
     */
    static getRCCSharingInfo(rccItem: SR5Item) {
        if (!rccItem || rccItem.system.category !== 'rcc') {
            return {
                deviceRating: 0,
                sharing: 0,
                noiseReduction: 0,
                isOverAllocated: false,
                loadedAutosoftsCount: 0,
                isOverSharingLimit: false
            };
        }

        const deviceRating = rccItem.getRating();
        const system = rccItem.system as any;
        const sharing = Number(system.sharing || 0);
        const noiseReduction = Number(system.noise_reduction || 0);

        const loadedAutosofts = this.getLoadedRCCAutosofts(rccItem);
        const loadedAutosoftsCount = loadedAutosofts.length;

        return {
            deviceRating,
            sharing,
            noiseReduction,
            isOverAllocated: (sharing + noiseReduction) > deviceRating,
            loadedAutosoftsCount,
            isOverSharingLimit: loadedAutosoftsCount > sharing
        };
    }

    /**
     * Resolve effective autosoft rating for a drone action.
     * Hierarchy:
     * 1. If drone has ANY local running autosofts: use local matching autosoft.
     * 2. Else if drone is slaved to an active RCC: use RCC loaded matching autosoft.
     * 3. Else rating = 0.
     */
    static getEffectiveAutosoft(
        drone: SR5Actor,
        autosoftType: string,
        options?: { model?: string; weapon?: string }
    ): { rating: number; source: 'local' | 'rcc' | 'none'; name?: string } {
        if (!drone.isType('vehicle')) return { rating: 0, source: 'none' };

        const localAutosofts = this.getRunningLocalAutosofts(drone);

        if (localAutosofts.length > 0) {
            const match = localAutosofts.find(item => {
                const sys = item.system as any;
                return sys.autosoftType === autosoftType;
            });
            if (match) {
                return {
                    rating: match.getRating(),
                    source: 'local',
                    name: match.name
                };
            }
            return { rating: 0, source: 'local' };
        }

        // Check if slaved to an RCC master device
        const masterItem = drone.master;
        if (masterItem && masterItem.system.category === 'rcc') {
            const rccAutosofts = this.getLoadedRCCAutosofts(masterItem);
            const match = rccAutosofts.find(item => {
                const sys = item.system as any;
                return sys.autosoftType === autosoftType;
            });
            if (match) {
                return {
                    rating: match.getRating(),
                    source: 'rcc',
                    name: match.name
                };
            }
        }

        return { rating: 0, source: 'none' };
    }

    /**
     * Calculate Drone Swarm Pilot info and pool bonus.
     * Formula: Swarm Pilot = Max(Pilot in Swarm) + (Count of Drones in Swarm - 1).
     */
    static getSwarmPilotInfo(drone: SR5Actor): { swarmPilot: number; highestPilot: number; memberCount: number; bonus: number } {
        if (!drone.isType('vehicle')) {
            return { swarmPilot: 0, highestPilot: 0, memberCount: 0, bonus: 0 };
        }

        const system = drone.system as any;
        if (!system.isSwarm) {
            return { swarmPilot: 0, highestPilot: 0, memberCount: 0, bonus: 0 };
        }

        // Collect all swarm member actors
        const memberUuids: string[] = [];
        if (system.isSwarmLeader && Array.isArray(system.swarmMemberUuids)) {
            if (drone.uuid) memberUuids.push(drone.uuid);
            memberUuids.push(...system.swarmMemberUuids);
        } else if (system.swarmLeaderUuid) {
            const leader = fromUuidSync(system.swarmLeaderUuid) as SR5Actor | null;
            if (leader && leader.isType('vehicle')) {
                const leaderSys = leader.system as any;
                if (leader.uuid) memberUuids.push(leader.uuid);
                if (Array.isArray(leaderSys.swarmMemberUuids)) {
                    memberUuids.push(...leaderSys.swarmMemberUuids);
                }
            }
        }

        const uniqueUuids = Array.from(new Set(memberUuids.filter(Boolean)));
        if (uniqueUuids.length <= 1) {
            return { swarmPilot: 0, highestPilot: 0, memberCount: 1, bonus: 0 };
        }

        let highestPilot = 0;
        let count = 0;

        for (const uuid of uniqueUuids) {
            const memberActor = fromUuidSync(uuid) as SR5Actor | null;
            if (memberActor && memberActor.isType('vehicle')) {
                count++;
                const pilotVal = memberActor.system.vehicle_stats?.pilot?.value || 1;
                if (pilotVal > highestPilot) {
                    highestPilot = pilotVal;
                }
            }
        }

        if (count <= 1) {
            return { swarmPilot: highestPilot, highestPilot, memberCount: count, bonus: 0 };
        }

        const swarmPilot = highestPilot + (count - 1);
        const currentPilot = drone.system.vehicle_stats?.pilot?.value || 1;
        const bonus = Math.max(0, swarmPilot - currentPilot);

        return { swarmPilot, highestPilot, memberCount: count, bonus };
    }
}
