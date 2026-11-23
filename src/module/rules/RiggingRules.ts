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
    static getRunningLocalAutosofts(drone: SR5Actor): SR5Item<'program'>[] {
        if (!drone.isType('vehicle')) return [];
        const programs = (drone.itemsForType.get('program') || []).filter(item => item.isType('program'));
        return programs.filter(item => {
            return item.system.type === 'autosoft' && item.isEquipped();
        });
    }

    /**
     * Get all equipped autosofts on the RCC owner that belong to this RCC device.
     * Includes autosofts explicitly linked to this RCC or unlinked autosofts when this RCC is the owner's active Matrix device.
     */
    static getAllMatchingRCCAutosofts(rccItem: SR5Item): SR5Item<'program'>[] {
        if (!rccItem.isType('device') || rccItem.system.category !== 'rcc') return [];

        const owner = rccItem.actorOwner;
        if (!owner) return [];

        const programs = (owner.itemsForType.get('program') || []).filter(item => item.isType('program'));
        const activeDeviceUuid = owner.getMatrixDevice()?.uuid;

        return programs.filter(item => {
            if (item.system.type !== 'autosoft' || !item.isEquipped()) return false;
            const itemMaster = item.system.technology?.master || (item.getFlag('shadowrun5e', 'rccUuid') as string | undefined);
            if (itemMaster) {
                return itemMaster === rccItem.uuid;
            }
            return activeDeviceUuid === rccItem.uuid;
        });
    }

    /**
     * Get loaded/equipped autosofts from an RCC device, capped by its Sharing rating.
     */
    static getLoadedRCCAutosofts(rccItem: SR5Item): SR5Item<'program'>[] {
        if (!rccItem.isType('device') || rccItem.system.category !== 'rcc') return [];

        const sharing = Number(rccItem.system.sharing || 0);
        if (sharing <= 0) return [];

        return this.getAllMatchingRCCAutosofts(rccItem).slice(0, sharing);
    }

    /**
     * Calculate RCC Sharing vs Noise Reduction state and soft warnings.
     */
    static getRCCSharingInfo(rccItem: SR5Item) {
        if (!rccItem.isType('device') || rccItem.system.category !== 'rcc') {
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
        const sharing = Number(rccItem.system.sharing || 0);
        const noiseReduction = Number(rccItem.system.noise_reduction || 0);

        const allMatching = this.getAllMatchingRCCAutosofts(rccItem);
        const loadedAutosoftsCount = allMatching.length;

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
     * Resolve the target skill key for an autosoft program.
     * Uses item.system.skill if explicitly set, otherwise infers from autosoftType.
     */
    static getSkillForAutosoft(item: SR5Item<'program'>, drone?: SR5Actor): string {
        if (item.system.skill) return item.system.skill;

        switch (item.system.autosoftType) {
            case 'clearsight':
                return 'perception';
            case 'stealth':
                return 'sneaking';
            case 'targeting':
                return 'gunnery';
            case 'electronic_warfare':
                return 'electronic_warfare';
            case 'maneuvering':
                return (drone?.isType('vehicle') ? drone.getVehicleTypeSkillName() : undefined) || 'pilot_ground_craft';
            case 'evasion':
                return '';
            default:
                return '';
        }
    }

    /**
     * Check whether an autosoft's targetModel and targetWeapon restrictions match a given drone (and optional weapon/model context).
     */
    static doesAutosoftMatchDrone(
        drone: SR5Actor,
        item: SR5Item<'program'>,
        options?: { model?: string; weapon?: string; weaponUuid?: string }
    ): boolean {
        if (!drone.isType('vehicle')) return false;

        const requestedWeapon = options?.weapon || '';
        const requestedWeaponUuid = options?.weaponUuid || '';

        // 1. Targeting autosoft matches specific targetWeapon if specified
        if (item.system.autosoftType === 'targeting' && item.system.targetWeapon) {
            const tw = item.system.targetWeapon.trim();
            let twName = tw.toLowerCase();
            if (tw.startsWith('Actor.') || tw.startsWith('Compendium.') || tw.startsWith('Item.')) {
                if (requestedWeaponUuid && tw === requestedWeaponUuid) {
                    // Exact UUID match
                } else {
                    const resolved = fromUuidSync(tw) as SR5Item | null;
                    if (resolved?.name) {
                        twName = resolved.name.toLowerCase();
                    }
                }
            }

            if (requestedWeapon || requestedWeaponUuid) {
                const rw = requestedWeapon.trim().toLowerCase();
                const uuidMatch = requestedWeaponUuid && tw === requestedWeaponUuid;
                const nameMatch = rw && (twName === rw || rw.includes(twName) || twName.includes(rw));
                if (!uuidMatch && !nameMatch) {
                    return false;
                }
            } else {
                const droneWeapons = (drone.itemsForType?.get('weapon') || []).filter(w => w.isType('weapon'));
                const hasMatchingWeapon = droneWeapons.some(w => {
                    if (w.uuid === tw || w.id === tw) return true;
                    const wName = (w.name || '').trim().toLowerCase();
                    return Boolean(wName && (twName === wName || wName.includes(twName) || twName.includes(wName)));
                });
                if (!hasMatchingWeapon) {
                    return false;
                }
            }
        }

        // 2. Maneuvering / Stealth / Evasion autosofts match specific model if specified
        if (['maneuvering', 'stealth', 'evasion'].includes(item.system.autosoftType || '') && item.system.targetModel) {
            const tm = item.system.targetModel.trim().toLowerCase();
            const candidateModels = [
                options?.model,
                drone.system.model,
                drone.prototypeToken?.name,
                drone.name
            ].filter((m): m is string => Boolean(m)).map(m => m.trim().toLowerCase());

            const modelMatches = candidateModels.some(
                cm => cm === tm || cm.includes(tm) || tm.includes(cm) || item.system.targetModel === drone.uuid
            );
            if (!modelMatches) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get all effective autosofts running on a drone.
     * Follows SR5 CRB p. 267: if any local autosoft is running, all RCC shared autosofts are ignored.
     */
    static getAllEffectiveAutosofts(drone: SR5Actor): SR5Item<'program'>[] {
        if (!drone.isType('vehicle')) return [];

        const localAutosofts = this.getRunningLocalAutosofts(drone);
        if (localAutosofts.length > 0) {
            return localAutosofts.filter(item => this.doesAutosoftMatchDrone(drone, item));
        }

        const masterItem = drone.master;
        if (masterItem && masterItem.isType('device') && masterItem.system.category === 'rcc') {
            return this.getLoadedRCCAutosofts(masterItem).filter(item => this.doesAutosoftMatchDrone(drone, item));
        }

        return [];
    }

    /**
     * Resolve effective autosoft rating for a drone action.
     * Hierarchy:
     * 1. If drone has ANY local running autosofts: use local matching autosoft (RCC ignored).
     * 2. Else if drone is slaved to an active RCC: use RCC loaded matching autosoft.
     * 3. Else rating = 0.
     */
    static getEffectiveAutosoft(
        drone: SR5Actor,
        autosoftType: string,
        options?: { model?: string; weapon?: string; weaponUuid?: string; skill?: string }
    ): { rating: number; source: 'local' | 'rcc' | 'none'; name?: string } {
        if (!drone.isType('vehicle')) return { rating: 0, source: 'none' };

        const requestedSkill = options?.skill || '';

        const matchesAutosoft = (item: SR5Item<'program'>) => {
            const itemSkill = RiggingRules.getSkillForAutosoft(item, drone);

            // 1. Skill / Autosoft Type match check
            if (requestedSkill) {
                if (itemSkill !== requestedSkill && item.system.autosoftType !== autosoftType) {
                    return false;
                }
            } else if (autosoftType && item.system.autosoftType !== autosoftType) {
                return false;
            }

            // 2. Target Weapon & Target Model match check
            return RiggingRules.doesAutosoftMatchDrone(drone, item, options);
        };

        const localAutosofts = this.getRunningLocalAutosofts(drone);

        if (localAutosofts.length > 0) {
            const match = localAutosofts.find(matchesAutosoft);
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
        if (masterItem && masterItem.isType('device') && masterItem.system.category === 'rcc') {
            const rccAutosofts = this.getLoadedRCCAutosofts(masterItem);
            const match = rccAutosofts.find(matchesAutosoft);
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
}
