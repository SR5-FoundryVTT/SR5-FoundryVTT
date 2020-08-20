import { Helpers } from '../helpers';
import { SR5Actor } from '../actor/SR5Actor';
import { ShadowrunItemDialog } from '../apps/dialogs/ShadowrunItemDialog';
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
import { AdvancedRollProps, ShadowrunRoll, ShadowrunRoller } from '../rolls/ShadowrunRoller';
import Template from '../template';
import { createChatData } from '../chat';
import { SYSTEM_NAME } from '../constants';
import ConditionData = Shadowrun.ConditionData;
import { SR5ItemDataWrapper } from './SR5ItemDataWrapper';
import SR5ItemType = Shadowrun.SR5ItemType;
import { PartsList } from '../parts/PartsList';

export class SR5Item extends Item {
    labels: {} = {};
    items: SR5Item[];
    actor: SR5Actor;

    private get wrapper(): SR5ItemDataWrapper {
        // we need to cast here to unknown first to make ts happy
        return new SR5ItemDataWrapper((this.data as unknown) as SR5ItemType);
    }

    // Flag Functions
    getLastFireMode(): FireModeData {
        return this.getFlag(SYSTEM_NAME, 'lastFireMode') || { value: 0 };
    }
    async setLastFireMode(fireMode: FireModeData) {
        return this.setFlag(SYSTEM_NAME, 'lastFireMode', fireMode);
    }
    getLastSpellForce(): SpellForceData {
        return this.getFlag(SYSTEM_NAME, 'lastSpellForce') || { value: 0 };
    }
    async setLastSpellForce(force: SpellForceData) {
        return this.setFlag(SYSTEM_NAME, 'lastSpellForce', force);
    }
    getLastComplexFormLevel(): ComplexFormLevelData {
        return this.getFlag(SYSTEM_NAME, 'lastComplexFormLevel') || { value: 0 };
    }
    async setLastComplexFormLevel(level: ComplexFormLevelData) {
        return this.setFlag(SYSTEM_NAME, 'lastComplexFormLevel', level);
    }
    getLastFireRangeMod(): FireRangeData {
        return this.getFlag(SYSTEM_NAME, 'lastFireRange') || { value: 0 };
    }
    async setLastFireRangeMod(environmentalMod: FireRangeData) {
        return this.setFlag(SYSTEM_NAME, 'lastFireRange', environmentalMod);
    }

    /**
     * Return an Array of the Embedded Item Data
     * TODO properly types this
     */
    getEmbeddedItems(): any[] {
        let items = this.getFlag(SYSTEM_NAME, 'embeddedItems');
        if (items) {
            // moved this "hotfix" to here so that everywhere that accesses the flag just gets an array -- Shawn
            //TODO: This is a hotfix. Items should either always be
            // stored as an array or always be stored as a object.
            if (!Array.isArray(items)) {
                let newItems: any[] = [];
                for (const key of Object.keys(items)) {
                    newItems.push(items[key]);
                }
                return newItems;
            }
            return items;
        }
        return [];
    }

    /**
     * Set the embedded item data
     * @param items
     */
    async setEmbeddedItems(items: any[]) {
        // clear the flag first to remove the previous items - if we don't do this then it doesn't actually "delete" any items
        await this.unsetFlag(SYSTEM_NAME, 'embeddedItems');
        await this.setFlag(SYSTEM_NAME, 'embeddedItems', items);
    }

    getLastAttack(): AttackData | undefined {
        return this.getFlag(SYSTEM_NAME, 'lastAttack');
    }
    async setLastAttack(attack: AttackData) {
        // unset the flag first to clear old data, data can get weird if not done
        await this.unsetFlag(SYSTEM_NAME, 'lastAttack');
        return this.setFlag(SYSTEM_NAME, 'lastAttack', attack);
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
        const { action } = this.data.data;
        return !!(action && action.type !== '' && (action.skill || action.attribute));
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

        if (technology) {
            if (!technology.condition_monitor) technology.condition_monitor = { value: 0 };
            technology.condition_monitor.max = 8 + Math.ceil(technology.rating / 2);

            if (!technology.conceal) technology.conceal = {};

            const concealParts = new PartsList<number>();
            equippedMods.forEach((mod) => {
                if (mod.data.data.technology.conceal.value) {
                    concealParts.addUniquePart(mod.name, mod.data.data.technology.conceal.value);
                }
            });
            technology.conceal.mod = concealParts.list;

            technology.conceal.value = Helpers.calcTotal(technology.conceal);
        }

        if (action) {
            action.alt_mod = 0;
            action.limit.mod = [];
            action.damage.mod = [];
            action.damage.ap.mod = [];
            action.dice_pool_mod = [];
            // handle overrides from mods
            const limitParts = new PartsList(action.limit.mod);
            const dpParts = new PartsList(action.dice_pool_mod);
            equippedMods.forEach((mod) => {
                if (mod.data.data.accuracy) {
                    limitParts.addUniquePart(mod.name, mod.data.data.accuracy);
                }
                if (mod.data.data.dice_pool) {
                    dpParts.addUniquePart(mod.name, mod.data.data.dice_pool);
                }
            });

            if (equippedAmmo) {
                // add mods to damage from ammo
                PartsList.AddUniquePart(action.damage.mod, equippedAmmo.name, equippedAmmo.data.data.damage);
                // add mods to ap from ammo
                PartsList.AddUniquePart(action.damage.ap.mod, equippedAmmo.name, equippedAmmo.data.data.ap);

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
            action.damage.value = Helpers.calcTotal(action.damage);
            action.damage.ap.value = Helpers.calcTotal(action.damage.ap);

            action.limit.value = Helpers.calcTotal(action.limit);

            if (this.actor) {
                if (action.damage.attribute) {
                    const { attribute } = action.damage;
                    // TODO convert this in the template
                    PartsList.AddUniquePart(
                        action.damage.mod,
                        game.i18n.localize(CONFIG.SR5.attributes[attribute]),
                        this.actor.findAttribute(attribute)?.value,
                    );
                    action.damage.value = Helpers.calcTotal(action.damage);
                }
                if (action.limit.attribute) {
                    const { attribute } = action.limit;
                    // TODO convert this in the template
                    PartsList.AddUniquePart(action.limit.mod, game.i18n.localize(CONFIG.SR5.limits[attribute]), this.actor.findLimit(attribute)?.value);
                    action.limit.value = Helpers.calcTotal(action.limit);
                }
            }
        }

        if (range) {
            if (range.rc) {
                const rangeParts = new PartsList();
                equippedMods.forEach((mod) => {
                    if (mod.data.data.rc) rangeParts.addUniquePart(mod.name, mod.data.data.rc);
                    // handle overrides from ammo
                });
                range.rc.mod = rangeParts.list;
                if (range.rc) range.rc.value = Helpers.calcTotal(range.rc);
            }
        }

        if (item.type === 'adept_power') {
            item.data.type = item.data.action?.type ? 'active' : 'passive';
        }

        this.labels = labels;
        item['properties'] = this.getChatData().properties;
    }

    async postCard(event?) {
        // we won't work if we don't have an actor
        if (!this.actor) return;

        const postOnly = event?.shiftKey || !this.hasRoll;

        const post = (bonus = {}) => {
            // if only post, don't roll and post a card version -- otherwise roll
            const onComplete = postOnly
                ? () => {
                      const { token } = this.actor;
                      const attack = this.getAttackData(0);
                      // don't include any hits
                      delete attack?.hits;
                      // generate chat data
                      createChatData({
                          header: {
                              name: this.name,
                              img: this.img,
                          },
                          testName: this.getRollName(),
                          actor: this.actor,
                          tokenId: token ? `${token.scene._id}.${token.id}` : undefined,
                          description: this.getChatData(),
                          item: this,
                          previewTemplate: this.hasTemplate,
                          attack,
                          ...bonus,
                      }).then((chatData) => {
                          // create the message
                          return ChatMessage.create(chatData, { displaySheet: false });
                      });
                  }
                : () => this.rollTest(event);

            if (!postOnly && this.hasTemplate) {
                // onComplete is called when template is finished
                const template = Template.fromItem(this, onComplete);
                if (template) {
                    template.drawPreview();
                }
            } else {
                onComplete();
            }
        };
        // prompt user if needed
        const dialogData = await ShadowrunItemDialog.fromItem(this, event);
        if (dialogData) {
            // keep track of old close function
            const oldClose = dialogData.close;
            // call post() after dialog closes
            dialogData.close = async (html) => {
                if (oldClose) {
                    // the oldClose we put on the dialog will return a boolean
                    const ret = ((await oldClose(html)) as unknown) as boolean;
                    if (!ret) return;
                }
                post();
            };
            return new Dialog(dialogData).render(true);
        } else {
            post();
        }
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

    getOpposedTestMod(): PartsList<number> {
        const parts = new PartsList<number>();
        if (this.hasDefenseTest()) {
            if (this.isAreaOfEffect()) {
                parts.addUniquePart('SR5.Aoe', -2);
            }
            if (this.isRangedWeapon()) {
                const fireModeData = this.getLastFireMode();
                if (fireModeData?.defense) {
                    if (fireModeData.defense !== 'SR5.DuckOrCover') {
                        const fireMode = +fireModeData.defense;
                        parts.addUniquePart('SR5.FireMode', fireMode);
                    }
                }
            }
        }
        return parts;
    }

    getOpposedTestModifier(): string {
        const testMod = this.getOpposedTestMod();
        const total = testMod.total;
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
        if (this.isSpell() && this.isAreaOfEffect()) {
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

    getEquippedAmmo() {
        return (this.items || []).filter((item) => item.type === 'ammo' && item.data.data?.technology?.equipped)[0];
    }

    getEquippedMods() {
        return (this.items || []).filter((item) => item.type === 'modification' && item.data.data.type === 'weapon' && item.data.data?.technology?.equipped);
    }

    hasExplosiveAmmo(): boolean {
        const ammo = this.getEquippedAmmo();
        return ammo?.data?.data?.blast?.radius > 0;
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
        if (!this.data.data.action || !this.actor) return [];

        const parts = new PartsList(duplicate(this.getModifierList()));

        const skill = this.actor.findActiveSkill(this.getActionSkill());
        const attribute = this.actor.findAttribute(this.getActionAttribute());
        const attribute2 = this.actor.findAttribute(this.getActionAttribute2());

        if (attribute && attribute.label) parts.addPart(attribute.label, attribute.value);

        // if we have a valid skill, don't look for a second attribute
        if (skill && skill.label) parts.addUniquePart(skill.label, skill.value);
        else if (attribute2 && attribute2.label) parts.addUniquePart(attribute2.label, attribute2.value);

        const spec = this.getActionSpecialization();
        if (spec) parts.addUniquePart(spec, 2);

        // TODO remove these (by making them not used, not just delete)
        const mod = parseInt(this.data.data.action.mod || 0);
        if (mod) parts.addUniquePart('SR5.ItemMod', mod);

        const atts: (AttributeField | SkillField)[] | boolean = [];
        if (attribute !== undefined) atts.push(attribute);
        if (attribute2 !== undefined) atts.push(attribute2);
        if (skill !== undefined) atts.push(skill);
        // add global parts from actor
        this.actor._addGlobalParts(parts);
        this.actor._addMatrixParts(parts, atts);
        this._addWeaponParts(parts);

        return parts.list;
    }

    calculateRecoil() {
        const lastFireMode = this.getLastFireMode();
        if (!lastFireMode) return 0;
        if (lastFireMode.value === 20) return 0;
        return Math.min(this.getRecoilCompensation(true) - (this.getLastFireMode()?.value || 0), 0);
    }

    _addWeaponParts(parts: PartsList<number>) {
        if (this.isRangedWeapon()) {
            const recoil = this.calculateRecoil();
            if (recoil) parts.addUniquePart('SR5.Recoil', recoil);
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
            return target.rollDefense(options, parts.list);
        } else if (opposed.type === 'soak') {
            options['damage'] = lastAttack?.damage;
            options['attackerHits'] = lastAttack?.hits;
            return target.rollSoak(options, parts.list);
        } else if (opposed.type === 'armor') {
            return target.rollArmor(options);
        } else {
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

    /**
     * Rolls a test using the latest stored data on the item (force, fireMode, level)
     * @param event - mouse event
     * @param options - any additional roll options to pass along - note that currently the Item will overwrite -- WIP
     */
    async rollTest(event, options?: Partial<AdvancedRollProps>): Promise<ShadowrunRoll | undefined> {
        const promise = ShadowrunRoller.itemRoll(event, this, options);

        // handle promise when it resolves for our own stuff
        promise.then(async (roll) => {
            // complex form handles fade
            if (this.isComplexForm()) {
                const totalFade = Math.max(this.getFade() + this.getLastComplexFormLevel().value, 2);
                await this.actor.rollFade({ event }, totalFade);
            } // spells handle drain, force, and attack data
            else if (this.isSpell()) {
                if (this.isCombatSpell() && roll) {
                    const attackData = this.getAttackData(roll.total);
                    if (attackData) {
                        await this.setLastAttack(attackData);
                    }
                }
                const forceData = this.getLastSpellForce();
                const drain = Math.max(this.getDrain() + forceData.value + (forceData.reckless ? 3 : 0), 2);
                await this.actor?.rollDrain({ event }, drain);
            } // weapons handle ammo and attack data
            else if (this.data.type === 'weapon') {
                const attackData = this.getAttackData(roll?.total || 0);
                if (attackData) {
                    await this.setLastAttack(attackData);
                }
                if (this.hasAmmo) {
                    const fireMode = this.getLastFireMode()?.value || 1;
                    await this.useAmmo(fireMode);
                }
            }
        });

        return promise;
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

    static getTargets() {
        const { character } = game.user;
        const { controlled } = canvas.tokens;
        const targets = controlled.reduce((arr, t) => (t.actor ? arr.concat([t.actor]) : arr), []);
        if (character && controlled.length === 0) targets.push(character);
        if (!targets.length) throw new Error(`You must designate a specific Token as the roll target`);
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
            const currentItems = duplicate(this.getEmbeddedItems());

            itemData.forEach((ogItem) => {
                const item = duplicate(ogItem);
                item._id = randomID(16);
                if (item.type === 'ammo' || item.type === 'modification') {
                    if (item?.data?.technology?.equipped) {
                        item.data.technology.equipped = false;
                    }
                    currentItems.push(item);
                }
            });

            await this.setEmbeddedItems(currentItems);
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
        let items = this.getEmbeddedItems();
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
        const items = duplicate(this.getEmbeddedItems());
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

        await this.setEmbeddedItems(items);
        await this.prepareEmbeddedEntities();
        await this.prepareData();
        await this.render(false);
        return true;
    }

    async updateEmbeddedEntity(embeddedName: string, updateData: object | object[], options?: object) {
        await this.updateOwnedItem(updateData);
        return this;
    }

    /**
     * Remove an owned item
     * @param deleted
     * @returns {Promise<boolean>}
     */
    async deleteOwnedItem(deleted) {
        const items = duplicate(this.getEmbeddedItems());
        if (!items) return;

        const idx = items.findIndex((i) => i._id === deleted || Number(i._id) === deleted);
        if (idx === -1) throw new Error(`Shadowrun5e | Couldn't find owned item ${deleted}`);
        items.splice(idx, 1);
        await this.setEmbeddedItems(items);
        await this.prepareEmbeddedEntities();
        await this.prepareData();
        await this.render(false);
        return true;
    }

    async openPdfSource() {
        const source = this.getBookSource();
        if (source === '') {
            // @ts-ignore
            ui.notifications.error(game.i18n.localize('SR5.SourceFieldEmptyError'));
        }
        // TODO open PDF to correct location
        // parse however you need, all "buttons" will lead to this function
        const [code, page] = source.split(' ');
        //@ts-ignore
        ui.PDFoundry.openPDFByCode(code, parseInt(page));
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
            const damageParts = new PartsList(data.damage.mod);
            data.force = force;
            data.damage.base = force;
            data.damage.value = force + damageParts.total;
            data.damage.ap.value = -force + damageParts.total;
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

        return data;
    }

    getRollName(): string | undefined {
        if (this.isRangedWeapon()) {
            return game.i18n.localize('SR5.RangeWeaponAttack');
        }
        if (this.isMeleeWeapon()) {
            return game.i18n.localize('SR5.MeleeWeaponAttack');
        }
        if (this.isCombatSpell()) {
            return game.i18n.localize('SR5.SpellAttack');
        }
        if (this.isSpell()) {
            return game.i18n.localize('SR5.SpellCast');
        }
        if (this.hasRoll) return this.name;
        return undefined;
    }

    getLimit(): LimitField | undefined {
        const limit = this.data.data.action?.limit;
        if (!limit) return undefined;
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

    /**
     * Override setFlag to remove the 'SR5.' from keys in modlists, otherwise it handles them as embedded keys
     * @param scope
     * @param key
     * @param value
     */
    setFlag(scope: string, key: string, value: any): Promise<Entity> {
        const newValue = Helpers.onSetFlag(value);
        return super.setFlag(scope, key, newValue);
    }

    /**
     * Override getFlag to add back the 'SR5.' keys correctly to be handled
     * @param scope
     * @param key
     */
    getFlag(scope: string, key: string): any {
        const data = super.getFlag(scope, key);
        return Helpers.onGetFlag(data);
    }

    /**
     * Passthrough functions
     */
    isAreaOfEffect(): boolean {
        return this.wrapper.isAreaOfEffect();
    }

    isArmor(): boolean {
        return this.wrapper.isArmor();
    }

    isArmorBase(): boolean {
        return this.wrapper.isArmorBase();
    }

    isArmorAccessory(): boolean {
        return this.wrapper.isArmorAccessory();
    }

    isGrenade(): boolean {
        return this.wrapper.isGrenade();
    }

    isWeapon(): boolean {
        return this.wrapper.isWeapon();
    }

    isCyberware(): boolean {
        return this.wrapper.isCyberware();
    }

    isCombatSpell(): boolean {
        return this.wrapper.isCombatSpell();
    }

    isRangedWeapon(): boolean {
        return this.wrapper.isRangedWeapon();
    }

    isSpell(): boolean {
        return this.wrapper.isSpell();
    }

    isComplexForm(): boolean {
        return this.wrapper.isComplexForm();
    }

    isMeleeWeapon(): boolean {
        return this.wrapper.isMeleeWeapon();
    }

    isDevice(): boolean {
        return this.wrapper.isDevice();
    }

    isEquipped(): boolean {
        return this.wrapper.isEquipped();
    }

    isCyberdeck(): boolean {
        return this.wrapper.isCyberdeck();
    }

    getBookSource(): string {
        return this.wrapper.getBookSource();
    }

    getConditionMonitor(): ConditionData {
        return this.wrapper.getConditionMonitor();
    }

    getRating(): number {
        return this.wrapper.getRating();
    }

    getArmorValue(): number {
        return this.wrapper.getArmorValue();
    }

    getArmorElements(): { [key: string]: number } {
        return this.wrapper.getArmorElements();
    }

    getEssenceLoss(): number {
        return this.wrapper.getEssenceLoss();
    }

    getASDF() {
        return this.wrapper.getASDF();
    }

    getActionSkill(): string | undefined {
        return this.wrapper.getActionSkill();
    }

    getActionAttribute(): string | undefined {
        return this.wrapper.getActionAttribute();
    }

    getActionAttribute2(): string | undefined {
        return this.wrapper.getActionAttribute2();
    }

    getActionLimit(): number | undefined {
        return this.wrapper.getActionLimit();
    }

    getModifierList(): ModList<number> {
        return this.wrapper.getModifierList();
    }

    getActionSpecialization(): string | undefined {
        return this.wrapper.getActionSpecialization();
    }

    getDrain(): number {
        return this.wrapper.getDrain();
    }

    getFade(): number {
        return this.wrapper.getFade();
    }

    getRecoilCompensation(includeActor: boolean = true): number {
        let rc = this.wrapper.getRecoilCompensation();
        if (includeActor && this.actor) {
            rc += this.actor.getRecoilCompensation();
        }
        return rc;
    }

    getReach(): number {
        if (this.isMeleeWeapon()) {
            return this.data.data.melee?.reach ?? 0;
        }
        return 0;
    }

    hasDefenseTest(): boolean {
        return this.data.data.action?.opposed?.type === 'defense';
    }
}
