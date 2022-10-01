import { SkillFlow } from "../actor/flows/SkillFlow";
import { SR5Actor } from '../actor/SR5Actor';
import { ActionTestData } from '../apps/dialogs/ShadowrunItemDialog';
import { createItemChatMessage } from '../chat';
import { DEFAULT_ROLL_NAME, FLAGS, SYSTEM_NAME } from '../constants';
import { DefaultValues } from "../data/DataDefaults";
import { SR5ItemDataWrapper } from '../data/SR5ItemDataWrapper';
import { Helpers } from '../helpers';
import { PartsList } from '../parts/PartsList';
import { Test } from "../rolls/ShadowrunRoller";
import { MatrixRules } from "../rules/MatrixRules";
import { TestCreator } from "../tests/TestCreator";
import { ChatData } from './ChatData';
import { NetworkDeviceFlow } from "./flows/NetworkDeviceFlow";
import { HostDataPreparation } from "./prep/HostPrep";
import ModList = Shadowrun.ModList;
import AttackData = Shadowrun.AttackData;
import AttributeField = Shadowrun.AttributeField;
import SkillField = Shadowrun.SkillField;
import FireModeData = Shadowrun.FireModeData;
import SpellForceData = Shadowrun.SpellForceData;
import ComplexFormLevelData = Shadowrun.ComplexFormLevelData;
import FireRangeData = Shadowrun.FireRangeData;
import BlastData = Shadowrun.BlastData;
import ConditionData = Shadowrun.ConditionData;
import ActionRollData = Shadowrun.ActionRollData;
import DamageData = Shadowrun.DamageData;
import SpellData = Shadowrun.SpellData;
import WeaponData = Shadowrun.WeaponData;
import AmmoData = Shadowrun.AmmoData;
import TechnologyData = Shadowrun.TechnologyData;
import RangeWeaponData = Shadowrun.RangeWeaponData;
import SpellRange = Shadowrun.SpellRange;
import CritterPowerRange = Shadowrun.CritterPowerRange;
import ShadowrunItemData = Shadowrun.ShadowrunItemData;
import ActionItemData = Shadowrun.ActionItemData;
import AdeptPowerItemData = Shadowrun.AdeptPowerItemData;
import AmmoItemData = Shadowrun.AmmoItemData;
import ArmorItemData = Shadowrun.ArmorItemData;
import ComplexFormItemData = Shadowrun.ComplexFormItemData;
import ContactItemData = Shadowrun.ContactItemData;
import CritterPowerItemData = Shadowrun.CritterPowerItemData;
import CyberwareItemData = Shadowrun.CyberwareItemData;
import DeviceItemData = Shadowrun.DeviceItemData;
import EquipmentItemData = Shadowrun.EquipmentItemData;
import LifestyleItemData = Shadowrun.LifestyleItemData;
import ModificationItemData = Shadowrun.ModificationItemData;
import ProgramItemData = Shadowrun.ProgramItemData;
import QualityItemData = Shadowrun.QualityItemData;
import SinItemData = Shadowrun.SinItemData;
import SpellItemData = Shadowrun.SpellItemData;
import SpritePowerItemData = Shadowrun.SpritePowerItemData;
import WeaponItemData = Shadowrun.WeaponItemData;
import HostItemData = Shadowrun.HostItemData;
import ActionResultData = Shadowrun.ActionResultData;
import MatrixMarks = Shadowrun.MatrixMarks;
import MarkedDocument = Shadowrun.MarkedDocument;
import RollEvent = Shadowrun.RollEvent;

/**
 * Implementation of Shadowrun5e items (owned, unowned and embedded).
 *
 *       tamIf here: The current legacy embedded items approach has been cleaned up a bit but is still causing some issues
 *       with typing and ease of use.
 *
 *       SR5Item.items currently overwrites foundries internal DocumentCollection mechanism of embedded documents. Partially
 *       due to legacy reasons and since Foundry 0.8 SR5Item.update can't be used for embedded items in items anymore.
 *
 *        At the moment this means, that this.actor can actually be an SR5Actor as well as an SR5Item, depending on who
 *       'owns' the embedded item as they are created using Item.createOwned during the embedded item prep phase.
 *
 *       For this reason SR5Item.actorOwner has been introduced to allow access to the actual owning actor, no matter
 *       how deep embedded into other items an item is.
 *
 *       Be wary of SR5Item.actor for this reason!
 */
export class SR5Item extends Item {
    static LOG_V10_COMPATIBILITY_WARNINGS = false;
    
    // Item.items isn't the Foundry default ItemCollection but is overwritten within prepareNestedItems
    // to allow for embedded items in items in actors.
    items: SR5Item[];

    // Item Sheet labels for quick info on an item dropdown.
    labels: {} = {};


    /**
     * Return the owner of this item, which can either be
     * - an actor instance (Foundry default)
     * - an item instance (shadowrun custom) for embedded items
     *
     * If you need the actual actor owner, no matter how deep into item embedding, this current item is use SR5item.actorOwner
     */
    get actor(): SR5Actor {
        return super.actor as unknown as SR5Actor;
    }

    /**
     * Helper property to get an actual actor for an owned or embedded item. You'll need this for when you work with
     * embeddedItems, as they have their .actor property set to the item they're embedded into.
     *
     * NOTE: This helper is necessary since we have setup embedded items with an item owner, due to the current embedding
     *       workflow using item.update.isOwned condition within Item.update (foundry Item) to NOT trigger a global item
     *       update within the ItemCollection but instead have this.actor.updateEmbeddedEntities actually trigger SR5Item.updateEmbeddedEntities
     */
    get actorOwner(): SR5Actor | undefined {
        // An unowned item won't have an actor.
        if (!this.actor) return;
        // An owned item will have an actor.
        if (this.actor instanceof SR5Actor) return this.actor;
        // An embedded item will have an item as an actor, which might have an actor owner.
        // NOTE: This is very likely wrong and should be fixed during embedded item prep / creation. this.actor will only
        //       check what is set in the items options.actor during it's construction.
        //@ts-ignore
        return this.actor.actorOwner;
    }

    private get wrapper(): SR5ItemDataWrapper {
        // we need to cast here to unknown first to make ts happy
        return new SR5ItemDataWrapper((this.data as unknown) as ShadowrunItemData);
    }

    // Flag Functions
    getLastFireMode(): FireModeData {
        return this.getFlag(SYSTEM_NAME, FLAGS.LastFireMode) as FireModeData || DefaultValues.fireModeData();
    }
    async setLastFireMode(fireMode: FireModeData) {
        return this.setFlag(SYSTEM_NAME, FLAGS.LastFireMode, fireMode);
    }
    getLastSpellForce(): SpellForceData {
        return this.getFlag(SYSTEM_NAME, FLAGS.LastSpellForce) as SpellForceData|| { value: 0 };
    }
    async setLastSpellForce(force: SpellForceData) {
        return this.setFlag(SYSTEM_NAME, FLAGS.LastSpellForce, force);
    }
    getLastComplexFormLevel(): ComplexFormLevelData {
        return this.getFlag(SYSTEM_NAME, FLAGS.LastComplexFormLevel) as ComplexFormLevelData || { value: 0 };
    }
    async setLastComplexFormLevel(level: ComplexFormLevelData) {
        return this.setFlag(SYSTEM_NAME, FLAGS.LastComplexFormLevel, level);
    }
    getLastFireRangeMod(): FireRangeData {
        return this.getFlag(SYSTEM_NAME, FLAGS.LastFireRange) as FireRangeData || { value: 0 };
    }
    async setLastFireRangeMod(environmentalMod: FireRangeData) {
        return this.setFlag(SYSTEM_NAME, FLAGS.LastFireRange, environmentalMod);
    }

    /**
     * Return an Array of the Embedded Item Data
     */
    getNestedItems(): any[] {
        let items = this.getFlag(SYSTEM_NAME, FLAGS.EmbeddedItems) as any[];

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
            // TODO: foundry-vtt-types v10 - TODO: Move into migration...
            // if (item.data) {
            //     item.system = item.system || {};
            //     mergeObject(item.system, item.data);
            //     item.system = item.data;
            //     delete item.data;
            // }
            return item;
        });

        return items;
    }

    /**
     * Set the embedded item data
     * @param items
     */
    async setNestedItems(items: any[]) {
        // clear the flag first to remove the previous items - if we don't do this then it doesn't actually "delete" any items
        // await this.unsetFlag(SYSTEM_NAME, 'embeddedItems');
        await this.setFlag(SYSTEM_NAME, FLAGS.EmbeddedItems, items);
    }

    async clearNestedItems() {
        await this.unsetFlag(SYSTEM_NAME, FLAGS.EmbeddedItems);
    }

    get hasOpposedRoll(): boolean {
        const action = this.getAction();
        if (!action) return false;
        return !!action.opposed.test;
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
        this.prepareNestedItems();

        // Description labels might have changed since last data prep.
        this.labels = {};

        if (this.type === 'sin') {
            //@ts-ignore // TODO: foundry-vtt-types v10 
            if (typeof this.system.licenses === 'object') {
                //@ts-ignore // taMiF: This seems to be a hacky solution to some internal or Foundry issue with reading
                //                      a object/HashMap when an array/iterable was expected
                //@ts-ignore // TODO: foundry-vtt-types v10 
                this.system.licenses = Object.values(this.system.licenses);
            }
        }
        const equippedMods = this.getEquippedMods();
        const equippedAmmo = this.getEquippedAmmo();

        const technology = this.getTechnologyData();
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
                const technology = mod.getTechnologyData();

                if (technology && technology.conceal.value) {
                    concealParts.addUniquePart(mod.name as string, technology.conceal.value);
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

            // @ts-ignore
            // Due to faulty template value items without a set operator will have a operator literal instead since 0.7.10.
            if (action.damage.base_formula_operator === '+') {
                action.damage.base_formula_operator = 'add';
            }

            // Item.prepareData is called once (first) with an empty SR5Actor instance without .data and once (second) with .data.
            //@ts-ignore // TODO: foundry-vtt-types v10 Is there way with v10 to determine if data has been set? (second round)
            if (this.actor?.data) {
                action.damage.source = {
                    actorId: this.actor.id as string,
                    itemId: this.id as string,
                    itemName: this.name as string,
                    itemType: this.type
                };
            }

            // handle overrides from mods
            const limitParts = new PartsList(action.limit.mod);
            const dpParts = new PartsList(action.dice_pool_mod);
            equippedMods.forEach((mod) => {
                const modification = mod.asModificationData();
                if (!modification) return;

                //@ts-ignore // TODO: foundry-vtt-types v10 
                if (modification.system.accuracy) limitParts.addUniquePart(mod.name as string, modification.system.accuracy);
                //@ts-ignore // TODO: foundry-vtt-types v10 
                if (modification.system.dice_pool) dpParts.addUniquePart(mod.name as string, modification.system.dice_pool);
                
            });



            if (equippedAmmo) {
                //@ts-ignore // TODO: foundry-vtt-types v10 
                const ammoData = equippedAmmo.system as AmmoData;
                // add mods to damage from ammo
                action.damage.mod = PartsList.AddUniquePart(action.damage.mod, equippedAmmo.name as string, ammoData.damage);
                // add mods to ap from ammo
                action.damage.ap.mod = PartsList.AddUniquePart(action.damage.ap.mod, equippedAmmo.name as string, ammoData.ap);

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
                    //@ts-ignore // TypeScript doesn't like this.system Item.Data<DataType> possibly being all the things.
                    //@ts-ignore // TODO: foundry-vtt-types v10 
                    if (mod.system.rc) rangeParts.addUniquePart(mod.name, mod.system.rc);
                    // handle overrides from ammo
                });
                //@ts-ignore // TypeScript doesn't like this.system Item.Data<DataType> possibly being all the things.
                range.rc.mod = rangeParts.list;
                //@ts-ignore // TypeScript doesn't like this.system Item.Data<DataType> possibly being all the things.
                if (range.rc) range.rc.value = Helpers.calcTotal(range.rc);
            }
        }

        const adeptPower = this.asAdeptPowerData();
        if (adeptPower) {
            //@ts-ignore // TODO: foundry-vtt-types v10 
            adeptPower.system.type = adeptPower.system.action.type ? 'active' : 'passive';
        }

        // Switch item data preparation between types...
        // ... this is ongoing work to clean up SR5item.prepareData
        switch (this.type) {
            case 'host':
                //@ts-ignore // TODO: foundry-vtt-types v10 
                HostDataPreparation(this.system);
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

    /**
     * Cast the action of this item as a Test.
     *
     * @param event A PointerEvent by user interaction.
     */
    async castAction(event?: RollEvent) {
        // Only show the item's description by user intention or by lack of testability.
        const dontRollTest = TestCreator.shouldPostItemDescription(event) || !this.hasRoll;
        if (dontRollTest) return await this.postItemCard();

        if (!this.actor) return;

        const showDialog = !TestCreator.shouldHideDialog(event);
        const test = await TestCreator.fromItem(this, this.actor, {showDialog});
        if (!test) return;
        await test.execute();
}

    getChatData(htmlOptions={}) {
        //@ts-ignore // TODO: foundry-vtt-types v10 
        const system = duplicate(this.system);
        const { labels } = this;
        //@ts-ignore // This is a hacky monkey patch solution to add a property to the item data
        //              that's not actually defined in any SR5Item typing.
        if (!system.description) system.description = {};
        // TextEditor.enrichHTML will return null as a string, making later handling difficult.
        if (!system.description.value) system.description.value = '';
        //@ts-ignore // TODO: foundry-vtt-types v10
        system.description.value = TextEditor.enrichHTML(system.description.value, {...htmlOptions, async: false});

        const props = [];
        //@ts-ignore // TODO: foundry-vtt-types v10 
        const func = ChatData[this.type];
        if (func) func(duplicate(system), labels, props, this);

        //@ts-ignore // This is a hacky monkey patch solution to add a property to the item data
        //              that's not actually defined in any SR5Item typing.
        system.properties = props.filter((p) => !!p);

        return system;
    }

    getActionTestName(): string {
        const testName = this.getRollName();
        return testName ? testName :  game.i18n.localize('SR5.Action');
    }

    /**
     * Any item implementation can define a set of modifiers to be applied when used within an opposed test.
     *
     * NOTE: This is a legacy method of applied modifiers to opposed tests but works fine for now.
     */
    getOpposedTestMod(): PartsList<number> {
        const parts = new PartsList<number>();

        if (this.hasOpposedTest()) {
            if (this.isAreaOfEffect()) {
                parts.addUniquePart('SR5.Aoe', -2);
            }
        }

        return parts;
    }

    getBlastData(actionTestData?: ActionTestData): BlastData | undefined {
        if (this.isSpell() && this.isAreaOfEffect()) {
            //@ts-ignore // TODO: foundry-vtt-types v10 
            const system = this.system as SpellData;

            // By default spell distance is equal to it's Force.
            let distance = this.getLastSpellForce().value;

            // Except for predefined user test selection.
            if (actionTestData?.spell) {
                distance = actionTestData.spell.force;
            }

            // Extended spells have a longer range.
            if (system.extended) distance *= 10;
            const dropoff = 0;

            return {
                radius: distance,
                dropoff
            }

        } else if (this.isGrenade()) {
            //@ts-ignore // TODO: foundry-vtt-types v10 
            const system = this.system as WeaponData;

            const distance = system.thrown.blast.radius;
            const dropoff = system.thrown.blast.dropoff;

            return {
                radius: distance,
                dropoff
            }

        } else if (this.hasExplosiveAmmo()) {
            const ammo = this.getEquippedAmmo();
            const ammoData = ammo.asAmmoData();

            if (!ammoData) return {radius: 0, dropoff: 0};

            //@ts-ignore // TODO: foundry-vtt-types v10 
            const distance = ammoData.system.blast.radius;
            //@ts-ignore // TODO: foundry-vtt-types v10 
            const dropoff = ammoData.system.blast.dropoff;

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
        //@ts-ignore // TODO: foundry-vtt-types v10 
        const system = ammo.system as AmmoData;
        return system.blast.radius > 0;
    }

    /**
     * Toggle equipment state of a single Modification item.
     * @param iid Modification item id to be equip toggled
     */
    async equipWeaponMod(iid) {
        await this.equipNestedItem(iid, 'modification', {unequipOthers: false, toggle: true});
    }

    /**
     * Check if weapon has enough ammunition.
     *
     * @param rounds The amount of rounds to be fired
     * @returns Either the weapon has no ammo at all or not enough.
     */
    hasAmmo(rounds: number=0): boolean {
        return this.ammoLeft >= rounds;
    }

    /**
     * Amount of ammunition this weapon has currently available
     */
    get ammoLeft(): number {
        const ammo = this.wrapper.getAmmo();
        if (!ammo) return 0;

        return ammo.current.value;
    }

    /**
     * Use the weapons ammunition with the amount of bullets fired.
     * @param fired Amount of bullets fired.
     */
    async useAmmo(fired) {
        if (this.type !== 'weapon') return;

        //@ts-ignore // TODO: foundry-vtt-types v10 
        const value = Math.max(0, this.system.ammo.current.value - fired);
        return await this.update({'system.ammo.current.value': value});
    }

    async reloadAmmo() {
        if (this.type !== 'weapon') return;
        
        // Reload this weapons ammunition to it's max capacity.
        const updateData = {};
        //@ts-ignore // TODO: foundry-vtt-types v10 
        const diff = this.system.ammo.current.max - this.system.ammo.current.value;
        //@ts-ignore // TODO: foundry-vtt-types v10 
        updateData['system.ammo.current.value'] = this.system.ammo.current.max;
        
        // TODO: Make actual use of this spare clips system...
        //@ts-ignore // TODO: foundry-vtt-types v10 
        if (this.system.ammo.current.spare_clips) {
            //@ts-ignore // TODO: foundry-vtt-types v10 
            updateData['system.ammo.current.value'] = Math.max(0, this.system.ammo.spare_clips.value - 1);
        }
        
        await this.update(updateData);


        // Reduce capacity in whatever equipped nested ammunition item.
        // TODO: This must be the other way around. Reduce equipped ammo first and only reload what's possible to the weapon item.
        //       Additionally there needs to be a reload clip mechanism equipping / unequipping clips/mags
        const newAmmunition = (this.items || [])
            .filter((i) => i.type === 'ammo')
            .reduce((acc: AmmoItemData[], item: SR5Item) => {
                //@ts-ignore // TODO: foundry-vtt-types v10 
                // Not-equipped ammunition isn't expected to be consumed.
                if (item.data && item.data.system.technology.equipped) {

                    const itemData = item.toObject() as AmmoItemData;
                    //@ts-ignore // TODO: foundry-vtt-types v10 
                    const qty = typeof itemData.system.technology.quantity === 'string' ? 0 : itemData.system.technology.quantity;

                    // Inform user about missing rounds.
                    if (qty - diff < 0) {
                        ui.notifications?.warn('SR5.Warnings.CantConsumeEquippedAmmo', {localize: true})
                    }
                    
                    //@ts-ignore // TODO: foundry-vtt-types v10 
                    itemData.system.technology.quantity = Math.max(0, qty - diff);
                    acc.push(itemData);
                }
                
                return acc;
            }, []);

        if (newAmmunition && newAmmunition.length) {
            await this.updateNestedItems(newAmmunition);

            // Inform user about change to equipped ammo.
            ui.notifications?.info('SR5.Infos.ConsumedEquippedAmmo', {localize: true});
        }
    }

    async equipNestedItem(id: string, type: string, options: {unequipOthers?: boolean, toggle?: boolean}={}) {
        const unequipOthers = options.unequipOthers || false;
        const toggle = options.toggle || false;

        // Collect all item data and update at once.
        const updateData: Record<any, any>[] = [];
        const ammoItems = this.items.filter(item => item.type === type);
            
        for (const item of ammoItems) {
            if (!unequipOthers && item.id !== id) continue;
            //@ts-ignore TODO: foundry-vtt-types v10
            const equip = toggle ? !item.system.technology.equipped : id === item.id;

            updateData.push({_id: item.id, 'system.technology.equipped': equip});
        }

        if (updateData) await this.updateNestedItems(updateData);
    }

    /**
     * Equip one ammo item exclusivley.
     * 
     * @param id Item id of the to be exclusivley equipped ammo item.
     */
    async equipAmmo(id) {
        await this.equipNestedItem(id, 'ammo', {unequipOthers: true});
    }

    async addNewLicense() {
        if (this.type !== 'sin') return;

        // NOTE: This might be related to Foundry data serialization sometimes returning arrays as ordered HashMaps...
        //@ts-ignore TODO: foundry-vtt-types v10
        const licenses = foundry.utils.getType(this.system.licenses) === 'Object' ? 
            //@ts-ignore TODO: foundry-vtt-types v10
            Object.values(this.system.licenses) :
            //@ts-ignore TODO: foundry-vtt-types v10
            this.system.licenses;
        
        // Add the new license to the list
        licenses.push({
            name: '',
            rtg: '',
            description: '',
        });

        await this.update({'system.licenses': licenses});
    }

    getRollPartsList(): ModList<number> {
        // we only have a roll if we have an action or an actor
        const action = this.getAction();
        if (!action || !this.actor) return [];

        // @ts-ignore
        const parts = new PartsList(duplicate(this.getModifierList()));

        const skill = this.actor.findActiveSkill(this.getActionSkill());
        const attribute = this.actor.findAttribute(this.getActionAttribute());
        const attribute2 = this.actor.findAttribute(this.getActionAttribute2());

        if (attribute && attribute.label) parts.addPart(attribute.label, attribute.value);

        // if we have a valid skill, don't look for a second attribute
        if (skill) {
            parts.addUniquePart(skill.label || skill.name, skill.value);
            SkillFlow.handleDefaulting(skill, parts);
        }
        else if (attribute2 && attribute2.label) {
            parts.addPart(attribute2.label, attribute2.value);
        }

        const spec = this.getActionSpecialization();
        if (spec) parts.addUniquePart(spec, 2);

        //@ts-ignore parseInt does allow for number type parameter. // TODO: foundry-vtt-types v10
        const mod = parseInt(this.system.action.mod || 0);
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

    asSinData(): SinItemData | undefined {
        if (this.isSin()) {
            //@ts-ignore TODO: foundry-vtt-types v10
            return this.data as SinItemData;
        }
    }

    isLifestyle(): boolean {
        return this.wrapper.isLifestyle();
    }

    asLifestyleData(): LifestyleItemData | undefined {
        if (this.isLifestyle()) {
            //@ts-ignore TODO: foundry-vtt-types v10
            return this.data as LifestyleItemData;
        }
    }

    isAmmo(): boolean {
        return this.wrapper.isAmmo();
    }

    asAmmoData(): AmmoItemData | undefined {
        if (this.isAmmo()) {
            //@ts-ignore TODO: foundry-vtt-types v10
            return this.data as AmmoItemData;
        }
    }

    isModification(): boolean {
        return this.wrapper.isModification();
    }

    asModificationData(): ModificationItemData | undefined {
        if (this.isModification()) {
            //@ts-ignore TODO: foundry-vtt-types v10
            return this.data as ModificationItemData;
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

    asProgramData(): ProgramItemData | undefined {
        if (this.isProgram()) {
            //@ts-ignore TODO: foundry-vtt-types v10
            return this.data as ProgramItemData;
        }
    }

    isQuality(): boolean {
        return this.wrapper.isQuality();
    }

    asQualityData(): QualityItemData | undefined {
        if (this.isQuality()) {
            //@ts-ignore TODO: foundry-vtt-types v10
            return this.data as QualityItemData;
        }
    }

    isAdeptPower(): boolean {
        return this.type === 'adept_power';
    }

    asAdeptPowerData(): AdeptPowerItemData|undefined {
        if (this.isAdeptPower())
        //@ts-ignore TODO: foundry-vtt-types v10
            return this.data as AdeptPowerItemData;
    }


    isHost(): boolean {
        return this.type === 'host';
    }

    asHostData(): HostItemData|undefined {
        if (this.isHost()) {
            //@ts-ignore TODO: foundry-vtt-types v10
            return this.data as HostItemData;
        }
    }

    /**
     * SIN Item - remove a single license within this SIN
     * 
     * @param index The license list index
     */
    async removeLicense(index) {
        if (this.type !== 'sin') return;

        //@ts-ignore TODO: foundry-vtt-types v10
        const licenses = this.system.licenses.splice(index, 1);
        await this.update({'system.licenses': licenses});
    }

    isAction(): boolean {
        return this.wrapper.isAction();
    }

    asActionData(): ActionItemData | undefined {
        if (this.isAction()) {
            //@ts-ignore TODO: foundry-vtt-types v10
            return this.data as ActionItemData;
        }
    }



    async rollOpposedTest(target: SR5Actor, attack: AttackData, event):  Promise<void> {
        console.error(`Shadowrun5e | ${this.constructor.name}.rollOpposedTest is not supported anymore`);
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
     * The item can be stored on a token on the current or another, given, scene.
     *
     * The chat message must contain a data attribute containing a 'SceneId.TokenId' mapping.
     * See chat.ts#getTokenSceneId for further context.
     *
     *
     * @param html
     */
    static getItemFromMessage(html): SR5Item | undefined {
        if (!game || !game.scenes || !game.ready || !canvas || !canvas.ready || !canvas.scene) return;

        const card = html.find('.chat-card');
        let actor;
        const sceneTokenId = card.data('tokenId');
        if (sceneTokenId) actor = Helpers.getSceneTokenActor(sceneTokenId);
        else actor = game.actors?.get(card.data('actorId'));

        if (!actor) return;
        const itemId = card.data('itemId');
        return actor.items.get(itemId);
    }

    static getTargets() {
        if (!game.ready || !game.user) return;
        const { character } = game.user;
        // @ts-ignore
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

    getActionResult(): ActionResultData|undefined {
        if (!this.isAction()) return;

        return this.wrapper.getActionResult();
    }

    /**
     * Create an item in this item
     * @param itemData
     * @param options
     * 
     * //@ts-ignore TODO: foundry-vtt-types v10 Rework method...
     */
    async createNestedItem(itemData, options = {}) {
        if (!Array.isArray(itemData)) itemData = [itemData];
        // weapons accept items
        if (this.type === 'weapon') {
            const currentItems = duplicate(this.getNestedItems());

            itemData.forEach((ogItem) => {
                const item = duplicate(ogItem);
                item._id = randomID(16);
                if (item.type === 'ammo' || item.type === 'modification') {
                    if (item?.system?.technology?.equipped) {
                        item.system.technology.equipped = false;
                    }
                    currentItems.push(item);
                }
            });

            await this.setNestedItems(currentItems);
        }
        this.prepareNestedItems();
        this.prepareData();
        this.render(false);

        return true;
    }

    /**
     * Prepare embeddedItems
     */
    prepareNestedItems() {
        this.items = this.items || [];
        
        const items = this.getNestedItems();
        if (!items) return;

        // Reduce items to id:item HashMap style
        const loaded = this.items.reduce((object, item) => {
            object[item.id as string] = item;
            return object;
        }, {});

        // Merge and overwrite existing owned items with new changes.
        const tempItems = items.map((item) => {
            // Set user permissions to owner, to allow none-GM users to edit their own nested items.
            const data = game.user ? {ownership: {[game.user.id]: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER}} :
                                     {};
            item = mergeObject(item, data);

            // Case: MODIFY => Update existing item.
            if (item._id in loaded) {
                const currentItem = loaded[item._id];
                
                // Update DocumentData directly, since we're not really having database items here.
                currentItem.updateSource(item);
                currentItem.prepareData();
                return currentItem;

            // Case: CREATE => Create new item.
            } else {
                // NOTE: It's important to deliver the item as the item parent document, even though this is meant for actor owners.
                //       The legacy approach for embeddedItems (within another item) relies upon this.actor
                //       returning an SR5Item instance to call .updateEmbeddedEntities, while Foundry expects an actor
                return new SR5Item(item, {parent: this as unknown as SR5Actor});
            }
        });

        this.items = tempItems;
    }

    // TODO: Rework to either use custom embeddedCollection or Map
    getOwnedItem(itemId): SR5Item | undefined {
        const items = this.items;
        if (!items) return;
        return items.find((item) => item.id === itemId);
    }

    // TODO: Rework this method. It's complicated and obvious optimizations can be made. (find vs findIndex)
    async updateNestedItems(changes) {
        const items = duplicate(this.getNestedItems());
        if (!items) return;
        changes = Array.isArray(changes) ? changes : [changes];
        if (!changes || changes.length === 0) return;
        changes.forEach((itemChanges) => {
            const index = items.findIndex((i) => i._id === itemChanges._id);
            if (index === -1) return;
            const item = items[index];

            // TODO: The _id field has been added by the system. Even so, don't change the id to avoid any byproducts.
            delete itemChanges._id;

            if (item) {
                itemChanges = expandObject(itemChanges);
                mergeObject(item, itemChanges);
                items[index] = item;
                // this.items[index].data = items[index];
            }
        });

        await this.setNestedItems(items);
        this.prepareNestedItems();
        this.prepareData();
        this.render(false);
        return true;
    }

    /**
     * This method hooks into the Foundry Item.update approach and is called using this<Item>.actor.updateEmbeddedEntity.
     *
     * @param embeddedName
     * @param data
     * @param options
     */
    // @ts-ignore
    async updateEmbeddedEntity(embeddedName, data, options?): Promise<any> {
        await this.updateNestedItems(data);
        return this;
    }

    /**
     * Remove an owned item
     * @param deleted
     * @returns {Promise<boolean>}
     */
    async deleteOwnedItem(deleted) {
        const items = duplicate(this.getNestedItems());
        if (!items) return;

        const idx = items.findIndex((i) => i._id === deleted || Number(i._id) === deleted);
        if (idx === -1) throw new Error(`Shadowrun5e | Couldn't find owned item ${deleted}`);
        items.splice(idx, 1);
        // we need to clear the items when one is deleted or it won't actually be deleted
        await this.clearNestedItems();
        await this.setNestedItems(items);
        await this.prepareNestedItems();
        await this.prepareData();
        await this.render(false);
        return true;
    }

    async openPdfSource() {
        // Check for pdfpager module hook: https://github.com/farling42/fvtt-pdf-pager
        if (!ui['pdfpager']) {
            ui.notifications?.warn('SR5.DIALOG.MissingModuleContent', {localize: true});
            return;
        }

        const source = this.getBookSource();
        if (source === '') {
            ui.notifications?.error('SR5.SourceFieldEmptyError', {localize: true});
        }

        const [code, page] = source.split(' ');

        //@ts-ignore
        ui.pdfpager.openPDFByCode(code, { page: parseInt(page) });
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

    getTechnologyData(): TechnologyData|undefined {
        return this.wrapper.getTechnology();
    }

    getRange(): CritterPowerRange|SpellRange|RangeWeaponData|undefined {
        return this.wrapper.getRange();
    }

    getWeaponRange(): RangeWeaponData|undefined {
        if (this.isRangedWeapon())
            return this.getRange() as RangeWeaponData;
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
            return this.name as string;
        }

        return DEFAULT_ROLL_NAME;
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

    asArmorData(): ArmorItemData | undefined {
        if (this.isArmor()) {
            return this.data as ArmorItemData;
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

    //@ts-ignore // TODO: foundry-vtt-types v10
    asWeapon(): WeaponItemData | undefined {
        if (this.wrapper.isWeapon()) {
            return this.data as WeaponItemData;
        }
    }

    isCyberware(): boolean {
        return this.wrapper.isCyberware();
    }

    //@ts-ignore // TODO: foundry-vtt-types v10
    asCyberware(): CyberwareItemData | undefined {
        if (this.isCyberware()) {
            return this.data as CyberwareItemData;
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

    //@ts-ignore // TODO: foundry-vtt-types v10
    asSpell(): SpellItemData | undefined {
        if (this.isSpell()) {
            return this.data as SpellItemData;
        }
    }

    isSpritePower(): boolean {
        return this.wrapper.isSpritePower();
    }

    //@ts-ignore // TODO: foundry-vtt-types v10
    asSpritePower(): SpritePowerItemData | undefined {
        if (this.isSpritePower()) {
            return this.data as SpritePowerItemData;
        }
    }

    isBioware(): boolean {
        return this.wrapper.isBioware();
    }

    isComplexForm(): boolean {
        return this.wrapper.isComplexForm();
    }

    //@ts-ignore // TODO: foundry-vtt-types v10
    asComplexForm(): ComplexFormItemData | undefined {
        if (this.isComplexForm()) {
            return this.data as ComplexFormItemData;
        }
    }

    isContact(): boolean {
        return this.wrapper.isContact();
    }

    //@ts-ignore // TODO: foundry-vtt-types v10
    asContact(): ContactItemData | undefined {
        if (this.isContact()) {
            return this.data as ContactItemData;
        }
    }

    isCritterPower(): boolean {
        return this.wrapper.isCritterPower();
    }

    //@ts-ignore // TODO: foundry-vtt-types v10
    asCritterPower(): CritterPowerItemData | undefined {
        if (this.isCritterPower()) {
            return this.data as CritterPowerItemData;
        }
    }

    isMeleeWeapon(): boolean {
        return this.wrapper.isMeleeWeapon();
    }

    isDevice(): boolean {
        return this.wrapper.isDevice();
    }

    //@ts-ignore // TODO: foundry-vtt-types v10
    asDevice(): DeviceItemData | undefined {
        if (this.isDevice()) {
            return this.data as DeviceItemData;
        }
    }

    //@ts-ignore // TODO: foundry-vtt-types v10
    asController(): HostItemData | DeviceItemData | undefined {
        return this.asHostData() || this.asDevice() || undefined;
    }

    isEquipment(): boolean {
        return this.wrapper.isEquipment();
    }

    //@ts-ignore // TODO: foundry-vtt-types v10
    asEquipment(): EquipmentItemData | undefined {
        if (this.isEquipment()) {
            return this.data as EquipmentItemData;
        }
    }

    isEquipped(): boolean {
        return this.wrapper.isEquipped();
    }

    isCyberdeck(): boolean {
        return this.wrapper.isCyberdeck();
    }

    isCommlink(): boolean {
        return this.wrapper.isCommlink();
    }

    isMatrixAction(): boolean {
        return this.wrapper.isMatrixAction();
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

    getModifierList(): ModList<number> {
        return this.wrapper.getModifierList();
    }

    getActionSpecialization(): string | undefined {
        return this.wrapper.getActionSpecialization();
    }

    get getDrain(): number {
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
            //@ts-ignore // TODO: foundry-vtt-types v10 
            const system = this.system as WeaponData;
            return system.melee.reach ?? 0;
        }
        return 0;
    }

    getCondition(): ConditionData|undefined {
        const technology = this.getTechnologyData();
        if (technology && "condition_monitor" in technology)
            return technology.condition_monitor;
    }

    hasOpposedTest(): boolean {
        if (!this.hasOpposedRoll) return false;
        const action = this.getAction();
        if (!action) return false;
        return action.opposed.test !== '';
    }

    /**
     * A host type item can store IC actors to spawn in order, use this method to add into that.
     * @param id An IC type actor id to fetch the actor with.
     * @param pack Optional pack collection to fetch from
     */
    async addIC(id: string, pack: string|null = null) {
        const hostData = this.asHostData();
        if (!hostData || !id) return;

        // Check if actor exists before adding.
        const actor = (pack ? await Helpers.getEntityFromCollection(pack, id) : game.actors?.get(id)) as SR5Actor;
        if (!actor || !actor.isIC()) {
            console.error(`Provided actor id ${id} doesn't exist (with pack collection '${pack}') or isn't an IC type`);
            return;
        }

        const icData = actor.asIC();
        if (!icData) return;

        // Add IC to the hosts IC order
        const sourceEntity = DefaultValues.sourceEntityData({
            id: actor.id as string,
            name: actor.name as string,
            type: 'Actor',
            pack,
            // Custom fields for IC
            data: {icType: icData.data.icType},
        });
        hostData.data.ic.push(sourceEntity);

        await this.update({'data.ic': hostData.data.ic});
    }

    /**
     * A host type item can contain IC in an order. Use this function remove IC at the said position
     * @param index The position in the IC order to be removed
     */
    async removeIC(index: number) {
        if (isNaN(index) || index < 0) return;

        const hostData = this.asHostData();
        if (!hostData) return;
        if (hostData.data.ic.length <= index) return;

        hostData.data.ic.splice(index, 1);

        await this.update({'data.ic': hostData.data.ic});
    }

    get _isNestedItem(): boolean {
        return this.hasOwnProperty('parent') && this.parent instanceof SR5Item;
    }

    /**
     * Hook into the Item.update process for embedded items.
     *
     * @param data changes made to the SR5ItemData
     */
    async updateNestedItem(data): Promise<this> {
        if (!this.parent || this.parent instanceof SR5Actor) return this;
        // Inform the parent item about changes to one of it's embedded items.
        // TODO: updateOwnedItem needs the id of the update item. hand the item itself over, to the hack within updateOwnedItem for this.
        data._id = this.id;

        // Shadowrun Items can contain other items, while Foundry Items can't. Use the system local implementation for items.
        // @ts-ignore
        await this.parent.updateNestedItems(data);

        // After updating all item embedded data, rerender the sheet to trigger the whole rerender workflow.
        // Otherwise changes in the template of an hiddenItem will show for some fields, while not rerendering all
        // #if statements (hidden fields for other values, won't show)
        await this.sheet?.render(false);

        return this;
    }

    async update(data, options?): Promise<this> {
        // Item.item => Embedded item into another item!
        if (this._isNestedItem) {
            return this.updateNestedItem(data);
        }

        // Actor.item => Directly owned item by an actor!
        // @ts-ignore
        return await super.update(data, options);
    }

    /**
     * Place a Matrix Mark for this Item.
     *
     * @param target The Document the marks are placed on. This can be an actor (character, technomancer, IC) OR an item (Host)
     * @param marks Amount of marks to be placed.
     * @param options Additional options that may be needed.
     * @param options.scene The scene the targeted actor lives on.
     * @param options.item
     *
     * TODO: It might be useful to create a 'MatrixDocument' class sharing matrix methods to avoid duplication between
     *       SR5Item and SR5Actor.
     */
    async setMarks(target: Token, marks: number, options?: {scene?: Scene, item?: Item, overwrite?: boolean}) {
        if (!canvas.ready) return;

        if (!this.isHost()) {
            console.error('Only Host item types can place matrix marks!');
            return;
        }

        // Both scene and item are optional.
        const scene = options?.scene || canvas.scene as Scene;
        const item = options?.item;

        // Build the markId string. If no item has been given, there still will be a third split element.
        // Use Helpers.deconstructMarkId to get the elements.
        const markId = Helpers.buildMarkId(scene.id as string, target.id, item?.id as string);
        const hostData = this.asHostData();

        if (!hostData) return;

        const currentMarks = options?.overwrite ? 0 : this.getMarksById(markId);
        hostData.data.marks[markId] = MatrixRules.getValidMarksCount(currentMarks + marks);

        await this.update({'data.marks': hostData.data.marks});
    }

    getMarksById(markId: string): number {
        const hostData = this.asHostData();
        return hostData ? hostData.data.marks[markId] : 0;
    }

    getAllMarks(): MatrixMarks|undefined {
        const hostData = this.asHostData();
        if (!hostData) return;
        return hostData.data.marks;
    }

    /**
     * Receive the marks placed on either the given target as a whole or one it's owned items.
     *
     * @param target
     * @param item
     * @param options
     *
     * TODO: Check with technomancers....
     *
     * @return Will always return a number. At least zero, for no marks placed.
     */
    getMarks(target: SR5Actor, item?: SR5Item, options?: {scene?: Scene}): number {
        if (!canvas.ready) return 0;
        if (!this.isHost()) return 0;

        // Scene is optional.
        const scene = options?.scene || canvas.scene as Scene;
        item = item || target.getMatrixDevice();

        const markId = Helpers.buildMarkId(scene.id as string, target.id as string, item?.id as string);
        const hostData = this.asHostData();

        if (!hostData) return 0

        return hostData.data.marks[markId] || 0;
    }

    /**
     * Remove ALL marks placed by this item.
     *
     * TODO: Allow partial deletion based on target / item
     */
    async clearMarks() {
        if (!this.isHost()) return;

        const hostData = this.asHostData();

        if (!hostData) return;

        // Delete all markId properties from ActorData
        const updateData = {}
        for (const markId of Object.keys(hostData.data.marks)) {
            updateData[`-=${markId}`] = null;
        }

        await this.update({'data.marks': updateData});
    }

    /**
     * Remove ONE mark. If you want to delete all marks, use clearMarks instead.
     */
    async clearMark(markId: string) {
        if (!this.isHost()) return;

        const updateData = {}
        updateData[`-=${markId}`] = null;

        await this.update({'data.marks': updateData});
    }

    /**
     * Configure the given matrix item to be controlled by this item in a PAN/WAN.
     * @param target The matrix item to be connected.
     */
    async addNetworkDevice(target: SR5Item) {
        // TODO: Add device to WAN network
        // TODO: Add IC actor to WAN network
        // TODO: setup networkController link on networked devices.
        await NetworkDeviceFlow.addDeviceToNetwork(this, target);
    }

    /**
     * Alias method for addNetworkDevice, both do the same.
     * @param target
     */
    async addNetworkController(target: SR5Item) {
        await this.addNetworkDevice(target);
    }

    async removeNetworkDevice(index: number) {
        const controllerData = this.asController();
        if (!controllerData) return;

        // Convert the index to a device link.
        if (controllerData.data.networkDevices[index] === undefined) return;
        const networkDeviceLink = controllerData.data.networkDevices[index];
        const controller = this;
        return await NetworkDeviceFlow.removeDeviceLinkFromNetwork(controller, networkDeviceLink);
    }

    async removeAllNetworkDevices() {
        const controllerData = this.asController();
        if (!controllerData) return;

        return await NetworkDeviceFlow.removeAllDevicesFromNetwork(this);
    }

    getAllMarkedDocuments(): MarkedDocument[] {
        if (!this.isHost()) return [];

        const marks = this.getAllMarks();
        if (!marks) return [];

        // Deconstruct all mark ids into documents.
        // @ts-ignore
        return Object.entries(marks)
            .filter(([markId, marks]) => Helpers.isValidMarkId(markId))
            .map(([markId, marks]) => ({
                ...Helpers.getMarkIdDocuments(markId),
                marks,
                markId
            }))
    }

    /**
     * Return the network controller item when connected to a PAN or WAN.
     */
    get networkController(): SR5Item | undefined {
        const technologyData = this.getTechnologyData();
        if (!technologyData) return;
        if (!technologyData.networkController) return;

        return NetworkDeviceFlow.resolveLink(technologyData.networkController) as SR5Item;
    }

    /**
     * Return all network device items within a possible PAN or WAN.
     */
    get networkDevices(): SR5Item[] {
        const controllerData = this.asDevice() || this.asHostData();
        if (!controllerData) return [];

        return NetworkDeviceFlow.getNetworkDevices(this);
    }

    /**
     * Only devices can control a network.
     */
    get canBeNetworkController(): boolean {
        return this.isDevice() || this.isHost();
    }

    /**
     * Assume all items with that are technology (therefore have a rating) are active matrix devices.
     */
    get canBeNetworkDevice(): boolean {
        const technologyData = this.getTechnologyData();
        return !!technologyData;
    }

    /**
     * Disconnect any kind of item from a PAN or WAN.
     */
    async disconnectFromNetwork() {
        if (this.canBeNetworkController) await NetworkDeviceFlow.removeAllDevicesFromNetwork(this);
        if (this.canBeNetworkDevice) await NetworkDeviceFlow.removeDeviceFromController(this);
    }

    async _onCreate(changed, options, user) {
        const applyData = {};
        //@ts-ignore
        Helpers.injectActionTestsIntoChangeData(this.type, changed, applyData);
        await super._preCreate(changed, options, user);

        // Don't kill DocumentData by applying empty objects. Also performance.
        //@ts-ignore // TODO: foundry-vtt-types v10
        if (!foundry.utils.isEmpty(applyData)) this.update(applyData);
    }

    /**
     * Make sure all item data is in a persistent and valid status.
     *
     * This is preferred to altering data on the fly in the prepareData methods flow.
     */
     async _preUpdate(changed, options, user) {
        // Change used action test implementation when necessary.
        Helpers.injectActionTestsIntoChangeData(this.type, changed, changed);
        await super._preUpdate(changed, options, user);
    }
}
