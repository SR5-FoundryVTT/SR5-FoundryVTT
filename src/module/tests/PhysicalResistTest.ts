import { SuccessTest, TestOptions } from './SuccessTest';
import { PartsList } from '../parts/PartsList';
import { CombatRules } from '../rules/CombatRules';
import { Helpers } from '../helpers';
import { PhysicalDefenseTestData } from './PhysicalDefenseTest';
import { SoakFlow } from '../actor/flows/SoakFlow';
import { Translation } from '../utils/strings';
import { SR5Actor } from '../actor/SR5Actor';
import { SR5Item } from '../item/SR5Item';
import { MatrixResistTestData } from './MatrixResistTest';
import { ResistTestData, ResistTestDataFlow } from './flows/ResistTestDataFlow';
import MinimalActionData = Shadowrun.MinimalActionData;
import ModifierTypes = Shadowrun.ModifierTypes;

export interface PhysicalResistTestData extends ResistTestData<PhysicalDefenseTestData> {
    // Determine if an actor should be knockedDown after a defense.
    knockedDown: boolean
}

export type PhysicalResistSuccessCondition = {
    test: () => boolean,
    label?: Translation,
    effect?: () => void,
}

/**
 * A physical resist test handles SR5#173 Defend B
 *
 * Physical resist specifically handles physical damage dealt by ranged, melee and physical spell attacks.
 */
export class PhysicalResistTest extends SuccessTest<PhysicalResistTestData> {

    override _prepareData(data: PhysicalResistTestData, options): any {
        data = super._prepareData(data, options);
        data = ResistTestDataFlow._prepareData(data);

        const armor = this.actor?.getArmor();
        if(armor?.hardened){
            data.hitsIcon = {
                icon: "systems/shadowrun5e/dist/icons/bell-shield.svg",
                tooltip: "SR5.ArmorHardenedFull",
            };
        }

        return data;
    }

    override get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/rolls/defense-test-message.html';
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/physical-resist-test-dialog.html';
    }

    /**
     * This test type can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

    static override _getDefaultTestAction(): Partial<MinimalActionData> {
        return {
            'attribute': 'body',
            'armor': true
        };
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['resist']
    }

    override get testModifiers(): ModifierTypes[] {
        return ['soak'];
    }

    override applyPoolModifiers() {
        super.applyPoolModifiers();
        this.applyArmorPoolModifier();
    }

    /**
     * Resisting against damage on the physical plane includes the modified armor value.
     */
    applyArmorPoolModifier() {
        if (this.data.action.armor) {
            if (this.actor) {
                const armor = this.actor.getArmor(this.data.incomingDamage);
                this.data.pool.mod = PartsList.AddUniquePart(this.data.pool.mod,'SR5.Armor', armor.value);
            }
        }
    }

    override calculateBaseValues() {
        super.calculateBaseValues();
        ResistTestDataFlow.calculateBaseValues(this.data);
    }

    override get canSucceed() {
        return true;
    }

    /**
     * Resist Test success means ALL damage has been soaked.
     */
    override get success() {
        return !!this.getSuccessCondition();
    }

    private isFullySoaked(): boolean {
        return this.data.incomingDamage.value <= this.hits.value;
    }

    private readonly successConditions: PhysicalResistSuccessCondition[] = [
        {
            test: () => this.actor !== undefined && CombatRules.isBlockedByHardenedArmor(this.data.incomingDamage, 0, 0, this.actor),
            label: "SR5.TestResults.SoakBlockedByHardenedArmor",
            effect: () => {
                this.data.autoSuccess = true;
            }
        },
        {
            test: () => this.isFullySoaked(),
        },
    ]

    private getSuccessCondition(): PhysicalResistSuccessCondition|undefined {
        return this.successConditions.find(({ test }) => test());
    }

    override get showSuccessLabel(): boolean {
        return this.success;
    }

    override get successLabel(): Translation {
        return this.getSuccessCondition()?.label || 'SR5.TestResults.ResistedAllDamage';
    }
    override get failureLabel(): Translation {
        return 'SR5.TestResults.ResistedSomeDamage';
    }

    override async processSuccess() {
        await super.processSuccess();

        this.getSuccessCondition()?.effect?.();
    }

    override async evaluate(): Promise<this> {
        await super.evaluate();

        // Automatic hits from hardened armor (SR5#397)
        const armor = this.actor?.getArmor(this.data.modifiedDamage);
        if(armor?.hardened) {
            PartsList.AddUniquePart(this.hits.mod, 'SR5.AppendedHits', Math.ceil(armor.value/2));
            Helpers.calcTotal(this.hits);
        }

        return this;
    }

    override async processResults() {

        await super.processResults();

        if (!this.actor) return;

        // Handle damage modification.
        this.data.modifiedDamage = CombatRules.modifyDamageAfterResist(this.actor, this.data.modifiedDamage, this.hits.value);

        // Handle Knock Down Rules with legacy flow handling.
        this.data.knockedDown = new SoakFlow().knocksDown(this.data.modifiedDamage, this.actor);
    }

    /**
     * Prepare any ResistTest from given test data. This should come from a MatrixDefenseTest
     *
     */
    static override async _getResistActionTestData(opposedData: PhysicalDefenseTestData, document: SR5Actor|SR5Item, previousMessageId: string): Promise<MatrixResistTestData | undefined> {
        if (!opposedData.against?.opposed.resist) {
            console.error(`Shadowrun 5e | Supplied test data doesn't contain a resist action`, opposedData, this);
            return;
        }
        if (!document) {
            console.error(`Shadowrun 5e | Can't resolve resist test values due to missing actor`, this);
            return;
        }
        // get most of our resist data from the ResistTestDataFlow test data
        const data = ResistTestDataFlow._getResistTestData(opposedData, 'SR5.Tests.MatrixResistTest', previousMessageId);
        const action = await ResistTestDataFlow._getResistActionData(this, opposedData, 'PhysicalResistTest');
        return this._prepareActionTestData(action, document, data) as MatrixResistTestData;
    }

    /**
     * Execute actions triggered by a tests chat message.
     *
     * This can be used to trigger resist tests.
     */
    static override async executeMessageAction(againstData: PhysicalDefenseTestData, messageId: string, options: TestOptions) {
        // Determine documents to roll test with.
        const documents = await Helpers.getTestTargetDocuments(againstData)
        await ResistTestDataFlow.executeMessageAction(this, againstData, messageId, documents, options);
    }
}
