import { DeepPartial } from "fvtt-types/utils";
import { SR5 } from "../config";
import { DataDefaults } from "../data/DataDefaults";
import { PartsList } from "../parts/PartsList";
import { CompilationRules } from "../rules/CompilationRules";
import { DamageType, MinimalActionType } from "../types/item/Action";
import { SuccessTest, SuccessTestData, TestOptions } from "./SuccessTest";


interface CompileSpriteTestData extends SuccessTestData {
    // Sprite type selection.
    spriteTypes: typeof SR5.spriteTypes
    spriteTypeSelected: string

    // Testing values as described on SR5#254
    level: number
    fade: number
    fadeDamage: DamageType

    // Determine if compilation concluded and fade will apply
    fadeReady: boolean

    // Reference to prepared sprite actor
    preparedSpriteUuid: string
}
/**
 * Implement testing workflow for technomancers sprite compilation within FoundryVTT.
 * 
 * This test is designed to work together with the compilation item type as it's
 * defined within
 */
export class CompileSpriteTest extends SuccessTest<CompileSpriteTestData> {

    override _prepareData(data: any, options: TestOptions) {
        data = super._prepareData(data, options);

        this._prepareCompilationData(data);

        data.fade = data.fade || 0;
        data.fadeDamage = data.fadeDamage || DataDefaults.createData('damage');

        return data;
    }

    _prepareCompilationData(data) {
        if (!this.item) return;
        const compilation = this.item.asType('call_in_action');
        if (!compilation || !this.item.isCompilation) return;

        // Choose the most explicit value given, making sure it's still usable.
        data.level = Math.max(data.level || compilation.system.sprite.level || 1, 1);

        data.spriteTypes = this._prepareSpriteTypes();
        data.spriteTypeSelected = data.spriteTypeSelected || compilation.system.sprite.type;

        data.preparedSpriteUuid = data.preparedSpriteUuid || compilation.system.sprite.uuid;
    }

    _prepareSpriteTypes() {
        return SR5.spriteTypes;
    }

    override get _dialogTemplate() {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/compilation-test-dialog.html';
    }

    override get canBeExtended() {
        return false;
    }

    /**
     * Fade test is configured here but will be executed only manually after the opposed test finished.
     */
    override get autoExecuteFollowupTest() {
        return false;
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['compiling'];
    }

    /**
     * Skill + Attribute [Limit] as defined in SR5#254 'Compiling a Sprite'
     * 
     * Limit 'level' is a dynamic test value, so it's missing here as it can't be taken from actor values
     * but will be injected during test dialog preparations.
     */
    static override _getDefaultTestAction(): DeepPartial<MinimalActionType> {
        return { skill: 'compiling', attribute: 'resonance' };
    }

    /**
     * Inject level as limit value into test.
     */
    override prepareBaseValues() {
        super.prepareBaseValues();
        this.prepareLimitValue();
    }

    /**
     * Level value only depends on user selection and doesn't deviate according to SR5#254.
     */
    prepareLimitValue() {
        const level = Number(this.data.level);
        const label = 'SR5.Level';
        
        const limitParts = new PartsList<number>(this.data.limit.mod);
        limitParts.addUniquePart(label, level);
    }

    /**
     * Inject into user dialog level value selection changes.
     */
    override validateBaseValues() {
        this.warnAboutInvalidLevel();
    }

    /**
     * Notify mancers about incomplete compilation. To avoid pre mature fade tests.
     */
    override async executeFollowUpTest() {
        if (!this.data.fadeReady) ui.notifications?.warn('SR5.Warnings.CompilationNotConcluded', {localize: true});
        await super.executeFollowUpTest();
    }

    /**
     * Let user know about invalid level selection.
     */
    warnAboutInvalidLevel() {
        const level = Number(this.data.level);
        const resonance = (this.actor?.getAttribute('resonance')?.value ?? 0);

        if (CompilationRules.validLevel(level, resonance)) return;

        ui.notifications?.warn('SR5.Warnings.InvalidCompilationLevel', {localize: true});
    }

    /**
     * Derive the actual fade damage from compilation values.
     * NOTE: This will be called by the opposing test via a follow up test action.
     * 
     * @param opposingHits Amount of hits from the opposing test (sprite).
     */
    calcFade(opposingHits: number) {
        this.data.fadeReady = true;
        this.data.fade = CompilationRules.compilationFadeValue(opposingHits);
        this.data.fadeDamage = this.calcFadeDamage(opposingHits);
    }

    calcFadeDamage(opposingHits: number): DamageType {
        if (!this.actor) return DataDefaults.createData('damage');

        const resonance = this.actor.getAttribute('resonance').value;
        const level = this.data.level;

        return CompilationRules.calcFadeDamage(opposingHits, level, resonance);
    }

    /**
     * Indicate the use of a prepared actor.
     */
    get preparedActorUsed(): boolean {
        return this.data.preparedSpriteUuid !== '';
    }
}
