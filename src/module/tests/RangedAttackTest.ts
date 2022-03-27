import {SuccessTest, SuccessTestData} from "./SuccessTest";
import DamageData = Shadowrun.DamageData;
import {DefaultValues} from "../data/DataDefaults";
import {PartsList} from "../parts/PartsList";
import { Helpers } from "../helpers";
import {TestDialog} from "../apps/dialogs/TestDialog";
import FireModeData = Shadowrun.FireModeData;
import RangeTemplateData = Shadowrun.RangeTemplateData;
import {SR} from "../constants";
import {SR5} from "../config";
import RangesTemplateData = Shadowrun.RangesTemplateData;

export interface RangedAttackTestData extends SuccessTestData {
    damage: DamageData
    fireModes: Record<string, string>
    fireMode: FireModeData
    recoilCompensation: number
    ranges: Record<string, RangeTemplateData>
    range: number
}

export class RangedAttackTest extends SuccessTest {
    public data: RangedAttackTestData;

    // TODO: Is this needed here?
    _prepareData(data, options): RangedAttackTestData {
        data = super._prepareData(data, options);

        // TODO: these must go into some _prepareActorData during execution (async is needed)
        data.fireModes = {};
        data.fireMode = {value: 0, defense: 0, label: ''};
        data.ranges = {};
        data.recoilCompensation = 0;
        data.damage = data.damage || DefaultValues.damageData();

        return data;
    }

    _prepareFireMode() {
        // No firemodes selectable on dialog for invalid item provided.
        const weaponData = this.item?.asWeaponData();
        if (!weaponData) return;

        // Firemodes selection.
        const {modes} = weaponData.data.range;

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

        // Transform weapon ranges to something useable
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

    _prepareRecoilCompensation() {
        this.data.recoilCompensation = this.item?.getRecoilCompensation(true) || 0;
    }

    async prepareDocumentData(){
        this._prepareFireMode();
        await this._prepareWeaponRanges();
        this._prepareRecoilCompensation();
    }

    _createTestDialog(): TestDialog {
        return new TestDialog({templatePath: 'systems/shadowrun5e/dist/templates/apps/dialogs/ranged-attack-test-dialog.html',
                                     test: this});
    }

    async _alterTestDataFromDialogData() {
        // TODO: structure the resulting modifiers of these into this.data.Modifiers
        // Alter data related to fire modes.
        const {fireMode, fireModes} = this.data;
        // Store current firemode for next test.
        fireMode.value = Number(fireMode.value || 0);
        const fireModeName = fireModes[fireMode.value];
        const defenseModifier = Helpers.mapRoundsToDefenseDesc(fireMode.value);

        this.data.fireMode = {
            label: fireModeName,
            value: fireMode.value,
            defense: defenseModifier,
        };

        // Store for next usage.
        await this.item?.setLastFireMode(this.data.fireMode);

        // alter data related to weapon ranges.
        this.data.range = Number(this.data.range);

        // Store for next usage;
        const actor = this.actor;
        if (!actor) return;

        const modifiers = await actor.getModifiers();
        if (!modifiers.hasActiveEnvironmentalOverwrite) {
            modifiers.activateEnvironmentalCategory('range', this.data.range);
            await actor.setModifiers(modifiers)
        } else {
            console.error('The actor has an active environmental overwrite, yet could define a manual range selection.');
        }
    }

    prepareBaseValues() {
        // Apply recoil modification
        // TODO: Actual recoil calculation with consumption of recoil compensation.
        const {fireMode, recoilCompensation} = this.data;

        const recoil = recoilCompensation - fireMode.value;
        const parts = new PartsList(this.data.pool.mod);
        if (recoil < 0)
            parts.addUniquePart('SR5.Recoil', recoil);
        else
            parts.removePart('SR5.Recoil');

        // Apply weapon range modification
        if (this.data.range < 0)
            parts.addUniquePart('SR5.Range', this.data.range);
        else
            parts.removePart('SR5.Range');
    }

    async processResults() {
        await super.processResults();
    }

    async processSuccess(): Promise<void> {
        const parts = new PartsList(this.data.damage.mod);
        parts.addUniquePart('SR5.NetHits', this.netHits.value);
        this.data.damage.value = Helpers.calcTotal(this.data.damage, {min: 0});
    }
}