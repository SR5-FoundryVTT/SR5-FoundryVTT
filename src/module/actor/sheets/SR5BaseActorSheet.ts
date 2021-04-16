import {SR5Actor} from "../SR5Actor";
import {Helpers} from "../../helpers";
import {SR5Item} from "../../item/SR5Item";
import SR5SheetFilters = Shadowrun.SR5SheetFilters;
import {onManageActiveEffect} from "../../effects";

/**
 * This class should not be used directly but be extended for each actor type.
 */
export class SR5BaseActorSheet extends ActorSheet<{}, SR5Actor> {
    // TODO: What is this used for?
    _shownDesc: string[];
    // If something needs filtering, store those filters here.
    _filters: SR5SheetFilters;
    // Used to store the scroll position on rerender. Needed as Foundry fully rerenders on update.
    _scroll: string;

    constructor(...args) {
        super(...args);

        this._shownDesc = [];
        this._filters = {
            skills: '',
            showUntrainedSkills: true,
        };
    }

    /**
     * Extend and override the default options used by the 5e Actor Sheet
     * @returns {Object}
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['sr5', 'sheet', 'actor'],
            width: 880,
            height: 690,
            tabs: [
                {
                    navSelector: '.tabs',
                    contentSelector: '.sheetbody',
                    initial: 'skills',
                },
            ],
        });
    }

    /**
     *
     * @override
     */
    get template() {
        const path = 'systems/shadowrun5e/dist/templates';

        if (this.actor.hasPerm(game.user, 'LIMITED', true)) {
            return `${path}/actor-limited/${this.actor.data.type}.html`;
        }

        return `${path}/actor/${this.actor.data.type}.html`;
    }

    /**
     * Data used by all actor types.
     */
    getData() {
        // Return as any to avoid unnecessary typing. The handlebar template won't be using any type hints.
        const data = super.getData() as any;

        // General purpose fields
        data.config = CONFIG.SR5;
        data.filters = this._filters;

        this._prepareItems(data);

        this._prepareActorTypeFields(data);

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Active Effect management
        html.find(".effect-control").click(event => onManageActiveEffect(event, this.entity));

        // General item CRUD management...
        html.find('.item-create').on('click', this._onItemCreate.bind(this));
        html.find('.item-edit').on('click', this._onItemEdit.bind(this));
        html.find('.item-delete').on('click', this._onItemDelete.bind(this));

        // General item testing...
        html.find('.item-roll').click(this._onItemRoll.bind(this));
        html.find('.Roll').on('click', this._onRoll.bind(this));

        // Condition monitor track handling...
        html.find('.horizontal-cell-input .cell').on('click', this._onSetConditionTrackCell.bind(this));
        html.find('.horizontal-cell-input .cell').on('contextmenu', this._onClearConditionTrack.bind(this));
    }

    /**
     * Listeners
     */
    async _onItemCreate(event) {
        event.preventDefault();
        const type = Helpers.listItemId(event);
        // TODO: Add translation for item names...
        const itemData = {
            name: `New ${type}`,
            type: type,
        };
        return await this.actor.createOwnedItem(itemData, {renderSheet: true});
    }

    async _onItemEdit(event) {
        event.preventDefault();
        const iid = Helpers.listItemId(event);
        const item = this.actor.getOwnedSR5Item(iid);
        if (item) await item.sheet.render(true);
    }


    async _onItemDelete(event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const iid = Helpers.listItemId(event);
        return await this.actor.deleteOwnedItem(iid);
    }

    async _onItemRoll(event) {
        event.preventDefault();
        const iid = Helpers.listItemId(event);
        const item = this.actor.getOwnedSR5Item(iid);
        if (item) {
            await item.castAction(event);
        }
    }

    /**
     * General roll api
     * @param event
     */
    async _onRoll(event) {
        event.preventDefault();

        // look for roll id data in the current line
        let rollId = $(event.currentTarget).data()?.rollId;
        // if that doesn't exist, look for a prent with RollId name
        rollId = rollId ?? $(event.currentTarget).parent('.RollId').data().rollId;

        const split = rollId.split('.');
        const options = { event };
        switch (split[0]) {
            case 'prompt-roll':
                await this.actor.promptRoll(options);
                break;
            case 'armor':
                await this.actor.rollArmor(options);
                break;
            case 'fade':
                await this.actor.rollFade(options);
                break;
            case 'drain':
                await this.actor.rollDrain(options);
                break;
            case 'defense':
                await this.actor.rollAttackDefense(options);
                break;
            case 'damage-resist':
                await this.actor.rollSoak(options);
                break;

            // attribute only rolls
            case 'composure':
                await this.actor.rollAttributesTest('composure');
                break;
            case 'judge-intentions':
                await this.actor.rollAttributesTest('judge_intentions');
                break;
            case 'lift-carry':
                await this.actor.rollAttributesTest('lift_carry');
                break;
            case 'memory':
                await this.actor.rollAttributesTest('memory');
                break;

            case 'vehicle-stat':
                console.log('roll vehicle stat', rollId);
                break;

            case 'drone':
                const droneRoll = split[1];
                switch (droneRoll) {
                    case 'perception':
                        await this.actor.rollDronePerception(options);
                        break;
                    case 'infiltration':
                        await this.actor.rollDroneInfiltration(options);
                        break;
                    case 'pilot-vehicle':
                        await this.actor.rollPilotVehicle(options);
                        break;
                }
                break;
            // end drone

            case 'attribute':
                const attribute = split[1];
                if (attribute) {
                    await this.actor.rollAttribute(attribute, options);
                }
                break;
            // end attribute

            case 'skill':
                const skillType = split[1];
                switch (skillType) {
                    case 'active': {
                        const skillId = split[2];
                        await this.actor.rollActiveSkill(skillId, options);
                        break;
                    }
                    case 'language': {
                        const skillId = split[2];
                        await this.actor.rollLanguageSkill(skillId, options);
                        break;
                    }
                    case 'knowledge': {
                        const category = split[2];
                        const skillId = split[3];
                        await this.actor.rollKnowledgeSkill(category, skillId, options);
                        break;
                    }
                }
                break;
            // end skill

            case 'matrix':
                const matrixRoll = split[1];
                switch (matrixRoll) {
                    case 'attribute':
                        const attr = split[2];
                        await this.actor.rollMatrixAttribute(attr, options);
                        break;
                    case 'device-rating':
                        await this.actor.rollDeviceRating(options);
                        break;
                }

                break;
            // end matrix
        }
    }

    /**
     * Set any kind of condition monitor to a specific cell value.
     */
    async _onSetConditionTrackCell(event) {
        event.preventDefault();

        const value = Number(event.currentTarget.dataset.value);
        const cmId = $(event.currentTarget).closest('.horizontal-cell-input').data().id;
        const data = {};
        if (cmId === 'stun' || cmId === 'physical') {
            const property = `data.track.${cmId}.value`;
            data[property] = value;
        } else if (cmId === 'edge') {
            const property = `data.attributes.edge.uses`;
            data[property] = value;
        } else if (cmId === 'overflow') {
            const property = 'data.track.physical.overflow.value';
            data[property] = value;
        } else if (cmId === 'matrix') {
            const matrixDevice = this.actor.getMatrixDevice();
            if (matrixDevice && !isNaN(value)) {
                const updateData = {};
                updateData['data.technology.condition_monitor.value'] = value;
                await matrixDevice.update(updateData);
            } else {
                const property = `data.track.matrix.value`;
                data[property] = value;
            }
        }
        await this.actor.update(data);
    }

    async _onClearConditionTrack(event) {
        event.preventDefault();

        const cmId = $(event.currentTarget).closest('.horizontal-cell-input').data().id;
        const data = {};
        if (cmId === 'stun') {
            data[`data.track.stun.value`] = 0;
        }
        // Clearing the physical monitor should also clear the overflow.
        else if (cmId === 'physical') {
            data[`data.track.physical.value`] = 0;
            data['data.track.physical.overflow.value'] = 0;

        } else if (cmId === 'edge') {
            data[`data.attributes.edge.uses`] = 0;

        } else if (cmId === 'overflow') {
            data['data.track.physical.overflow.value'] = 0;

        } else if (cmId === 'matrix') {
            const matrixDevice = this.actor.getMatrixDevice();

            if (matrixDevice) {
                const updateData = {};
                updateData['data.technology.condition_monitor.value'] = 0;
                await matrixDevice.update(updateData);

            } else {
                data['data.track.matrix.value'] = 0;
            }
        }

        await this.actor.update(data);
    }

    /**
     * Data Handlers
     */
    _prepareItems(data) {
        const inventory = {};

        // All acting entities should be allowed to carry some protection!
        inventory['weapon'] = {
            label: game.i18n.localize('SR5.ItemTypes.Weapon'),
            items: [],
            dataset: {
                type: 'weapon',
            },
        };

        // Critters are people to... Support your local HMHVV support groups!
        if (this.actor.matchesActorTypes(['character', 'critter', 'vehicle'])) {
            inventory['armor'] = {
                label: game.i18n.localize('SR5.ItemTypes.Armor'),
                items: [],
                dataset: {
                    type: 'armor',
                },
            };
            inventory['device'] = {
                label: game.i18n.localize('SR5.ItemTypes.Device'),
                items: [],
                dataset: {
                    type: 'device',
                },
            };
            inventory['equipment'] = {
                label: game.i18n.localize('SR5.ItemTypes.Equipment'),
                items: [],
                dataset: {
                    type: 'equipment',
                },
            };
            inventory['ammo'] = {
                label: game.i18n.localize('SR5.ItemTypes.Ammo'),
                items: [],
                dataset: {
                    type: 'ammo',
                },
            };
            inventory['cyberware'] = {
                label: game.i18n.localize('SR5.ItemTypes.Cyberware'),
                items: [],
                dataset: {
                    type: 'cyberware',
                },
            };
            inventory['bioware'] = {
                label: game.i18n.localize('SR5.ItemTypes.Bioware'),
                items: [],
                dataset: {
                    type: 'bioware',
                },
            };
        }

        let [
            items,
            spells,
            qualities,
            adept_powers,
            actions,
            complex_forms,
            lifestyles,
            contacts,
            sins,
            programs,
            critter_powers,
            sprite_powers,
        ] = data.items.reduce(
            (arr, item) => {
                // Duplicate to avoid later updates propagating changed item data.
                // NOTE: If no duplication is done, added fields will be stored in the database on updates!
                item = duplicate(item);
                // Show item properties and description in the item list overviews.
                const actorItem = this.actor.items.get(item._id) as SR5Item;
                const chatData = actorItem.getChatData();
                item.description = chatData.description;
                // @ts-ignore // This is a hacky monkey patch solution to pass template data through duplicated item data.
                item.properties = chatData.properties;

                // TODO: isStack property isn't used elsewhere. Remove if unnecessary.
                item.isStack = item.data.quantity ? item.data.quantity > 1 : false;
                if (item.type === 'spell') arr[1].push(item);
                else if (item.type === 'quality') arr[2].push(item);
                else if (item.type === 'adept_power') arr[3].push(item);
                else if (item.type === 'action') arr[4].push(item);
                else if (item.type === 'complex_form') arr[5].push(item);
                else if (item.type === 'lifestyle') arr[6].push(item);
                else if (item.type === 'contact') arr[7].push(item);
                else if (item.type === 'sin') arr[8].push(item);
                else if (item.type === 'program') arr[9].push(item);
                else if (item.type === 'critter_power') arr[10].push(item);
                else if (item.type === 'sprite_power') arr[11].push(item);
                else if (Object.keys(inventory).includes(item.type)) arr[0].push(item);
                return arr;
            },
            [[], [], [], [], [], [], [], [], [], [], [], []],
        );

        const sortByName = (i1, i2) => {
            if (i1.name > i2.name) return 1;
            if (i1.name < i2.name) return -1;
            return 0;
        };
        const sortByEquipped = (left, right) => {
            const leftEquipped = left.data?.technology?.equipped;
            const rightEquipped = right.data?.technology?.equipped;
            if (leftEquipped && !rightEquipped) return -1;
            if (rightEquipped && !leftEquipped) return 1;
            if (left.name > right.name) return 1;
            if (left.name < right.name) return -1;
            return 0;
        };
        actions.sort(sortByName);
        adept_powers.sort(sortByName);
        complex_forms.sort(sortByName);
        items.sort(sortByEquipped);
        spells.sort(sortByName);
        contacts.sort(sortByName);
        lifestyles.sort(sortByName);
        sins.sort(sortByName);
        programs.sort(sortByEquipped);
        critter_powers.sort(sortByName);
        sprite_powers.sort(sortByName);

        items.forEach((item) => {
            inventory[item.type].items.push(item);
        });

        data.inventory = Object.values(inventory);
        data.magic = {
            spellbook: spells,
            powers: adept_powers,
        };
        data.actions = actions;
        data.complex_forms = complex_forms;
        data.lifestyles = lifestyles;
        data.contacts = contacts;
        data.sins = sins;
        data.programs = programs;
        data.critter_powers = critter_powers;
        data.sprite_powers = sprite_powers;

        qualities.sort((a, b) => {
            if (a.data.type === 'positive' && b.data.type === 'negative') return -1;
            if (a.data.type === 'negative' && b.data.type === 'positive') return 1;
            return a.name < b.name ? -1 : 1;
        });
        data.qualities = qualities;
    }

    _prepareActorTypeFields(data) {
        data.isCharacter = this.actor.isCharacter();
        data.isSpirit = this.actor.isSpirit();
        data.isCritter = this.actor.isCritter();
        data.hasSkills = this.actor.hasSkills;
        data.hasSpecial = this.actor.hasSpecial;
    }
}