import AttributeField = Shadowrun.AttributeField;
import SkillField = Shadowrun.SkillField;
import ModifiableValue = Shadowrun.ModifiableValue;
import { PartsList } from './parts/PartsList';
import LabelField = Shadowrun.LabelField;
import {FLAGS, LENGTH_UNIT, LENGTH_UNIT_TO_METERS_MULTIPLIERS, SR, SYSTEM_NAME} from "./constants";
import {SR5Actor} from "./actor/SR5Actor";
import RangesTemplateData = Shadowrun.RangesTemplateData;
import RangeTemplateData = Shadowrun.RangeTemplateData;
import DamageData = Shadowrun.DamageData;
import {SR5Roll} from "./roll/SR5Roll";
import ModifiedDamageData = Shadowrun.ModifiedDamageData;
import {DataTemplates} from "./dataTemplates";
import DamageType = Shadowrun.DamageType;
import DamageElement = Shadowrun.DamageElement;
import ActorAttribute = Shadowrun.ActorAttribute;
import {ShadowrunRoll} from "./rolls/ShadowrunRoller";

interface CalcTotalOptions {
    min?: number,
    max?: number
}
export class Helpers {
    /**
     * Calculate the total value for a data object
     * - stores the total value and returns it
     * @param data
     * @param options
     */
    static calcTotal(data: ModifiableValue, options?): number {
        if (data.mod === undefined) data.mod = [];
        const parts = new PartsList(data.mod);
        // if a temp field is found, add it as a unique part
        if (data['temp'] !== undefined) {
            parts.addUniquePart('SR5.Temporary', data['temp']);
        }
        const decimalCount = 3;
        const mult = Math.pow(10, decimalCount);

        data.value = Math.round((parts.total + data.base) * mult) / mult;
        data.mod = parts.list;

        // Apply possible range restrictions, including zero...
        if (typeof options?.min === 'number') {
            data.value = Math.max(options.min, data.value);
        }
        if (typeof options?.max === 'number') {
            data.value = Math.min(options.max, data.value);
        }

        return data.value;
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

    static getToken(id?: string): Token|undefined {
        for (const token of canvas.tokens.placeables) {
            if (token.id === id) {
                return token;
            }
        }
    }

    static getSceneToken(sceneTokenId: string): Token|undefined {
        const [sceneId, tokenId] = sceneTokenId.split('.');

        const isActiveScene = sceneId === canvas?.scene._id;
        if (isActiveScene) {
            return canvas.tokens.get(tokenId);
        }

        // Build Token using it's data from the connected scene as a fallback.
        const scene = game.scenes.get(sceneId);
        if (!scene) {
            return;
        }

        //@ts-ignore
        const tokenData = scene.data.tokens.find((t) => t.id === Number(tokenId));
        if (!tokenData) {
            return;
        }

        return new Token(tokenData);
    }

    static getUserTargets(user?: User): Token[] {
        user = user ? user : game.user;

        if (user) {
            return Array.from(user.targets);
        } else {
            return [];
        }
    }

    static userHasTargets(user?: User): boolean {
        user = user ? user : game.user;

        return user.targets.size > 0;
    }

    static measureTokenDistance(tokenOrigin: Token, tokenDest: Token): number {
        if (!tokenOrigin || !tokenDest) return 0;

        const origin = new PIXI.Point(...canvas.grid.getCenter(tokenOrigin.data.x, tokenOrigin.data.y));
        const dest = new PIXI.Point(...canvas.grid.getCenter(tokenDest.data.x, tokenDest.data.y));

        const distanceInGridUnits = canvas.grid.measureDistance(origin, dest, {gridSpaces: true});
        const sceneUnit = canvas.scene.data.gridUnits;
        // TODO: Define weapon range units somewhere (settings)
        return Helpers.convertLengthUnit(distanceInGridUnits, sceneUnit);
    }

    static convertLengthUnit(length:number, fromUnit: string): number {
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
        return canvas.tokens.controlled;
    }

    static getSelectedActorsOrCharacter(): SR5Actor[] {
        const tokens = Helpers.getControlledTokens();
        const actors = tokens.map(token => token.actor) as SR5Actor[];

        // Try to default to a users character.
        if (actors.length === 0 && game.user?.character) {
            actors.push(game.user.character as SR5Actor);
        }

        return actors;
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

    static createDamageData(value: number, type: DamageType, ap: number = 0, element: DamageElement = ''): DamageData {
        const damage = duplicate(DataTemplates.damage);
        damage.base = value;
        damage.value = value;
        damage.type.base = type;
        damage.type.value = type;
        damage.ap.base = ap;
        damage.ap.value = ap;
        damage.element.base = element;
        damage.element.value = element;

        return damage;
    }

    static modifyDamageBySoakRoll(incoming: DamageData, roll: ShadowrunRoll, modificationLabel: string): ModifiedDamageData {
        const modified = duplicate(incoming);
        modified.mod = PartsList.AddUniquePart(modified.mod, modificationLabel, -roll.hits);
        modified.value = Helpers.calcTotal(modified, {min: 0});

        return {incoming, modified};
    }
}
