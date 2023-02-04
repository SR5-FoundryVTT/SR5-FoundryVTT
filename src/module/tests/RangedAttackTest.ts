import { RangedWeaponRules } from './../rules/RangedWeaponRules';
import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {DefaultValues} from "../data/DataDefaults";
import {PartsList} from "../parts/PartsList";
import {Helpers} from "../helpers";
import {LENGTH_UNIT, SR} from "../constants";
import {SR5} from "../config";
import {DocumentSituationModifiers} from "../rules/DocumentSituationModifiers";
import {FireModeRules} from "../rules/FireModeRules";
import { SR5Item } from "../item/SR5Item";
import { TestCreator } from './TestCreator';
import DamageData = Shadowrun.DamageData;
import FireModeData = Shadowrun.FireModeData;
import RangesTemplateData = Shadowrun.RangesTemplateData;
import TargetRangeTemplateData = Shadowrun.TargetRangeTemplateData;
import ModifierTypes = Shadowrun.ModifierTypes;

export interface RangedAttackTestData extends SuccessTestData {
    damage: DamageData
    fireModes: FireModeData[]
    fireMode: FireModeData
    // index of selceted fireMode in fireModes
    fireModeSelected: number
    recoilCompensation: number
    ranges: RangesTemplateData
    range: number
    targetRanges: TargetRangeTemplateData[]
    // index of selected target range in targetRanges
    targetRangesSelected: number
}

/**
 * TODO: Handle near misses (3 hits attacker, 3 hits defender) => No hit, but also no failure.
 * TODO: Move rules into CombatRules
 */
export class RangedAttackTest extends SuccessTest {
    public data: RangedAttackTestData;
    public item: SR5Item;

    _prepareData(data, options): RangedAttackTestData {
        data = super._prepareData(data, options);

        data.fireModes = [];
        data.fireMode = {value: 0, defense: 0, label: ''};
        data.ranges = {};
        data.range = 0;
        data.targetRanges = [];
        data.targetRangesSelected = 0;
        data.recoilCompensation = 0;
        data.damage = data.damage || DefaultValues.damageData();

        return data;
    }

    /**
     * This test type can't be extended.
     */
    get canBeExtended() {
        return false;
    }

    get showSuccessLabel(): boolean {
        return this.success;
    }

    _prepareFireMode() {        
        // No firemodes selectable on dialog for invalid item provided.
        const weapon = this.item.asWeapon;
        if (!weapon) return;

        //@ts-ignore // TODO: foundry-vtt-types v10 
        this.data.fireModes = FireModeRules.availableFireModes(weapon.system.range.modes);

        // To avoid problems when no firemode is configured on the weapon, add at least one to what's available
        if (this.data.fireModes.length === 0) {
            this.data.fireModes.push(SR5.fireModes[0]);
            ui.notifications?.warn('SR5.Warnings.NoFireModeConfigured', {localize: true});
        }

        // Current firemode selected
        const lastFireMode = this.item.getLastFireMode() || DefaultValues.fireModeData();
        // Try pre-selection based on last fire mode.
        this.data.fireModeSelected = this.data.fireModes.findIndex(available => lastFireMode.label === available.label);
        if (this.data.fireModeSelected == -1) this.data.fireModeSelected = 0;
        this.data.fireMode = this.data.fireModes[this.data.fireModeSelected];
    }

    async _prepareWeaponRanges() {
        // Don't let missing weapon ranges break test.
        const weapon = this.item?.asWeapon;
        if (!weapon) return;

        // Transform weapon ranges to something usable
        const {ranges} = weapon.system.range;
        const {range_modifiers} = SR.combat.environmental;
        const newRanges = {} as RangesTemplateData;
        for (const [key, value] of Object.entries(ranges)) {
            const distance = value as number;
            newRanges[key] = Helpers.createRangeDescription(SR5.weaponRanges[key], distance, range_modifiers[key]);
        }
        this.data.ranges = newRanges;

        // Get currently active range modifier.
        const actor = this.actor;
        if (!actor) return;

        const modifiers = actor.getSituationModifiers();
        // If no range is active, set to zero.
        this.data.range = modifiers.environmental.applied.active.range || 0;
    }

    /**
     * Prepare distances between attacker and targeted tokens.
     */
    async _prepareTargetRanges() {
        //@ts-ignore // TODO: foundry-vtt-types v10
        if (foundry.utils.isEmpty(this.data.ranges)) return;
        if (!this.actor) return;
        if (!this.hasTargets) return;

        const attacker = this.actor.getToken();

        if (!attacker) {
            ui.notifications?.warn(game.i18n.localize('SR5.TargetingNeedsActorWithToken'));
            return [];
        }

        // Build target ranges for template display.
        this.data.targetRanges = this.targets.map(target => {
            const distance = Helpers.measureTokenDistance(attacker, target);
            const range = RangedWeaponRules.getRangeForTargetDistance(distance, this.data.ranges);
            return {
                uuid: target.uuid,
                name: target.name || '',
                unit: LENGTH_UNIT,
                range,
                distance,
            };
        });

        // Sort targets by ascending distance from attacker.
        this.data.targetRanges = this.data.targetRanges.sort((a, b) => {
            if (a.distance < b.distance) return -1;
            if (a.distance > b.distance) return 1;
            return 0;
        });

        // if no range is active, set to first target selected.
        const modifiers = this.actor.getSituationModifiers();
        this.data.range = modifiers.environmental.applied.active.range || this.data.targetRanges[0].range.modifier;
    }

    _prepareRecoilCompensation() {
        this.data.recoilCompensation = this.item?.totalRecoilCompensation || 0;
    }

    get testModifiers(): ModifierTypes[] {
        return ['global', 'wounds', 'environmental'];
    }

    async prepareDocumentData(){
        await this._prepareWeaponRanges();
        await this._prepareTargetRanges();
        this._prepareFireMode();
        this._prepareRecoilCompensation();

        await super.prepareDocumentData();
    }

    get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/ranged-attack-test-dialog.html';
    }

    /**
     * If a supression fire mode is used, ignore action opposed test configuration.
     */
    get _opposedTestClass() {
        if (this.data.fireMode.suppression) return TestCreator._getTestClass(SR5.supressionDefenseTest);
        return super._opposedTestClass;
    }

    async saveUserSelectionAfterDialog() {
        if (!this.item) return;

        // Store for next usage.
        await this.item.setLastFireMode(this.data.fireMode);

        /**
         * RANGE
         */

        if (!this.actor) return;

        const modifiers = await this.actor.getSituationModifiers();
        modifiers.environmental.setActive('range', this.data.range);
        await this.actor.setSituationModifiers(modifiers);
    }

    prepareBaseValues() {
        if (!this.actor) return;
        if (!this.item) return;

        const poolMods = new PartsList(this.data.modifiers.mod);

        // Apply recoil modification to general modifiers before calculating base values.
        // TODO: Actual recoil calculation with consumption of recoil compensation.
        const {fireModes, fireModeSelected, recoilCompensation} = this.data;

        // Use selection for actual fireMode, overwriting possible previous selection for item.
        // TODO: Suppression fire mode causes dice pool modifiers against all actions. Add an active effect to the chat message.
        this.data.fireMode = fireModes[fireModeSelected];

        // Alter fire mode by ammunition constraints.
        this.data.fireMode.defense = FireModeRules.fireModeDefenseModifier(this.data.fireMode, this.item.ammoLeft);
        // Alter recoil modifier by ammunition constraints.
        const {compensation, recoilModifier} = FireModeRules.recoilAttackModifier(this.data.fireMode, recoilCompensation, this.item.ammoLeft);

        poolMods.addUniquePart('SR5.Recoil', recoilModifier);

        // Get range modifier from selected target instead of selected range.
        if (this.hasTargets) {
            // Cast select options string to integer index.
            this.data.targetRangesSelected = Number(this.data.targetRangesSelected);
            const target = this.data.targetRanges[this.data.targetRangesSelected];
            this.data.range = target.range.modifier;

            this.data.targetActorsUuid = this.data.targetActorsUuid.filter(uuid => uuid === target.uuid);
        }

        // Alter test data for range.
        this.data.range = Number(this.data.range);

        // Apply altered environmental modifiers
        const range = this.hasTargets ? this.data.targetRanges[this.data.targetRangesSelected].range.modifier : this.data.range;
        const modifiers = DocumentSituationModifiers.getDocumentModifiers(this.actor);
        
        // Locally set env modifier temporarily.
        modifiers.environmental.setActive('range', Number(range));
        modifiers.environmental.apply({reapply: true});

        poolMods.addUniquePart(SR5.modifierTypes.environmental, modifiers.environmental.total);

        super.prepareBaseValues();
    }

    /**
     * Ennough ressources according to test configuration?
     * 
     * Ranged weapons need ammunition in enough quantity.
     * 
     * NOTE: In this case it's only checked if at least ONE bullet exists.
     *       It's done this way as no matter the fire mode, you can fire it.
     */
    canConsumeDocumentRessources() {
        if (!this.item.isRangedWeapon) return true;
        
        // Ammo consumption
        const fireMode = this.data.fireMode;
        if (fireMode.value === 0) return true;

        if (!this.item.hasAmmo(1)) {
            ui.notifications?.error('SR5.MissingRessource.Ammo', {localize: true});
            return false;
        }

        return super.canConsumeDocumentRessources();
    }

    /**
     * Ranged Attacks not only can consume edge but also reduce ammunition.
     * 
     */
    async consumeDocumentRessources() {        
        if (!await super.consumeDocumentRessources()) return false;
        if (!await this.consumeWeaponAmmo()) return false;

        return true;
    }

    /**
     * Reduce ranged weapon ammunition according to the fire mode used.
     */
    async consumeWeaponAmmo(): Promise<boolean> {
        if (!this.item) return true;
        if (!this.item.isRangedWeapon) return true;

        const fireMode = this.data.fireMode;
        if (fireMode.value === 0) return true;

        // Notify user about some but not no ammo. Still fire though.
        if (!this.item.hasAmmo(fireMode.value)) {
            ui.notifications?.warn('SR5.MissingRessource.SomeAmmo', {localize: true});
        }

        await this.item.useAmmo(fireMode.value);

        return true;
    }
}