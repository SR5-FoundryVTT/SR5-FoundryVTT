import {Helpers} from '../helpers';
import {SR5Actor} from '../actor/SR5Actor';
import {ActionTestData, ShadowrunItemDialog} from '../apps/dialogs/ShadowrunItemDialog';
import {ChatData} from './ChatData';
import {AdvancedRollProps, ShadowrunRoll, ShadowrunRoller, Test} from '../rolls/ShadowrunRoller';
import {createItemChatMessage} from '../chat';
import {DEFAULT_ROLL_NAME, FLAGS, SYSTEM_NAME} from '../constants';
import {SR5ItemDataWrapper} from './SR5ItemDataWrapper';
import {PartsList} from '../parts/PartsList';
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
import ConditionData = Shadowrun.ConditionData;
import SR5ItemType = Shadowrun.SR5ItemType;
import ActionRollData = Shadowrun.ActionRollData;
import TrackType = Shadowrun.TrackType;
import DamageData = Shadowrun.DamageData;
import DefenseRollOptions = Shadowrun.DefenseRollOptions;
import SpellDefenseOptions = Shadowrun.SpellDefenseOptions;
import SpellData = Shadowrun.SpellData;
import WeaponData = Shadowrun.WeaponData;
import AmmoData = Shadowrun.AmmoData;
import TechnologyPartData = Shadowrun.TechnologyPartData;
import Sin = Shadowrun.Sin;
import Weapon = Shadowrun.Weapon;
import Ammo = Shadowrun.Ammo;
import TechnologyData = Shadowrun.TechnologyData;
import RangeData = Shadowrun.RangeData;
import RangeWeaponData = Shadowrun.RangeWeaponData;
import SpellRange = Shadowrun.SpellRange;
import CritterPowerRange = Shadowrun.CritterPowerRange;
import AdeptPowerData = Shadowrun.AdeptPowerData;
import AdeptPower = Shadowrun.AdeptPower;
import Modification = Shadowrun.Modification;
import Action = Shadowrun.Action;
import Armor = Shadowrun.Armor;
import ComplexForm = Shadowrun.ComplexForm;
import Contact = Shadowrun.Contact;
import CritterPower = Shadowrun.CritterPower;
import Cyberware = Shadowrun.Cyberware;
import Device = Shadowrun.Device;
import Equipment = Shadowrun.Equipment;
import Lifestyle = Shadowrun.Lifestyle;
import Program = Shadowrun.Program;
import Quality = Shadowrun.Quality;
import Spell = Shadowrun.Spell;
import SpritePower = Shadowrun.SpritePower;
import {ItemAction} from "./ItemAction";

export class SR5Item extends Item {
    labels: {} = {};
    items: SR5Item[];
    actor: SR5Actor;
    data: SR5ItemType;

    private get wrapper(): SR5ItemDataWrapper {
        // we need to cast here to unknown first to make ts happy
        return new SR5ItemDataWrapper((this.data as unknown) as SR5ItemType);
    }

    // Flag Functions
    getLastFireMode(): FireModeData {
        return this.getFlag(SYSTEM_NAME, FLAGS.LastFireMode) || { value: 0 };
    }
    async setLastFireMode(fireMode: FireModeData) {
        return this.setFlag(SYSTEM_NAME, FLAGS.LastFireMode, fireMode);
    }
    getLastSpellForce(): SpellForceData {
        return this.getFlag(SYSTEM_NAME, FLAGS.LastSpellForce) || { value: 0 };
    }
    async setLastSpellForce(force: SpellForceData) {
        return this.setFlag(SYSTEM_NAME, FLAGS.LastSpellForce, force);
    }
    getLastComplexFormLevel(): ComplexFormLevelData {
        return this.getFlag(SYSTEM_NAME, FLAGS.LastComplexFormLevel) || { value: 0 };
    }
    async setLastComplexFormLevel(level: ComplexFormLevelData) {
        return this.setFlag(SYSTEM_NAME, FLAGS.LastComplexFormLevel, level);
    }
    getLastFireRangeMod(): FireRangeData {
        return this.getFlag(SYSTEM_NAME, FLAGS.LastFireRange) || { value: 0 };
    }
    async setLastFireRangeMod(environmentalMod: FireRangeData) {
        return this.setFlag(SYSTEM_NAME, FLAGS.LastFireRange, environmentalMod);
    }

    /**
     * Return an Array of the Embedded Item Data
     * TODO properly type this
     */
    getEmbeddedItems(): any[] {
        let items = this.getFlag(SYSTEM_NAME, FLAGS.EmbeddedItems);

        items = items ? items : [];

        // moved this "hotfix" to here so that everywhere that accesses the flag just gets an array -- Shawn
        if (items && !Array.isArray(items)) {
            items = Helpers.convertIndexedObjectToArray(items);
        }

        // Manually map wrongly converted array fields...
        items = items.map(item => {
            if (item.effects && !Array.isArray(item.effects)) {
                item.effects = Helpers.convertIndexedObjectToArray(item.effects);
            }
            return item;
        });

        return items;
    }

    /**
     * Set the embedded item data
     * @param items
     */
    async setEmbeddedItems(items: any[]) {
        // clear the flag first to remove the previous items - if we don't do this then it doesn't actually "delete" any items
        // await this.unsetFlag(SYSTEM_NAME, 'embeddedItems');
        await this.setFlag(SYSTEM_NAME, FLAGS.EmbeddedItems, items);
    }

    async clearEmbeddedItems() {
        await this.unsetFlag(SYSTEM_NAME, FLAGS.EmbeddedItems);
    }

    /** Overwrite to allow for options param to be skipped.
     */
    async update(data, options?): Promise<this> {
        return super.update(data, options);
    }

    get hasOpposedRoll(): boolean {
        const action = this.getAction();
        if (!action) return false;
        return !!action.opposed.type;
    }

    get hasRoll(): boolean {
        const action = this.getAction();
        return !!(action && action.type !== '' && (action.skill || action.attribute || action.attribute2 || action.dice_pool_mod));
    }
    get hasTemplate(): boolean {
        return this.isAreaOfEffect();
    }

    /**
     * PREPARE DATA CANNOT PULL FROM this.actor at ALL
     * - as of foundry v0.7.4, actor data isn't prepared by the time we prepare items
     * - this caused issues with Actions that have a Limit or Damage attribute and so those were moved
     */
    prepareData() {
        super.prepareData();

        // Description labels might have changed since last data prep.
        this.labels = {};

        if (this.data.type === 'sin') {
            if (typeof this.data.data.licenses === 'object') {
                //@ts-ignore // taMiF: This seems to be a hacky solution to some internal or Foundry issue with reading
                //                      a object/HashMap when an array/iterable was expected
                this.data.data.licenses = Object.values(this.data.data.licenses);
            }
        }
        const equippedMods = this.getEquippedMods();
        const equippedAmmo = this.getEquippedAmmo();

        const technology = this.getTechnology();
        if (technology) {
            // taMiF: This migration code could be needed for items imported from an older compendium?
            if (technology.condition_monitor === undefined) {
                technology.condition_monitor = { value: 0, max: 0, label: '' };
            }
            // Rating might be a string.
            const rating = typeof technology.rating === 'string' ? 0 : technology.rating;
            technology.condition_monitor.max = 8 + Math.ceil(rating / 2);

            // Calculate conceal data.
            if (!technology.conceal) technology.conceal = {base: 0, value: 0, mod: []};

            const concealParts = new PartsList<number>();
            equippedMods.forEach((mod) => {
                const technology = mod.getTechnology();

                if (technology && technology.conceal.value) {
                    concealParts.addUniquePart(mod.name, technology.conceal.value);
                }
            });

            technology.conceal.mod = concealParts.list;
            technology.conceal.value = Helpers.calcTotal(technology.conceal);
        }

        const action = this.getAction();
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
                const modification = mod.asModificationData();
                if (!modification) return;

                if (modification.data.accuracy) {
                    limitParts.addUniquePart(mod.name, modification.data.accuracy);
                }
                if (modification.data.dice_pool) {
                    dpParts.addUniquePart(mod.name, modification.data.dice_pool);
                }
            });



            if (equippedAmmo) {
                const ammoData = equippedAmmo.data.data as AmmoData;
                // add mods to damage from ammo
                action.damage.mod = PartsList.AddUniquePart(action.damage.mod, equippedAmmo.name, ammoData.damage);
                // add mods to ap from ammo
                action.damage.ap.mod = PartsList.AddUniquePart(action.damage.ap.mod, equippedAmmo.name, ammoData.ap);

                // override element
                if (ammoData.element) {
                    action.damage.element.value = ammoData.element;
                } else {
                    action.damage.element.value = action.damage.element.base;
                }

                // override damage type
                if (ammoData.damageType) {
                    action.damage.type.value = ammoData.damageType;
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
        }

        const range = this.getWeaponRange();
        if (range) {
            if (range.rc) {
                const rangeParts = new PartsList();
                equippedMods.forEach((mod) => {
                    //@ts-ignore // TypeScript doesn't like this.data.data Item.Data<DataType> possibly being all the things.
                    if (mod.data.data.rc) rangeParts.addUniquePart(mod.name, mod.data.data.rc);
                    // handle overrides from ammo
                });
                //@ts-ignore // TypeScript doesn't like this.data.data Item.Data<DataType> possibly being all the things.
                range.rc.mod = rangeParts.list;
                //@ts-ignore // TypeScript doesn't like this.data.data Item.Data<DataType> possibly being all the things.
                if (range.rc) range.rc.value = Helpers.calcTotal(range.rc);
            }
        }

        const adeptPower = this.asAdeptPowerData();
        if (adeptPower) {
            adeptPower.data.type = adeptPower.data.action.type ? 'active' : 'passive';
        }
    }

    async postItemCard() {
        const tests =  this.getActionTests();
        const options = {
            actor: this.actor,
            description: this.getChatData(),
            item: this,
            previewTemplate: this.hasTemplate,
            tests
        };
        return await createItemChatMessage(options);
    }

    async castAction(event?) {
        if (!this.actor) return;

        const dontRollTest = event?.shiftKey || !this.hasRoll;
        if (dontRollTest) return await this.postItemCard();

        const dialog = await ShadowrunItemDialog.create(this, event);
        // Some items might not have an additional dialog.
        if (!dialog) return await this.rollTest(event);

        const actionTestData = await dialog.select();
        if (dialog.canceled) return;

        return await this.rollTest(event, actionTestData);
}

    getChatData(htmlOptions?) {
        const data = duplicate(this.data.data);
        const { labels } = this;
        //@ts-ignore // This is a hacky monkey patch solution to add a property to the item data
        //              that's not actually defined in any SR5Item typing.
        if (!data.description) data.description = {};
        // TextEditor.enrichHTML will return null as a string, making later handling difficult.
        if (!data.description.value) data.description.value = '';

        data.description.value = TextEditor.enrichHTML(data.description.value, htmlOptions);

        const props = [];
        const func = ChatData[this.data.type];
        if (func) func(duplicate(data), labels, props, this);

        //@ts-ignore // This is a hacky monkey patch solution to add a property to the item data
        //              that's not actually defined in any SR5Item typing.
        data.properties = props.filter((p) => !!p);

        return data;
    }

    getActionTestName(): string {
        const testName = this.getRollName();
        return testName ? testName :  game.i18n.localize('SR5.Action');
    }

    getOpposedTestName(): string {
        let name = '';
        const action = this.getAction();
        if (action && action.opposed.type) {
            const { opposed } = action;
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

     getBlastData(actionTestData?: ActionTestData): BlastData | undefined {
        if (this.isSpell() && this.isAreaOfEffect()) {
            const data = this.data.data as SpellData;

            // By default spell distance is equal to it's Force.
            let distance = this.getLastSpellForce().value;

            // Except for predefined user test selection.
            if (actionTestData?.spell) {
                distance = actionTestData.spell.force;
            }

            // Extended spells have a longer range.
            // TODO: data.extended is not defined in typing. It only exists under data.detection or data.action
            // @ts-ignore
            if (data.extended) distance *= 10;
            const dropoff = 0;

            return {
                radius: distance,
                dropoff
            }

        } else if (this.isGrenade()) {
            const data = this.data.data as WeaponData;

            const distance = data.thrown.blast.radius;
            const dropoff = data.thrown.blast.dropoff;

            return {
                radius: distance,
                dropoff
            }

        } else if (this.hasExplosiveAmmo()) {
            const data = this.data.data as WeaponData;

            const ammo = this.getEquippedAmmo();
            const ammoData = ammo.data as Ammo;
            const distance = ammoData.data.blast.radius;
            const dropoff = ammoData.data.blast.dropoff;

            return {
                radius: distance,
                dropoff
            };
        }
    }

    getEquippedAmmo(): SR5Item {
        const equippedAmmos = (this.items || []).filter((item) =>
            item.isAmmo() &&
            item.isEquipped());

        // Cast Typing isn't a mistake, so long as isAmmo is filtered.
        return equippedAmmos[0];
    }

    getEquippedMods(): SR5Item[] {
        return (this.items || []).filter((item) =>
            item.isWeaponModification() &&
            item.isEquipped());
    }

    hasExplosiveAmmo(): boolean {
        const ammo = this.getEquippedAmmo();
        if (!ammo) return false;
        const data = ammo.data.data as AmmoData;
        return data.blast.radius > 0;
    }

    async equipWeaponMod(iid) {
        const mod = this.getOwnedItem(iid);
        if (mod) {
            const dupData = duplicate(mod.data);
            const data = dupData.data as TechnologyPartData;
            data.technology.equipped = !data.technology.equipped;
            await this.updateOwnedItem(dupData);
        }
    }

    hasAmmo(): boolean {
        return this.wrapper.hasAmmo();
    }

    async useAmmo(fireMode) {
        const weapon = duplicate(this.asWeaponData());
        if (weapon) {
            const { ammo } = weapon.data;
            ammo.current.value = Math.max(0, ammo.current.value - fireMode);

            return await this.update(weapon);
        }
    }

    async reloadAmmo() {
        const data = duplicate(this.asWeaponData());

        if (!data) return;

        const { ammo } = data.data;
        const diff = ammo.current.max - ammo.current.value;
        ammo.current.value = ammo.current.max;

        if (ammo.spare_clips) {
            ammo.spare_clips.value = Math.max(0, ammo.spare_clips.value - 1);
        }

        await this.update(data);

        const newAmmunition = (this.items || [])
            .filter((i) => i.data.type === 'ammo')
            .reduce((acc: Entity.Data[], item) => {
                const ammoData = item.asAmmoData();

                if (ammoData && ammoData.data.technology.equipped) {
                    const { technology } = ammoData.data;
                    const qty = typeof technology.quantity === 'string' ? 0 : technology.quantity;
                    technology.quantity = Math.max(0, qty - diff);
                    acc.push(item.data);
                }
                return acc;
            }, []);

        if (newAmmunition && newAmmunition.length) {
            await this.updateOwnedItem(newAmmunition);
        }
    }

    async equipAmmo(iid) {
        // only allow ammo that was just clicked to be equipped
        const ammo = this.items
            .filter((item) => item.type === 'ammo')
            .map((item) => {
                const ownedItem = this.getOwnedItem(item._id);
                const ammoData = ownedItem?.asAmmoData();

                if (ownedItem && ammoData) {
                    ammoData.data.technology.equipped = iid === item._id;
                    return ownedItem.data;
                }
            });
        await this.updateOwnedItem(ammo);
    }

    async addNewLicense() {
        const sin = duplicate(this.asSinData());
        if (!sin) return;

        // NOTE: This might be related to Foundry data serialization sometimes returning arrays as ordered HashMaps...
        if (typeof sin.data.licenses === 'object') {
            // @ts-ignore
            sin.data.licenses = Object.values(sin.data.licenses);
        }

        sin.data.licenses.push({
            name: '',
            rtg: '',
            description: '',
        });

        await this.update(sin);
    }

    getRollPartsList(): ModList<number> {
        // we only have a roll if we have an action or an actor
        const action = this.getAction();
        if (!action || !this.actor) return [];

        const parts = new PartsList(duplicate(this.getModifierList()));

        const skill = this.actor.findActiveSkill(this.getActionSkill());
        const attribute = this.actor.findAttribute(this.getActionAttribute());
        const attribute2 = this.actor.findAttribute(this.getActionAttribute2());

        if (attribute && attribute.label) parts.addPart(attribute.label, attribute.value);

        // if we have a valid skill, don't look for a second attribute
        if (skill && skill.label) {
            parts.addUniquePart(skill.label, skill.value);
            if (skill.value === 0) {
                parts.addUniquePart('SR5.Defaulting', -1);
            }
        }
        else if (attribute2 && attribute2.label) {
            parts.addPart(attribute2.label, attribute2.value);
        }

        const spec = this.getActionSpecialization();
        if (spec) parts.addUniquePart(spec, 2);

        //@ts-ignore parseInt does allow for number type parameter.
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

    isSin(): boolean {
        return this.wrapper.isSin();
    }

    asSinData(): Sin | undefined {
        if (this.isSin()) {
            return this.data as Sin;
        }
    }

    isLifestyle(): boolean {
        return this.wrapper.isLifestyle();
    }

    asLifestyleData(): Lifestyle | undefined {
        if (this.isLifestyle()) {
            return this.data as Lifestyle;
        }
    }

    isAmmo(): boolean {
        return this.wrapper.isAmmo();
    }

    asAmmoData(): Ammo | undefined {
        if (this.isAmmo()) {
            return this.data as Ammo;
        }
    }

    isModification(): boolean {
        return this.wrapper.isModification();
    }

    asModificationData(): Modification | undefined {
        if (this.isModification()) {
            return this.data as Modification;
        }
    }

    isWeaponModification(): boolean {
        return this.wrapper.isWeaponModification();
    }

    isArmorModification(): boolean {
        return this.wrapper.isArmorModification();
    }

    isProgram(): boolean {
        return this.wrapper.isProgram();
    }

    asProgramData(): Program | undefined {
        if (this.isProgram()) {
            return this.data as Program;
        }
    }

    isQuality(): boolean {
        return this.wrapper.isQuality();
    }

    asQualityData(): Quality | undefined {
        if (this.isQuality()) {
            return this.data as Quality;
        }
    }

    isAdeptPower(): boolean {
        return this.data.type === 'adept_power';
    }

    asAdeptPowerData(): AdeptPower|undefined {
        if (this.isAdeptPower())
            return this.data as AdeptPower;
    }

    async removeLicense(index) {
        const data = duplicate(this.asSinData());
        if (data) {
            data.data.licenses.splice(index, 1);
            await this.update(data);
        }
    }

    isAction(): boolean {
        return this.wrapper.isAction();
    }

    asActionData(): Action | undefined {
        if (this.isAction()) {
            return this.data as Action;
        }
    }



    async rollOpposedTest(target: SR5Actor, attack: AttackData, event):  Promise<ShadowrunRoll | undefined> {
        const options = {
            event,
            fireModeDefense: 0,
            cover: false,
            attack
        };

        const parts = this.getOpposedTestMod();
        const action = this.getAction();
        if (!action) return;

        const { opposed } = action;

        if (opposed.type === 'defense') {
            return await this.rollDefense(target, options);

        } else if (opposed.type === 'soak') {
            options['damage'] = attack?.damage;
            options['attackerHits'] = attack?.hits;
            return await target.rollSoak(options, parts.list);

        } else if (opposed.type === 'armor') {
            return target.rollArmor(options);

        } else if (opposed.skill && opposed.attribute) {
            const skill = target.getSkill(opposed.skill);

            if (!skill) {
                ui.notifications.error(game.i18n.localize("SR5.Errors.MissingSkill"));
                return;
            }

            return target.rollSkill(skill, {
                ...options,
                attribute: opposed.attribute,
            });

        } else if (opposed.attribute && opposed.attribute2) {
            return target.rollTwoAttributes([opposed.attribute, opposed.attribute2], options);

        } else if (opposed.attribute) {
            return target.rollSingleAttribute(opposed.attribute, options);

        }
    }

    async rollTestType(type: string, attack: AttackData, event, target: SR5Actor) {
        if (type === 'opposed') {
            await this.rollOpposedTest(target, attack, event);
        }
        if (type === 'action') {
            await this.castAction(event);
        }
    }

    /**
     * Rolls a test using the latest stored data on the item (force, fireMode, level)
     * @param event - mouse event
     * @param actionTestData
     * @param options - any additional roll options to pass along - note that currently the Item will overwrite -- WIP
     */
    async rollTest(event, actionTestData?: ActionTestData): Promise<ShadowrunRoll | undefined> {

        const roll = await ShadowrunRoller.itemRoll(event, this, actionTestData);
        if (!roll) return;

        await ShadowrunRoller.resultingItemRolls(event, this, actionTestData);

        return roll;
    }

    static getItemFromMessage(html): SR5Item | undefined {
        const card = html.find('.chat-card');
        let actor;
        const tokenKey = card.data('tokenId');
        if (tokenKey) {
            const [sceneId, tokenId] = tokenKey.split('.');
            let token;
            if (sceneId === canvas?.scene._id) token = canvas.tokens.get(tokenId);
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

    getActionTests(): Test[] {
        if (!this.hasRoll) return []

        return [{
            label: this.getActionTestName(),
            type: 'action',
        }];
    }

    getOpposedTests(): Test[] {
        if (!this.hasOpposedRoll) {
            return [];
        }
        return [{
            label: this.getOpposedTestName(),
            type: 'opposed',
        }];
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

        // Templates and further logic need a items HashMap, yet the flag provides an array.
        if (items) {

            const existing = (this.items || []).reduce((object, i) => {
                object[i.id] = i;
                return object;
            }, {});

            // Merge possible changes / new items from the flag into the current item instance.
            this.items = items.map((item) => {
                if (item._id in existing) {
                    const currentItem = existing[item._id];

                    // Patch .data isn't really anymore but do it for consistency.
                    // Patch ._data is needed for Item.prepareData to work, as it's simply duplicating _data over data.
                    // Otherwise old item data will be used for value preparation.
                    currentItem.data = item;
                    currentItem._data = item;
                    currentItem.prepareData();
                    return currentItem;

                } else {
                    // dirty things done here
                    // @ts-ignore
                    return Item.createOwned(item, this);
                }
            });
        }
    }

    getOwnedItem(itemId): SR5Item | undefined {
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
        // we need to clear the items when one is deleted or it won't actually be deleted
        await this.clearEmbeddedItems();
        await this.setEmbeddedItems(items);
        await this.prepareEmbeddedEntities();
        await this.prepareData();
        await this.render(false);
        return true;
    }

    async openPdfSource() {
        // Check for PDFoundry module hook: https://github.com/Djphoenix719/PDFoundry
        if (!ui['PDFoundry']) {
            ui.notifications.warn(game.i18n.localize('SR5.DIALOG.MissingModuleContent'));
            return;
        }

        const source = this.getBookSource();
        if (source === '') {
            // @ts-ignore
            ui.notifications.error(game.i18n.localize('SR5.SourceFieldEmptyError'));
        }
        // TODO open PDF to correct location
        // parse however you need, all "buttons" will lead to this function
        const [code, page] = source.split(' ');

        //@ts-ignore
        ui.PDFoundry.openPDFByCode(code, { page: parseInt(page) });
    }

    _canDealDamage(): boolean {
        // NOTE: Double negation to force boolean comparison casting.
        const action = this.getAction();
        if (!action) return false;
        return !!action.damage.type.base;
    }

    getAction(): ActionRollData|undefined {
        return this.wrapper.getAction();
    }

    getExtended(): boolean {
        const action = this.getAction();
        if (!action) return false;
        return action.extended;
    }

    getTechnology(): TechnologyData|undefined {
        return this.wrapper.getTechnology();
    }

    getRange(): CritterPowerRange|SpellRange|RangeWeaponData|undefined {
        return this.wrapper.getRange();
    }

    getWeaponRange(): RangeWeaponData|undefined {
        if (this.isRangedWeapon())
            return this.getRange() as RangeWeaponData;
    }

    getAttackData(hits: number, actionTestData?: ActionTestData): AttackData | undefined {
        if (!this._canDealDamage()) {
            return;
        }

        const action = this.getAction();
        if (!action) return;

        const damage = ItemAction.calcDamage(action.damage, this.actor);

        const data: AttackData = {
            hits,
            damage,
        };

        // Modify action damage by spell damage.
        if (this.isCombatSpell() && actionTestData?.spell) {
            const force = actionTestData.spell.force;
            const damageParts = new PartsList(data.damage.mod);
            const spellDamage = this.getSpellDamage(force, hits);

            if (spellDamage) {
                data.force = force;
                data.damage.base = spellDamage.base;
                data.damage.value = spellDamage.base + damageParts.total;
                data.damage.ap.value = -spellDamage.ap.value + damageParts.total;
                data.damage.ap.base = -spellDamage.ap.value;
            }
        }

        if (this.isComplexForm() && actionTestData?.complexForm) {
            data.level = actionTestData.complexForm.level;
        }

        if (this.isMeleeWeapon()) {
            data.reach = this.getReach();
            data.accuracy = this.getActionLimit();
        }

        if (this.isRangedWeapon()) {
            data.fireMode = actionTestData?.rangedWeapon?.fireMode;
            data.accuracy = this.getActionLimit();
        }

        const blastData = this.getBlastData(actionTestData);
        if (blastData) data.blast = blastData;

        return data;
    }

    getRollName(): string {
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
        if (this.hasRoll) {
            return this.name
        }

        return DEFAULT_ROLL_NAME;
    }

    getLimit(): LimitField | undefined {
        // @ts-ignore // TODO: This should use this.getAction(). However action.limit doesn't contain label field.
        const limit = duplicate(this.data.data.action?.limit);
        if (!limit) return undefined;
        // go through and set the label correctly
        if (this.data.type === 'weapon') {
            limit.label = 'SR5.Accuracy';
        } else if (limit?.attribute) {
            limit.label = CONFIG.SR5.limits[limit.attribute];
        } else if (this.isSpell()) {
            limit.value = this.getLastSpellForce().value;
            limit.label = 'SR5.Force';
        } else if (this.isComplexForm()) {
            limit.value = this.getLastComplexFormLevel().value;
            limit.label = 'SR5.Level';
        } else {
            limit.label = 'SR5.Limit';
        }

        // adjust limit value for actor data
        if (limit.attribute) {
            const att = this.actor.findLimit(limit.attribute);
            if (att) {
                limit.mod = PartsList.AddUniquePart(limit.mod, att.label, att.value);
                Helpers.calcTotal(limit);
            }
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

    asArmorData(): Armor | undefined {
        if (this.isArmor()) {
            return this.data as Armor;
        }
    }

    hasArmorBase(): boolean {
        return this.wrapper.hasArmorBase();
    }

    hasArmorAccessory(): boolean {
        return this.wrapper.hasArmorAccessory();
    }

    hasArmor(): boolean {
        return this.wrapper.hasArmor();
    }

    isGrenade(): boolean {
        return this.wrapper.isGrenade();
    }

    isWeapon(): boolean {
        return this.wrapper.isWeapon();
    }

    asWeaponData(): Weapon | undefined {
        if (this.wrapper.isWeapon()) {
            return this.data as Weapon;
        }
    }

    isCyberware(): boolean {
        return this.wrapper.isCyberware();
    }

    asCyberwareData(): Cyberware | undefined {
        if (this.isCyberware()) {
            return this.data as Cyberware;
        }
    }

    isCombatSpell(): boolean {
        return this.wrapper.isCombatSpell();
    }

    isDirectCombatSpell(): boolean {
        return this.wrapper.isDirectCombatSpell();
    }

    isIndirectCombatSpell(): boolean {
        return this.wrapper.isIndirectCombatSpell();
    }

    isManaSpell(): boolean {
        return this.wrapper.isManaSpell();
    }

    isPhysicalSpell(): boolean {
        return this.wrapper.isPhysicalSpell();
    }

    isRangedWeapon(): boolean {
        return this.wrapper.isRangedWeapon();
    }

    isSpell(): boolean {
        return this.wrapper.isSpell();
    }

    asSpellData(): Spell | undefined {
        if (this.isSpell()) {
            return this.data as Spell;
        }
    }

    isSpritePower(): boolean {
        return this.wrapper.isSpritePower();
    }

    asSpritePowerData(): SpritePower | undefined {
        if (this.isSpritePower()) {
            return this.data as SpritePower;
        }
    }

    isBioware(): boolean {
        return this.wrapper.isBioware();
    }

    isComplexForm(): boolean {
        return this.wrapper.isComplexForm();
    }

    asComplexFormData(): ComplexForm | undefined {
        if (this.isComplexForm()) {
            return this.data as ComplexForm;
        }
    }

    isContact(): boolean {
        return this.wrapper.isContact();
    }

    asContactData(): Contact | undefined {
        if (this.isContact()) {
            return this.data as Contact;
        }
    }

    isCritterPower(): boolean {
        return this.wrapper.isCritterPower();
    }

    asCritterPowerData(): CritterPower | undefined {
        if (this.isCritterPower()) {
            return this.data as CritterPower;
        }
    }

    isMeleeWeapon(): boolean {
        return this.wrapper.isMeleeWeapon();
    }

    isDevice(): boolean {
        return this.wrapper.isDevice();
    }

    asDeviceData(): Device | undefined {
        if (this.isDevice()) {
            return this.data as Device;
        }
    }

    isEquipment(): boolean {
        return this.wrapper.isEquipment();
    }

    asEquipmentData(): Equipment | undefined {
        if (this.isEquipment()) {
            return this.data as Equipment;
        }
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
        let limit = this.wrapper.getActionLimit();
        // get the limit modifiers from the actor if we have them
        const action = this.wrapper.getAction();
        if (action?.limit.attribute && limit && this.actor) {
            const { attribute } = action.limit;
            const att = this.actor.findAttribute(attribute);
            if (att) {
                limit += att.value;
            }
        }
        return limit;
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
            const data = this.data.data as WeaponData;
            return data.melee.reach ?? 0;
        }
        return 0;
    }

    getCondition(): ConditionData|undefined {
        const technology = this.getTechnology();
        if (technology && "condition_monitor" in technology)
            return technology.condition_monitor;
    }

    hasDefenseTest(): boolean {
        if (!this.hasOpposedRoll) return false;
        const action = this.getAction();
        if (!action) return false;
        return action.opposed.type === 'defense';
    }

    /** Use this method to get the base damage of spell, before any opposing action
     *
     * NOTE: This will NOT give you modified damage for direct combat spells
     */
    getSpellDamage(force: number, hits: number): DamageData|undefined {
        if (!this.isCombatSpell()) return;

        const action = this.getAction();
        if (!action) return;

        if (this.isDirectCombatSpell()) {
            const damage = hits;

            return Helpers.createDamageData(damage, action.damage.type.value);
        } else if (this.isIndirectCombatSpell()) {
            const damage = force;
            const ap = -force;

            return Helpers.createDamageData(damage, action.damage.type.value, -ap)
        }
    }

    // TODO: Move into a rule section.
    async rollDefense(target: SR5Actor, options: DefenseRollOptions): Promise<ShadowrunRoll | undefined> {
        // TODO: Maybe move into defense methods and give the actor access to the item.
        const opposedParts = this.getOpposedTestMod();

        if (this.isWeapon()) {
            options.cover = true;
            if (options.attack?.fireMode?.defense) {
                options.fireModeDefense = +options.attack.fireMode.defense;
            }

            return await target.rollRangedDefense(options, opposedParts.list);
        }

        if (this.isDirectCombatSpell()) {
            return await target.rollDirectSpellDefense(this, options as SpellDefenseOptions);
        }

        if (this.isIndirectCombatSpell()) {
            return await target.rollIndirectSpellDefense(this, options as SpellDefenseOptions);
        }
    }

    /** Should environmental modifiers apply an action by this item?
     */
    applyEnvironmentalModifiers(): boolean {
        if (this.isRangedWeapon()) return true;
        if (this.isMeleeWeapon()) return true;
        if (this.isIndirectCombatSpell()) return true;

        return false;
    }
}
