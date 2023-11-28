import { SuccessTest, SuccessTestData } from './SuccessTest';
import { DataDefaults } from '../data/DataDefaults';
import { RangedAttackTestData } from './RangedAttackTest';
import { SR5Item } from '../item/SR5Item';
import { LENGTH_UNIT, SR, SYSTEM_NAME } from '../constants';
import { Helpers } from '../helpers';
import { SR5 } from '../config';
import { RangedWeaponRules } from '../rules/RangedWeaponRules';
import { PartsList } from '../parts/PartsList';
import { DocumentSituationModifiers } from '../rules/DocumentSituationModifiers';

export interface ThrownAttackTestData extends SuccessTestData {
    damage: Shadowrun.DamageData
    ranges: Shadowrun.RangesTemplateData
    range: number
    targetRanges: Shadowrun.TargetRangeTemplateData[]
    // index of selected target range in targetRanges
    targetRangesSelected: number
}

/**
 * Test implementation for attack tests using weapon of category thrown.
 */
export class ThrownAttackTest extends SuccessTest {
    public override data: ThrownAttackTestData;
    public override item: SR5Item;

    override _prepareData(data, options): RangedAttackTestData {
        data = super._prepareData(data, options);

        data.ranges = {};
        data.range = 0;
        data.targetRanges = [];
        data.targetRangesSelected = 0;
        data.damage = data.damage || DataDefaults.damageData();

        return data;
    }

    override get canBeExtended() {
        return false;
    }

    override get showSuccessLabel(): boolean {
        return this.success;
    }

    /**
     * Weapon range selection depends on the weapon alone.
     *
     * In case of selected targets, this will be overwritten.
     *
     */
    _prepareWeaponRanges() {
        // Don't let missing weapon ranges break test.
        const weapon = this.item?.asWeapon;
        if (!weapon) return;

        // Transform weapon ranges to something usable
        const {ranges} = weapon.system.thrown;
        const {range_modifiers} = SR.combat.environmental;
        const newRanges = {} as Shadowrun.RangesTemplateData;

        for (const key of ["short", "medium", "long", "extreme"] as const) {
            const rangeValue = ranges[key];
            const distance = (this.actor && !!ranges.attribute) ?
                this.actor.getAttribute(ranges.attribute).value * rangeValue :
                rangeValue;
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
     * Actual target range between attack and target.
     *
     * This will overwrite the default weapon range selection.
     */
    _prepareTargetRanges() {
        //@ts-expect-error // TODO: foundry-vtt-types v10
        if (foundry.utils.isEmpty(this.data.ranges)) return;
        if (!this.actor) return;
        if (!this.hasTargets) return;

        const attacker = this.actor.getToken();

        if (!attacker) {
            ui.notifications?.warn(game.i18n.localize('SR5.TargetingNeedsActorWithToken'));
            return [];
        }

        // Build target ranges for template display.
        this.data.targetRanges = this.targets.map(token => {
            const distance = Helpers.measureTokenDistance(attacker, token);
            const range = RangedWeaponRules.getRangeForTargetDistance(distance, this.data.ranges);
            return {
                tokenUuid: token.uuid,
                name: token.name || '',
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

    override get testModifiers(): Shadowrun.ModifierTypes[] {
        return ['global', 'wounds', 'environmental'];
    }

    override async prepareDocumentData(){
        this._prepareWeaponRanges();
        this._prepareTargetRanges();

        await super.prepareDocumentData();
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/thrown-attack-test-dialog.html';
    }

    /**
     * Save selections made back to documents.
     * @returns
     */
    override async saveUserSelectionAfterDialog() {
        if (!this.actor) return;
        if (!this.item) return;

        // Save range selection
        const modifiers = this.actor.getSituationModifiers();
        modifiers.environmental.setActive('range', this.data.range);
        await this.actor.setSituationModifiers(modifiers);
    }

    /**
     * Apply test selections made by user in dialog.
     * @returns
     */
    override prepareBaseValues() {
        if (!this.actor) return;
        if (!this.item) return;

        // Get range modifier from selected target instead of selected range.
        if (this.hasTargets) {
            // Cast select options string to integer index.
            this.data.targetRangesSelected = Number(this.data.targetRangesSelected);
            const target = this.data.targetRanges[this.data.targetRangesSelected];
            this.data.range = target.range.modifier;

            // Reduce all targets selected down to the actual target fired upon.
            const token = fromUuidSync(target.tokenUuid) as TokenDocument;
            if (!(token instanceof TokenDocument)) return console.error(`Shadowrun 5e | ${this.type} got a target that is no TokenDocument`, token);
            if (!token.actor) return console.error(`Shadowrun 5e | ${this.type} got a token that has no actor`, token);
            this.data.targetActorsUuid = [token.actor.uuid];
            this.targets = [token];
        }

        // Alter test data for range.
        this.data.range = Number(this.data.range);

        super.prepareBaseValues();
    }

    /**
     * Ranged attack tests allow for temporarily changing of modifiers without altering the document.
     */
    override prepareTestModifiers() {
        this.prepareEnvironmentalModifier();
    }

    prepareEnvironmentalModifier() {
        if (!this.actor) return;

        const poolMods = new PartsList(this.data.modifiers.mod);

        // Apply altered environmental modifiers
        const range = this.hasTargets ? this.data.targetRanges[this.data.targetRangesSelected].range.modifier : this.data.range;
        const modifiers = DocumentSituationModifiers.getDocumentModifiers(this.actor);

        // Locally set env modifier temporarily.
        modifiers.environmental.setActive('range', Number(range));
        modifiers.environmental.apply({reapply: true});

        poolMods.addUniquePart(SR5.modifierTypes.environmental, modifiers.environmental.total);
    }

    override async processResults() {
        super.processResults();

        await this.markActionPhaseAsAttackUsed();
    }

    async markActionPhaseAsAttackUsed() {
        if (!this.actor! || !this.actor.combatActive) return;

        const combatant = this.actor.combatant;
        if (!combatant) return;

        await combatant.setFlag(SYSTEM_NAME, 'turnsSinceLastAttack', 0);
    }
}