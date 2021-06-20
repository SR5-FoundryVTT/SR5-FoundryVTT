import AttributeField = Shadowrun.AttributeField;
import SkillField = Shadowrun.SkillField;
import ModifiableValue = Shadowrun.ModifiableValue;
import LabelField = Shadowrun.LabelField;
import RangesTemplateData = Shadowrun.RangesTemplateData;
import RangeTemplateData = Shadowrun.RangeTemplateData;
import DamageData = Shadowrun.DamageData;
import ModifiedDamageData = Shadowrun.ModifiedDamageData;
import DamageType = Shadowrun.DamageType;
import DamageElement = Shadowrun.DamageElement;
import {PartsList} from './parts/PartsList';
import {DEFAULT_ID_LENGTH, FLAGS, LENGTH_UNIT, LENGTH_UNIT_TO_METERS_MULTIPLIERS, SR, SYSTEM_NAME} from "./constants";
import {SR5Actor} from "./actor/SR5Actor";
import {DeleteConfirmationDialog} from "./apps/dialogs/DeleteConfirmationDialog";
import { SR5Item } from './item/SR5Item';
import Skills = Shadowrun.Skills;
import {ShadowrunRoll} from "./rolls/ShadowrunRoller";
import {DataDefaults} from "./data/DataDefaults";

interface CalcTotalOptions {
    min?: number,
    max?: number
}

export class Helpers {
    /**
     * Calculate the total value for a data object
     * - stores the total value and returns it
     * @param value
     * @param options min will a apply a minimum value, max will apply a maximum value.
     */
    static calcTotal(value: ModifiableValue, options?: CalcTotalOptions): number {
        if (value.mod === undefined) value.mod = [];
        const parts = new PartsList(value.mod);
        // if a temp field is found, add it as a unique part
        if (value['temp'] !== undefined) {
            parts.addUniquePart('SR5.Temporary', value['temp']);
        }
        // LEGACY: On new actors .base can be undefined, resulting in NaN .value
        const base = value.base || 0;

        value.value = Helpers.roundTo(parts.total + base, 3);
        value.mod = parts.list;

        value.value = Helpers.applyValueRange(value.value, options);

        return value.value;
    }

    /** Round a number to a given degree.
     *
     * @param value Number to round with.
     * @param decimals Amount of decimals after the decimal point.
     */
    static roundTo(value: number, decimals): number {
        const multiplier = Math.pow(10, decimals);
        return Math.round(value * multiplier) / multiplier;
    }

    /** Make sure a given value is in between a range.
     *
     * @param value
     * @param options Define the range the given value must be in (or none)
     */
    static applyValueRange(value: number, options?: CalcTotalOptions): number {
        if (typeof options?.min === 'number') {
            value = Math.max(options.min, value);
        }
        if (typeof options?.max === 'number') {
            value = Math.min(options.max, value);
        }

        return value;
    }

    static listItemId(event) {
        return event.currentTarget.closest('.list-item').dataset.itemId;
    }

    // replace 'SR5.'s on keys with 'SR5_DOT_'
    static onSetFlag(data) {
        if (typeof data !== 'object') return data;
        if (data === undefined || data === null) return data;
        const newData = {};
        for (const [key, value] of Object.entries(data)) {
            const newKey = key.replace('SR5.', 'SR5_DOT_');
            newData[newKey] = this.onSetFlag(value);
        }
        return newData;
    }

    // replace 'SR5_DOT_' with 'SR5.' on keys
    static onGetFlag(data) {
        if (typeof data !== 'object') return data;
        if (data === undefined || data === null) return data;
        const newData = {};
        for (const [key, value] of Object.entries(data)) {
            const newKey = key.replace('SR5_DOT_', 'SR5.');
            newData[newKey] = this.onGetFlag(value);
        }
        return newData;
    }

    static isMatrix(atts?: boolean | (AttributeField | string | SkillField)[] | AttributeField | string | SkillField) {
        if (!atts) return false;
        if (typeof atts === 'boolean') return atts;
        // array of labels to check for on the incoming data
        const matrixLabels = [
            'SR5.MatrixAttrFirewall',
            'SR5.MatrixAttrDataProcessing',
            'SR5.MatrixAttrSleaze',
            'SR5.MatrixAttrAttack',
            'SR5.SkillComputer',
            'SR5.SkillHacking',
            'SR5.SkillCybercombat',
            'SR5.SkillElectronicWarfare',
            'SR5.Software',
        ];
        if (!Array.isArray(atts)) atts = [atts];
        atts = atts.filter((att) => att);
        // iterate over the attributes and return true if we find a matrix att
        for (const att of atts) {
            if (typeof att === 'string') {
                if (matrixLabels.indexOf(att) >= 0) {
                    return true;
                }
            } else if (typeof att === 'object' && (att as LabelField).label !== undefined) {
                if (matrixLabels.indexOf(att.label ?? '') >= 0) {
                    return true;
                }
            }
        }
        // if we don't find anything return false
        return false;
    }

    static parseInputToString(val: number | string | string[] | undefined): string {
        if (val === undefined) return '';
        if (typeof val === 'number') return val.toString();
        if (typeof val === 'string') return val;
        if (Array.isArray(val)) {
            return val.join(',');
        }
        return '';
    }

    static parseInputToNumber(val: number | string | string[] | undefined): number {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            const ret = +val;
            if (!isNaN(ret)) return ret;
            return 0;
        }
        if (Array.isArray(val)) {
            const str = val.join('');
            const ret = +str;
            if (!isNaN(ret)) return ret;
            return 0;
        }
        return 0;
    }

    static setupCustomCheckbox(app, html) {
        const setContent = (el) => {
            const checkbox = $(el).children('input[type=checkbox]');
            const checkmark = $(el).children('.checkmark');
            if ($(checkbox).prop('checked')) {
                $(checkmark).addClass('fa-check-circle');
                $(checkmark).removeClass('fa-circle');
            } else {
                $(checkmark).addClass('fa-circle');
                $(checkmark).removeClass('fa-check-circle');
            }
        };
        html.find('label.checkbox').each(function () {
            setContent(this);
        });
        html.find('label.checkbox').click((event) => setContent(event.currentTarget));
        html.find('.submit-checkbox').change((event) => app._onSubmit(event));
    }

    static mapRoundsToDefenseMod(rounds) {
        if (rounds === 1) return 0;
        if (rounds === 3) return -2;
        if (rounds === 6) return -5;
        if (rounds === 10) return -9;
        return 0;
    }

    static mapRoundsToDefenseDesc(rounds) {
        if (rounds === 1) return '';
        if (rounds === 3) return '-2';
        if (rounds === 6) return '-5';
        if (rounds === 10) return '-9';
        if (rounds === 20) return 'SR5.DuckOrCover';
        return '';
    }

    static label(str) {
        const frags = str.split('_');
        for (let i = 0; i < frags.length; i++) {
            frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
        }
        frags.forEach((frag, idx) => {
            if (frag === 'Processing') frags[idx] = 'Proc.';
            if (frag === 'Mechanic') frags[idx] = 'Mech.';
        });
        return frags.join(' ');
    }

    static orderKeys(obj) {
        const keys = Object.keys(obj).sort(function keyOrder(k1, k2) {
            if (k1 < k2) return -1;
            if (k1 > k2) return +1;
            return 0;
        });

        let i;
        const after = {};
        for (i = 0; i < keys.length; i++) {
            after[keys[i]] = obj[keys[i]];
            delete obj[keys[i]];
        }

        for (i = 0; i < keys.length; i++) {
            obj[keys[i]] = after[keys[i]];
        }
        return obj;
    }

    static hasModifiers(event) {
        return event && (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey);
    }

    static filter(obj, comp) {
        const retObj = {};
        if (typeof obj === 'object' && obj !== null) {
            Object.entries(obj).forEach(([key, value]) => {
                if (comp([key, value])) retObj[key] = value;
            });
        }
        return retObj;
    }

    static addLabels(obj, label) {
        if (typeof obj === 'object' && obj !== null) {
            if (!obj.hasOwnProperty('label') && obj.hasOwnProperty('value') && label !== '') {
                obj.label = label;
            }
            Object.entries(obj)
                .filter(([, value]) => typeof value === 'object')
                .forEach(([key, value]) => Helpers.addLabels(value, key));
        }
    }

    /* Handle Shadowrun style shortened attribute names with typical three letter shortening. */
    static shortenAttributeLocalization(label: string, length: number = 3): string {
        const name = game.i18n.localize(label);

        if (length <= 0) {
            return name;
        }

        if (name.length < length) {
            length = name.length;
        }

        return name.slice(0, length).toUpperCase();
    }

    // TODO: Foundry 0.9 Should TokenDocument be used instead of Token?
    // TODO: Check canvas.scene.tokens
    static getToken(id?: string): Token | undefined {
        if (!canvas || !canvas.ready) return;

        for (const token of canvas.tokens.placeables) {
            if (token.id === id) {
                return token;
            }
        }
    }

    /**
     * Use this helper to get a tokens actor from any given scene id, while the sceneTokenId is a mixed ID
     * @param sceneTokenId A mixed id with the format '<sceneId>.<tokenid>
     */
    static getSceneTokenActor(sceneTokenId: string): SR5Actor | undefined {
        const [sceneId, tokenId] = sceneTokenId.split('.');
        const scene = game.scenes.get(sceneId);
        if (!scene) return;
        // @ts-ignore
        const token = scene.tokens.get(tokenId);
        if (!token) return;
        return token.getActor();
    }

    static getUserTargets(user?: User|null): Token[] {
        user = user ? user : game.user;

        if (!user) return []

        return Array.from(user.targets);
    }

    static userHasTargets(user?: User|null): boolean {
        user = user ? user : game.user;

        if (!user) return false;

        return user.targets.size > 0;
    }

    static measureTokenDistance(tokenOrigin: Token, tokenDest: Token): number {
        if (!canvas || !canvas.ready || !canvas.scene) return 0;

        if (!tokenOrigin || !tokenDest) return 0;

        const origin = new PIXI.Point(...canvas.grid.getCenter(tokenOrigin.data.x, tokenOrigin.data.y));
        const dest = new PIXI.Point(...canvas.grid.getCenter(tokenDest.data.x, tokenDest.data.y));

        // TODO: Used to be const distanceInGridUnits = canvas.grid.measureDistance(origin, dest, {gridSpaces: true});
        //       Double Check for errors.
        const distanceInGridUnits = canvas.grid.measureDistance(origin, dest);
        const sceneUnit = canvas.scene.data.gridUnits;
        return Helpers.convertLengthUnit(distanceInGridUnits, sceneUnit);
    }

    static convertLengthUnit(length: number, fromUnit: string): number {
        //@ts-ignore
        fromUnit = fromUnit.toLowerCase();

        if (!LENGTH_UNIT_TO_METERS_MULTIPLIERS.hasOwnProperty(fromUnit)) {
            console.error(`Distance can't be converted from ${fromUnit} to ${LENGTH_UNIT}`);
            return 0;
        }

        // Round down since X.8 will hit X and not X+1.
        return Math.floor(length * LENGTH_UNIT_TO_METERS_MULTIPLIERS[fromUnit]);
    }

    static getWeaponRange(distance: number, ranges: RangesTemplateData): RangeTemplateData {
        // Assume ranges to be in ASC order and to define their max range.
        // Should no range be found, assume distance to be out of range.
        const rangeKey = Object.keys(ranges).find(range => distance < ranges[range].distance);
        if (rangeKey) {
            return ranges[rangeKey];
        } else {
            const {extreme} = ranges;
            return Helpers.createRangeDescription('SR5.OutOfRange', extreme.distance, SR.combat.environmental.range_modifiers.out_of_range);
        }
    }

    static getControlledTokens(): Token[] {
        if (!canvas || !canvas.ready) return [];
        return canvas.tokens.controlled;
    }

    static getSelectedActorsOrCharacter(): SR5Actor[] {
        const tokens = Helpers.getControlledTokens();
        const actors = tokens.map(token => token.actor);

        // Try to default to a users character.
        if (actors.length === 0 && game.user?.character) {
            actors.push(game.user?.character);
        }

        return actors as SR5Actor[];
    }

    static createRangeDescription(label: string, distance: number, modifier: number): RangeTemplateData {
        label = game.i18n.localize(label);
        return {label, distance, modifier}
    }

    static convertIndexedObjectToArray(indexedObject: object): object[] {
        return Object.keys(indexedObject).map((index) => {
            if (Number.isNaN(index)) {
                console.warn('An object with no numerical index was given, which is likely a bug.', indexedObject);
            }
            return indexedObject[index];
        });
    }

    static getChatSpeakerName(actor: SR5Actor): string {
        if (!actor) return '';

        const useTokenNameForChatOutput = game.settings.get(SYSTEM_NAME, FLAGS.ShowTokenNameForChatOutput);
        const token = actor.getToken();

        if (useTokenNameForChatOutput && token) return token.data.name;

        return actor.name;
    }

    static createDamageData(value: number, type: DamageType, ap: number = 0, element: DamageElement = '', sourceItem? : SR5Item): DamageData {
        const damage = duplicate(DataDefaults.damage) as DamageData;
        damage.base = value;
        damage.value = value;
        damage.type.base = type;
        damage.type.value = type;
        damage.ap.base = ap;
        damage.ap.value = ap;
        damage.element.base = element;
        damage.element.value = element;

        if (sourceItem && sourceItem.actor) {
            damage.source = {
                actorId: sourceItem.actor.id,
                itemType: sourceItem.type,
                itemId: sourceItem.id,
                itemName: sourceItem.name
            };
        }

        return damage;
    }

    /**
     * Retrieves the item causing the damage, if there is any.
     * This only works for embedded items at the moment
     */
    static findDamageSource(damageData : DamageData) : SR5Item | undefined{
        if (!damageData.source) {
            return;
        }

        const actorId = damageData.source.actorId;
        const actorSource = game.actors.find(
            actor => actor.id === actorId
            );

        if (!actorSource) {
            return;
        }

        // First search the actor itself for the item
        const itemId = damageData.source.itemId;
        const actorItem = actorSource.items.get(itemId) as unknown as SR5Item;
        if (actorItem)
        {
            return actorItem;
        }

        // If we did not find anything on the actor, search the active tokens (the item might only exist on a non linked token)
        // This will not work if we are on a different scene or the token got deleted, which is expected when you put an
        // item on a token without linking it.
        const tokens = actorSource.getActiveTokens();
        let tokenItem : SR5Item | undefined;
        tokens.forEach(token => {
            const foundItem = token.actor.items.find(i => i.id === itemId);
            if (foundItem) {
                tokenItem = foundItem as unknown as SR5Item;
            }
        });

        return tokenItem;
    }

    /** Modifies given damage value and returns both original and modified damage
     *
     * For better readability reduceDamageByHits wraps this method to avoid negative params in the call signature.
     * so instead of
     * > modifyDamageByHits(incoming, -hits, label)
     * do this instead
     * > reduceDamageByHits(incoming, hits, label)
     *
     * @param incoming A DamageData value to be modified from
     * @param hits Positive or negative hits to change the damage value with.
     * @param modificationLabel The translatable label for the modification
     */
    static modifyDamageByHits(incoming: DamageData, hits: number, modificationLabel: string): ModifiedDamageData {
        const modified = duplicate(incoming) as DamageData;
        modified.mod = PartsList.AddUniquePart(modified.mod, modificationLabel, hits);
        modified.value = Helpers.calcTotal(modified, {min: 0});

        return {incoming, modified};
    }

    /** Reduces given damage value and returns both original and modified damage.
     *
     * Should you want RAISE the damage value, use modifyDamageByHits directly.
     *
     * @param incoming A DamageData value to be modified from
     * @param hits Positive hits to reduce the damage value with! Should the hits amount be negative, use modifyDamageByHits.
     * @param modificationLabel The translatable label for the modification
     */
    static reduceDamageByHits(incoming: DamageData, hits: number, modificationLabel: string): ModifiedDamageData {
        if (hits < 0) {
            console.warn('Helpers.reduceDamageByHits should only be called with positive hits values to avoid confusion');
        }
        return Helpers.modifyDamageByHits(incoming, -hits, modificationLabel);
    }

    static async confirmDeletion(): Promise<boolean> {
        const dialog = new DeleteConfirmationDialog();
        await dialog.select();
        return !dialog.canceled && dialog.selectedButton === 'delete';
    }

    /**
     * This can be used to create an SkillField into the Skills data path during the Skill creation process.
     *
     * @param skillDataPath Could be 'data.skills.active' or 'data.skill.language.value' or more
     * @param skillField A SkillField with whatever values. You could use DefaultValues.skillData to create one.
     * @param idLength How long should the id (GUID) be?
     */
    static getRandomIdSkillFieldDataEntry(skillDataPath: string, skillField: SkillField, idLength: number = DEFAULT_ID_LENGTH): { id: string, updateSkillData: { [skillDataPath: string]: { [id: string]: SkillField } } } | undefined {
        if (!skillDataPath || skillDataPath.length === 0) return;

        const id = randomID(idLength);
        const updateSkillData = {
            [skillDataPath]: {[id]: skillField}
        };

        return {
            id,
            updateSkillData
        }
    }

    /**
     * A simple helper to get an data entry for updating with Entity.update
     *
     * @param path The main data path as a doted string relative from the type data (not document data).
     * @param value Whatever needs to be stored.
     *
     */
    static getUpdateDataEntry(path: string, value: any): {[path: string]: any} {
        return {[path]: value};
    }
    /**
     * A simple helper to delete existing document data keys with Entity.update
     *
     * @param path The main data path as doted string relative from the item type data (not document data). data.skills.active
     * @param key The single sub property within the path that's meant to be deleted. 'test'
     *
     * @return An expected return object could look like this: {'data.skills.active': {'-=Pistols': null}} and would
     *         remove the Pistols key from the 'data.skills.active' path within Entity.data.data.skills.active.
     */
    static getDeleteDataEntry(path: string, key: string): {[path: string]: {[key: string]: null}} {
        // Entity.update utilizes the mergeObject function within Foundry.
        // That functions documentation allows property deletion using the -= prefix before property key.
        return {[path]: {[`-=${key}`]: null}};
    }

    static localizeSkill(skill: SkillField): string {
        return skill.label ? game.i18n.localize(skill.label) : skill.name;
    }

    /**
     * Alphabetically sort skills either by their translated label. Should a skill not have one, use the name as a
     * fallback.
     *
     * Sorting should be aware of UTF-8, however please blame JavaScript if it's not. :)
     *
     * @param skills
     * @param asc Set to true for ascending sorting order and to false for descending order.
     * @return Sorted Skills given by the skills parameter
     */
    static sortSkills(skills: Skills, asc: boolean=true): Skills {
        // Filter entries instead of values to have a store of ids for easy rebuild.
        const sortedEntries = Object.entries(skills).sort(([aId, a], [bId, b]) => {
            const comparatorA = Helpers.localizeSkill(a) || aId;
            const comparatorB = Helpers.localizeSkill(b) || bId;
            // Use String.localeCompare instead of the > Operator to support other alphabets.
            if (asc)
                return comparatorA.localeCompare(comparatorB) === 1 ? 1 : -1;
            else
                return comparatorA.localeCompare(comparatorB) === 1 ? -1 : 1;
        });

        // Rebuild the Skills type using the earlier entries.
        const sortedAsObject = {};
        for (const [id, skill] of sortedEntries) {
            sortedAsObject[id] = skill;
        }

        return sortedAsObject;
    }

    /**
     * Alphabetically sort any SR5 config object with a key to label structure.
     *
     * Sorting should be aware of UTF-8, however please blame JavaScript if it's not. :)
     *
     * @param configValues The config value to be sorted
     * @param asc Set to true for ascending sorting order and to false for descending order.
     * @return Sorted config values given by the configValues parameter
     */
    static sortConfigValuesByTranslation(configValues: Record<string, string>, asc: boolean=true): Record<string, string> {
        // Filter entries instead of values to have a store of ids for easy rebuild.
        const sortedEntries = Object.entries(configValues).sort(([aId, a], [bId, b]) => {
            const comparatorA = game.i18n.localize(a);
            const comparatorB = game.i18n.localize(b);
            // Use String.localeCompare instead of the > Operator to support other alphabets.
            if (asc)
                return comparatorA.localeCompare(comparatorB) === 1 ? 1 : -1;
            else
                return comparatorA.localeCompare(comparatorB) === 1 ? -1 : 1;
        });

        // Rebuild the skills type using the earlier entries.
        const sortedAsObject = {};
        for (const [key, translated] of sortedEntries) {
            sortedAsObject[key] = translated;
        }
        return sortedAsObject;
    }

    /**
     * Return a list of users with the given permission for the given document.
     *
     * @param document A foundry Document implementation.
     * @param permission A foundry access permission
     * @param active If true, will only return users that are also currently active.
     */
    static getPlayersWithPermission(document: Entity, permission: string, active: boolean = true): User[] {
        return game.users.filter(user => {
            if (user.isGM) return false;
            // Check for permissions.
            // @ts-ignore // TODO: foundry-vtt-types 0.8 missing testUserPermission for Documents (it's not DocumentClientMixin)
            if (!document.testUserPermission(user, permission)) return false;
            // Check for active state.
            if (active && !user.active) return false;

            return true;
        });
    }

    /**
     * Handle the special skill cases with id equals name and possible i18n
     *
     * @param skill
     * @returns Either a translation or a name.
     */
    static getSkillLabelOrName(skill: SkillField): string {
        // Custom skills don't have labels, use their name instead.
        return skill.label ? game.i18n.localize(skill.label) : skill.name || '';
    }


    /**
     * Support for the Dice So Nice module
     *
     * Dice So Nice Roll API: https://gitlab.com/riccisi/foundryvtt-dice-so-nice/-/wikis/API/Roll
     *
     * @param roll The roll thrown.
     * @param whisper The user ids the roll should be shown to. Null for show all.
     * @param blind Is the roll blind to current user?
     *
     */
    static async showDiceSoNice(roll: ShadowrunRoll, whisper: string[] = null, blind: boolean = false) {
        if (!game.dice3d) return;
        // @ts-ignore
        const synchronize = whisper?.length === 0 || whisper === null;
        // @ts-ignore
        whisper = whisper?.length > 0 ? whisper : null;
        // @ts-ignore
        await game.dice3d.showForRoll(roll, game.user, synchronize, whisper, blind);
    }


    /**
     * Fetch entities from global or pack collections using data acquired by Foundry Drag&Drop process
     * @param data Foundry Drop Data
     */
    static async getEntityFromDropData(data: {type: 'Actor'|'Item', pack: string, id: string}): Promise<Entity | undefined> {
        if (data.pack)
            return await Helpers.getEntityFromCollection(data.pack, data.id);

        if (data.type === 'Actor')
            return game.actors.get(data.id);

        if (data.type === 'Item')
            return game.items.get(data.id);
    }

    /**
     * Fetch entities from a pack collection
     * @param collection The pack name as stored in the collection property
     * @param id The entity id in that collection
     */
    static async getEntityFromCollection(collection: string, id: string): Promise<Entity> {
        const pack = game.packs.find((p) => p.collection === collection);
        return await pack.getEntity(id);
    }

    /**
     * Build a markId string. See Helpers.deconstructMarkId for usage.
     *
     * @param sceneId Optional id in a markId
     * @param targetId Mandatory id in a markId
     * @param itemId Optional id in a markId
     * @param separator Should you want to change the default separator used
     */
    static buildMarkId(sceneId: string, targetId: string, itemId: string|undefined, separator='.'): string {
        return [sceneId, targetId, itemId || ''].join(separator);
    }

    /**
     * Deconstruct the given markId string.
     *
     * @param markId 'sceneId.targetId.itemId' with itemId being optional
     * @param separator Should you want to change the default separator used
     */
    static deconstructMarkId(markId: string, separator='.'): {scene: Scene, target: SR5Actor|SR5Item, item?: SR5Item} {
        const ids = markId.split(separator);

        if (ids.length !== 3) {
            console.error('A mark id must always be of length 3');
            return;
        }

        const [sceneId, targetId, itemId] = ids;

        const scene = game.scenes.get(sceneId);
        const target = game.actors.get(targetId) as SR5Actor || game.items.get(targetId) as SR5Item;
        const item = game.items.get(itemId) as SR5Item; // DocumentCollection will return undefined if needed

        return {
            scene, target, item
        }
    }
}
