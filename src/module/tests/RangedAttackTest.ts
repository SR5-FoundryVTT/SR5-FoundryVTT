import { TestDialog } from '../apps/dialogs/TestDialog';
import { RangedWeaponRules } from '../rules/RangedWeaponRules';
import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {DataDefaults} from "../data/DataDefaults";
import {PartsList} from "../parts/PartsList";
import {Helpers} from "../helpers";
import {LENGTH_UNIT, SR, SYSTEM_NAME} from "../constants";
import {SR5} from "../config";
import {DocumentSituationModifiers} from "../rules/DocumentSituationModifiers";
import {FireModeRules} from "../rules/FireModeRules";
import { SR5Item } from "../item/SR5Item";
import { TestCreator } from './TestCreator';

export interface RangedAttackTestData extends SuccessTestData {
    damage: Shadowrun.DamageData
    fireModes: Shadowrun.FireModeData[]
    fireMode: Shadowrun.FireModeData
    // index of selected fireMode in fireModes
    fireModeSelected: number
    ranges: Shadowrun.RangesTemplateData
    range: number
    targetRanges: Shadowrun.TargetRangeTemplateData[]
    // index of selected target range in targetRanges
    targetRangesSelected: number
}


export class RangedAttackTest extends SuccessTest {
    public override data: RangedAttackTestData;
    public override item: SR5Item;

    override _prepareData(data, options): RangedAttackTestData {
        data = super._prepareData(data, options);

        data.fireModes = [];
        data.fireMode = {value: 0, defense: 0, label: ''};
        data.ranges = {};
        data.range = 0;
        data.targetRanges = [];
        data.targetRangesSelected = 0;
        data.damage = data.damage || DataDefaults.damageData();

        return data;
    }

    override _testDialogListeners() {
        return [{
            query: '#reset-progressive-recoil',
            on: 'click',
            callback: this._handleResetProgressiveRecoil
        }]
    }

    /**
     * User want's to manually reset progressive recoil before casting the attack test.
     */
    async _handleResetProgressiveRecoil(event: JQuery<HTMLElement>, test: TestDialog) {
        if (!this.actor) return;
        await this.actor.clearProgressiveRecoil();

        // Refresh test values.
        this.prepareBaseValues();
        this.calculateBaseValues();

        // Inform user about changes.
        test.render();
    }

    override get canBeExtended() {
        return false;
    }

    override get showSuccessLabel(): boolean {
        return this.success;
    }

    _selectFireMode(index: number) {
        this.data.fireMode = this.data.fireModes[index];
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
        const {ranges} = weapon.system.range;
        const {range_modifiers} = SR.combat.environmental;
        const newRanges = {} as Shadowrun.RangesTemplateData;
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

    /**
     * Weapon fire modes will affect recoil during test.
     * 
     * To show the user the effect of recoil, it's applied during selection but progressive recoil is only ever fully applied
     * after the test is executed.
     */
    _prepareFireMode() {        
        // No fire modes selectable on dialog for invalid item provided.
        const weapon = this.item.asWeapon;
        if (!weapon) return;

        this.data.fireModes = FireModeRules.availableFireModes(weapon.system.range.modes);

        // To avoid problems when no firemode is configured on the weapon, add at least one to what's available
        if (this.data.fireModes.length === 0) {
            this.data.fireModes.push(SR5.fireModes[0]);
            ui.notifications?.warn('SR5.Warnings.NoFireModeConfigured', {localize: true});
        }

        // Current firemode selected
        const lastFireMode = this.item.getLastFireMode() || DataDefaults.fireModeData();
        // Try pre-selection based on last fire mode.
        this.data.fireModeSelected = this.data.fireModes.findIndex(available => lastFireMode.label === available.label);
        if (this.data.fireModeSelected == -1) this.data.fireModeSelected = 0;
        this._selectFireMode(this.data.fireModeSelected);
    }

    override get testModifiers(): Shadowrun.ModifierTypes[] {
        return ['global', 'wounds', 'environmental', 'recoil'];
    }

    override async prepareDocumentData(){
        this._prepareWeaponRanges();
        this._prepareTargetRanges();
        this._prepareFireMode();

        await super.prepareDocumentData();
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/ranged-attack-test-dialog.html';
    }

    /**
     * If a suppression fire mode is used, ignore action opposed test configuration.
     */
    override get _opposedTestClass() {
        if (this.data.fireMode.suppression) return TestCreator._getTestClass(SR5.suppressionDefenseTest);
        return super._opposedTestClass;
    }

    /**
     * Save selections made back to documents.
     * @returns 
     */
    override async saveUserSelectionAfterDialog() {
        if (!this.actor) return;
        if (!this.item) return;

        // Save fire mode selection
        await this.item.setLastFireMode(this.data.fireMode);

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

        // Use selection for actual fireMode, overwriting possible previous selection for item.
        this._selectFireMode(this.data.fireModeSelected);
        
        // Alter fire mode by ammunition constraints.
        this.data.fireMode.defense = FireModeRules.fireModeDefenseModifier(this.data.fireMode, this.item.ammoLeft);

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

    /**
     * Enough resources according to test configuration?
     * 
     * Ranged weapons need ammunition in enough quantity.
     * 
     * NOTE: In this case it's only checked if at least ONE bullet exists.
     *       It's done this way as no matter the fire mode, you can fire it.
     */
    override canConsumeDocumentResources() {
        if (!this.item.isRangedWeapon) return true;
        
        // Ammo consumption
        const fireMode = this.data.fireMode;
        if (fireMode.value === 0) return true;

        if (!this.item.hasAmmo(1)) {
            ui.notifications?.error('SR5.MissingRessource.Ammo', {localize: true});
            return false;
        }

        return super.canConsumeDocumentResources();
    }

    /**
     * Ranged Attacks not only can consume edge but also reduce ammunition.
     * 
     */
    override async consumeDocumentRessources() {        
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
        await this.actor?.addProgressiveRecoil(fireMode);

        return true;
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

    /**
     * Template helper for showing recoil before attack
     */
    get recoilBeforeAttack(): number {
        if (!this.actor) return 0;
        return this.actor.recoil;
    }

    /**
     * Template helper for showing recoil after attack
     */
    get recoilAfterAttack(): number {
        if (!this.actor) return 0;
        
        const fireMode = this.data.fireMode;
        const fireModeRecoil = fireMode.recoil ? fireMode.value : 0;
        return this.actor.recoil + fireModeRecoil;
    }
}