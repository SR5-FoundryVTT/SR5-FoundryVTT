import { DamageType } from "./types/item/ActionModel";
import GenericValueField = Shadowrun.GenericValueField;
import RangeTemplateData = Shadowrun.RangeTemplateData;
import ModifiedDamageData = Shadowrun.ModifiedDamageData;
import TargetedDocument = Shadowrun.TargetedDocument;
import { SR5Actor } from "./actor/SR5Actor";
import { DeleteConfirmationDialog } from "./apps/dialogs/DeleteConfirmationDialog";
import { DEFAULT_ID_LENGTH, FLAGS, LENGTH_UNIT, LENGTH_UNIT_TO_METERS_MULTIPLIERS, SYSTEM_NAME } from "./constants";
import { DataDefaults } from "./data/DataDefaults";
import { SR5Item } from './item/SR5Item';
import { PartsList } from './parts/PartsList';
import { SuccessTestData } from "./tests/SuccessTest";
import { Translation } from './utils/strings';
import { ModifiableValueType } from "./types/template/BaseModel";
import { AttributeFieldType } from "./types/template/AttributesModel";
import { SkillFieldType, SkillsType } from "./types/template/SkillsModel";
import { ModifiedDamageType } from "./types/rolls/ActorRollsModel";
import { RangesTemplateType } from "./types/template/WeaponModel";

type OneOrMany<T> = T | T[];

interface CalcTotalOptions {
    // Min/Max value range
    min?: number,
    max?: number,
    // Round total to a given decimal, 0 rounds to the next integer.
    roundDecimals?: number
}

export class Helpers {
    /**
     * Calculate the total value for a data object
     * - stores the total value and returns it
     * @param value
     * @param options min will a apply a minimum value, max will apply a maximum value.
     */
    static calcTotal(value: ModifiableValueType, options?: CalcTotalOptions): number {
        if (value.mod === undefined) value.mod = [];

        const parts = new PartsList(value.mod);
        // if a temp field is found, add it as a unique part
        if (!isNaN(value.temp as number) && Number(value.temp) !== 0) {
            parts.addUniquePart('SR5.Temporary', value['temp']);
        }

        // On some values base might be undefined...
        // Check for undefined, as some Values might be none numerical / boolean.
        value.base = value.base !== undefined ? Number(value.base) : 0;

        // If the given value has an override defined, use that as a value, while keeping the base and mod values.
        if (value.override) {
            // Still apply a possible value range, even if override says otherwise.
            value.value = Helpers.applyValueRange(value.override.value, options);
            return value.value;
        }

        // Base on type change calculation behavior.
        switch (foundry.utils.getType(value.base)) {
            case 'number':
                value.value = Helpers.roundTo(parts.total + value.base, options?.roundDecimals);
                value.value = Helpers.applyValueRange(value.value, options);
                break;
            // boolean / string values should be applied
            default:
                value.value = parts.last === undefined ? value.base : parts.last;
                break;
        }

        value.mod = parts.list;

        return value.value;
    }

    static calcValue<ValueType>(value: GenericValueField): any {
        if (value.mod === undefined) value.mod = [];

        if (value.override) {
            value.value = value.override.value;

            return value.value;
        }

        value.value = value.base;

        return value.value;
    }

    /** Round a number to a given degree.
     *
     * @param value Number to round with.
     * @param decimals Amount of decimals after the decimal point.
     */
    static roundTo(value: number, decimals: number=3): number {
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

    static listItemId(event): string {
        return event.currentTarget.closest('.list-item').dataset.itemId;
    }

    static listHeaderId(event): string {
        return event.currentTarget.closest('.list-header').dataset.itemId;
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

    static isMatrix(atts: boolean | OneOrMany<string | AttributeFieldType | SkillFieldType>): boolean {
        if (!atts) return false;
        if (typeof atts === 'boolean') return atts;
        // array of labels to check for on the incoming data
        const matrixLabels = [
            'SR5.MatrixAttrFirewall',
            'SR5.MatrixAttrDataProcessing',
            'SR5.MatrixAttrSleaze',
            'SR5.MatrixAttrAttack',
            'SR5.Skill.Computer',
            'SR5.Skill.Hacking',
            'SR5.Skill.Cybercombat',
            'SR5.Skill.ElectronicWarfare',
            'SR5.Software',
        ];
        if (!Array.isArray(atts)) atts = [atts];
        atts = atts.filter((att) => att);
        // iterate over the attributes and return true if we find a matrix att
        for (const att of atts) {
            const label = typeof att === 'object' ? att.label : att;
            if (matrixLabels.includes(label)) {
                return true;
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
        html.find('label.checkbox').each(function (this: any) {
            setContent(this);
        });
        html.find('label.checkbox').click((event) => setContent(event.currentTarget));
        html.find('.submit-checkbox').change((event) => app._onSubmit(event));
    }

    static mapRoundsToDefenseDesc(rounds) {
        if (rounds === 1) return '';
        if (rounds === 3) return '-2';
        if (rounds === 6) return '-5';
        if (rounds === 10) return '-9';
        if (rounds === 20) return 'SR5.DuckOrCover';
        return '';
    }

    static label(str: string) {
        // Gracefully fail if for falsy values.
        if (!str) return '';

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
        const name = game.i18n.localize(label as Translation);

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
    /**
     * Retrieve a Token by its ID from the current canvas.
     * @param id The token's ID. If omitted, returns the first controlled token or undefined.
     * @returns The Token instance or undefined if not found.
     */
    static getToken(id?: string): Token | undefined {
        if (!canvas || !canvas.ready || !canvas.tokens) return undefined;

        if (id) return canvas.tokens.placeables.find(token => token.id === id);

        // If no id is provided, return the first controlled token if available
        return canvas.tokens.controlled.length > 0 ? canvas.tokens.controlled[0] : undefined;
    }

    /**
     * Use this helper to get a tokens actor from any given scene id.
     * @param sceneTokenId A mixed id with the format '<sceneId>.<tokenid>
     */
    static getSceneTokenActor(sceneTokenId: string): SR5Actor | null {
        const [sceneId, tokenId] = Helpers.deconstructSceneTokenId(sceneTokenId);
        const token = Helpers.getSceneTokenDocument(sceneId, tokenId);
        if (!token) return null;
        return token.getActor();
    }

    static deconstructSceneTokenId(sceneTokenId: string): [sceneId: string, tokenId: string] {
        return sceneTokenId.split('.') as [sceneId: string, tokenId: string];
    }

    static getSceneTokenDocument(sceneId, tokenId): TokenDocument | undefined {
        const scene = game.scenes?.get(sceneId);
        if (!scene) return undefined;
        const token = scene.tokens.get(tokenId);
        if (!token) return undefined;

        return token;
    }

    static getUserTargets(user?: User | null): Token[] {
        user = user ? user : game.user;

        if (!user) return []

        return Array.from(user.targets);
    }

    static userHasTargets(user?: User | null): boolean {
        user = user ? user : game.user;

        if (!user) return false;

        return user.targets.size > 0;
    }

    /**
     * Measure the distance between two tokens on the canvas in length units, 
     * factoring in both 2D distance and 3D elevation difference.
     * 
     * Depending on the scene distance unit the result will be converted.
     * 
     * If wall-height is installed and using tokenHeight, it will be used for elevation.
     * 
     * @param tokenOrigin 
     * @param tokenDest 
     * @returns Distance in scene distance unit
     */
    static measureTokenDistance(tokenOrigin: TokenDocument, tokenDest: TokenDocument): number {
        if (!canvas || !canvas.ready || !canvas.scene || !canvas.grid) return 0;

        if (!tokenOrigin || !tokenDest) return 0;

        // 2d coordinates and distance
        const origin2D = canvas.grid.getCenterPoint({x: tokenOrigin.x, y: tokenOrigin.y});
        const dest2D = canvas.grid.getCenterPoint({x: tokenDest.x, y: tokenDest.y});

        // Use gridSpace to measure in grids instead of distance. This will give results parity to FoundryVTTs canvas ruler.
        const distanceInGridUnits2D = canvas.grid.measurePath([origin2D, dest2D], {});

        // 3d coordinates and distance
        const originLOSHeight = Helpers.getTokenLOSHeight(tokenOrigin);
        const destLOSHeight = Helpers.getTokenLOSHeight(tokenDest);
        const elevationDifference = (tokenOrigin.elevation + originLOSHeight) - (tokenDest.elevation + destLOSHeight);
        const origin3D = new PIXI.Point(0, 0);
        const dest3D = new PIXI.Point(distanceInGridUnits2D.distance, elevationDifference);
        
        const distanceInGridUnits3D = Math.round(Helpers.measurePointDistance(origin3D, dest3D));

        const sceneUnit = canvas.scene.grid.units;
        return Helpers.convertLengthUnit(distanceInGridUnits3D, sceneUnit);
    }

    /**
     * Measure distance between two points on a grid in length units.
     * 
     * @param origin 
     * @param destination 
     * @returns Distance without a unit.
     */
    static measurePointDistance(origin: PIXI.Point, destination: PIXI.Point): number {
        const sideA = origin.x + destination.x;
        const sideB = origin.y + destination.y;
        return Math.sqrt(Math.pow(sideA, 2) + Math.pow(sideB, 2))
    }

    /**
     * Determine a tokens line of sight height.
     * 
     * Default Foundry will use 0, while wall-height might have defined another value on the token.
     * 
     * The auto height generation of wall-height isn't supported.
     * 
     * @param token 
     * @returns 
     */
    static getTokenLOSHeight(token: TokenDocument): number {
        return token.flags['wall-height']?.tokenHeight ?? 0;
    }

    static convertLengthUnit(length: number, fromUnit: string): number {
        fromUnit = fromUnit.toLowerCase();

        if (!LENGTH_UNIT_TO_METERS_MULTIPLIERS.hasOwnProperty(fromUnit)) {
            console.error(`Distance can't be converted from ${fromUnit} to ${LENGTH_UNIT}`);
            return 0;
        }

        // Note: length is a grid distance. To avoid suddenly feeding floats, still round in case
        //       of a later API change somewhere.
        return Math.round(length * LENGTH_UNIT_TO_METERS_MULTIPLIERS[fromUnit]);
    }

    static getControlledTokens(): Token[] {
        if (!canvas || !canvas.ready || !canvas.tokens) return [];
        return canvas.tokens.controlled;
    }

    /**
     * Determine if the current user has any tokens selected.
     * @returns true if one or more tokens have been selected.
     */
    static userHasControlledTokens(): boolean {
        if (!canvas || !canvas.ready || !canvas.tokens) return false;
        return canvas.tokens.controlled.length > 0;
    }

    /**
     * Return all actors connected to all user controlled tokens.
     * @returns An array token actors.
     */
    static getControlledTokenActors(): SR5Actor[] {
        if (!canvas || !canvas.ready) return []

        const tokens = Helpers.getControlledTokens();
        return tokens.map(token => token.actor) as SR5Actor[];
    }

    /**
     * return all tokens a user has targeted at the moment.
     * @returns An array tokens.
     */
    static getTargetedTokens(): Token[] {
        if (!canvas.ready || !game.user) return [];

        return Array.from(game.user.targets);
    }

    /**
     * Return either all user selected token actors or the users game character actor.
     * @returns An array of actors.
     */
    static getSelectedActorsOrCharacter(): SR5Actor[] {
        if (!game.user) return [];

        const actors = Helpers.getControlledTokenActors();

        // Try to default to a users character.
        if (actors.length === 0 && game.user.character?.uuid) {
            const character = fromUuidSync(game.user.character.uuid);
            if (character && character instanceof SR5Actor) actors.push(character);
        }

        return actors as SR5Actor[];
    }

    /**
     * Given a SuccessTestData subset fetch all target actors.
     *
     * BEWARE: A target will always be token based BUT linked actors provide an actor uuid instead of
     * pointing to their token actors.
     * 
     * @param testData The test data containing target uuids.
     */
    static async getTestTargetActors(testData: SuccessTestData): Promise<SR5Actor[]> {
        const actors: SR5Actor[] = [];
        for (const uuid of testData.targetActorsUuid) {
            const tokenOrActor = await fromUuid(uuid);
            // Assume given target to be an actor.
            let actor = tokenOrActor;

            // In case of a Token, extract it's synthetic actor.
            if (tokenOrActor instanceof TokenDocument) {
                if (!tokenOrActor.actor) continue;
                actor = tokenOrActor.actor;
            }

            // Avoid fromUuid pulling an unwanted Document type.
            if (!(actor instanceof SR5Actor)) {
                console.error(`Shadowrun5e | testData with targets containt UUID ${uuid} which doesn't provide an actor or syntheic actor`, tokenOrActor);
                continue;
            }

            actors.push(actor);
        }
        return actors;
    }
    /**
     * Check given test for actors to use for opposed tests.
     *
     * @param testData The test to use for actor selection
     * @returns A list of actors that should be used for an opposed test.
     */
    static async getOpposedTestActors(testData: SuccessTestData): Promise<SR5Actor[]> {
        const overwriteSelectionWithTarget = game.settings.get(SYSTEM_NAME, FLAGS.DefaultOpposedTestActorSelection) as boolean;

        // Honor user preference of using test targets, if any are set.
        if (overwriteSelectionWithTarget && testData.targetActorsUuid.length > 0) {
            return await Helpers.getTestTargetActors(testData);
        }

        // Otherwise fallback to default behavior
        return Helpers.getSelectedActorsOrCharacter();
    }

    static createRangeDescription(label: Translation, distance: number, modifier: number): RangesTemplateType {
        const localizedLabel = game.i18n.localize(label);
        return {label: localizedLabel, distance, modifier}
    }

    static convertIndexedObjectToArray(indexedObject: object): object[] {
        return Object.keys(indexedObject).map((index) => {
            if (Number.isNaN(index)) {
                console.warn('An object with no numerical index was given, which is likely a bug.', indexedObject);
            }
            return indexedObject[index];
        });
    }

    /**
     * Depending on the system setting allow GMs to define if they want to always display the name within the actor
     * or within the token.
     *
     * This can be relevant for when GMs either manually or by module change the tokens name, while the actors name
     * is untouched and might even be detrimental to share with players.
     *
     * @param actor
     */
    static getChatSpeakerName(actor: SR5Actor): string {
        if (!actor) return '';

        const useTokenNameForChatOutput = game.settings.get(SYSTEM_NAME, FLAGS.ShowTokenNameForChatOutput);
        const token = actor.getToken();

        if (useTokenNameForChatOutput && token) return token.name as string;

        return actor.name as string;
    }

    /**
     * Given an actor this will display either the actor or token name, when there is any.
     *
     * The use token name setting is also respected.
     *
     * @param actor Either an actual or a virtual actor, taken from a token.
     * @returns A path pointing to an image.
     */
    static getChatSpeakerImg(actor: SR5Actor): string {
        if (!actor) return '';

        const useTokenForChatOutput = game.settings.get(SYSTEM_NAME, FLAGS.ShowTokenNameForChatOutput);
        const token = actor.getToken();

        if (useTokenForChatOutput && token?.document) return token.document.texture.src || '';
        return actor.img || '';
    }

    static createDamageData(
        value: number,
        type: DamageType['type']['value'],
        ap: number = 0,
        element: DamageType['element']['value'] = '',
        sourceItem?: SR5Item
    ): DamageType {
        const damage = DataDefaults.createData('damage') as DamageType;
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
                actorId: sourceItem.actor.id as string,
                itemType: sourceItem.type,
                itemId: sourceItem.id as string,
                itemName: sourceItem.name as string
            };
        }

        return damage;
    }

    /**
     * Retrieves the item causing the damage, if there is any.
     * This only works for embedded items at the moment
     */
    static findDamageSource(damageData: DamageType): SR5Item | undefined {
        if (!game.actors) return undefined;

        if (!damageData.source) return undefined;

        const actorId = damageData.source.actorId;
        const actorSource = game.actors.get(actorId)

        if (!actorSource) return undefined;

        // First search the actor itself for the item
        const itemId = damageData.source.itemId;
        const actorItem = actorSource.items.get(itemId);
        if (actorItem) {
            return actorItem;
        }

        // If we did not find anything on the actor, search the active tokens (the item might only exist on a non linked token)
        // This will not work if we are on a different scene or the token got deleted, which is expected when you put an
        // item on a token without linking it.
        const tokens = actorSource.getActiveTokens();
        let tokenItem: SR5Item | undefined;
        tokens.forEach(token => {
            if (!token.actor) return;

            const foundItem = token.actor.items.get(itemId);
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
     * @param incoming A DamageType value to be modified from
     * @param hits Positive or negative hits to change the damage value with.
     * @param modificationLabel The translatable label for the modification
     */
    static modifyDamageByHits(incoming: DamageType, hits: number, modificationLabel: string): ModifiedDamageType {
        const modified = foundry.utils.duplicate(incoming) as DamageType;
        modified.mod = PartsList.AddUniquePart(modified.mod, modificationLabel, hits);
        modified.value = Helpers.calcTotal(modified, {min: 0});

        return {incoming, modified};
    }

    /** Reduces given damage value and returns both original and modified damage.
     *
     * Should you want RAISE the damage value, use modifyDamageByHits directly.
     *
     * @param incoming A DamageType value to be modified from
     * @param hits Positive hits to reduce the damage value with! Should the hits amount be negative, use modifyDamageByHits.
     * @param modificationLabel The translatable label for the modification
     */
    static reduceDamageByHits(incoming: DamageType, hits: number, modificationLabel: string): ModifiedDamageType {
        if (hits < 0) hits = 0;
        return Helpers.modifyDamageByHits(incoming, -hits, modificationLabel);
    }

    static async confirmDeletion(): Promise<boolean> {
        const dialog = new DeleteConfirmationDialog();
        await dialog.select();
        return !dialog.canceled && dialog.selectedButton === 'delete';
    }

    /**
     * Creates a data entry for a skill field with a random ID.
     *
     * @param skillDataPath The data path where the skill should be added (e.g., 'data.skills.active').
     * @param skillField The skill field data to insert.
     * @param idLength The length of the generated random ID.
     * @returns An object containing the generated ID and the update data, or undefined if the path is invalid.
     */
    static getRandomIdSkillFieldDataEntry(
        skillDataPath: string,
        skillField: SkillFieldType,
        idLength: number = DEFAULT_ID_LENGTH
    ): { id: string, updateSkillData: { [skillDataPath: string]: { [id: string]: SkillFieldType } } } | undefined {
        if (!skillDataPath || skillDataPath.length === 0) return undefined;

        const id = randomID(idLength);
        const updateSkillData = {
            [skillDataPath]: {[id]: skillField}
        };

        return { id, updateSkillData }
    }

    /**
     * A simple helper to get an data entry for updating with Entity.update
     *
     * @param path The main data path as a doted string relative from the type data (not document data).
     * @param value Whatever needs to be stored.
     *
     */
    static getUpdateDataEntry(path: string, value: any): { [path: string]: any } {
        return {[path]: value};
    }

    /**
     * A simple helper to delete existing document data keys with Entity.update
     *
     * @param path The main data path as doted string relative from the item type data (not document data). data.skills.active
     * @param key The single sub property within the path that's meant to be deleted. 'test'
     *
     * @return An expected return object could look like this: {'data.skills.active': {'-=Pistols': null}} and would
     *         remove the Pistols key from the 'data.skills.active' path within Entity.system.skills.active.
     */
    static getDeleteKeyUpdateData(path: string, key: string): { [path: string]: { [key: string]: null } } {
        // Entity.update utilizes the mergeObject function within Foundry.
        // That functions documentation allows property deletion using the -= prefix before property key.
        return {[path]: {[`-=${key}`]: null}};
    }

    static localizeSkill(skill: SkillFieldType): string {
        return skill.label ? game.i18n.localize(skill.label as Translation) : skill.name;
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
    static sortSkills(skills: SkillsType, asc: boolean = true): SkillsType {
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
    static sortConfigValuesByTranslation(configValues: Record<string, Translation>, asc: boolean = true): Record<string, string> {
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
    static getPlayersWithPermission(
        document: SR5Actor | SR5Item,
        permission: keyof typeof CONST.DOCUMENT_OWNERSHIP_LEVELS,
        active: boolean = true
    ): User[] {
        if (!game.users) return [];

        return game.users.filter(user => {
            if (user.isGM) return false;
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
    static getSkillLabelOrName(skill: SkillFieldType): string {
        // Custom skills don't have labels, use their name instead.
        return skill.label ? game.i18n.localize(skill.label as Translation) : skill.name || '';
    }

    /**
     * Fetch entities from global or pack collections using data acquired by Foundry Drag&Drop process
     * @param data Foundry Drop Data
     */
    static async getEntityFromDropData(data: { type: 'Actor' | 'Item', pack: string, id: string }): Promise<SR5Actor | SR5Item | undefined> {
        if (!game.actors || !game.items) return undefined;

        if (data.pack && data.type === 'Actor')
            return await Helpers.getEntityFromCollection(data.pack, data.id) as SR5Actor;

        if (data.pack && data.type === 'Item')
            return await Helpers.getEntityFromCollection(data.pack, data.id) as SR5Item;

        if (data.type === 'Actor')
            return game.actors.get(data.id) as SR5Actor;

        if (data.type === 'Item')
            return game.items.get(data.id) as SR5Item;
    
        return undefined;
    }

    /**
     * Fetch entities from a pack collection
     * @param collection The pack name as stored in the collection property
     * @param id The entity id in that collection
     */
    static async getEntityFromCollection(collection: string, id: string): Promise<ClientDocument | null | undefined> {
        const pack = game.packs.find((p) => p.collection === collection);
        return await pack?.getDocument(id);
    }

    /**
     * A markId is valid if:
     * - It's scene still exists
     * - The token still exists on that scene
     * - And a possible owned item still exists on that documents actor.
     */
    static isValidMarkId(markId: string): boolean {
        if (!game.scenes) return false;

        const [sceneId, targetId, itemId] = Helpers.deconstructMarkId(markId);

        const scene = game.scenes.get(sceneId);
        if (!scene) return false;

        const tokenDocument = scene.tokens.get(targetId);
        if (!tokenDocument) return false;

        const actor = tokenDocument.actor;
        // Some targets are allowed without a targeted owned item.
        if (itemId && !actor?.items.get(itemId)) return false;

        return true;
    }

    /**
     * Build a markId string. See Helpers.deconstructMarkId for usage.
     *
     * @param sceneId Optional id in a markId
     * @param targetId Mandatory id in a markId
     * @param itemId Optional id in a markId
     * @param separator Should you want to change the default separator used. Make sure not to use a . since Foundry will split the key into objects.
     */
    static buildMarkId(sceneId: string, targetId: string, itemId: string | undefined, separator = '/'): string {
        return [sceneId, targetId, itemId || ''].join(separator);
    }

    /**
     * Deconstruct the given markId string.
     *
     * @param markId 'sceneId.targetId.itemId' with itemId being optional
     * @param separator Should you want to change the default separator used
     */
    static deconstructMarkId(markId: string, separator = '/'): [sceneId: string, targetId: string, itemId: string] {
        const ids = markId.split(separator);

        if (ids.length !== 3) {
            console.error('A mark id must always be of length 3');
        }

        return ids as [string, string, string];
    }

    static getMarkIdDocuments(markId: string): TargetedDocument | undefined {
        if (!game.scenes || !game.items) return undefined;

        const [sceneId, targetId, itemId] = Helpers.deconstructMarkId(markId);

        const scene = game.scenes.get(sceneId);
        if (!scene) return undefined;
        const target = scene.tokens.get(targetId) || game.items.get(targetId) as SR5Item;
        const item = target?.actor?.items?.get(itemId) as SR5Item; // DocumentCollection will return undefined if needed

        return { scene, target, item };
    }

    /**
     * Return true if all given keys are present in the given object.
     * Values don't matter for this comparison.
     *
     * @param obj
     * @param keys
     */
    static objectHasKeys(obj: object, keys: string[]): boolean {
        for (const key of keys) {
            if (!obj.hasOwnProperty(key)) return false;
        }

        return true;
    }

    /**
     * Check packs for a given action.
     *
     * TODO: Use pack and action ids to avoid polluted user namespaces
     * TODO: Allow for i18n to fetch a label from an action? Or predefine the title?
     *
     * @param packName The metadata name of the pack
     * @param actionName The name of the action within that pack
     */
    static async getPackAction(packName, actionName): Promise<SR5Item | undefined> {
        console.debug(`Shadowrun 5e | Trying to fetch action ${actionName} from pack ${packName}`);
        const pack = game.packs.find(pack =>
            pack.metadata.system === SYSTEM_NAME &&
            pack.metadata.name === packName);
        if (!pack) return undefined;

        // TODO: Use predefined ids instead of names...
        const packEntry = pack.index.find(data => data.name?.toLowerCase().replace(new RegExp(' ', 'g'), '_') === actionName.toLowerCase());
        if (!packEntry) return undefined;

        const item = await pack.getDocument(packEntry._id) as unknown as SR5Item;
        if (!item || item.type !== 'action') return undefined;

        console.debug(`Shadowrun5e | Fetched action ${actionName} from pack ${packName}`, item);
        return item;
    }

    /**
     * Show the DocumentSheet of whatever entity link uuid.
     *
     * This function is designed to work in cojunction with the content-link CSS-class used by Foundry opening
     * the given id. Because of this only entity-links with uuid dataset entries should trigger.
     *
     * @param event A PointerEvent by user interaction.
     */
    static async renderEntityLinkSheet(event) {
        const element = $(event.currentTarget);
        const uuid = element.data('uuid');
        await Helpers.renderDocumentSheet(uuid);
    }

    /**
     * Fetch a Document using the FoundryVTT UUID and render it's connected sheet.
     *
     * @param uuid Generated by Document.uuid property.
     * @param resolveTokenToActor Should the uuid resolve to a TokenDocument, rather render it's actor.
     */
    static async renderDocumentSheet(uuid: string, resolveTokenToActor = true) {
        if (!uuid) return;
        let document = await fromUuid(uuid);
        if (!document) return;
        if (document instanceof TokenDocument && resolveTokenToActor && document.actor)
            document = document.actor;
        if (document instanceof SR5Actor || document instanceof SR5Item)
            await document?.sheet?.render(true);
    }

    /**
     * Sanitize keys to not use characters used within FoundryVTT Document#update and expandObject methods.
     * 
     * @param key The key, maybe containing prohibited characters
     * @param replace The characters to replaces prohibited characters with
     * @returns key without 
     */
    static sanitizeDataKey(key: string, replace: string=''): string {
        const spicyCharacters = ['.', '-='];
        spicyCharacters.forEach(character => key = key.replace(character, replace));
        return key;
    }

    /**
     * This method tries to get an owned actor of the user.
     * If none are found it will return null
     * If exactly one is found, it will automatically return the found actor
     * If several are found it prompts the user to choose on of the available actors
     * @returns an actor
     */
    static async chooseFromAvailableActors() {
        let availableActors =  game.actors?.filter( e => e.isOwner && e.hasPlayerOwner) ?? [];

        if(availableActors.length == 0) {
            return undefined;
        }

        if(availableActors.length == 1) {
            return availableActors[0]
        } else {
            let allActors = ''
            game.actors?.filter( e => e.isOwner && e.hasPlayerOwner).forEach(t => {
                    allActors = allActors.concat(`
                            <option value="${t.id}">${t.name}</option>`);
                });
            const  dialog_content = `  
                <select name ="actor">
                ${allActors}
                </select>`;
    
            let choosenActor = await Dialog.prompt({
                title: game.i18n.localize('SR5.Skill.Teamwork.ParticipantActor'),
                content: dialog_content,
                callback: (html) => html.find('select').val()
            }) as string;
    
            return game.actors?.get(choosenActor) as SR5Actor;
        }
    }

    /**
     * A method to capitalize the first letter of a given string.
     * This allows to transform skill and attribute ids to the corresponding translation sub-keys
     * See @see getSkillTranslation @see getAttributeTranslaton
     * @param string 
     * @returns the string with a capitalized first letter
     */
    static capitalizeFirstLetter(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }  

    /**
     * Translates a skillId
     * @param skill 
     * @returns translation
     */
    static getSkillTranslation(skill: string) : string {
        return game.i18n.localize(`SR5.Skill.${this.capitalizeFirstLetter(skill)}` as Translation)
    }

    /**
     * Translate an attribute
     * @param attribute 
     * @returns translation
     */
    static getAttributeTranslation(attribute: string) : string {
        return game.i18n.localize(`SR5.Attr${this.capitalizeFirstLetter(attribute)}` as Translation)
    }
}
