import {Helpers} from '../helpers';
import {ChummerImportForm} from '../apps/chummer-import-form';
import {SkillEditSheet} from '../apps/skills/SkillEditSheet';
import {KnowledgeSkillEditSheet} from '../apps/skills/KnowledgeSkillEditSheet';
import {LanguageSkillEditSheet} from '../apps/skills/LanguageSkillEditSheet';
import {SR5Actor} from './SR5Actor';
import {SR5} from '../config';
import SR5ActorSheetData = Shadowrun.SR5ActorSheetData;
import SR5SheetFilters = Shadowrun.SR5SheetFilters;
import Skills = Shadowrun.Skills;
import MatrixAttribute = Shadowrun.MatrixAttribute;
import SkillField = Shadowrun.SkillField;
import DeviceData = Shadowrun.DeviceData;
import {onManageActiveEffect, prepareActiveEffectCategories} from "../effects";

// Use SR5ActorSheet._showSkillEditForm to only ever render one SkillEditSheet instance.
// Should multiple instances be open, Foundry will cause cross talk between skills and actors,
// when opened in succession, causing SkillEditSheet to wrongfully overwrite the wrong data.
let globalSkillAppId: number = -1;

/**
 * See Hooks.init for which actor type this sheet handles.
 *
 */
console.warn('Shadowrun5e | The SR5ActorSheet class is deprecated and will be removed');
export class SR5ActorSheet extends ActorSheet {
    _shownDesc: string[] = [];
    _filters: SR5SheetFilters = {
        skills: '',
        showUntrainedSkills: true,
    };
    _scroll: string;

    /* -------------------------------------------- */

    /**
     * Extend and override the default options used by the 5e Actor Sheet
     * @returns {Object}
     */
    static get defaultOptions() {
        // @ts-ignore
        return mergeObject(super.defaultOptions, {
            classes: ['sr5', 'sheet', 'actor'],
            width: 905,
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
        const path = 'systems/shadowrun5e/dist/templates';

        if (this.actor.limited) {
            return `${path}/actor-limited/${this.actor.data.type}.html`;
        }

        return `${path}/actor/${this.actor.data.type}.html`;
    }

    getData(options?: Application.RenderOptions): Promise<ActorSheet.Data<ActorSheet.Options>> | ActorSheet.Data<ActorSheet.Options> {
        //     // Restructure redesigned Document.getData to contain all new fields, while keeping data.data as system data.
            let data = super.getData() as unknown as SR5ActorSheetData;
            data = {
                ...data,
                // @ts-ignore
                data: data.data.data
            }

            // General purpose fields...
            data.config = SR5;
            data.filters = this._filters;

            this._prepareMatrixAttributes(data);
            this._prepareActorAttributes(data);

            this._prepareItems(data);
            this._prepareSkillsWithFilters(data);
            this._prepareActorTypeFields(data);
            this._prepareCharacterFields(data);
            this._prepareVehicleFields(data);

            // Active Effects data.
            data['effects'] = prepareActiveEffectCategories(this.document.effects);
            data['markedDocuments'] = this.object.getAllMarkedDocuments();

            // @ts-ignore // TODO: ActorSheetData typing is missing
            return data;
    }

    _isSkillMagic(id, skill) {
        return skill.attribute === 'magic' || id === 'astral_combat' || id === 'assensing';
    }

    _isSkillResonance(skill) {
        return skill.attribute === 'resonance';
    }

    _getSkillLabelOrName(skill) {
        return Helpers.getSkillLabelOrName(skill);
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

    _prepareVehicleFields(data: SR5ActorSheetData) {
        if (!this.actor.isVehicle()) return;

        const driver = this.actor.getVehicleDriver();

        data.vehicle = {
            driver
        };
    }

    _prepareActorTypeFields(data: SR5ActorSheetData) {
        data.isCharacter = this.actor.isCharacter();
        data.isSpirit = this.actor.isSpirit();
        data.isCritter = this.actor.isCritter();
        data.hasSkills = this.actor.hasSkills;
        data.hasSpecial = this.actor.hasSpecial;
        data.hasFullDefense = this.actor.hasFullDefense;
    }

    _prepareMatrixAttributes(data) {
        const { matrix } = data.data;
        if (matrix) {
            const cleanupAttribute = (attribute: MatrixAttribute) => {
                const att = matrix[attribute];
                if (att) {
                    if (!att.mod) att.mod = [];
                    if (att.temp === 0) delete att.temp;
                }
            };

            ['firewall', 'data_processing', 'sleaze', 'attack'].forEach((att: MatrixAttribute) => cleanupAttribute(att));
        }
    }

    _prepareActorAttributes(data: SR5ActorSheetData) {
        // Clear visible, zero value attributes temporary modifiers so they appear blank.
        const attributes = data.data.attributes;
        for (let [, attribute] of Object.entries(attributes)) {
            if (!attribute.hidden) {
                if (attribute.temp === 0) delete attribute.temp;
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
            // Don't show hidden skills.
            if (skill.hidden) {
                continue;
            }
            // Filter visible skills.
            if (this._showSkill(key, skill, data)) {
                filteredSkills[key] = skill;
            }
        }

        return Helpers.sortSkills(filteredSkills);
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
        // a newly created skill shouldn't be filtered, no matter what.
        // Therefore disqualify empty skill labels/names from filtering and always show them.
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
                const actorItem = this.actor.items.get(item._id);
                if (!actorItem) return;
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

        // Active Effect management
        html.find(".effect-control").click(event => onManageActiveEffect(event, this.document));

        html.find('.skill-header').find('.item-name').click(this._onFilterUntrainedSkills.bind(this));
        html.find('.skill-header').find('.skill-spec-item').click(this._onFilterUntrainedSkills.bind(this));
        html.find('.skill-header').find('.rtg').click(this._onFilterUntrainedSkills.bind(this));

        html.find('.cell-input-roll').click(this._onRollCellInput.bind(this));
        html.find('.attribute-roll').click(this._onRollAttribute.bind(this));
        html.find('.skill-roll').click(this._onRollActiveSkill.bind(this));

        html.find('#filter-skills').on('input', this._onFilterSkills.bind(this));

        html.find('.skill-edit').click(this._onShowEditSkill.bind(this));
        html.find('.knowledge-skill-edit').click(this._onShowEditKnowledgeSkill.bind(this));
        html.find('.language-skill-edit').click(this._onShowEditLanguageSkill.bind(this));
        html.find('.add-knowledge').click(this._onAddKnowledgeSkill.bind(this));
        html.find('.add-language').click(this._onAddLanguageSkill.bind(this));
        html.find('.add-active').click(this._onAddActiveSkill.bind(this));
        html.find('.remove-knowledge').click(this._onRemoveKnowledgeSkill.bind(this));
        html.find('.remove-language').click(this._onRemoveLanguageSkill.bind(this));
        html.find('.remove-active').click(this._onRemoveActiveSkill.bind(this));
        html.find('.knowledge-skill').click(this._onRollKnowledgeSkill.bind(this));
        html.find('.language-skill').click(this._onRollLanguageSkill.bind(this));

        html.find('.item-roll').click(this._onRollItem.bind(this));
        html.find('.item-equip-toggle').click(this._onEquipItem.bind(this));
        html.find('.item-qty').change(this._onChangeQty.bind(this));
        html.find('.item-rtg').change(this._onChangeRtg.bind(this));
        html.find('.item-create').click(this._onItemCreate.bind(this));
        html.find('.reload-ammo').click(this._onReloadAmmo.bind(this));

        html.find('.matrix-att-selector').change(this._onMatrixAttributeSelected.bind(this));
        html.find('.marks-qty').on('change', this._onMarksQuantityChange.bind(this));
        html.find('.marks-add-one').on('click', async (event) => this._onMarksQuantityChangeBy(event, 1));
        html.find('.marks-remove-one').on('click', async (event) => this._onMarksQuantityChangeBy(event, -1));
        html.find('.marks-delete').on('click', this._onMarksDelete.bind(this));
        html.find('.marks-clear-all').on('click', this._onMarksClearAll.bind(this));

        html.find('.import-character').click(this._onShowImportCharacter.bind(this));
        html.find('.show-hidden-skills').click(this._onShowHiddenSkills.bind(this));

        /**
         * Open the PDF for an item on the actor
         */
        $(html)
            .find('.open-source-pdf')
            .on('click', async (event) => {
                event.preventDefault();
                const field = $(event.currentTarget).parents('.list-item');
                const iid = $(field).data().itemId;
                const item = this.actor.items.get(iid);
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

        // updates matrix condition monitor on the device the actor has equipped
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
            const item = this.actor.items.get(iid);
            if (!item) return;
            // @ts-ignore
            item.sheet.render(true);
        });
        // Delete Inventory Item
        html.find('.item-delete').click(event => this.deleteOwnedItem(event));

        // Augment ListItem.html templates with drag support
       this._addDragSupportToListItemTemplatePartial(html);

        html.find('.driver-remove').click(this.handleRemoveVehicleDriver.bind(this));
    }

    /**
     * @override Default drag start handler to add Skill support
     * @param event
     */
    async _onDragStart(event) {
        // Create drag data
        const dragData = {
            actorId: this.actor.id,
            sceneId: this.actor.isToken ? canvas.scene?.id : null,
            tokenId: this.actor.isToken ? this.actor.token?.id : null,
            type: '',
            data: {}
        };

        // Handle different item type data transfers.
        // These handlers depend on behavior of the template partial ListItem.html.
        const element = event.currentTarget;
        switch (element.dataset.itemType) {
            // Skill data transfer. (Active and language skills)
            case 'skill':
                // Prepare data transfer
                dragData.type = 'Skill';
                dragData.data = {
                    skillId: element.dataset.itemId,
                    skill: this.actor.getSkill(element.dataset.itemId)
                };

                // Set data transfer
                event.dataTransfer.setData("text/plain", JSON.stringify(dragData));

                return;

            // Knowlege skill data transfer
            case 'knowledgeskill':
                // Knowledge skills have a multi purpose id built: <id>.<knowledge_category>
                const skillId = element.dataset.itemId.includes('.') ? element.dataset.itemId.split('.')[0] : element.dataset.itemId;

                dragData.type = 'Skill';
                dragData.data = {
                    skillId,
                    skill: this.actor.getSkill(skillId)
                };

                // Set data transfer
                event.dataTransfer.setData("text/plain", JSON.stringify(dragData));

                return;

            // All default Foundry data transfer.
            default:
                // Let default Foundry handler deal with default drag cases.
                return super._onDragStart(event);
        }
    }

    /** Handle all document drops onto all actor sheet types.
     *
     * @param event
     */
    // @ts-ignore
    async _onDrop(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!event.dataTransfer) return;

        const dropData = JSON.parse(event.dataTransfer.getData('text/plain'));

        // Handle specific system drop events.
        switch (dropData.type) {
            case "Actor":
                await this.actor.addVehicleDriver(dropData.id)
                break;
        }

        // Handle none specific drop events.
        await super._onDrop(event);
    }

    /**
     * Augment each item of the ListItem template partial with drag support.
     * @param html
     */
    _addDragSupportToListItemTemplatePartial(html) {
         html.find('.list-item').each((i, item) => {
            if (item.dataset && item.dataset.itemId) {
                item.setAttribute('draggable', true);
                item.addEventListener('dragstart', this._onDragStart.bind(this), false);
            }
        });
    }

    async deleteOwnedItem(event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const iid = Helpers.listItemId(event);
        const item = this.actor.items.get(iid);
        if (!item) return;
        await item.delete();
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
                const prop = split[1]; // we expect another for "drone" category
                switch (prop) {
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
                const subkey = split[1];
                switch (subkey) {
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
        const item = this.actor.items.get(iid);
        if (item) return item.reloadAmmo();
    }

    async _onMatrixAttributeSelected(event) {
        if (!("matrix" in this.actor.data.data)) return;

        let iid = this.actor.data.data.matrix.device;
        let item = this.actor.items.get(iid);
        if (!item) {
            console.error('could not find item');
            return;
        }
        // grab matrix attribute (sleaze, attack, etc.)
        let att = event.currentTarget.dataset.att;
        // grab device attribute (att1, att2, ...)
        let deviceAtt = event.currentTarget.value;

        // get current matrix attribute on the device
        const deviceData = item.data.data as DeviceData;
        let oldVal = deviceData.atts[deviceAtt].att;
        let data = {
            _id: iid,
        };

        // go through atts on device, setup matrix attributes on it
        for (let i = 1; i <= 4; i++) {
            let tmp = `att${i}`;
            let key = `data.atts.att${i}.att`;
            if (tmp === deviceAtt) {
                data[key] = att;
            } else if (deviceData.atts[`att${i}`].att === att) {
                data[key] = oldVal;
            }
        }
        await this.actor.updateEmbeddedDocuments('Item', [data]);
    }

    async _onMarksQuantityChange(event) {
       event.stopPropagation();

        const markId = event.currentTarget.dataset.markId;
        if (!markId) return;

        const markedDocuments = Helpers.getMarkIdDocuments(markId);
        if (!markedDocuments) return;
        const {scene, target, item} = markedDocuments;
        if (!scene || !target) return; // item can be undefined.

        const marks = parseInt(event.currentTarget.value);
        await this.object.setMarks(target, marks, {scene, item, overwrite: true});
    }

    async _onMarksQuantityChangeBy(event, by: number) {
        event.stopPropagation();

        const markId = event.currentTarget.dataset.markId;
        if (!markId) return;

        const markedDocuments = Helpers.getMarkIdDocuments(markId);
        if (!markedDocuments) return;
        const {scene, target, item} = markedDocuments;
        if (!scene || !target) return; // item can be undefined.

        await this.object.setMarks(target, by, {scene, item});
    }

    async _onMarksDelete(event) {
        event.stopPropagation();

        const markId = event.currentTarget.dataset.markId;
        if (!markId) return;

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.object.clearMark(markId);
    }

    async _onMarksClearAll(event) {
        event.stopPropagation();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.object.clearMarks();
    }

    _onItemCreate(event) {
        event.preventDefault();
        const type = Helpers.listItemId(event);
        const itemData = {
            name: `New ${type}`,
            type: type,
        };
        return this.actor.createEmbeddedDocuments('Item', [itemData], { renderSheet: true });
    }

    async _onAddLanguageSkill(event) {
        event.preventDefault();
        const skillId = await this.actor.addLanguageSkill({ name: '' });
        if (!skillId) return;

        // NOTE: Causes issues with adding knowledge skills (category undefined)
        // await this._showSkillEditForm(LanguageSkillEditSheet, this.actor, {event}, skillId);
    }

    async _onRemoveLanguageSkill(event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const skillId = Helpers.listItemId(event);
        await this.actor.removeLanguageSkill(skillId);
    }

    async _onAddKnowledgeSkill(event) {
        event.preventDefault();
        const category = Helpers.listItemId(event);
        const skillId = await this.actor.addKnowledgeSkill(category);
        if (!skillId) return;

        // NOTE: Causes issues with adding knowledge skills (category undefined)
        // await this._showSkillEditForm(KnowledgeSkillEditSheet, this.actor, {event}, skillId);
    }

    async _onRemoveKnowledgeSkill(event) {
        event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const [skillId, category] = Helpers.listItemId(event).split('.');
        await this.actor.removeKnowledgeSkill(skillId, category);
    }

    /** Add an active skill and show the matching edit application afterwards.
     *
     * @param event The HTML event from which the action resulted.
     */
     async _onAddActiveSkill(event: Event) {
        event.preventDefault();
        const skillId = await this.actor.addActiveSkill();
        if (!skillId) return;

        await this._showSkillEditForm(SkillEditSheet, this.actor, { event: event }, skillId);
    }

    async _onRemoveActiveSkill(event: Event) {
         event.preventDefault();

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        const skillId = Helpers.listItemId(event);
        await this.actor.removeActiveSkill(skillId);
    }

    async _onChangeRtg(event) {
        const iid = Helpers.listItemId(event);
        const item = this.actor.items.get(iid);
        const rtg = parseInt(event.currentTarget.value);
        if (item && rtg) {
            await item.update({ 'data.technology.rating': rtg });
        }
    }

    async _onChangeQty(event) {
        const iid = Helpers.listItemId(event);
        const item = this.actor.items.get(iid);
        const qty = parseInt(event.currentTarget.value);
        if (item && qty && "technology" in item.data.data) {
            item.data.data.technology.quantity = qty;
            await item.update({ 'data.technology.quantity': qty });
        }
    }

    async _onEquipItem(event) {
        event.preventDefault();
        const iid = Helpers.listItemId(event);
        const item = this.actor.items.get(iid);
        if (item) {
            const newItems = [] as any[];

            // Handle the equipped state.
            if (item.isDevice()) {
                // Only allow one equipped device item. Unequip all other.
                for (const item of this.actor.items.filter(actorItem => actorItem.isDevice())) {
                    newItems.push({
                        '_id': item.id,
                        'data.technology.equipped': item.id === iid,
                    });
                }

            } else {
                // Toggle equip status.
                newItems.push({
                    '_id': iid,
                    'data.technology.equipped': !item.isEquipped(),
                });
            }

            // Handle active effects based on equipped status.
            // NOTE: This is commented out for later ease of enabling effects based on equip status AND if they are
            //       meant to enable on eqiup or not.
            // this.actor.effects.forEach(effect => {
            //     if (effect.data.origin !== item.uuid) return;
            //
            //     // @ts-ignore
            //     effect.disable(item.isEquipped());
            // })

            await this.actor.updateEmbeddedDocuments('Item', newItems);

            this.actor.render(false);
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
        const item = this.actor.items.get(iid);
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
     * Enhance Foundry state restore on rerender by more user interaction state.
     * @override
     */
    async _render(...args) {
        const focus = this._saveInputCursorPosition();
        this._saveScrollPositions();

        await super._render(...args);

        this._restoreScrollPositions();
        this._restoreInputCursorPosition(focus);
    }

    _saveInputCursorPosition(): any|null {
        const focusList = $(this.element).find('input:focus');
        return focusList.length ? focusList[0] : null;
    }

    /**
     * Restore the cursor position of focused input elements on top of Foundry restoring the general focus
     * This is needed for char by char update caused by filtering skills.
     */
    _restoreInputCursorPosition(focus) {
        if (focus && focus.name) {
            if (!this.form) return;

            const element = this.form[focus.name];
            if (element) {
                // Set general focus for allem input types.
                element.focus();

                // Set selection range for supported input types.
                if (['checkbox', 'radio'].includes(element.type)) return;
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

    /** Keep track of each SkillEditSheet instance and close before opening another.
     *
     * @param skillEditFormImplementation Any extending class! of SkillEditSheet
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
            KnowledgeSkillEditSheet,
            this.actor,
            {
                event: event,
            },
            skill,
            category,
        );
    }

    async _onShowEditLanguageSkill(event) {
        event.preventDefault();
        const skill = Helpers.listItemId(event);
        // new LanguageSkillEditSheet(this.actor, skill, { event: event }).render(true);
        await this._showSkillEditForm(LanguageSkillEditSheet, this.actor, { event: event }, skill);
    }

    async _onShowEditSkill(event) {
        event.preventDefault();
        const skill = Helpers.listItemId(event);
        // new SkillEditSheet(this.actor, skill, { event: event }).render(true);
        await this._showSkillEditForm(SkillEditSheet, this.actor, { event: event }, skill);
    }

    _onShowImportCharacter(event) {
        event.preventDefault();
        const options = {
            name: 'chummer-import',
            title: 'Chummer Import',
        };
        new ChummerImportForm(this.actor, options).render(true);
    }

    async _onShowHiddenSkills(event) {
        event.preventDefault();

        await this.actor.showHiddenSkills();
    }

    async handleRemoveVehicleDriver(event) {
        event.preventDefault();
        await this.actor.removeVehicleDriver();
    }
}
