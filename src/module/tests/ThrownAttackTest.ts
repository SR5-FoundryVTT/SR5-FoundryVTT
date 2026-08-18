import { SuccessTest, SuccessTestData, TestOptions } from './SuccessTest';
import { DeepPartial } from "fvtt-types/utils";
import { SR5Item } from '../item/SR5Item';
import { WeaponRangeTestBehavior, WeaponRangeTestDataFragment } from '../rules/WeaponRangeRules';
import { getItemScatterKind } from '../rules/ScatterRules';
import { BlastTemplateFlow } from './flows/BlastTemplateFlow';
import { WeaponRangeOverlayFlow } from './flows/WeaponRangeOverlayFlow';

export interface ThrownAttackTestData extends SuccessTestData, WeaponRangeTestDataFragment {
}

/**
 * Test implementation for attack tests using weapon of category thrown.
 */
export class ThrownAttackTest extends SuccessTest<ThrownAttackTestData> {
    declare item: SR5Item;
    public rangeOverlayFlow = new WeaponRangeOverlayFlow(this);
    public blastTemplateFlow = new BlastTemplateFlow(this, {
        prepareTargetData: () => WeaponRangeTestBehavior.prepareTargetData(this),
        canScatter: () => getItemScatterKind(this.item) !== undefined,
    });

    override _prepareData(data: DeepPartial<ThrownAttackTestData>, options: Partial<TestOptions>): ThrownAttackTestData {
        const prepared = super._prepareData(data, options);

        WeaponRangeTestBehavior.prepareData(this, prepared);

        return prepared as ThrownAttackTestData;
    }

    override get canBeExtended() {
        return false;
    }

    get canPlaceBlastTemplate(): boolean {
        return this.blastTemplateFlow.canPlace;
    }

    override get showSuccessLabel(): boolean {
        return this.success;
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['attack', 'attack_thrown']
    }

    override get testModifiers(): Shadowrun.ModifierTypes[] {
        return ['global', 'wounds', 'environmental'];
    }

    override async prepareDocumentData(){
        WeaponRangeTestBehavior.prepareDocumentData(this, (weapon) => weapon.system.thrown.ranges);
        await super.prepareDocumentData();
    }

    override _testDialogListeners() {
        return [...super._testDialogListeners(), ...this.rangeOverlayFlow.dialogListeners(), ...this.blastTemplateFlow.dialogListeners()];
    }

    override async _cleanUpAfterDialogCancel() {
        this.rangeOverlayFlow.remove();
        await this.blastTemplateFlow.cancelPreview();
        await super._cleanUpAfterDialogCancel();
    }

    override async _cleanUpAfterDialog() {
        this.rangeOverlayFlow.remove();
        await this.blastTemplateFlow.finalizePreview();
        await super._cleanUpAfterDialog();
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/thrown-attack-test-dialog.hbs';
    }

    /**
     * Save selections made back to documents.
     */
    override async saveUserSelectionAfterDialog() {
        await WeaponRangeTestBehavior.saveUserSelectionAfterDialog(this);
    }

    /**
     * Apply test selections made by user in dialog.
     */
    override prepareBaseValues() {
        WeaponRangeTestBehavior.prepareBaseValues(this);

        super.prepareBaseValues();
    }

    /**
     * Ranged attack tests allow for temporarily changing of modifiers without altering the document.
     */
    override prepareTestModifiers() {
        WeaponRangeTestBehavior.prepareTestModifiers(this);
    }


    override async processResults() {
        await super.processResults();

        await WeaponRangeTestBehavior.processResults(this);
    }
}
