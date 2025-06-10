import { TestDialog } from '../apps/dialogs/TestDialog';
import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {DataDefaults} from "../data/DataDefaults";
import {SR5} from "../config";
import {FireModeRules} from "../rules/FireModeRules";
import { SR5Item } from "../item/SR5Item";
import { TestCreator } from './TestCreator';
import { WeaponRangeTestBehavior, WeaponRangeTestDataFragment } from '../rules/WeaponRangeRules';
import { DamageType } from '../types/item/ActionModel';

export interface RangedAttackTestData extends SuccessTestData, WeaponRangeTestDataFragment {
    damage: DamageType
    fireModes: Shadowrun.FireModeData[]
    fireMode: Shadowrun.FireModeData
    // index of selected fireMode in fireModes
    fireModeSelected: number
    ranges: Shadowrun.RangesTemplateData
    range: number
    targetRanges: Shadowrun.TargetRangeTemplateData[]
    // index of selected target range in targetRanges
    targetRangesSelected: number
    // Distance to target in meters.
    distance: number
}


export class RangedAttackTest extends SuccessTest<RangedAttackTestData> {
    declare item: SR5Item;

    override _prepareData(data, options): RangedAttackTestData {
        data = super._prepareData(data, options);

        data.fireModes = [];
        data.fireMode = {value: 0, defense: 0, label: ''};
        WeaponRangeTestBehavior.prepareData(this, data);


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
     * Weapon fire modes will affect recoil during test.
     * 
     * To show the user the effect of recoil, it's applied during selection but progressive recoil is only ever fully applied
     * after the test is executed.
     */
    _prepareFireMode() {        
        // No fire modes selectable on dialog for invalid item provided.
        const weapon = this.item.asType('weapon');
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

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['attack', 'attack_ranged']
    }

    override get testModifiers(): Shadowrun.ModifierTypes[] {
        return ['global', 'wounds', 'environmental', 'recoil'];
    }

    override async prepareDocumentData(){
        WeaponRangeTestBehavior.prepareDocumentData(this, (weapon) => weapon.system.range.ranges);
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
        await WeaponRangeTestBehavior.saveUserSelectionAfterDialog(this);
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
        this.data.fireMode.defense = FireModeRules.fireModeDefenseModifier(this.data.fireMode, this.item.ammoLeft());

        WeaponRangeTestBehavior.prepareBaseValues(this);

        super.prepareBaseValues();
    }

    /**
     * Ranged attack tests allow for temporarily changing of modifiers without altering the document.
     */
    override prepareTestModifiers() {
        WeaponRangeTestBehavior.prepareTestModifiers(this);
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
        if (!this.item.isRangedWeapon()) return true;
        
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
        if (!this.item.isRangedWeapon()) return true;

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
        await super.processResults();

        await WeaponRangeTestBehavior.processResults(this);
    }

    /**
     * Template helper for showing recoil before attack
     */
    get recoilBeforeAttack(): number {
        if (!this.actor) return 0;
        return this.actor.recoil();
    }

    /**
     * Template helper for showing recoil after attack
     */
    get recoilAfterAttack(): number {
        if (!this.actor) return 0;
        
        const fireMode = this.data.fireMode;
        const fireModeRecoil = fireMode.recoil ? fireMode.value : 0;
        return this.actor.recoil() + fireModeRecoil;
    }
}