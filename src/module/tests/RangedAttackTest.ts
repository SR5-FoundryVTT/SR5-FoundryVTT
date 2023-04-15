import { TestDialog } from './../apps/dialogs/TestDialog';
import { RangedWeaponRules } from './../rules/RangedWeaponRules';
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

    /**
     * This test type can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

    override get showSuccessLabel(): boolean {
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
        const lastFireMode = this.item.getLastFireMode() || DataDefaults.fireModeData();
        // Try pre-selection based on last fire mode.
        this.data.fireModeSelected = this.data.fireModes.findIndex(available => lastFireMode.label === available.label);
        if (this.data.fireModeSelected == -1) this.data.fireModeSelected = 0;
        this._selectFireMode(this.data.fireModeSelected);
    }

    _selectFireMode(index: number) {
        this.data.fireMode = this.data.fireModes[index];
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

    override get testModifiers(): ModifierTypes[] {
        return ['global', 'wounds', 'environmental', 'recoil'];
    }

    override async prepareDocumentData(){
        await this._prepareWeaponRanges();
        await this._prepareTargetRanges();
        this._prepareFireMode();

        await super.prepareDocumentData();
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/ranged-attack-test-dialog.html';
    }

    /**
     * If a supression fire mode is used, ignore action opposed test configuration.
     */
    override get _opposedTestClass() {
        if (this.data.fireMode.suppression) return TestCreator._getTestClass(SR5.supressionDefenseTest);
        return super._opposedTestClass;
    }

    override async saveUserSelectionAfterDialog() {
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

    override prepareBaseValues() {
        if (!this.actor) return;
        if (!this.item) return;

        const poolMods = new PartsList(this.data.modifiers.mod);

        // Apply recoil modification to general modifiers before calculating base values.
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
    override canConsumeDocumentRessources() {
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