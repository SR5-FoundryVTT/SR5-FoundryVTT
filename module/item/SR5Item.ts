import { Helpers } from '../helpers';
import { SR5Actor } from '../actor/SR5Actor';
import { ShadowrunRollDialog } from '../apps/dialogs/ShadowrunRollDialog';
import Template from '../template';
import ModList = Shadowrun.ModList;
import AttackData = Shadowrun.AttackData;
import AttributeField = Shadowrun.AttributeField;
import SkillField = Shadowrun.SkillField;
import LimitField = Shadowrun.LimitField;
import FireModeData = Shadowrun.FireModeData;
import SpellForceData = Shadowrun.SpellForceData;
import ComplexFormLevelData = Shadowrun.ComplexFormLevelData;
import FireRangeData = Shadowrun.FireRangeData;
import BlastData = Shadowrun.BlastData;
import { ChatData } from './ChatData';

export class SR5Item extends Item {
    labels: {} = {};
    items: SR5Item[];
    actor: SR5Actor;

    // Flag Functions
    getLastFireMode(): FireModeData | undefined {
        return this.getFlag('shadowrun5e', 'lastFireMode');
    }
    async setLastFireMode(fireMode: FireModeData) {
        return this.setFlag('shadowrun5e', 'lastFireMode', fireMode);
    }
    getLastSpellForce(): SpellForceData {
        return this.getFlag('shadowrun5e', 'lastSpellForce');
    }
    async setLastSpellForce(force: SpellForceData) {
        return this.setFlag('shadowrun5e', 'lastSpellForce', force);
    }
    getLastComplexFormLevel(): ComplexFormLevelData {
        return this.getFlag('shadowrun5e', 'lastComplexFormLevel');
    }
    async setLastComplexFormLevel(level: ComplexFormLevelData) {
        return this.setFlag('shadowrun5e', 'lastComplexFormLevel', level);
    }
    getLastFireRange(): FireRangeData {
        return this.getFlag('shadowrun5e', 'lastFireRange') || 0;
    }
    setLastFireRange(environmentalMod: FireRangeData) {
        return this.setFlag('shadowrun5e', 'lastFireRange', environmentalMod);
    }

    getLastAttack(): AttackData | undefined {
        return this.getFlag('shadowrun5e', 'lastAttack');
    }
    async setLastAttack(attack: AttackData) {
        // unset the flag first to clear old data, data can get weird if not done
        await this.unsetFlag('shadowrun5e', 'lastAttack');
        return this.setFlag('shadowrun5e', 'lastAttack', attack);
    }

    async update(data, options?) {
        const ret = super.update(data, options);
        ret.then(() => {
            if (this.actor) {
                this.actor.render();
            }
        });
        return ret;
    }
    get hasOpposedRoll(): boolean {
        return !!(this.data.data.action && this.data.data.action.opposed.type);
    }

    get hasRoll(): boolean {
        return !!(this.data.data.action && this.data.data.action.type !== '');
    }
    get hasTemplate(): boolean {
        return this.isAreaOfEffect();
    }

    prepareData() {
        super.prepareData();
        const labels = {};
        const item = this.data;

        if (item.type === 'sin') {
            if (typeof item.data.licenses === 'object') {
                item.data.licenses = Object.values(item.data.licenses);
            }
        }
        const equippedMods = this.getEquippedMods();
        const equippedAmmo = this.getEquippedAmmo();

        const { technology, range, action } = item.data;

        if (technology?.conceal) {
            technology.conceal.mod = {};
            equippedMods.forEach((mod) => {
                if (technology?.conceal && mod.data.data.technology.conceal.value) {
                    technology.conceal.mod[mod.name] = mod.data.data.technology.conceal.value;
                }
            });

            technology.conceal.value =
                technology.conceal.base + Helpers.totalMods(technology.conceal.mod);
        }

        if (action) {
            action.alt_mod = 0;
            action.limit.mod = {};
            action.damage.mod = {};
            action.damage.ap.mod = {};
            action.dice_pool_mod = {};
            // handle overrides from mods
            equippedMods.forEach((mod) => {
                if (mod.data.data.accuracy) action.limit.mod[mod.name] = mod.data.data.accuracy;
                if (mod.data.data.dice_pool)
                    action.dice_pool_mod[mod.name] = mod.data.data.dice_pool;
            });

            if (equippedAmmo) {
                // add mods to damage from ammo
                action.damage.mod[`SR5.Ammo ${equippedAmmo.name}`] = equippedAmmo.data.data.damage;
                // add mods to ap from ammo
                action.damage.ap.mod[`SR5.Ammo ${equippedAmmo.name}`] = equippedAmmo.data.data.ap;

                // override element
                if (equippedAmmo.data.data.element) {
                    action.damage.element.value = equippedAmmo.data.data.element;
                } else {
                    action.damage.element.value = action.damage.element.base;
                }

                // override damage type
                if (equippedAmmo.data.data.damageType) {
                    action.damage.type.value = equippedAmmo.data.data.damageType;
                } else {
                    action.damage.type.value = action.damage.type.base;
                }
            } else {
                // set value if we don't have item overrides
                action.damage.element.value = action.damage.element.base;
                action.damage.type.value = action.damage.type.base;
            }

            // once all damage mods have been accounted for, sum base and mod to value
            action.damage.value = action.damage.base + Helpers.totalMods(action.damage.mod);
            action.damage.ap.value =
                action.damage.ap.base + Helpers.totalMods(action.damage.ap.mod);

            action.limit.value = action.limit.base + Helpers.totalMods(action.limit.mod);

            if (this.actor) {
                if (action.damage.attribute) {
                    action.damage.value += this.actor.data.data.attributes[
                        action.damage.attribute
                    ].value;
                }
                if (action.limit.attribute) {
                    action.limit.value += this.actor.data.data.limits[action.limit.attribute].value;
                }
            }
        }

        if (range) {
            if (range.rc) {
                range.rc.mod = {};
                equippedMods.forEach((mod) => {
                    if (mod.data.data.rc) range.rc.mod[mod.name] = mod.data.data.rc;
                    // handle overrides from ammo
                });
                if (range.rc) range.rc.value = range.rc.base + Helpers.totalMods(range.rc.mod);
            }
        }

        if (item.data.condition_monitor) {
            item.data.condition_monitor.max = 8 + Math.ceil(item.data.technology.rating / 2);
        }

        if (item.type === 'adept_power') {
            item.data.type = item.data.action?.type ? 'active' : 'passive';
        }

        this.labels = labels;
        item['properties'] = this.getChatData().properties;
    }

    async postCard() {
        // we won't work if we don't have an actor
        if (!this.actor) return;
        const { token } = this.actor;
        const templateData = {
            actor: this.actor,
            tokenId: token ? `${token.scene._id}.${token.id}` : null,
            item: this.data,
            type: this.data.type,
            data: this.getChatData(),
            hasRoll: this.hasRoll,
            hasOpposedRoll: this.hasOpposedRoll,
            hasTemplate: this.hasTemplate,
            labels: this.labels,
        };

        const templateType = 'item';
        const template = `systems/shadowrun5e/templates/rolls/${templateType}-card.html`;
        const html = await renderTemplate(template, templateData);

        const chatData = {
            user: game.user._id,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            content: html,
            speaker: {
                actor: this.actor._id,
                token: this.actor.token,
                alias: this.actor.name,
            },
        };

        const rollMode = game.settings.get('core', 'rollMode');
        if (['gmroll', 'blindroll'].includes(rollMode))
            chatData['whisper'] = ChatMessage.getWhisperIDs('GM');
        if (rollMode === 'blindroll') chatData['blind'] = true;

        return ChatMessage.create(chatData, { displaySheet: false });
    }

    getChatData(htmlOptions?) {
        const data = duplicate(this.data.data);
        const { labels } = this;
        if (!data.description) data.description = {};

        data.description.value = TextEditor.enrichHTML(data.description.value, htmlOptions);

        const props = [];
        const func = ChatData[this.data.type];
        if (func) func(duplicate(data), labels, props, this);

        data.properties = props.filter((p) => !!p);

        return data;
    }

    getOpposedTestName(): string {
        let name = '';
        if (this.data.data.action?.opposed?.type) {
            const { opposed } = this.data.data.action;
            if (opposed.type !== 'custom') {
                name = `${Helpers.label(opposed.type)}`;
            } else if (opposed.skill) {
                name = `${Helpers.label(opposed.skill)}+${Helpers.label(opposed.attribute)}`;
            } else if (opposed.attribute2) {
                name = `${Helpers.label(opposed.attribute)}+${Helpers.label(opposed.attribute2)}`;
            } else if (opposed.attribute) {
                name = `${Helpers.label(opposed.attribute)}`;
            }
        }
        const mod = this.getOpposedTestModifier();
        if (mod) name += ` ${mod}`;
        return name;
    }

    getEquippedAmmo() {
        return (this.items || []).filter(
            (item) => item.type === 'ammo' && item.data.data?.technology?.equipped
        )[0];
    }

    getEquippedMods() {
        return (this.items || []).filter(
            (item) =>
                item.type === 'modification' &&
                item.data.data.type === 'weapon' &&
                item.data.data?.technology?.equipped
        );
    }

    async equipWeaponMod(iid) {
        const mod = this.getOwnedItem(iid);
        if (mod) {
            const dupData = duplicate(mod.data);
            dupData.data.technology.equipped = !dupData.data.technology.equipped;
            await this.updateOwnedItem(dupData);
        }
    }

    get hasAmmo() {
        return this.data.data.ammo !== undefined;
    }

    async useAmmo(fireMode) {
        const dupData = duplicate(this.data);
        const { ammo } = dupData.data;
        if (ammo) {
            ammo.current.value = Math.max(0, ammo.current.value - fireMode);
            return this.update(dupData);
        }
    }

    async reloadAmmo() {
        const data = duplicate(this.data);
        const { ammo } = data.data;
        const diff = ammo.current.max - ammo.current.value;
        ammo.current.value = ammo.current.max;

        if (ammo.spare_clips) {
            ammo.spare_clips.value = Math.max(0, ammo.spare_clips.value - 1);
        }
        await this.update(data);

        const newAmmunition = (this.items || [])
            .filter((i) => i.data.type === 'ammo')
            .reduce((acc: BaseEntityData[], item) => {
                const { technology } = item.data.data;
                if (technology.equipped) {
                    const qty = technology.quantity;
                    technology.quantity = Math.max(0, qty - diff);
                    acc.push(item.data);
                }
                return acc;
            }, []);
        if (newAmmunition.length) await this.updateOwnedItem(newAmmunition);
    }

    async equipAmmo(iid) {
        // only allow ammo that was just clicked to be equipped
        const ammo = this.items
            ?.filter((item) => item.type === 'ammo')
            .map((item) => {
                const i = this.getOwnedItem(item._id);
                if (i) {
                    i.data.data.technology.equipped = iid === item._id;
                    return i.data;
                }
            });
        await this.updateOwnedItem(ammo);
    }

    addNewLicense() {
        const data = duplicate(this.data);
        const { licenses } = data.data;
        if (typeof licenses === 'object') {
            data.data.licenses = Object.values(licenses);
        }
        data.data.licenses.push({
            name: '',
            rtg: '',
            description: '',
        });
        this.update(data);
    }

    getRollPartsList(): ModList<number> {
        // we only have a roll if we have an action or an actor
        if (!this.data.data.action || !this.actor) return {};

        const parts = duplicate(this.getModifierList());

        const skill = this.actor.findActiveSkill(this.getActionSkill());
        const attribute = this.actor.findAttribute(this.getActionAttribute());
        const attribute2 = this.actor.findAttribute(this.getActionAttribute2());

        if (attribute && attribute.label) parts[attribute.label] = attribute.value;

        // if we have a valid skill, don't look for a second attribute
        if (skill && skill.label) parts[skill.label] = skill.value;
        else if (attribute2 && attribute2.label) parts[attribute2.label] = attribute2.value;

        const spec = this.getActionSpecialization();
        if (spec) parts[spec] = 2;

        // TODO remove these (by making them not used, not just delete)
        const mod = parseInt(this.data.data.action.mod || 0);
        if (mod) parts['SR5.ItemMod'] = mod;

        const atts: (AttributeField | SkillField)[] | boolean = [];
        if (attribute !== undefined) atts.push(attribute);
        if (attribute2 !== undefined) atts.push(attribute2);
        if (skill !== undefined) atts.push(skill);
        // add global parts from actor
        this.actor._addGlobalParts(parts);
        this.actor._addMatrixParts(parts, atts);
        this._addWeaponParts(parts);

        return parts;
    }

    calculateRecoil() {
        return Math.min(this.getRecoilCompensation(true) - (this.getLastFireMode()?.value || 0), 0);
    }

    _addWeaponParts(parts: ModList<number>) {
        if (this.isRangedWeapon()) {
            const recoil = this.calculateRecoil();
            if (recoil) parts['SR5.Recoil'] = recoil;
        }
    }

    removeLicense(index) {
        const data = duplicate(this.data);
        const { licenses } = data.data;
        licenses.splice(index, 1);
        this.update(data);
    }

    async rollOpposedTest(target: SR5Actor, ev) {
        const itemData = this.data.data;
        const options = {
            event: ev,
            fireModeDefense: 0,
            cover: false,
        };

        const lastAttack = this.getLastAttack();
        const parts = this.getOpposedTestMod();
        const { opposed } = itemData.action;

        if (opposed.type === 'defense') {
            if (lastAttack) {
                options['incomingAttack'] = lastAttack;
                options.cover = true;
                if (lastAttack.fireMode?.defense) {
                    options.fireModeDefense = +lastAttack.fireMode.defense;
                }
            }
            return target.rollDefense(options, parts);
        }
        else if (opposed.type === 'soak') {
            options['damage'] = lastAttack?.damage;
            options['attackerHits'] = lastAttack?.hits;
            return target.rollSoak(options, parts);
        }
        else if (opposed.type === 'armor') {
            return target.rollArmor(options);
        }
        else {
            if (opposed.skill && opposed.attribute) {
                return target.rollSkill(opposed.skill, {
                    ...options,
                    attribute: opposed.attribute,
                });
            } else if (opposed.attribute && opposed.attribute2) {
                return target.rollTwoAttributes([opposed.attribute, opposed.attribute2], options);
            } else if (opposed.attribute) {
                return target.rollSingleAttribute(opposed.attribute, options);
            }
        }
    }

    async rollExtraTest(type: string, event) {
        const targets = SR5Item.getTargets();
        if (type === 'opposed') {
            for (const t of targets) {
                await this.rollOpposedTest(t, event);
            }
        }
    }

    async rollTest(event) {
        const dialog = await ShadowrunRollDialog.fromItemRoll(this, event);
        if (dialog) return dialog.render(true);
    }

    static getItemFromMessage(html): SR5Item | undefined {
        const card = html.find('.chat-card');
        let actor;
        const tokenKey = card.data('tokenId');
        if (tokenKey) {
            const [sceneId, tokenId] = tokenKey.split('.');
            let token;
            if (sceneId === canvas.scene._id) token = canvas.tokens.get(tokenId);
            else {
                const scene: Scene = game.scenes.get(sceneId);
                if (!scene) return;
                // @ts-ignore
                const tokenData = scene.data.tokens.find((t) => t.id === Number(tokenId));
                if (tokenData) token = new Token(tokenData);
            }
            if (!token) return;
            actor = Actor.fromToken(token);
        } else actor = game.actors.get(card.data('actorId'));

        if (!actor) return;
        const itemId = card.data('itemId');
        return actor.getOwnedItem(itemId);
    }

    static chatListeners(html) {
        html.on('click', '.card-buttons button', (ev) => {
            ev.preventDefault();
            const button = $(ev.currentTarget);
            const messageId = button.parents('.message').data('messageId');
            const senderId = game.messages.get(messageId).user._id;
            const action = button.data('action');

            const opposedRoll = action === 'opposed-roll';
            if (!opposedRoll && !game.user.isGM && game.user._id !== senderId) return;

            const item = this.getItemFromMessage(html);
            if (!item) return;

            if (action === 'roll') item.rollTest(ev);
            if (opposedRoll) {
                const targets = this.getTargets();
                for (const t of targets) {
                    item.rollOpposedTest(t, ev);
                }
            }
            if (action === 'place-template') {
                const template = Template.fromItem(item);
                console.log(template);
                if (template) {
                    template.drawPreview();
                }
            }
        });
        html.on('click', '.card-header', (ev) => {
            ev.preventDefault();
            $(ev.currentTarget).siblings('.card-description').toggle();
        });
        $(html).find('.card-description').hide();
    }

    static getTargets() {
        const { character } = game.user;
        const { controlled } = canvas.tokens;
        const targets = controlled.reduce((arr, t) => (t.actor ? arr.concat([t.actor]) : arr), []);
        if (character && controlled.length === 0) targets.push(character);
        if (!targets.length)
            throw new Error(`You must designate a specific Token as the roll target`);
        return targets;
    }

    /**
     * Create an item in this item
     * @param itemData
     * @param options
     */
    async createOwnedItem(itemData, options = {}) {
        if (!Array.isArray(itemData)) itemData = [itemData];
        // weapons accept items
        if (this.type === 'weapon') {
            const currentItems = duplicate(this.getFlag('shadowrun5e', 'embeddedItems') || []);

            itemData.forEach((item) => {
                item._id = randomID(16);
                if (item.type === 'ammo' || item.type === 'modification') {
                    currentItems.push(item);
                }
            });

            await this.setFlag('shadowrun5e', 'embeddedItems', currentItems);
        }
        await this.prepareEmbeddedEntities();
        await this.prepareData();
        await this.render(false);
        return true;
    }

    /**
     * Prepare embeddedItems
     */
    prepareEmbeddedEntities() {
        super.prepareEmbeddedEntities();
        const items = this.getFlag('shadowrun5e', 'embeddedItems');
        if (items) {
            const existing = (this.items || []).reduce((object, i) => {
                object[i.id] = i;
                return object;
            }, {});
            this.items = items.map((i) => {
                if (i._id in existing) {
                    const a = existing[i._id];
                    a.data = i;
                    a.prepareData();
                    return a;
                } else {
                    // dirty things done here
                    // @ts-ignore
                    return Item.createOwned(i, this);
                }
            });
        }
    }

    getOwnedItem(itemId) {
        const items = this.items;
        if (!items) return;
        return items.find((i) => i._id === itemId);
    }

    async updateOwnedItem(changes) {
        const items = duplicate(this.getFlag('shadowrun5e', 'embeddedItems'));
        if (!items) return;
        changes = Array.isArray(changes) ? changes : [changes];
        if (!changes || changes.length === 0) return;
        changes.forEach((itemChanges) => {
            const index = items.findIndex((i) => i._id === itemChanges._id);
            if (index === -1) return;
            const item = items[index];
            if (item) {
                itemChanges = expandObject(itemChanges);
                mergeObject(item, itemChanges);
                items[index] = item;
                // this.items[index].data = items[index];
            }
        });

        await this.setFlag('shadowrun5e', 'embeddedItems', items);
        await this.prepareEmbeddedEntities();
        await this.prepareData();
        await this.render(false);
        return true;
    }

    async updateEmbeddedEntity(
        embeddedName: string,
        updateData: object | object[],
        options?: object
    ) {
        await this.updateOwnedItem(updateData);
        return this;
    }

    /**
     * Remove an owned item
     * @param deleted
     * @returns {Promise<boolean>}
     */
    async deleteOwnedItem(deleted) {
        const items = duplicate(this.getFlag('shadowrun5e', 'embeddedItems'));
        if (!items) return;

        const idx = items.findIndex((i) => i._id === deleted || Number(i._id) === deleted);
        if (idx === -1) throw new Error(`Shadowrun5e | Couldn't find owned item ${deleted}`);
        items.splice(idx, 1);
        await this.setFlag('shadowrun5e', 'embeddedItems', items);
        await this.prepareEmbeddedEntities();
        await this.prepareData();
        await this.render(false);
        return true;
    }

    isAreaOfEffect(): boolean {
        return (
            this.isGrenade() ||
            (this.isSpell() && this.data.data.range === 'los_a') ||
            this.hasExplosiveAmmo()
        );
    }

    isGrenade(): boolean {
        return this.data.type === 'weapon' && this.data.data.thrown?.blast?.radius;
    }

    isCombatSpell(): boolean {
        return this.isSpell() && this.data.data.category === 'combat';
    }

    isRangedWeapon(): boolean {
        return this.data.type === 'weapon' && this.data.data.category === 'range';
    }

    isSpell(): boolean {
        return this.data.type === 'spell';
    }

    isComplexForm(): boolean {
        return this.data.type === 'complex_form';
    }

    isMeleeWeapon(): boolean {
        return this.data.type === 'weapon' && this.data.data.category === 'melee';
    }

    getAttackData(hits: number): AttackData | undefined {
        if (!this.data.data.action?.damage) return undefined;
        const damage = this.data.data.action.damage;
        const data: AttackData = {
            hits,
            damage: damage,
        };

        if (this.isCombatSpell()) {
            const force = this.getLastSpellForce().value;
            data.force = force;
            data.damage.base = force;
            data.damage.value = force + Helpers.totalMods(data.damage.mod);
            data.damage.ap.value = -force + Helpers.totalMods(data.damage.mod);
            data.damage.ap.base = -force;
        }

        if (this.isComplexForm()) {
            data.level = this.getLastComplexFormLevel().value;
        }

        if (this.isMeleeWeapon()) {
            data.reach = this.getReach();
            data.accuracy = this.getActionLimit();
        }

        if (this.isRangedWeapon()) {
            data.fireMode = this.getLastFireMode();
            data.accuracy = this.getActionLimit();
        }

        const blastData = this.getBlastData();
        if (blastData) data.blast = blastData;

        console.log('atkData');
        console.log('');
        console.log(data);
        console.log('');

        return data;
    }

    getActionSkill(): string | undefined {
        return this.data.data.action?.skill;
    }

    getActionAttribute(): string | undefined {
        return this.data.data.action?.attribute;
    }

    getActionAttribute2(): string | undefined {
        return this.data.data.action?.attribute2;
    }

    getRollName(): string {
        if (this.isRangedWeapon()) {
            return 'SR5.RangedWeaponAttack';
        }
        if (this.isMeleeWeapon()) {
            return 'SR5.MeleeWeaponAttack';
        }
        if (this.isCombatSpell()) {
            return 'SR5.SpellAttack';
        }
        if (this.isSpell()) {
            return 'SR5.SpellCast';
        }
        return this.name;
    }

    getLimit(): LimitField {
        const limit = this.data.data.action?.limit;
        if (this.data.type === 'weapon') {
            limit.label = 'SR5.Accuracy';
        } else if (limit?.attribute) {
            limit.label = CONFIG.SR5.attributes[limit.attribute];
        } else if (this.isSpell()) {
            limit.value = this.getLastSpellForce().value;
            limit.label = 'SR5.Force';
        } else if (this.isComplexForm()) {
            limit.value = this.getLastComplexFormLevel().value;
            limit.label = 'SR5.Level';
        } else {
            limit.label = 'SR5.Limit';
        }
        return limit;
    }

    getActionLimit(): number | undefined {
        return this.data.data.action?.limit?.value;
    }

    getModifierList(): ModList<number> {
        return this.data.data.action?.dice_pool_mod || [];
    }

    getActionSpecialization(): string | undefined {
        if (this.data.data.action?.spec) return 'SR5.Specialization';
        return undefined;
    }

    getDrain(): number {
        return this.data.data.drain || 0;
    }

    getFade(): number {
        return this.data.data.fade || 0;
    }

    getRecoilCompensation(includeActor: boolean = true): number {
        let base = parseInt(this.data.data.range.rc.value);
        if (includeActor) base += parseInt(this.actor.data.data.recoil_compensation);
        return base;
    }

    getReach(): number {
        if (this.isMeleeWeapon()) {
            return this.data.data.melee?.reach;
        }
        return 0;
    }

    hasExplosiveAmmo(): boolean {
        const ammo = this.getEquippedAmmo();
        return ammo?.data?.data?.blast?.radius > 0;
    }

    hasDefenseTest(): boolean {
        return this.data.data.action?.opposed?.type === 'defense';
    }

    getOpposedTestMod(): ModList<number> {
        const parts = {};
        if (this.hasDefenseTest()) {
            if (this.isAreaOfEffect()) {
                parts['SR5.Aoe'] = -2;
            }
            if (this.isRangedWeapon()) {
                const fireModeData = this.getLastFireMode();
                if (fireModeData?.defense) {
                    if (fireModeData.defense !== 'SR5.DuckOrCover') {
                        const fireMode = +fireModeData.defense;
                        if (fireMode) parts['SR5.FireMode'] = fireMode;
                    }
                }
            }
        }
        return parts;
    }

    getOpposedTestModifier(): string {
        const testMod = this.getOpposedTestMod();
        const total = Helpers.totalMods(testMod);
        if (total) return `(${total})`;
        else {
            if (this.isRangedWeapon()) {
                const fireModeData = this.getLastFireMode();
                if (fireModeData?.defense) {
                    if (fireModeData.defense === 'SR5.DuckOrCover') {
                        return game.i18n.localize('SR5.DuckOrCover');
                    }
                }
            }
        }
        return '';
    }

    getBlastData(): BlastData | undefined {
        // can only handle spells and grenade right now
        if (this.isSpell()) {
            // distance on spells is equal to force
            let distance = this.getLastSpellForce().value;
            // extended spells multiply by 10
            if (this.data.data.extended) distance *= 10;
            return {
                radius: distance,
                dropoff: 0,
            };
        } else if (this.isGrenade()) {
            // use blast radius
            const distance = this.data.data.thrown.blast.radius;
            const dropoff = this.data.data.thrown.blast.dropoff;
            return {
                radius: distance,
                dropoff: dropoff,
            };
        } else if (this.hasExplosiveAmmo()) {
            const ammo = this.getEquippedAmmo();
            const distance = ammo.data.data.blast.radius;
            const dropoff = ammo.data.data.blast.dropoff;
            return {
                radius: distance,
                dropoff,
            };
        }
    }
}
