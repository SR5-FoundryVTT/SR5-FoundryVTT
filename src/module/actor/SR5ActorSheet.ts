import { Helpers } from '../helpers';
import { ChummerImportForm } from '../apps/chummer-import-form';
import { SkillEditForm } from '../apps/skills/SkillEditForm';
import { KnowledgeSkillEditForm } from '../apps/skills/KnowledgeSkillEditForm';
import { LanguageSkillEditForm } from '../apps/skills/LanguageSkillEditForm';
import SR5ActorSheetData = Shadowrun.SR5ActorSheetData;
import SR5SheetFilters = Shadowrun.SR5SheetFilters;
import Skills = Shadowrun.Skills;
import { SR5Actor } from './SR5Actor';
import MatrixAttribute = Shadowrun.MatrixAttribute;
import { SR5 } from '../config';
import SkillField = Shadowrun.SkillField;

// Use SR5ActorSheet._showSkillEditForm to only ever render one SkillEditForm instance.
// Should multiple instances be open, Foundry will cause cross talk between skills and actors,
// when opened in succession, causing SkillEditForm to wrongfully overwrite the wrong data.
let globalSkillAppId: number = -1;

/**
 * Extend the basic ActorSheet with some very simple modifications
 */
export class SR5ActorSheet extends ActorSheet {
    _shownDesc: string[];
    _filters: SR5SheetFilters;
    actor: SR5Actor;
    _scroll: string;

    constructor(...args) {
        super(...args);

        /**
         * Keep track of the currently active sheet tab
         * @type {string}
         */
        this._shownDesc = [];
        this._filters = {
            skills: '',
            showUntrainedSkills: true,
        };
    }

    /* -------------------------------------------- */

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

    get template() {
        const path = 'systems/shadowrun5e/dist/templates/actor/';
        return `${path}${this.actor.data.type}.html`;
    }

    /* -------------------------------------------- */

    /**
     * Prepare data for rendering the Actor sheet
     * The prepared data object contains both the actor data as well as additional sheet options
     */
    getData() {
        const data: SR5ActorSheetData = (super.getData() as unknown) as SR5ActorSheetData;

        // General purpose fields...
        data.config = CONFIG.SR5;
        data.filters = this._filters;

        this._prepareMatrixAttributes(data);
        this._prepareActorAttributes(data);

        this._prepareItems(data);
        this._prepareSkillsWithFilters(data);
        this._prepareActorTypeFields(data);
        this._prepareCharacterFields(data);

        return data;
    }

    _isSkillMagic(id, skill) {
        return skill.attribute === 'magic' || id === 'astral_combat' || id === 'assensing';
    }

    _isSkillResonance(skill) {
        return skill.attribute === 'resonance';
    }

    _getSkillLabelOrName(skill) {
        // Custom skills don't have labels, use their name instead.
        return skill.label ? game.i18n.localize(skill.label) : skill.name;
    }

    _doesSkillContainText(key, skill, text) {
        if (!text) {
            return true;
        }

        // Search both english keys, localized labels and all specializations.
        const name = this._getSkillLabelOrName(skill);
        const searchKey = skill.name === undefined ? key : '';
        // some "specs" were a string from old code I think
        const specs = skill.specs !== undefined && Array.isArray(skill.specs) ? skill.specs.join(' ') : '';
        let searchString = `${searchKey} ${name} ${specs}`;

        return searchString.toLowerCase().search(text.toLowerCase()) > -1;
    }

    _prepareCharacterFields(data: SR5ActorSheetData) {
        // Empty zero value modifiers for display purposes.
        const { modifiers: mods } = data.data;
        for (let [key, value] of Object.entries(mods)) {
            if (value === 0) mods[key] = '';
        }

        data.awakened = data.data.special === 'magic';
        data.emerged = data.data.special === 'resonance';
        data.woundTolerance = 3 + (Number(mods['wound_tolerance']) || 0);
    }

    _prepareActorTypeFields(data: SR5ActorSheetData) {
        data.isCharacter = this.actor.isCharacter();
        data.isSpirit = this.actor.isSpirit();
    }

    _prepareMatrixAttributes(data) {
        const { matrix } = data.data;
        if (matrix) {
            const cleanupAttribute = (attribute: MatrixAttribute) => {
                const att = matrix[attribute];
                if (att) {
                    if (!att.mod) att.mod = {};
                    if (att.temp === 0) delete att.temp;
                }
            };

            ['firewall', 'data_processing', 'sleaze', 'attack'].forEach((att: MatrixAttribute) => cleanupAttribute(att));
        }
    }

    _prepareActorAttributes(data: SR5ActorSheetData) {
        // Clear visible, zero value attributes temporary modifiers so they appear blank.
        const attrs = data.data.attributes;
        for (let [, att] of Object.entries(attrs)) {
            if (!att.hidden) {
                if (att.temp === 0) delete att.temp;
            }
        }
    }

    _prepareSkillsWithFilters(data: SR5ActorSheetData) {
        this._filterActiveSkills(data);
        this._filterKnowledgeSkills(data);
        this._filterLanguageSkills(data);
    }

    _filterActiveSkills(data: SR5ActorSheetData) {
        // Handle active skills directly, as it doesn't use sub-categories.
        data.data.skills.active = this._filterSkills(data, data.data.skills.active);
    }

    _filterKnowledgeSkills(data: SR5ActorSheetData) {
        // Knowledge skill have separate sub-categories.
        Object.keys(SR5.knowledgeSkillCategories).forEach((category) => {
            if (!data.data.skills.knowledge.hasOwnProperty(category)) {
                console.warn(`Knowledge Skill doesn't provide configured category ${category}`);
                return;
            }
            data.data.skills.knowledge[category].value = this._filterSkills(data, data.data.skills.knowledge[category].value);
        });
    }

    _filterLanguageSkills(data: SR5ActorSheetData) {
        // Language Skills have no sub-categories.
        data.data.skills.language.value = this._filterSkills(data, data.data.skills.language.value);
    }

    _filterSkills(data: SR5ActorSheetData, skills: Skills) {
        const filteredSkills = {};
        for (let [key, skill] of Object.entries(skills)) {
            if (this._showSkill(key, skill, data)) {
                filteredSkills[key] = skill;
            }
        }
        Helpers.orderKeys(filteredSkills);
        return filteredSkills;
    }

    _showSkill(key, skill, data) {
        if (this._showMagicSkills(key, skill, data)) {
            return true;
        }
        if (this._showResonanceSkills(key, skill, data)) {
            return true;
        }

        return this._showGeneralSkill(key, skill);
    }

    _isSkillFiltered(skillId, skill) {
        // a newly created skill should be filtered, no matter what.
        const isFilterable = this._getSkillLabelOrName(skill).length > 0;
        const isHiddenForText = !this._doesSkillContainText(skillId, skill, this._filters.skills);
        const isHiddenForUntrained = !this._filters.showUntrainedSkills && skill.value === 0;

        return !(isFilterable && (isHiddenForUntrained || isHiddenForText));
    }

    _showGeneralSkill(skillId, skill: SkillField) {
        return !this._isSkillMagic(skillId, skill) && !this._isSkillResonance(skill) && this._isSkillFiltered(skillId, skill);
    }

    _showMagicSkills(skillId, skill: SkillField, data: SR5ActorSheetData) {
        return this._isSkillMagic(skillId, skill) && data.data.special === 'magic' && this._isSkillFiltered(skillId, skill);
    }

    _showResonanceSkills(skillId, skill: SkillField, data: SR5ActorSheetData) {
        return this._isSkillResonance(skill) && data.data.special === 'resonance' && this._isSkillFiltered(skillId, skill);
    }

    _prepareItems(data) {
        const inventory = {};
        inventory['weapon'] = {
            label: game.i18n.localize('SR5.ItemTypes.Weapon'),
            items: [],
            dataset: {
                type: 'weapon',
            },
        };
        if (this.actor.data.type === 'character') {
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
                item = duplicate(item);
                const actorItem = this.actor.items.get(item._id);
                // Show item properties (chatData) in the item list overviews.
                //@ts-ignore
                item.properties = actorItem.data.properties;

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

    /* -------------------------------------------- */

    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html The prepared HTML object ready to be rendered into the DOM
     */
    activateListeners(html) {
        super.activateListeners(html);

        html.find('.hidden').hide();

        html.find('.has-desc').click((event) => {
            event.preventDefault();
            const item = $(event.currentTarget).parents('.list-item');
            const iid = $(item).data().item;
            const field = item.next();
            field.toggle();
            if (iid) {
                if (field.is(':visible')) this._shownDesc.push(iid);
                else this._shownDesc = this._shownDesc.filter((val) => val !== iid);
            }
        });

        html.find('.skill-header').click(this._onFilterUntrainedSkills.bind(this));

        html.find('.cell-input-roll').click(this._onRollCellInput.bind(this));
        html.find('.attribute-roll').click(this._onRollAttribute.bind(this));
        html.find('.skill-roll').click(this._onRollActiveSkill.bind(this));

        html.find('#filter-skills').on('input', this._onFilterSkills.bind(this));

        html.find('.skill-edit').click(this._onShowEditSkill.bind(this));
        html.find('.knowledge-skill-edit').click(this._onShowEditKnowledgeSkill.bind(this));
        html.find('.language-skill-edit').click(this._onShowEditLanguageSkill.bind(this));
        html.find('.add-knowledge').click(this._onAddKnowledgeSkill.bind(this));
        html.find('.add-language').click(this._onAddLanguageSkill.bind(this));
        html.find('.remove-knowledge').click(this._onRemoveKnowledgeSkill.bind(this));
        html.find('.remove-language').click(this._onRemoveLanguageSkill.bind(this));
        html.find('.knowledge-skill').click(this._onRollKnowledgeSkill.bind(this));
        html.find('.language-skill').click(this._onRollLanguageSkill.bind(this));

        html.find('.item-roll').click(this._onRollItem.bind(this));
        html.find('.item-equip-toggle').click(this._onEquipItem.bind(this));
        html.find('.item-qty').change(this._onChangeQty.bind(this));
        html.find('.item-rtg').change(this._onChangeRtg.bind(this));
        html.find('.item-create').click(this._onItemCreate.bind(this));
        html.find('.reload-ammo').click(this._onReloadAmmo.bind(this));
        html.find('.matrix-att-selector').change(this._onMatrixAttributeSelected.bind(this));

        html.find('.import-character').click(this._onShowImportCharacter.bind(this));

        /**
         * Open the PDF for an item on the actor
         */
        $(html)
            .find('.open-source-pdf')
            .on('click', async (event) => {
                event.preventDefault();
                const field = $(event.currentTarget).parents('.list-item');
                const iid = $(field).data().itemId;
                const item = this.actor.getOwnedSR5Item(iid);
                if (item) {
                    await item.openPdfSource();
                }
            });

        $(html).find('.horizontal-cell-input .cell').on('click', this._onSetCellInput.bind(this));
        $(html).find('.horizontal-cell-input .cell').on('contextmenu', this._onClearCellInput.bind(this));

        /**
         * New API to use for rolling from the actor sheet
         * the clickable label needs the css class Roll
         * a parent of the label needs to have the css class RollId, and then have data-roll-id set
         */
        $(html).find('.Roll').on('click', this._onRollFromSheet.bind(this));

        // updates matrix condition monitor on the device the actor has equippe
        $(html)
            .find('[name="data.matrix.condition_monitor.value"]')
            .on('change', async (event: any) => {
                event.preventDefault();
                const value = Helpers.parseInputToNumber(event.currentTarget.value);
                const matrixDevice = this.actor.getMatrixDevice();
                if (matrixDevice && !isNaN(value)) {
                    const updateData = {};
                    updateData['data.technology.condition_monitor.value'] = value;
                    await matrixDevice.update(updateData);
                }
            });

        // Update Inventory Item
        html.find('.item-edit').click((event) => {
            event.preventDefault();
            const iid = Helpers.listItemId(event);
            const item = this.actor.getOwnedSR5Item(iid);
            if (item) item.sheet.render(true);
        });
        // Delete Inventory Item
        html.find('.item-delete').click((event) => {
            event.preventDefault();
            const iid = Helpers.listItemId(event);
            const el = $(event.currentTarget).parents('.list-item');
            this.actor.deleteOwnedItem(iid);
            el.slideUp(200, () => this.render(false));
        });
        // Drag inventory item
        let handler = (ev) => this._onDragStart(ev);
        html.find('.list-item').each((i, item) => {
            if (item.dataset && item.dataset.itemId) {
                item.setAttribute('draggable', true);
                item.addEventListener('dragstart', handler, false);
            }
        });
    }

    async _onRollFromSheet(event) {
        event.preventDefault();
        // look for roll id data in the current line
        let rollId = $(event.currentTarget).data()?.rollId;
        // if that doesn't exist, look for a prent with RollId name
        rollId = rollId ?? $(event.currentTarget).parent('.RollId').data().rollId;

        const split = rollId.split('.');
        const options = { event };
        switch (split[0]) {
            case 'prompt-roll':
                this.actor.promptRoll(options);
                break;
            case 'armor':
                this.actor.rollArmor(options);
                break;
            case 'fade':
                this.actor.rollFade(options);
                break;
            case 'drain':
                this.actor.rollDrain(options);
                break;
            case 'defense':
                await this.actor.rollDefense(options);
                break;
            case 'damage-resist':
                await this.actor.rollSoak(options);
                break;

            // attribute only rolls
            case 'composure':
                this.actor.rollAttributesTest('composure');
                break;
            case 'judge-intentions':
                this.actor.rollAttributesTest('judge_intentions');
                break;
            case 'lift-carry':
                this.actor.rollAttributesTest('lift_carry');
                break;
            case 'memory':
                this.actor.rollAttributesTest('memory');
                break;

            case 'vehicle-stat':
                console.log('roll vehicle stat', rollId);
                break;

            case 'drone':
                const prop = split[1]; // we expect another for "drone" category
                switch (prop) {
                    case 'perception':
                        this.actor.rollDronePerception(options);
                        break;
                    case 'infiltration':
                        this.actor.rollDroneInfiltration(options);
                        break;
                    case 'pilot-vehicle':
                        this.actor.rollPilotVehicle(options);
                        break;
                }
                break;
            // end drone

            case 'attribute':
                const attribute = split[1];
                if (attribute) {
                    this.actor.rollAttribute(attribute, options);
                }
                break;
            // end attribute

            case 'skill':
                const skillType = split[1];
                switch (skillType) {
                    case 'active': {
                        const skillId = split[2];
                        this.actor.rollActiveSkill(skillId, options);
                        break;
                    }
                    case 'language': {
                        const skillId = split[2];
                        this.actor.rollLanguageSkill(skillId, options);
                        break;
                    }
                    case 'knowledge': {
                        const category = split[2];
                        const skillId = split[3];
                        this.actor.rollKnowledgeSkill(category, skillId, options);
                        break;
                    }
                }
                break;
            // end skill

            case 'matrix':
                const subkey = split[1];
                switch (subkey) {
                    case 'attribute':
                        const attr = split[2];
                        this.actor.rollMatrixAttribute(attr, options);
                        break;
                    case 'device-rating':
                        this.actor.rollDeviceRating(options);
                        break;
                }

                break;
            // end matrix
        }
    }

    // Setup skill name filter within getData
    async _onFilterSkills(event) {
        this._filters.skills = event.currentTarget.value;
        await this.render();
    }

    // Setup untrained skill filter within getData
    async _onFilterUntrainedSkills(event) {
        event.preventDefault();
        this._filters.showUntrainedSkills = !this._filters.showUntrainedSkills;
        await this.render();
    }

    async _onReloadAmmo(event) {
        event.preventDefault();
        const iid = Helpers.listItemId(event);
        const item = this.actor.getOwnedSR5Item(iid);
        if (item) return item.reloadAmmo();
    }

    async _onMatrixAttributeSelected(event) {
        let iid = this.actor.data.data.matrix.device;
        let item = this.actor.getOwnedSR5Item(iid);
        if (!item) {
            console.error('could not find item');
            return;
        }
        // grab matrix attribute (sleaze, attack, etc.)
        let att = event.currentTarget.dataset.att;
        // grab device attribute (att1, att2, ...)
        let deviceAtt = event.currentTarget.value;

        // get current matrix attribute on the device
        let oldVal = item.data.data.atts[deviceAtt].att;
        let data = {
            _id: iid,
        };

        // go through atts on device, setup matrix attributes on it
        for (let i = 1; i <= 4; i++) {
            let tmp = `att${i}`;
            let key = `data.atts.att${i}.att`;
            if (tmp === deviceAtt) {
                data[key] = att;
            } else if (item.data.data.atts[`att${i}`].att === att) {
                data[key] = oldVal;
            }
        }
        await this.actor.updateOwnedItem(data);
    }

    _onItemCreate(event) {
        event.preventDefault();
        const type = Helpers.listItemId(event);
        const itemData = {
            name: `New ${type}`,
            type: type,
        };
        return this.actor.createOwnedItem(itemData, { renderSheet: true });
    }

    async _onAddLanguageSkill(event) {
        event.preventDefault();
        this.actor.addLanguageSkill({ name: '' });
    }

    async _onRemoveLanguageSkill(event) {
        event.preventDefault();
        const skillId = Helpers.listItemId(event);
        this.actor.removeLanguageSkill(skillId);
    }

    async _onAddKnowledgeSkill(event) {
        event.preventDefault();
        const category = Helpers.listItemId(event);
        this.actor.addKnowledgeSkill(category);
    }

    async _onRemoveKnowledgeSkill(event) {
        event.preventDefault();
        const [skillId, category] = Helpers.listItemId(event).split('.');
        this.actor.removeKnowledgeSkill(skillId, category);
    }

    async _onChangeRtg(event) {
        const iid = Helpers.listItemId(event);
        const item = this.actor.getOwnedSR5Item(iid);
        const rtg = parseInt(event.currentTarget.value);
        if (item && rtg) {
            item.update({ 'data.technology.rating': rtg });
        }
    }

    async _onChangeQty(event) {
        const iid = Helpers.listItemId(event);
        const item = this.actor.getOwnedSR5Item(iid);
        const qty = parseInt(event.currentTarget.value);
        if (item && qty) {
            item.data.data.technology.quantity = qty;
            item.update({ 'data.technology.quantity': qty });
        }
    }

    async _onEquipItem(event) {
        event.preventDefault();
        const iid = Helpers.listItemId(event);
        const item = this.actor.getOwnedSR5Item(iid);
        if (item) {
            const itemData = item.data.data;
            const newItems = [] as any[];
            if (item.type === 'device') {
                // turn off all other devices than the one that is being equipped
                // if clicking the equipped, toggle it
                for (let ite of this.actor.items.filter((i) => i.type === 'device')) {
                    newItems.push({
                        '_id': ite._id,
                        'data.technology.equipped': ite._id === iid ? !itemData.technology.equipped : false,
                    });
                }
            } else {
                newItems.push({
                    '_id': iid,
                    'data.technology.equipped': !itemData.technology.equipped,
                });
            }
            await this.actor.updateEmbeddedEntity('OwnedItem', newItems);
            this.actor.render();
        }
    }

    async _onSetCellInput(event) {
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
                data['data.matrix.condition_monitor.value'] = value;
            }
        }
        await this.actor.update(data);
    }

    async _onClearCellInput(event) {
        const cmId = $(event.currentTarget).closest('.horizontal-cell-input').data().id;
        const data = {};
        if (cmId === 'stun' || cmId === 'physical') {
            const property = `data.track.${cmId}.value`;
            data[property] = 0;
        } else if (cmId === 'edge') {
            const property = `data.attributes.edge.uses`;
            data[property] = 0;
        } else if (cmId === 'overflow') {
            const property = 'data.track.physical.overflow.value';
            data[property] = 0;
        } else if (cmId === 'matrix') {
            const matrixDevice = this.actor.getMatrixDevice();
            if (matrixDevice) {
                const updateData = {};
                updateData['data.technology.condition_monitor.value'] = 0;
                await matrixDevice.update(updateData);
            } else {
                data['data.matrix.condition_monitor.value'] = 0;
            }
        }
        await this.actor.update(data);
    }

    async _onRollCellInput(event) {
        event.preventDefault();
        let track = $(event.currentTarget).closest('.horizontal-cell-input').data().id;
        if (track === 'stun' || track === 'physical') {
            await this.actor.rollNaturalRecovery(track, event);
        } else if (track === 'edge') {
            await this.actor.rollAttribute('edge');
        }
    }

    async _onRollItem(event) {
        event.preventDefault();
        const iid = Helpers.listItemId(event);
        const item = this.actor.getOwnedSR5Item(iid);
        if (item) {
            await item.castAction(event);
        }
    }

    async _onRollKnowledgeSkill(event) {
        event.preventDefault();
        const id = Helpers.listItemId(event);
        const [skill, category] = id.split('.');
        return this.actor.rollKnowledgeSkill(category, skill, { event: event });
    }

    async _onRollLanguageSkill(event) {
        event.preventDefault();
        const skill = Helpers.listItemId(event);
        return this.actor.rollLanguageSkill(skill, { event: event });
    }

    async _onRollActiveSkill(event) {
        event.preventDefault();
        const skill = Helpers.listItemId(event);
        return this.actor.rollActiveSkill(skill, { event: event });
    }

    async _onRollAttribute(event) {
        event.preventDefault();
        const attr = event.currentTarget.closest('.attribute').dataset.attribute;
        return this.actor.rollAttribute(attr, { event: event });
    }

    /**
     * @private
     */
    _findActiveList() {
        return $(this.element).find('.tab.active .scroll-area');
    }

    /**
     * @private
     */
    async _render(...args) {
        const focusList = $(this.element).find(':focus');
        const focus: any = focusList.length ? focusList[0] : null;

        this._saveScrollPositions();
        await super._render(...args);
        this._restoreScrollPositions();

        if (focus && focus.name) {
            const element = this.form[focus.name];
            if (element) {
                element.focus();
                // set the selection range on the focus formed from before (keeps track of cursor in input)
                element.setSelectionRange && element.setSelectionRange(focus.selectionStart, focus.selectionEnd);
            }
        }
    }

    /**
     * @private
     */
    _restoreScrollPositions() {
        const activeList = this._findActiveList();
        if (activeList.length && this._scroll != null) {
            activeList.prop('scrollTop', this._scroll);
        }
    }

    /**
     * @private
     */
    _saveScrollPositions() {
        const activeList = this._findActiveList();
        if (activeList.length) {
            this._scroll = activeList.prop('scrollTop');
        }
    }

    async _closeOpenSkillApp() {
        if (globalSkillAppId !== -1) {
            if (ui.windows[globalSkillAppId]) {
                await ui.windows[globalSkillAppId].close();
            }
            globalSkillAppId = -1;
        }
    }

    /** Keep track of each SkillEditForm instance and close before opening another.
     *
     * @param skillEditFormImplementation Any extending class! of SkillEditForm
     * @param actor
     * @param options
     * @param args Collect arguments of the different renderWithSkill implementations.
     */
    async _showSkillEditForm(skillEditFormImplementation, actor: SR5Actor, options: object, ...args) {
        await this._closeOpenSkillApp();

        const skillEditForm = new skillEditFormImplementation(actor, options, ...args);
        globalSkillAppId = skillEditForm.appId;
        await skillEditForm.render(true);
    }

    _onShowEditKnowledgeSkill(event) {
        event.preventDefault();
        const [skill, category] = Helpers.listItemId(event).split('.');
        this._showSkillEditForm(
            KnowledgeSkillEditForm,
            this.actor,
            {
                event: event,
            },
            skill,
            category,
        );
    }

    _onShowEditLanguageSkill(event) {
        event.preventDefault();
        const skill = Helpers.listItemId(event);
        // new LanguageSkillEditForm(this.actor, skill, { event: event }).render(true);
        this._showSkillEditForm(LanguageSkillEditForm, this.actor, { event: event }, skill);
    }

    _onShowEditSkill(event) {
        event.preventDefault();
        const skill = Helpers.listItemId(event);
        // new SkillEditForm(this.actor, skill, { event: event }).render(true);
        this._showSkillEditForm(SkillEditForm, this.actor, { event: event }, skill);
    }

    _onShowImportCharacter(event) {
        event.preventDefault();
        const options = {
            name: 'chummer-import',
            title: 'Chummer Import',
        };
        new ChummerImportForm(this.actor, options).render(true);
    }
}
