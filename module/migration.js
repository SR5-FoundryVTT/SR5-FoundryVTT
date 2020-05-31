/**
 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
 * @return {Promise}      A Promise which resolves once the migration is completed
 */
export const migrateWorld = async function () {
    ui.notifications.info(
        `Applying Shadowrun 5e System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`,
        { permanent: true }
    );

    // Migrate World Items
    for (const i of game.items.entities) {
        try {
            const updateData = migrateItemData(i.data);
            if (!isObjectEmpty(updateData)) {
                expandObject(updateData);
                console.log(`Migrating Item entity ${i.name}`);
                await i.update(updateData, { enforceTypes: false });
            }
        } catch (err) {
            console.error(err);
        }
    }

    // Migrate World Actors
    for (const a of game.actors.entities) {
        try {
            const updateData = migrateActorData(duplicate(a.data));

            if (!isObjectEmpty(updateData)) {
                expandObject(updateData);
                delete updateData.items;
                console.log(`Migrating Actor entity ${a.name}`);
                await a.update(updateData, { enforceTypes: false });
                const items = getMigratedActorItems(a.data);
                console.log(items);
                await a.updateOwnedItem(items);
            }
        } catch (err) {
            console.error(err);
        }
    }

    // Migrate Actor Override Tokens
    for (const s of game.scenes.entities) {
        try {
            const updateData = migrateSceneData(duplicate(s.data));
            if (!isObjectEmpty(updateData)) {
                expandObject(updateData);
                console.log(`Migrating Scene entity ${s.name}`);
                await s.update(updateData, { enforceTypes: false });
                console.log(updateData);
            }
        } catch (err) {
            console.error(err);
        }
    }

    // Migrate World Compendium Packs
    const packs = game.packs.filter((p) => {
        return (
            p.metadata.package === 'world' && ['Actor', 'Item', 'Scene'].includes(p.metadata.entity)
        );
    });
    for (const p of packs) {
        await migrateCompendium(p);
    }

    // Set the migration as complete
    game.settings.set('shadowrun5e', 'systemMigrationVersion', game.system.data.version);
    ui.notifications.info(
        `Shadowrun5e System Migration to version ${game.system.data.version} completed!`,
        { permanent: true }
    );
    console.log(`Shadowrun5e System Migration to version ${game.system.data.version} completed!`);
};

const getMigratedActorItems = (actor) => {
    // Migrate Owned Items
    if (!actor.items) return updateData;
    return actor.items.reduce((acc, i) => {
        // Migrate the Owned Item
        const mi = migrateItemData(i);
        if (!isObjectEmpty(mi)) {
            acc.push(mi);
        }
        return acc;
    }, []);
};

/* -------------------------------------------- */

/**
 * Apply migration rules to all Entities within a single Compendium pack
 * @param pack
 * @return {Promise}
 */
export const migrateCompendium = async function (pack) {
    const { entity } = pack.metadata;
    if (!['Actor', 'Item', 'Scene'].includes(entity)) return;

    // Begin by requesting server-side data model migration and get the migrated content
    await pack.migrate();
    const content = await pack.getContent();

    // Iterate over compendium entries - applying fine-tuned migration functions
    for (const ent of content) {
        try {
            let updateData = null;
            if (entity === 'Item') updateData = migrateItemData(ent.data);
            else if (entity === 'Actor') updateData = migrateActorData(ent.data);
            else if (entity === 'Scene') updateData = migrateSceneData(ent.data);
            if (!isObjectEmpty(updateData) && updateData !== null) {
                expandObject(updateData);
                updateData._id = ent._id;
                await pack.updateEntity(updateData);
                console.log(
                    `Migrated ${entity} entity ${ent.name} in Compendium ${pack.collection}`
                );
            }
        } catch (err) {
            console.error(err);
        }
    }
    console.log(`Migrated all ${entity} entities from Compendium ${pack.collection}`);
};

/* -------------------------------------------- */
/*  Entity Type Migration Helpers               */
/* -------------------------------------------- */

/**
 * Migrate a single Actor entity to incorporate latest data model changes
 * Return an Object of updateData to be applied
 * @param {Actor} actor   The actor to Update
 * @return {Object}       The updateData to apply
 */
export const migrateActorData = function (actor) {
    const updateData = {};

    _migrateActorOverflow(actor, updateData);

    _migrateActorSkills(actor, updateData);

    let hasItemUpdates = false;
    const items = actor.items.map((i) => {
        // Migrate the Owned Item
        let itemUpdate = migrateItemData(i);

        // Update the Owned Item
        if (!isObjectEmpty(itemUpdate)) {
            hasItemUpdates = true;
            return mergeObject(i, itemUpdate, { enforceTypes: false, inplace: false });
        } else return i;
    });
    if (hasItemUpdates) updateData.items = items;

    if (!isObjectEmpty(updateData)) {
        updateData._id = actor._id;
        updateData.id = actor._id;
    }

    return updateData;
};

/* -------------------------------------------- */

/**
 * Migrate a single Item entity to incorporate latest data model changes
 * @param item
 */
export const migrateItemData = function (item) {
    const updateData = {};

    _migrateItemsAmmo(item, updateData);
    _migrateDamageTypeAndElement(item, updateData);
    _migrateItemsAddActions(item, updateData);
    _migrateItemsAddCapacity(item, updateData);
    _migrateItemsConceal(item, updateData);

    if (!isObjectEmpty(updateData)) {
        updateData._id = item._id;
        updateData.id = item._id;
    }

    // Return the migrated update data
    return updateData;
};
/* -------------------------------------------- */

/**
 * Migrate a single Scene entity to incorporate changes to the data model of it's actor data overrides
 * Return an Object of updateData to be applied
 * @param {Object} scene  The Scene data to Update
 * @return {Object}       The updateData to apply
 */
export const migrateSceneData = function (scene) {
    const tokens = duplicate(scene.tokens);
    return {
        tokens: tokens.map((t) => {
            if (!t.actorId || t.actorLink || !t.actorData.data) {
                t.actorData = {};
                return t;
            }
            const token = new Token(t);
            if (!token.actor) {
                t.actorId = null;
                t.actorData = {};
            } else if (!t.actorLink) {
                const updateData = migrateActorData(token.data.actorData);
                t.actorData = mergeObject(token.data.actorData, updateData);
            }
            return t;
        }),
    };
};

const _migrateActorOverflow = function (actor, updateData) {
    if (getProperty(actor.data, 'track.physical.overflow') === 0) {
        updateData['data.track.physical.overflow.value'] = 0;
        updateData['data.track.physical.overflow.max'] = 0;
    }
};

const _migrateActorSkills = function (actor, updateData) {
    const splitRegex = /[,\/|.]+/;

    const reducer = (running, [key, val]) => {
        if (!Array.isArray(val.specs) && val.specs) {
            running[key] = {
                specs: val.specs.split(splitRegex).filter((s) => s !== ''),
            };
        }
        return running;
    };

    // TODO verify this works
    updateData['data.skills.active'] = Object.entries(actor.data.skills.active).reduce(reducer, {});
    updateData['data.skills.knowledge.street.value'] = Object.entries(
        actor.data.skills.knowledge.street.value
    ).reduce(reducer, {});
    updateData['data.skills.knowledge.professional.value'] = Object.entries(
        actor.data.skills.knowledge.professional.value
    ).reduce(reducer, {});
    updateData['data.skills.knowledge.academic.value'] = Object.entries(
        actor.data.skills.knowledge.academic.value
    ).reduce(reducer, {});
    updateData['data.skills.knowledge.interests.value'] = Object.entries(
        actor.data.skills.knowledge.interests.value
    ).reduce(reducer, {});
    updateData['data.skills.language.value'] = Object.entries(
        actor.data.skills.language.value
    ).reduce(reducer, {});
};

const cleanItemData = function (itemData) {
    const model = game.system.model.Item[itemData.type];
    itemData.data = filterObject(itemData.data, model);
};

const _migrateDamageTypeAndElement = function (item, updateData) {
    console.log('Migrating Damage and Elements');
    if (item.data.action) {
        const action = item.data.action;
        if (typeof action.damage.type === 'string') {
            updateData['data.action.damage.type.base'] = item.data.action.damage.type;
        }
        if (typeof action.damage.element === 'string') {
            updateData['data.action.damage.element.base'] = item.data.action.damage.element;
        }
    }
};

const _migrateItemsAmmo = function (item, updateData) {
    console.log('Migrating Ammo');
    if (item.type === 'weapon') {
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
};

const _migrateItemsConceal = (item, updateData) => {
    if (item.data.technology?.concealability !== undefined) {
        updateData['data.technology.conceal'] = {
            base: item.data.technology.concealability,
        };
    }
};

const _migrateItemsAddCapacity = function (item, updateData) {
    if (['cyberware'].includes(item.type)) {
        if (item.data.capacity === undefined) {
            updateData.data.capacity = 0;
        }
    }
};

const _migrateItemsAddActions = function (item, updateData) {
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
};
