import { RangedWeaponRules } from './../rules/RangedWeaponRules';
import { SR5Actor } from '../actor/SR5Actor';
import { createItemChatMessage } from '../chat';
import { DEFAULT_ROLL_NAME, FLAGS, SYSTEM_NAME } from '../constants';
import { DataDefaults } from "../data/DataDefaults";
import { SR5ItemDataWrapper } from '../data/SR5ItemDataWrapper';
import { Helpers } from '../helpers';
import { PartsList } from '../parts/PartsList';
import { MatrixRules } from "../rules/MatrixRules";
import { TestCreator } from "../tests/TestCreator";
import { ChatData } from './ChatData';
import { NetworkDeviceFlow } from "./flows/NetworkDeviceFlow";
import { HostDataPreparation } from "./prep/HostPrep";
import ModList = Shadowrun.ModList;
import AttackData = Shadowrun.AttackData;
import FireModeData = Shadowrun.FireModeData;
import SpellForceData = Shadowrun.SpellForceData;
import ComplexFormLevelData = Shadowrun.ComplexFormLevelData;
import FireRangeData = Shadowrun.FireRangeData;
import ConditionData = Shadowrun.ConditionData;
import AmmoData = Shadowrun.AmmoData;
import RangeWeaponData = Shadowrun.RangeWeaponData;
import SpellRange = Shadowrun.SpellRange;
import CritterPowerRange = Shadowrun.CritterPowerRange;
import ActionTestLabel = Shadowrun.ActionTestLabel;
import MatrixMarks = Shadowrun.MatrixMarks;
import RollEvent = Shadowrun.RollEvent;
import { LinksHelpers } from '../utils/links';
import { TechnologyPrep } from './prep/functions/TechnologyPrep';
import { SinPrep } from './prep/SinPrep';
import { ActionPrep } from './prep/functions/ActionPrep';
import { RangePrep } from './prep/functions/RangePrep';
import { AdeptPowerPrep } from './prep/AdeptPowerPrep';

/**
 * WARN: I don't know why, but removing the usage of ActionResultFlow from SR5Item
 * causes esbuild (I assume) to re-order import dependencies resulting in vastly different orders of execution within transpiled bundle.js code, 
 * resulting OpposedTest not finding SuccessTest (undefined) when extending it.
 * 
 * ... I'd love to remove this, or even just comment it, but tree-shaking will do it's job.
 * 
 * Should you read this: Try it anyway and open any actor sheet. If it's not broken, the build issue must've been fixed somehow.
 * 
 * An esbuild update might fix this, but caused other issues at the time... Didn't fix it with esbuild@0.15.14 (20.11.2022)
 * NOTE: still not fixed with esbuild@0.19.5
 */
import { ActionResultFlow } from './flows/ActionResultFlow';
import { UpdateActionFlow } from './flows/UpdateActionFlow';
import { ActionResultType, ActionRollType } from '../types/item/ActionModel';

ActionResultFlow; // DON'T TOUCH!

export type SystemTechnologyItem = 'ammo' | 'armor' | 'device' | 'equipment' | 'modification' | 'program' | 'sin' | 'bioware' | 'cyberware' | 'weapon';
export type SystemItem = SystemTechnologyItem | 'adept_power' | 'action' | 'call_in_action' | 'complex_form' | 'contact' | 'critter_power' | 'echo' | 'host' | 'lifestyle' | 'quality' | 'sprite_power' | 'spell';

/**
 * Implementation of Shadowrun5e items (owned, unowned and nested).
 *
 *       tamIf here: The current legacy nested items approach has been cleaned up a bit but is still causing some issues
 *       with typing and ease of use.
 *
 *       SR5Item.items currently overwrites foundries internal DocumentCollection mechanism of nested documents. Partially
 *       due to legacy reasons and since Foundry 0.8 SR5Item.update can't be used for nested items in items anymore.
 *
 *        At the moment this means, that this.actor can actually be an SR5Actor as well as an SR5Item, depending on who
 *       'owns' the nested item as they are created using Item.createOwned during the nested item prep phase.
 *
 *       For this reason SR5Item.actorOwner has been introduced to allow access to the actual owning actor, no matter
 *       how deep nested into other items an item is.
 *
 *       Be wary of SR5Item.actor for this reason!
 */
export class SR5Item<SubType extends SystemItem = SystemItem> extends Item<SubType> {
    // Item.items isn't the Foundry default ItemCollection but is overwritten within prepareNestedItems
    // to allow for embedded items in items in actors.
    items: SR5Item[] = [];

    // Item Sheet labels for quick info on an item dropdown.
    labels: {} = {};

    /**
     * Return the owner of this item, which can either be
     * - an actor instance (Foundry default)
     * - an item instance (shadowrun custom) for embedded items
     *
     * If you need the actual actor owner, no matter how deep into item embedding, this current item is use SR5item.actorOwner
     */
    override get actor(): SR5Actor {
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
        //@ts-expect-error
        return this.actor.actorOwner;
    }

    private get wrapper(): SR5ItemDataWrapper {
        // we need to cast here to unknown first to make ts happy
        return new SR5ItemDataWrapper(this);
    }

    // Flag Functions
    getLastFireMode(): FireModeData {
        return this.flags[game.system.id]?.lastFireMode || DataDefaults.fireModeData();
    }
    async setLastFireMode(fireMode: FireModeData) {
        return this.flags[game.system.id]!.lastFireMode = fireMode;
    }
    getLastSpellForce(): SpellForceData {
        return this.flags[game.system.id]?.lastSpellForce || { value: 0 };
    }
    async setLastSpellForce(force: SpellForceData) {
        return this.flags[game.system.id]!.lastSpellForce = force;
    }
    getLastComplexFormLevel(): ComplexFormLevelData {
        return this.flags[game.system.id]?.lastComplexFormLevel || { value: 0 };
    }
    async setLastComplexFormLevel(level: ComplexFormLevelData) {
        return this.flags[game.system.id]!.lastComplexFormLevel = level;
    }
    getLastFireRangeMod(): FireRangeData {
        return this.flags[game.system.id]?.lastFireRange || { value: 0 };
    }
    async setLastFireRangeMod(environmentalMod: FireRangeData) {
        return this.flags[game.system.id]!.lastFireRange = environmentalMod;
    }

    /**
     * Return an Array of the Embedded Item Data
     */
    getNestedItems(): any[] {
        let items = this.flags[game.system.id]?.embeddedItems;

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
    setNestedItems(items: any[]) {
        // clear the flag first to remove the previous items - if we don't do this then it doesn't actually "delete" any items
        // await this.unsetFlag(SYSTEM_NAME, 'embeddedItems');
        this.flags[game.system.id]!.embeddedItems = items;
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

    /**
     * Determine if a blast area should be placed using FoundryVTT area templates.
     */
    get hasBlastTemplate(): boolean {
        return this.isAreaOfEffect();
    }

    /**
     * PREPARE DATA CANNOT PULL FROM this.actor at ALL
     * - as of foundry v0.7.4, actor data isn't prepared by the time we prepare items
     * - this caused issues with Actions that have a Limit or Damage attribute and so those were moved
     */
    override prepareData() {
        super.prepareData();
        this.prepareNestedItems();

        // Description labels might have changed since last data prep.
        // NOTE: this here is likely unused and heavily legacy.
        this.labels = {};

        // Collect the equipped modifying nested items.
        const equippedMods = this.getEquippedMods();
        const equippedAmmo = this.getEquippedAmmo();

        const technology = this.getTechnologyData();
        if (technology) {
            TechnologyPrep.prepareConditionMonitor(technology);
            TechnologyPrep.prepareConceal(technology, equippedMods);
        }

        const action = this.getAction();
        if (action) {
            ActionPrep.prepareData(action, this, equippedMods, equippedAmmo);
        }

        if (this.isRangedWeapon() && this.system.range.rc) {
            RangePrep.prepareData(this.system.range, equippedMods);
        }

        // Switch item data preparation between types...
        // ... this is ongoing work to clean up SR5item.prepareData
        if (this.isType('host'))
            HostDataPreparation(this.system);
        else if (this.isType('adept_power'))
            AdeptPowerPrep.prepareBaseData(this.system);
        else if (this.isType('sin'))
            SinPrep.prepareBaseData(this.system);
    }

    async postItemCard() {
        const options = {
            actor: this.actor,
            description: await this.getChatData(),
            item: this,
            previewTemplate: this.hasBlastTemplate,
            tests: this.getActionTests()
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
        let dontRollTest = TestCreator.shouldPostItemDescription(event);
        if (dontRollTest) return await this.postItemCard();
        
        // Should be right here so that TestCreator.shouldPostItemDescription(event); can prevent execution beforehand. 
        if (!Hooks.call('SR5_CastItemAction', this)) return; 

        dontRollTest = !this.hasRoll;

        if (dontRollTest) return await this.postItemCard();

        if (!this.actor) return;

        const showDialog = !TestCreator.shouldHideDialog(event);
        const test = await TestCreator.fromItem(this, this.actor, { showDialog });
        if (!test) return;
        await test.execute();
    }

    /**
     * Create display only information for this item. Used on sheets, chat messages and more.
     * Both actor and item sheets.
     * 
     * The original naming leans on the dnd5e systems use of it for chat messages.
     * NOTE: This is very legacy, difficult to read and should be improved upon.
     * 
     * @param htmlOptions 
     * @returns 
     */
    async getChatData(htmlOptions = {}) {
        const system = foundry.utils.duplicate(this.system) as Item.SystemOfType<SystemItem>;
        const { labels } = this;
        if (!system.description) system.description = { chat: '', source: '', value: '' };
        // TextEditor.enrichHTML will return null as a string, making later handling difficult.
        if (!system.description.value) system.description.value = '';
        system.description.value = await TextEditor.enrichHTML(system.description.value, { ...htmlOptions });

        const props = [];
        // Add additional chat data fields depending on item type.
        const chatDataForItemType = ChatData[this.type];
        if (chatDataForItemType) chatDataForItemType(system, labels, props, this);

        //@ts-expect-error TODO: foundry-vtt-types v10
        system.properties = props.filter((p) => !!p);

        return system;
    }

    getActionTestName(): string {
        const testName = this.getRollName();
        return testName ? testName : game.i18n.localize('SR5.Action');
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

    getBlastData(actionTestData?: any): { radius: number, dropoff: number } | undefined {
        if (this.isType('spell') && this.isAreaOfEffect()) {
            // By default spell distance is equal to it's Force.
            let distance = this.getLastSpellForce().value;

            // Except for predefined user test selection.
            if (actionTestData?.spell) {
                distance = actionTestData.spell.force;
            }

            // Extended spells have a longer range.
            if (this.system.extended) distance *= 10;

            return {
                radius: distance,
                dropoff: 0
            }

        } else if (this.isGrenade()) {
            return {
                radius: this.system.thrown.blast.radius,
                dropoff: this.system.thrown.blast.dropoff
            };
        } else if (this.hasExplosiveAmmo) {
            const item = this.getEquippedAmmo();
            const ammo = item?.asType('ammo');

            if (!ammo) return { radius: 0, dropoff: 0 };

            const distance = ammo.system.blast.radius;
            const dropoff = ammo.system.blast.dropoff;

            return {
                radius: distance,
                dropoff
            };
        }
        return undefined;
    }

    getEquippedAmmo(): SR5Item<'ammo'> | undefined {
        const equippedAmmos = (this.items || [])
            .filter((item) => item.isType('ammo') && item.isEquipped()) as SR5Item<'ammo'>[];

        // Cast Typing isn't a mistake, so long as isAmmo is filtered.
        return equippedAmmos[0];
    }

    getEquippedMods(): SR5Item<'modification'>[] {
        return this.items.filter((item) => item.isWeaponModification() && item.isEquipped()) as SR5Item<'modification'>[];
    }

    get hasExplosiveAmmo(): boolean {
        const ammo = this.getEquippedAmmo();
        if (!ammo) return false;
        const system = ammo.system as AmmoData;
        return system.blast.radius > 0;
    }

    /**
     * Toggle equipment state of a single Modification item.
     * @param iid Modification item id to be equip toggled
     */
    async equipWeaponMod(iid) {
        await this.equipNestedItem(iid, 'modification', { unequipOthers: false, toggle: true });
    }

    /**
     * Check if weapon has enough ammunition.
     *
     * @param rounds The amount of rounds to be fired
     * @returns Either the weapon has no ammo at all or not enough.
     */
    hasAmmo(rounds: number = 0): boolean {
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
        if (!this.isType('weapon')) return;

        const value = Math.max(0, this.system.ammo.current.value - fired);
        return await this.update({ system: { ammo: { current: { value } } } });
    }

    /**
     * Can this item (weapon, melee, ranged, whatever) use ammunition?
     * 
     * @returns true, for weapons with ammunition.
     */
    usesAmmo(): boolean {
        if (this.isType('weapon'))
            return Boolean(this.system.ammo.current.max);
        return false;
    }

    /**
     * Reload this weapon according to information in:
     * - its current clips
     * - its available spare clips (when given)
     * - its equipped ammo
     * 
     * This method will only reload the weapon to the max amount of ammo available.
     * 
     * TODO: Currently only the minimal amount of bullets is reloaded. For weapons using ejectable clips, this should be full clip capacity.
     */
    async reloadAmmo(partialReload: boolean) {
        const weapon = this.asType('weapon');
        if (!weapon) return;

        // Prepare reloading by getting ammunition information.
        const ammo = this.getEquippedAmmo()!;
        const ammoItems = this.items.filter(item => item.isType('ammo')).length;

        const remainingBullets = weapon.system.ammo.current.value;
        // Don't adhere to clip sizes, only reload from the point of capacity left.
        const missingBullets = Math.max(0, weapon.system.ammo.current.max - remainingBullets);
        // This checks how many rounds are required for a partial reload.
        const partialReloadBulletsNeeded = Math.min(weapon.system.ammo.current.max - remainingBullets, RangedWeaponRules.partialReload(weapon.system.ammo.clip_type, this.actor.getAttribute('agility').value));
        // If there aren't ANY ammo items, just use weapon max as to not enforce ammo onto users without.
        const availableBullets = ammoItems > 0 ? Number(ammo.system.technology?.quantity) : weapon.system.ammo.current.max;

        // Validate ammunition and clip availability.
        if (weapon.system.ammo.spare_clips.value === 0 && weapon.system.ammo.spare_clips.max > 0) {
            // Should this ever be enforced, change info to warn.
            ui.notifications?.info("SR5.Warnings.CantReloadWithoutSpareClip", { localize: true });
        }
        if (ammo && Number(ammo.system.technology?.quantity) === 0) {
            ui.notifications?.warn('SR5.Warnings.CantReloadAtAllDueToAmmo', { localize: true });
            return;
        }
        if (ammo && Number(ammo.system.technology?.quantity) < missingBullets) {
            if (partialReload && partialReloadBulletsNeeded !== -1 && Number(ammo.system.technology?.quantity) < partialReloadBulletsNeeded) {
                ui.notifications?.info('SR5.Warnings.CantReloadPartialDueToAmmo', { localize: true });
            } else {
                ui.notifications?.info('SR5.Warnings.CantReloadFullyDueToAmmo', { localize: true });
            }
        }

        // Prepare what can be reloaded.
        const reloadedBullets = Math.min(missingBullets, availableBullets, partialReload ? partialReloadBulletsNeeded : Infinity);

        await this.update({
            system: {
                ammo: {
                    ...(weapon.system.ammo.spare_clips.max > 0
                        ? { spare_clips: { value: Math.max(0, weapon.system.ammo.spare_clips.value - 1) } }
                        : {}),
                    current: { value: remainingBullets + reloadedBullets }
                }
            }
        });

        if (!ammo) return;
        await ammo.update({ system: { technology: { quantity: Math.max(0, Number(ammo.system.technology?.quantity) - reloadedBullets) } } });
    }

    async equipNestedItem(id: string, type: string, options: { unequipOthers?: boolean, toggle?: boolean } = {}) {
        const unequipOthers = options.unequipOthers || false;
        const toggle = options.toggle || false;

        // Collect all item data and update at once.
        const updateData: Record<any, any>[] = [];
        const ammoItems = this.items.filter(item => item.type === type);

        for (const item of ammoItems) {
            if (!unequipOthers && item.id !== id) continue;
            const equip = toggle ? !item.system.technology?.equipped : id === item.id;

            updateData.push({ _id: item.id, 'system.technology.equipped': equip });
        }

        if (updateData) await this.updateNestedItems(updateData);
    }

    /**
     * Equip one ammo item exclusively.
     * 
     * @param id Item id of the to be exclusively equipped ammo item.
     */
    async equipAmmo(id) {
        await this.equipNestedItem(id, 'ammo', { unequipOthers: true });
    }

    async addNewLicense() {
        if (!this.isType('sin')) return;

        // NOTE: This might be related to Foundry data serialization sometimes returning arrays as ordered HashMaps...
        const licenses = foundry.utils.getType(this.system.licenses) === 'Object' ?
            Object.values(this.system.licenses) :
            this.system.licenses;

        if (!licenses) return;

        // Add the new license to the list
        licenses.push({
            name: '',
            rtg: '',
            description: '',
        });

        await this.update({ system: { licenses } });
    }

    isWeaponModification(): this is SR5Item<'modification'> & { system : { type: 'weapon' } } {
        return this.isType('modification') && this.system.type === 'weapon';
    }

    /**
     * SIN Item - remove a single license within this SIN
     * 
     * @param index The license list index
     */
    async removeLicense(index) {
        if (this.isType('sin')) {
            const licenses = this.system.licenses.splice(index, 1);
            await this.update({ system: { licenses } });
        }
    }

    async rollOpposedTest(target: SR5Actor, attack: AttackData, event): Promise<void> {
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
        const { controlled } = canvas.tokens!;
        const targets = controlled.reduce<SR5Actor[]>((arr, t) => t.actor ? [...arr, t.actor] : arr, []);
        if (character instanceof SR5Actor && controlled.length === 0) targets.push(character);
        if (!targets.length) throw new Error(`You must designate a specific Token as the roll target`);
        return targets;
    }

    getActionTests(): ActionTestLabel[] {
        if (!this.hasRoll) return []

        return [{
            label: this.getActionTestName(),
            uuid: this.uuid
        }];
    }

    /**
     * Retrieve the action result for this item if it is of type 'action'.
     * @returns The action result, or undefined if not applicable.
     */
    getActionResult(): ActionResultType | undefined {
        return this.isType('action') ? this.system.result : undefined;
    }

    /**
     * Create an item in this item
     * @param itemData
     * @param options
     * 
     * //@ts-expect-error TODO: foundry-vtt-types v10 Rework method...
     */
    async createNestedItem(itemData, options = {}) {
        if (!Array.isArray(itemData)) itemData = [itemData];
        // weapons accept items
        if (this.type === 'weapon') {
            const currentItems = foundry.utils.duplicate(this.getNestedItems());

            itemData.forEach((ogItem) => {
                const item = foundry.utils.duplicate(ogItem);
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
            const data = game.user ? { ownership: { [game.user.id]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER } } :
                {};
            item = foundry.utils.mergeObject(item, data);

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
                return new SR5Item(item, { parent: this as unknown as SR5Actor });
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
        const items = foundry.utils.duplicate(this.getNestedItems());
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
                foundry.utils.mergeObject(item, itemChanges);
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
        const items = foundry.utils.duplicate(this.getNestedItems());
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

    /**
     * Use the items source field and try different means of opening it.
     */
    async openSource() {
        const source = this.getSource();
        await LinksHelpers.openSource(source);
    }

    get sourceIsUrl(): boolean {
        const source = this.getSource();
        return LinksHelpers.isURL(source);
    }

    get sourceIsPDF(): boolean {
        const source = this.getSource();
        return LinksHelpers.isPDF(source);
    }

    get sourceIsUuid(): boolean {
        const source = this.getSource();
        return LinksHelpers.isUuid(source);
    }

    _canDealDamage(): boolean {
        // NOTE: Double negation to force boolean comparison casting.
        const action = this.getAction();
        if (!action) return false;
        return !!action.damage.type.base;
    }

    getAction(this: SR5Item): ActionRollType | undefined {
        return this.system.action;
    }

    getExtended(): boolean {
        const action = this.getAction();
        if (!action) return false;
        return action.extended;
    }

    getTechnologyData(): Item.SystemOfType<SystemTechnologyItem>['technology'] | undefined {
        const systemTechnologyItems = [
            'ammo', 'armor', 'device', 'equipment', 'modification',
            'program', 'sin', 'bioware', 'cyberware', 'weapon',
        ] as const;
        return this.asType(...systemTechnologyItems)?.system.technology;
    }

    getNetworkController(): string | undefined {
        return this.getTechnologyData()?.networkController;
    }

    async setNetworkController(networkController: string | undefined): Promise<void> {
        await this.update({ system: { technology: { networkController } } });
    }

    getRollName(): string {
        if (this.isRangedWeapon()) {
            return game.i18n.localize('SR5.RangeWeaponAttack');
        }
        if (this.isMeleeWeapon()) {
            return game.i18n.localize('SR5.MeleeWeaponAttack');
        }
        if (this.isCombatSpell) {
            return game.i18n.localize('SR5.Spell.Attack');
        }
        if (this.isType('spell')) {
            return game.i18n.localize('SR5.Spell.Cast');
        }
        if (this.hasRoll) {
            return this.name as string;
        }

        return DEFAULT_ROLL_NAME;
    }

    isType<ST extends SystemItem = SystemItem>(type: ST): this is SR5Item<ST> {
        return this.type === type;
    }

    asType<ST extends readonly SystemItem[]>(...types: ST): SR5Item<ST[number]> | undefined {
        return types.some((t) => this.isType(t)) ? this : undefined;
    }

    /**
     * An attack with this weapon will create an area of effect / blast.
     * 
     * There is a multitude of possibilities as to HOW an item can create an AoE, 
     * both directly connected to the item and / or some of it's nested items.
     * 
     */
    isAreaOfEffect(): boolean {
        return false
            || (this.isType('weapon') && this.system.category === 'thrown' && this.system.thrown.blast.radius > 0)
            || (this.isType('weapon') && (this.getEquippedAmmo()?.system.blast?.radius ?? 0) > 0)
            || (this.isType('spell') && this.system.range === 'los_a')
            || (this.isType('ammo') && this.system.blast.radius > 0);
    }

    isGrenade(): this is SR5Item<'weapon'>  & { system: { category: 'thrown' } } {
        return this.isThrownWeapon() && (this.system.thrown?.blast.radius ?? 0) > 0;
    }

    isThrownWeapon(): this is SR5Item<'weapon'> & { system: { category: 'thrown' } } {
        return this.isType('weapon') && this.system.category === 'thrown';
    }

    isRangedWeapon(): this is SR5Item<'weapon'> & { system: { category: 'ranged' } } {
        return this.isType('weapon') && this.system.category === 'ranged';
    }

    isMeleeWeapon(): this is SR5Item<'weapon'> & { system: { category: 'melee' } } {
        return this.isType('weapon') && this.system.category === 'melee';
    }

    get isCombatSpell(): boolean {
        return this.wrapper.isCombatSpell();
    }

    get isDirectCombatSpell(): boolean {
        return this.wrapper.isDirectCombatSpell();
    }

    get isIndirectCombatSpell(): boolean {
        return this.wrapper.isIndirectCombatSpell();
    }

    get isManaSpell(): boolean {
        return this.wrapper.isManaSpell();
    }

    get isPhysicalSpell(): boolean {
        return this.wrapper.isPhysicalSpell();
    }

    get isUsingRangeCategory(): boolean {
        return this.wrapper.isUsingRangeCategory();
    }

    get isSummoning(): boolean {
        return this.isType('call_in_action') && this.system.actor_type === 'spirit';
    }

    get isCompilation(): boolean {
        return this.isType('call_in_action') && this.system.actor_type === 'sprite';
    }

    /**    
    * Retrieve the actor document linked to this item.
    * e.g.: Contact items provide linked actors
    */
    async getLinkedActor(): Promise<SR5Actor | undefined> {
        const uuid = this.wrapper.getLinkedActorUuid();

        if (uuid && this.isType('contact') && foundry.utils.parseUuid(uuid).documentType === 'Actor')
            return await fromUuid(uuid) as SR5Actor;

        return undefined;
    }

    isEquipped(): boolean {
        return this.wrapper.isEquipped();
    }

    isEnabled(): boolean {
        return this.wrapper.isEnabled();
    }

    isWireless(): boolean {
        return this.wrapper.isWireless();
    }

    isCyberdeck(): boolean {
        return this.wrapper.isCyberdeck();
    }

    isRCC(): boolean {
        return this.wrapper.isRCC();
    }

    isCommlink(): boolean {
        return this.wrapper.isCommlink();
    }

    isMatrixAction(): boolean {
        return this.wrapper.isMatrixAction();
    }

    getSource(): string {
        return this.wrapper.getSource();
    }

    setSource(source: string) {
        //@ts-expect-error
        if (!this.system.description) this.system.description = { chat: '', source: '', value: '' };
        this.update({ system: { description: { source } } });
        this.render(true);
    }

    getConditionMonitor(): ConditionData {
        return this.wrapper.getConditionMonitor();
    }

    getRating(): number {
        return this.wrapper.getRating();
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

    /**
     * Amount of current recoil left after recoil compensation.
     */
    get unhandledRecoil(): number {
        if (!this.isRangedWeapon()) return 0;
        return Math.max(this.actor.recoil() - this.totalRecoilCompensation, 0);
    }

    /**
     * Amount of recoil compensation configured via weapon system data.
     */
    get recoilCompensation(): number {
        if (!this.isRangedWeapon()) return 0;
        return this.wrapper.getRecoilCompensation();
    }

    /**
     * Amount of recoil compensation totally available when using weapon
     * 
     * This includes both actor and item recoil compensation.
     */
    get totalRecoilCompensation(): number {
        if (!this.isRangedWeapon()) return 0;
        return RangedWeaponRules.recoilCompensation(this);
    }

    /**
     * Current TOTAL recoil compensation with current recoil included.
     * 
     * This includes both the items and it's parent actors recoil compensation and total progressive recoil.
     * 
     * @returns A positive number or zero.
     */
    get currentRecoilCompensation(): number {
        if (!this.actor || !this.isRangedWeapon()) return 0;
        return Math.max(this.totalRecoilCompensation - this.actor.recoil(), 0);
    }

    getReach(this: SR5Item): number {
        if (this.isMeleeWeapon())
            return this.system.melee.reach ?? 0;
        return 0;
    }

    getCondition(): Item.SystemOfType<SystemTechnologyItem>['technology']['condition_monitor'] | undefined {
        return this.getTechnologyData()?.condition_monitor;
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
    async addIC(id: string, pack: string | null = null) {
        const host = this.asType('host');
        if (!host || !id) return;

        // Check if actor exists before adding.
        const actor = (pack ? await Helpers.getEntityFromCollection(pack, id) : game.actors?.get(id)) as SR5Actor;
        if (!actor || !actor.isType('ic')) {
            console.error(`Provided actor id ${id} doesn't exist (with pack collection '${pack}') or isn't an IC type`);
            return;
        }

        const icData = actor.asType('ic');
        if (!icData) return;

        // Add IC to the hosts IC order
        const sourceEntity = DataDefaults.sourceItemData({
            id: actor.id as string,
            name: actor.name as string,
            type: 'Actor',
            pack,
            // Custom fields for IC
            // @ts-expect-error foundry-vtt
            system: { icType: icData.system.icType },
        });
        host.system.ic.push(sourceEntity);

        await this.update({ system: { ic: host.system.ic } });
    }

    /**
     * A host type item can contain IC in an order. Use this function remove IC at the said position
     * @param index The position in the IC order to be removed
     */
    async removeIC(index: number) {
        if (isNaN(index) || index < 0) return;

        const host = this.asType('host');
        if (!host) return;
        if (host.system.ic.length <= index) return;

        host.system.ic.splice(index, 1);

        await this.update({ system: { ic: host.system.ic } });
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
        await this.parent.updateNestedItems(data);

        // After updating all item embedded data, rerender the sheet to trigger the whole rerender workflow.
        // Otherwise changes in the template of an hiddenItem will show for some fields, while not rerendering all
        // #if statements (hidden fields for other values, won't show)
        await this.sheet?.render(false);

        return this;
    }

    override async update(data: Item.UpdateData | undefined, options?: Item.Database.UpdateOperation): Promise<this> {
        // Item.item => Embedded item into another item!
        if (this._isNestedItem) {
            return this.updateNestedItem(data);
        }

        // Actor.item => Directly owned item by an actor!
        return (await super.update(data, options))!;
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
    async setMarks(target: Token, marks: number, options?: { scene?: Scene, item?: SR5Item, overwrite?: boolean }) {
        if (!canvas.ready) return;

        if (!this.isType('host')) {
            console.error('Only Host item types can place matrix marks!');
            return;
        }

        // Both scene and item are optional.
        const scene = options?.scene || canvas.scene as Scene;
        const item = options?.item;

        // Build the markId string. If no item has been given, there still will be a third split element.
        // Use Helpers.deconstructMarkId to get the elements.
        const markId = Helpers.buildMarkId(scene.id as string, target.id, item?.id as string);
        const host = this.asType('host');

        if (!host) return;

        const currentMarks = options?.overwrite ? 0 : this.getMarksById(markId);
        host.system.marks[markId] = MatrixRules.getValidMarksCount(currentMarks + marks);

        await this.update({ system: { marks: host.system.marks } });
    }

    getMarksById(markId: string): number {
        const host = this.asType('host');
        return host ? host.system.marks[markId] : 0;
    }

    getAllMarks(): MatrixMarks | undefined {
        const host = this.asType('host');
        if (!host) return;
        return host.system.marks;
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
    getMarks(target: SR5Actor, item?: SR5Item, options?: { scene?: Scene }): number {
        if (!canvas.ready) return 0;
        if (!this.isType('host')) return 0;

        // Scene is optional.
        const scene = options?.scene || canvas.scene as Scene;
        item = item || target.getMatrixDevice();

        const markId = Helpers.buildMarkId(scene.id as string, target.id as string, item?.id as string);
        const host = this.asType('host');

        if (!host) return 0

        return host.system.marks[markId] || 0;
    }

    /**
     * Remove ALL marks placed by this item.
     *
     * TODO: Allow partial deletion based on target / item
     */
    async clearMarks() {
        if (!this.isType('host')) return;

        const host = this.asType('host');

        if (!host) return;

        // Delete all markId properties from ActorData
        const updateData = {}
        for (const markId of Object.keys(host.system.marks)) {
            updateData[`-=${markId}`] = null;
        }

        await this.update({ system: { marks: updateData } });
    }

    /**
     * Remove ONE mark. If you want to delete all marks, use clearMarks instead.
     */
    async clearMark(markId: string) {
        if (!this.isType('host')) return;

        const updateData = {}
        updateData[`-=${markId}`] = null;

        await this.update({ system: { marks: updateData } });
    }

    /**
     * Configure the given matrix item to be controlled by this item in a PAN/WAN.
     * @param target The matrix item to be connected.
     */
    async addNetworkDevice(target: SR5Item | SR5Actor) {
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
        const controllerData = this.asType('host', 'device');
        if (!controllerData) return;

        // Convert the index to a device link.
        if (controllerData.system.networkDevices[index] === undefined) return;
        const networkDeviceLink = controllerData.system.networkDevices[index];
        const controller = this;
        return await NetworkDeviceFlow.removeDeviceLinkFromNetwork(controller, networkDeviceLink);
    }

    async removeAllNetworkDevices() {
        const controllerData = this.asType('host', 'device');
        if (!controllerData) return;

        return await NetworkDeviceFlow.removeAllDevicesFromNetwork(this);
    }

    getAllMarkedDocuments(): Shadowrun.MarkedDocument[] {
        if (!this.isType('host')) return [];

        const marks = this.getAllMarks();
        if (!marks) return [];

        // Deconstruct all mark ids into documents.
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
    async networkController() {
        const technologyData = this.getTechnologyData();
        if (!technologyData) return;
        if (!technologyData.networkController) return;

        return await NetworkDeviceFlow.resolveLink(technologyData.networkController) as SR5Item;
    }

    /**
     * Return all network device items within a possible PAN or WAN.
     */
    async networkDevices() {
        const controller = this.asType('device') || this.asType('host');;
        if (!controller) return [];

        return NetworkDeviceFlow.getNetworkDevices(this);
    }

    /**
     * Only devices can control a network.
     */
    get canBeNetworkController(): boolean {
        return this.isType('device') || this.isType('host');
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

    override async _onCreate(changed, options, user) {
        const applyData = {};
        UpdateActionFlow.injectActionTestsIntoChangeData(this.type, changed, applyData, this);
        await super._preCreate(changed, options, user);

        // Don't kill DocumentData by applying empty objects. Also performance.
        if (!foundry.utils.isEmpty(applyData)) await this.update(applyData);
    }

    /**
     * Make sure all item data is in a persistent and valid status.
     *
     * This is preferred to altering data on the fly in the prepareData methods flow.
     */
    override async _preUpdate(changed, options, user: User) {
        // Some Foundry core updates will no diff and just replace everything. This doesn't match with the
        // differential approach of action test injection. (NOTE: Changing ownership of a document)
        if (options.diff !== false && options.recursive !== false) {
            // Change used action test implementation when necessary.
            UpdateActionFlow.injectActionTestsIntoChangeData(this.type, changed, changed, this);
            UpdateActionFlow.onUpdateAlterActionData(changed, this);
        }

        await super._preUpdate(changed, options, user);
    }
}
