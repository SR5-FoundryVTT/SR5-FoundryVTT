import { VersionMigration } from '../VersionMigration';

/**
 * Migrates the data model for Legacy migrations prior to 0.6.4
 */
export class LegacyMigration extends VersionMigration {
    get SourceVersion(): string {
        return '0';
    }
    get TargetVersion(): string {
        return LegacyMigration.TargetVersion;
    }
    static get TargetVersion(): string {
        return '0.6.4';
    }

    protected async MigrateActorData(actorData: ActorData): Promise<any> {
        const updateData: any = {};
        LegacyMigration.migrateActorOverflow(actorData, updateData);
        LegacyMigration.migrateActorSkills(actorData, updateData);

        // @ts-ignore
        if (!actorData.items) {
            return updateData;
        }

        console.log('Pre-item map');
        // @ts-ignore
        console.log(actorData.items);
        let hasItemUpdates = false;
        const items = await Promise.all(
            // @ts-ignore
            actorData.items.map(async (item) => {
                let itemUpdate = await this.MigrateItemData(item);

                if (!isObjectEmpty(itemUpdate)) {
                    hasItemUpdates = true;
                    itemUpdate['_id'] = item._id;
                    return await mergeObject(item, itemUpdate, {
                        enforceTypes: false,
                        inplace: false,
                    });
                } else {
                    return item;
                }
            }),
        );
        console.log('Post-item map');
        console.log(items);
        if (hasItemUpdates) {
            updateData.items = items;
        }

        return updateData;
    }

    protected async MigrateItemData(item: BaseEntityData): Promise<any> {
        const updateData = {};
        LegacyMigration.migrateDamageTypeAndElement(item, updateData);
        LegacyMigration.migrateItemsAddActions(item, updateData);
        LegacyMigration.migrateActorOverflow(item, updateData);
        LegacyMigration.migrateItemsAddCapacity(item, updateData);
        LegacyMigration.migrateItemsAmmo(item, updateData);
        LegacyMigration.migrateItemsConceal(item, updateData);
        return updateData;
    }

    protected async MigrateSceneData(scene: any): Promise<any> {
        return {};
    }

    protected async ShouldMigrateActorData(actorData: ActorData): Promise<boolean> {
        return true;
    }

    protected async ShouldMigrateItemData(item: BaseEntityData): Promise<boolean> {
        return true;
    }

    protected async ShouldMigrateSceneData(scene: Scene): Promise<boolean> {
        // @ts-ignore
        return scene.data.tokens?.length > 0;
    }

    /**
     * Migrate actor overflow from an integer to an object
     * - it wasn't even displayed before so we know it is 0
     * @param actorData
     * @param updateData
     */
    private static migrateActorOverflow(actorData, updateData) {
        if (getProperty(actorData.data, 'track.physical.overflow') === 0) {
            updateData['data.track.physical.overflow.value'] = 0;
            updateData['data.track.physical.overflow.max'] = 0;
        }
    }

    /**
     * Migrate actor skills specializations to be a list instead of string
     * @param actorData
     * @param updateData
     */
    private static migrateActorSkills(actorData, updateData) {
        if (!actorData.data?.skills?.active) return;
        const splitRegex = /[,\/|.]+/;

        const reducer = (running, [key, val]) => {
            if (!Array.isArray(val.specs) && val.specs) {
                running[key] = {
                    specs: val.specs.split(splitRegex).filter((s) => s !== ''),
                };
            }
            return running;
        };

        updateData['data.skills.active'] = Object.entries(actorData.data.skills.active).reduce(reducer, {});
        updateData['data.skills.knowledge.street.value'] = Object.entries(actorData.data.skills.knowledge.street.value).reduce(reducer, {});
        updateData['data.skills.knowledge.professional.value'] = Object.entries(actorData.data.skills.knowledge.professional.value).reduce(reducer, {});
        updateData['data.skills.knowledge.academic.value'] = Object.entries(actorData.data.skills.knowledge.academic.value).reduce(reducer, {});
        updateData['data.skills.knowledge.interests.value'] = Object.entries(actorData.data.skills.knowledge.interests.value).reduce(reducer, {});
        updateData['data.skills.language.value'] = Object.entries(actorData.data.skills.language.value).reduce(reducer, {});
    }

    /**
     *
     * @param item
     * @param updateData
     */
    private static migrateDamageTypeAndElement(item, updateData) {
        // console.log('Migrating Damage and Elements');
        if (item.data.action) {
            const action = item.data.action;
            if (typeof action.damage.type === 'string') {
                updateData['data.action.damage.type.base'] = item.data.action.damage.type;
            }
            if (typeof action.damage.element === 'string') {
                updateData['data.action.damage.element.base'] = item.data.action.damage.element;
            }
        }
    }

    /**
     * Migrate ammo from ranged weapons only to all weapons
     * @param item
     * @param updateData
     */
    private static migrateItemsAmmo(item, updateData) {
        // console.log('Migrating Ammo');
        if (item.type === 'weapon' && item.data.ammo === undefined) {
            let currentAmmo = { value: 0, max: 0 };
            if (item.data.category === 'range' && item.data.range && item.data.range.ammo) {
                // copy over ammo count
                const oldAmmo = item.data.range.ammo;
                currentAmmo.value = oldAmmo.value;
                currentAmmo.max = oldAmmo.max;
            }
            updateData['data.ammo'] = {
                spare_clips: {
                    value: 0,
                    max: 0,
                },
                current: {
                    value: currentAmmo.value,
                    max: currentAmmo.max,
                },
            };
        }
    }

    /**
     * Migrate conceal name
     * @param item
     * @param updateData
     */
    private static migrateItemsConceal(item, updateData) {
        if (item.data.technology?.concealability !== undefined) {
            updateData['data.technology.conceal'] = {
                base: item.data.technology.concealability,
            };
        }
    }

    /**
     * Add capacity to items
     * @param item
     * @param updateData
     */
    private static migrateItemsAddCapacity(item, updateData) {
        if (['cyberware'].includes(item.type)) {
            if (item.data.capacity === undefined) {
                updateData.data.capacity = 0;
            }
        }
    }

    /**
     * Add actions to needed items
     * @param item
     * @param updateData
     */
    private static migrateItemsAddActions(item, updateData) {
        if (['quality', 'cyberware'].includes(item.type)) {
            if (item.data.action === undefined) {
                const action = {
                    type: '',
                    category: '',
                    attribute: '',
                    attribute2: '',
                    skill: '',
                    spec: false,
                    mod: 0,
                    limit: {
                        value: 0,
                        attribute: '',
                    },
                    extended: false,
                    damage: {
                        type: '',
                        element: '',
                        value: 0,
                        ap: {
                            value: 0,
                        },
                        attribute: '',
                    },
                    opposed: {
                        type: '',
                        attribute: '',
                        attribute2: '',
                        skill: '',
                        mod: 0,
                        description: '',
                    },
                };
                if (!updateData.data) updateData.data = {};
                updateData.data.action = action;
            }
        }
    }
}
