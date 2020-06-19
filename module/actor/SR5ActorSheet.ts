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

/**
 * Extend the basic ActorSheet with some very simple modifications
 */
export class SR5ActorSheet extends ActorSheet {
    _shownUntrainedSkills: boolean;
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
        this._shownUntrainedSkills = true;
        this._shownDesc = [];
        this._filters = {
            skills: '',
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
            template: 'systems/shadowrun5e/templates/actor/character.html',
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

    /* -------------------------------------------- */

    /**
     * Prepare data for rendering the Actor sheet
     * The prepared data object contains both the actor data as well as additional sheet options
     */
    getData() {
        const data: SR5ActorSheetData = (super.getData() as unknown) as SR5ActorSheetData;

        this._prepareMatrixAttributes(data);

        const attrs = data.data.attributes;
        for (let [, att] of Object.entries(attrs)) {
            if (!att.hidden) {
                if (att.mod['Temporary'] === 0) delete att.mod;
            }
        }

        const { magic } = data.data;
        if (magic.drain && magic.drain.mod['Temporary'] === 0) delete magic.drain.mod['Temporary'];

        const { modifiers: mods } = data.data;
        for (let [key, value] of Object.entries(mods)) {
            if (value === 0) mods[key] = '';
        }

        this._prepareItems(data);
        this._prepareSkills(data);

        data['config'] = CONFIG.SR5;
        data['awakened'] = data.data.special === 'magic';
        data['emerged'] = data.data.special === 'resonance';

        data.filters = this._filters;

        return data;
    }

    _isSkillMagic(id, skill) {
        return skill.attribute === 'magic' || id === 'astral_combat' || id === 'assensing';
    }

    _doesSkillContainText(key, skill, text) {
        let searchString = `${key} ${game.i18n.localize(skill.label)} ${skill?.specs?.join(' ')}`;
        return searchString.toLowerCase().search(text.toLowerCase()) > -1;
    }

    _prepareMatrixAttributes(data) {
        const { matrix } = data.data;
        const cleanupAttribute = (attribute: MatrixAttribute) => {
            const att = matrix[attribute];
            if (att) {
                if (!att.mod) att.mod = {};
                if (att.mod['Temporary'] === 0) delete att.mod['Temporary'];
            }
        };

        ['firewall', 'data_processing', 'sleaze', 'attack'].forEach((att: MatrixAttribute) => cleanupAttribute(att));
    }

    _prepareSkills(data) {
        const activeSkills = {};
        const oldSkills: Skills = data.data.skills.active;
        for (let [key, skill] of Object.entries(oldSkills)) {
            // if filter isn't empty, we are doing custom filtering
            if (this._filters.skills !== '') {
                if (this._doesSkillContainText(key, skill, this._filters.skills)) {
                    activeSkills[key] = skill;
                }
                // general check if we aren't filtering
            } else if (
                (skill.value > 0 || this._shownUntrainedSkills) &&
                !(this._isSkillMagic(key, skill) && data.data.special !== 'magic') &&
                !(skill.attribute === 'resonance' && data.data.special !== 'resonance')
            ) {
                activeSkills[key] = skill;
            }
        }
        Helpers.orderKeys(activeSkills);
        data.data.skills.active = activeSkills;
    }

    _prepareItems(data) {
        const inventory = {
            weapon: {
                label: game.i18n.localize('SR5.Weapon'),
                items: [],
                dataset: {
                    type: 'weapon',
                },
            },
            armor: {
                label: game.i18n.localize('SR5.Armor'),
                items: [],
                dataset: {
                    type: 'armor',
                },
            },
            device: {
                label: game.i18n.localize('SR5.Device'),
                items: [],
                dataset: {
                    type: 'device',
                },
            },
            equipment: {
                label: game.i18n.localize('SR5.Equipment'),
                items: [],
                dataset: {
                    type: 'equipment',
                },
            },
            cyberware: {
                label: game.i18n.localize('SR5.Cyberware'),
                items: [],
                dataset: {
                    type: 'cyberware',
                },
            },
            programs: {
                label: game.i18n.localize('SR5.Program'),
            },
        };

        let [items, spells, qualities, adept_powers, actions, complex_forms, lifestyles, contacts, sins, programs] = data.items.reduce(
            (arr, item) => {
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
                else if (Object.keys(inventory).includes(item.type)) arr[0].push(item);
                return arr;
            },
            [[], [], [], [], [], [], [], [], [], []],
        );

        const sortByName = (i1, i2) => {
            if (i1.name > i2.name) return 1;
            if (i1.name < i2.name) return -1;
            return 0;
        };
        actions.sort(sortByName);
        adept_powers.sort(sortByName);
        complex_forms.sort(sortByName);
        items.sort(sortByName);
        spells.sort(sortByName);
        contacts.sort(sortByName);
        lifestyles.sort(sortByName);
        sins.sort(sortByName);
        programs.sort((left, right) => {
            const leftEquipped = left.data?.technology?.equipped;
            const rightEquipped = right.data?.technology?.equipped;
            if (leftEquipped && !rightEquipped) return -1;
            if (rightEquipped && !leftEquipped) return 1;
            if (left.name > right.name) return 1;
            if (left.name < right.name) return -1;
            return 0;
        });

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

        html.find('.skill-header').click((event) => {
            event.preventDefault();
            this._shownUntrainedSkills = !this._shownUntrainedSkills;
            this._render(true);
        });

        html.find('.has-desc').click((event) => {
            event.preventDefault();
            const item = $(event.currentTarget).parents('.item');
            const iid = $(item).data().item;
            const field = item.next();
            field.toggle();
            if (iid) {
                if (field.is(':visible')) this._shownDesc.push(iid);
                else this._shownDesc = this._shownDesc.filter((val) => val !== iid);
            }
        });

        html.find('#filter-skills').on('input', this._onFilterSkills.bind(this));
        html.find('.track-roll').click(this._onRollTrack.bind(this));
        html.find('.attribute-roll').click(this._onRollAttribute.bind(this));
        html.find('.skill-roll').click(this._onRollActiveSkill.bind(this));
        html.find('.defense-roll').click(this._onRollDefense.bind(this));
        html.find('.attribute-only-roll').click(this._onRollAttributesOnly.bind(this));
        html.find('.soak-roll').click(this._onRollSoak.bind(this));
        html.find('.drain-roll').click(this._onRollDrain.bind(this));
        html.find('.fade-roll').click(this._onRollFade.bind(this));
        html.find('.item-roll').click(this._onRollItem.bind(this));
        // $(html).find('.item-roll').on('contextmenu', () => console.log('TEST'));
        html.find('.item-equip-toggle').click(this._onEquipItem.bind(this));
        html.find('.item-qty').change(this._onChangeQty.bind(this));
        html.find('.item-rtg').change(this._onChangeRtg.bind(this));
        html.find('.item-create').click(this._onItemCreate.bind(this));
        html.find('.matrix-roll').click(this._onRollMatrixAttribute.bind(this));
        html.find('.matrix-att-selector').change(this._onMatrixAttributeSelected.bind(this));
        html.find('.basic-roll').click(this._onRollPrompt.bind(this));
        html.find('.armor-roll').click(this._onRollArmor.bind(this));
        html.find('.add-knowledge').click(this._onAddKnowledgeSkill.bind(this));
        html.find('.knowledge-skill').click(this._onRollKnowledgeSkill.bind(this));
        html.find('.remove-knowledge').click(this._onRemoveKnowledgeSkill.bind(this));
        html.find('.add-language').click(this._onAddLanguageSkill.bind(this));
        html.find('.language-skill').click(this._onRollLanguageSkill.bind(this));
        html.find('.remove-language').click(this._onRemoveLanguageSkill.bind(this));
        html.find('.import-character').click(this._onShowImportCharacter.bind(this));
        html.find('.reload-ammo').click(this._onReloadAmmo.bind(this));
        html.find('.skill-edit').click(this._onShowEditSkill.bind(this));
        html.find('.knowledge-skill-edit').click(this._onShowEditKnowledgeSkill.bind(this));
        html.find('.language-skill-edit').click(this._onShowEditLanguageSkill.bind(this));
        html.find('.matrix-condition-value').on('change', async (event) => {
            event.preventDefault();
            console.log(event);
            const value = Helpers.parseInputToNumber(event.currentTarget.value);
            console.log(value);
            const matrixDevice = this.actor.getMatrixDevice();
            console.log(matrixDevice);
            if (matrixDevice && !isNaN(value)) {
                console.log(matrixDevice);
                const updateData = {};
                updateData['data.technology.condition_monitor.value'] = value;
                await matrixDevice.update(updateData);
            }
        });

        // Update Inventory Item
        html.find('.item-edit').click((event) => {
            event.preventDefault();
            const iid = event.currentTarget.closest('.item').dataset.itemId;
            const item = this.actor.getOwnedItem(iid);
            if (item) item.sheet.render(true);
        });
        // Delete Inventory Item
        html.find('.item-delete').click((event) => {
            event.preventDefault();
            const iid = event.currentTarget.closest('.item').dataset.itemId;
            const el = $(event.currentTarget).parents('.item');
            this.actor.deleteOwnedItem(iid);
            el.slideUp(200, () => this.render(false));
        });
        // Drag inventory item
        let handler = (ev) => this._onDragItemStart(ev);
        html.find('.item').each((i, item) => {
            if (item.dataset && item.dataset.itemId) {
                item.setAttribute('draggable', true);
                item.addEventListener('dragstart', handler, false);
            }
        });
    }

    async _onFilterSkills(event) {
        this._filters.skills = event.currentTarget.value;
        this.render();
    }

    async _onReloadAmmo(event) {
        event.preventDefault();
        const iid = event.currentTarget.closest('.item').dataset.itemId;
        const item = this.actor.getOwnedItem(iid);
        if (item) return item.reloadAmmo();
    }

    async _onMatrixAttributeSelected(event) {
        let iid = this.actor.data.data.matrix.device;
        let item = this.actor.getOwnedItem(iid);
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
        const header = event.currentTarget;
        const type = header.dataset.type;
        const itemData = {
            name: `New ${Helpers.label(type)}`,
            type: type,
            data: duplicate(header.dataset),
        };
        delete itemData.data['type'];
        return this.actor.createOwnedItem(itemData, { renderSheet: true });
    }

    async _onAddLanguageSkill(event) {
        event.preventDefault();
        this.actor.addLanguageSkill({ name: '' });
    }

    async _onRemoveLanguageSkill(event) {
        event.preventDefault();
        const skillId = event.currentTarget.dataset.skill;
        this.actor.removeLanguageSkill(skillId);
    }

    async _onAddKnowledgeSkill(event) {
        event.preventDefault();
        const category = event.currentTarget.dataset.category;
        this.actor.addKnowledgeSkill(category);
    }

    async _onRemoveKnowledgeSkill(event) {
        event.preventDefault();
        const skillId = event.currentTarget.dataset.skill;
        const category = event.currentTarget.dataset.category;
        this.actor.removeKnowledgeSkill(skillId, category);
    }

    async _onChangeRtg(event) {
        const iid = event.currentTarget.closest('.item').dataset.itemId;
        const item = this.actor.getOwnedItem(iid);
        const rtg = parseInt(event.currentTarget.value);
        if (item && rtg) {
            item.update({ 'data.technology.rating': rtg });
        }
    }

    async _onChangeQty(event) {
        const iid = event.currentTarget.closest('.item').dataset.itemId;
        const item = this.actor.getOwnedItem(iid);
        const qty = parseInt(event.currentTarget.value);
        if (item && qty) {
            item.data.data.technology.quantity = qty;
            item.update({ 'data.technology.quantity': qty });
        }
    }

    async _onEquipItem(event) {
        event.preventDefault();
        const iid = event.currentTarget.closest('.item').dataset.itemId;
        const item = this.actor.getOwnedItem(iid);
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

    async _onRollTrack(event) {
        event.preventDefault();
        let track = event.currentTarget.closest('.attribute').dataset.track;
        await this.actor.rollNaturalRecovery(track, event);
    }

    async _onRollPrompt(event) {
        event.preventDefault();
        await this.actor.promptRoll({ event: event });
    }

    async _onRollItem(event) {
        event.preventDefault();
        const iid = event.currentTarget.closest('.item').dataset.itemId;
        const item = this.actor.getOwnedItem(iid);
        if (item) {
            await item.postCard(event);
        }
    }

    async _onRollFade(event) {
        event.preventDefault();
        this.actor.rollFade({ event: event });
    }

    async _onRollDrain(event) {
        event.preventDefault();
        this.actor.rollDrain({ event: event });
    }

    async _onRollArmor(event) {
        event.preventDefault();
        return this.actor.rollArmor({ event: event });
    }

    async _onRollDefense(event) {
        event.preventDefault();
        return this.actor.rollDefense({ event: event });
    }

    async _onRollMatrixAttribute(event) {
        event.preventDefault();
        const attr = event.currentTarget.dataset.attribute;
        return this.actor.rollMatrixAttribute(attr, { event: event });
    }

    async _onRollSoak(event: MouseEvent) {
        event.preventDefault();
        return this.actor.rollSoak({ event: event });
    }

    async _onRollAttributesOnly(event) {
        event.preventDefault();
        const roll = event.currentTarget.dataset.roll;
        return this.actor.rollAttributesTest(roll, { event: event });
    }

    async _onRollKnowledgeSkill(event) {
        event.preventDefault();
        const skill = event.currentTarget.dataset.skill;
        const category = event.currentTarget.dataset.category;
        return this.actor.rollKnowledgeSkill(category, skill, { event: event });
    }

    async _onRollLanguageSkill(event) {
        event.preventDefault();
        const skill = event.currentTarget.dataset.skill;
        return this.actor.rollLanguageSkill(skill, { event: event });
    }

    async _onRollActiveSkill(event) {
        event.preventDefault();
        const skill = event.currentTarget.dataset.skill;
        return this.actor.rollActiveSkill(skill, { event: event });
    }

    async _onRollAttribute(event) {
        event.preventDefault();
        const attr = event.currentTarget.dataset.attribute;
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

    _onShowEditKnowledgeSkill(event) {
        event.preventDefault();
        const skill = event.currentTarget.dataset.skill;
        const category = event.currentTarget.dataset.category;
        new KnowledgeSkillEditForm(this.actor, skill, category, {
            event: event,
        }).render(true);
    }

    _onShowEditLanguageSkill(event) {
        event.preventDefault();
        const skill = event.currentTarget.dataset.skill;
        new LanguageSkillEditForm(this.actor, skill, { event: event }).render(true);
    }

    _onShowEditSkill(event) {
        event.preventDefault();
        const skill = event.currentTarget.dataset.skill;
        new SkillEditForm(this.actor, skill, { event: event }).render(true);
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
