import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {DefaultValues} from "../data/DataDefaults";
import {PartsList} from "../parts/PartsList";
import {Helpers} from "../helpers";
import {LENGTH_UNIT, SR} from "../constants";
import {SR5} from "../config";
import {Modifiers} from "../rules/Modifiers";
import DamageData = Shadowrun.DamageData;
import FireModeData = Shadowrun.FireModeData;
import RangesTemplateData = Shadowrun.RangesTemplateData;
import TargetRangeTemplateData = Shadowrun.TargetRangeTemplateData;
import {RangedRules} from "../rules/RangedRules";

export interface RangedAttackTestData extends SuccessTestData {
    damage: DamageData
    fireModes: Record<string, string>
    fireMode: FireModeData
    recoilCompensation: number
    ranges: RangesTemplateData
    range: number
    targetRanges: TargetRangeTemplateData[]
    // index of selected targetRanges
    targetRangesSelected: number
}

/**
 * TODO: Handle near misses (3 hits attacker, 3 hits defender) => No hit, but also no failure.
 * TODO: Move rules into CombatRules
 */
export class RangedAttackTest extends SuccessTest {
    public data: RangedAttackTestData;

    _prepareData(data, options): RangedAttackTestData {
        data = super._prepareData(data, options);

        data.fireModes = {};
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

    _prepareFireMode() {
        // No firemodes selectable on dialog for invalid item provided.
        const weaponData = this.item?.asWeaponData();
        if (!weaponData) return;

        // Firemodes selection.
        const {modes} = weaponData.data.range;

        // TODO: Remove fire modes unavailable due to missing ammunition.

         if (modes.single_shot) {
            this.data.fireModes['1'] = game.i18n.localize("SR5.WeaponModeSingleShotShort");
        }
        if (modes.semi_auto) {
            this.data.fireModes['1'] = game.i18n.localize("SR5.WeaponModeSemiAutoShort");
            this.data.fireModes['3'] = game.i18n.localize("SR5.WeaponModeSemiAutoBurst");
        }
        if (modes.burst_fire) {
            this.data.fireModes['3'] = `${modes.semi_auto ? `${game.i18n.localize("SR5.WeaponModeSemiAutoBurst")}/` : ''}${game.i18n.localize("SR5.WeaponModeBurstFireShort")}`;
            this.data.fireModes['6'] = game.i18n.localize("SR5.WeaponModeBurstFireLong");
        }
        if (modes.full_auto) {
            this.data.fireModes['6'] = `${modes.burst_fire ? 'LB/' : ''}${game.i18n.localize("SR5.WeaponModeFullAutoShort")}(s)`;
            this.data.fireModes['10'] = `${game.i18n.localize("SR5.WeaponModeFullAutoShort")}(c)`;
            this.data.fireModes['20'] = game.i18n.localize('SR5.Suppressing');
        }

        // Current firemode selected
        this.data.fireMode = this.item?.getLastFireMode() || {value: 0, defense: 0, label: ''};
    }

    async _prepareWeaponRanges() {
        // Don't let missing weapon ranges break test.
        const itemData = this.item?.asWeaponData();
        if (!itemData) return;

        // Transform weapon ranges to something usable
        const {ranges} = itemData.data.range;
        const {range_modifiers} = SR.combat.environmental;
        const newRanges = {} as RangesTemplateData;
        for (const [key, value] of Object.entries(ranges)) {
            const distance = value as number;
            newRanges[key] = Helpers.createRangeDescription(SR5.weaponRanges[key], distance, range_modifiers[key]);
        }
        this.data.ranges = newRanges;

        // TODO: template disableTargetRange
        // Get currently active range modifier.
        const actor = this.actor;
        if (!actor) return;

        const modifiers = await actor.getModifiers();
        // If no range is active, set to zero.
        this.data.range = modifiers.environmental.active.range || 0;
    }

    /**
     * Prepare distances between attacker and targeted tokens.
     */
    async _prepareTargetRanges() {
        if (foundry.utils.isObjectEmpty(this.data.ranges)) return;
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
            const range = Helpers.getWeaponRange(distance, this.data.ranges);
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
        const modifiers = await this.actor.getModifiers();
        this.data.range = modifiers.environmental.active.range || this.data.targetRanges[0].range.modifier;
    }

    _prepareRecoilCompensation() {
        this.data.recoilCompensation = this.item?.getRecoilCompensation(true) || 0;
    }

    get testModifiers() {
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

    async saveUserSelectionAfterDialog() {
        if (!this.item) return;

        // Store for next usage.
        await this.item.setLastFireMode(this.data.fireMode);

        /**
         * RANGE
         */

        if (!this.actor) return;

        const modifiers = await this.actor.getModifiers();
        modifiers.activateEnvironmentalCategory('range', this.data.range);
        await this.actor.setModifiers(modifiers);
    }

    prepareBaseValues() {
        if (!this.actor) return;
        if (!this.item) return;

        const poolMods = new PartsList(this.data.modifiers.mod);

        // Apply recoil modification to general modifiers before calculating base values.
        // TODO: Actual recoil calculation with consumption of recoil compensation.
        const {fireMode, fireModes, recoilCompensation} = this.data;

        // Alter fire mode by ammunition constraints.
        fireMode.value = Number(fireMode.value || 0);
        const fireModeName = fireModes[fireMode.value];
        const defenseModifier = RangedRules.fireModeDefenseModifier(fireMode.value, this.item.ammoLeft);

        this.data.fireMode = {
            label: fireModeName,
            value: fireMode.value,
            defense: defenseModifier,
        };

        // Alter recoil modifier by ammunition constraints.
        const {recoilModifier} = RangedRules.recoilAttackModifier(recoilCompensation, Number(fireMode.value), this.item.ammoLeft);

        // Inform user about insufficient ammunition for fire mode selected
        if (fireMode.value > this.item.ammoLeft) {
            ui.notifications?.warn('SR5.MissingResource.Ammo');
        }

        if (recoilModifier < 0)
            poolMods.addUniquePart('SR5.Recoil', recoilModifier);
        else
            poolMods.removePart('SR5.Recoil');

        // Get range modifier from selected target instead of selected range.
        if (this.hasTargets) {
            const target = this.data.targetRanges[this.data.targetRangesSelected];
            this.data.range = target.range.modifier;

            // Only use selected target as this tests target list. Otherwise, opposed test will use all targets.
            this.targets = this.targets.filter(tokenDoc => tokenDoc.uuid === target.uuid);
            this.data.targetActorsUuid = this.data.targetActorsUuid.filter(uuid => uuid === target.uuid);
        }

        // Alter test data for range.
        this.data.range = Number(this.data.range);

        // Apply altered environmental modifiers
        const range = this.hasTargets ? this.data.targetRanges[this.data.targetRangesSelected].range.modifier : this.data.range;
        const modifiers = Modifiers.getModifiersFromEntity(this.actor);
        modifiers.activateEnvironmentalCategory('range', Number(range));
        const environmental = modifiers.environmental.total;

        poolMods.addUniquePart(SR5.modifierTypes.environmental, environmental);

        super.prepareBaseValues();
    }

    /**
     * Ranged Attacks not only can consume edge but also reduce ammunition.
     */
    async consumeActorResources() {
        if (!await super.consumeActorResources()) return false;
        if (!await this.consumeWeaponAmmo()) return false;

        return true;
    }

    /**
     * Reduce ranged weapon ammunition according to the fire mode used.
     */
    async consumeWeaponAmmo(): Promise<boolean> {
        if (!this.item) return true;
        if (!this.item.isRangedWeapon()) return true;

        const fireMode = this.data.fireMode;
        if (fireMode.value === 0) return true;

        // Abort if the weapon doesn't even contain at least one round.
        if (!this.item.hasAmmo(1)) {
            await ui.notifications?.warn('SR5.MissingResource.Ammo', {localize: true});
            return false;
        }

        await this.item.useAmmo(fireMode.value)

        return true;
    }
}