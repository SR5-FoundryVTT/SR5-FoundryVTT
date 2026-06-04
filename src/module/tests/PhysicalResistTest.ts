import {SuccessTest, TestOptions} from "./SuccessTest";
import {ModifiableValue} from "../mods/ModifiableValue";
import {CombatRules} from "../rules/CombatRules";
import {Helpers} from "../helpers";
import {PhysicalDefenseTestData} from "./PhysicalDefenseTest";
import {SoakFlow} from "../actor/flows/SoakFlow";
import ModifierTypes = Shadowrun.ModifierTypes;
import { Translation } from '../utils/strings';
import { ResistTestData, ResistTestDataFlow } from "./flows/ResistTestDataFlow";
import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import { MatrixResistTestData } from "./MatrixResistTest";
import { MinimalActionType } from "../types/item/Action";
import { TestCreator } from "./TestCreator";

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
        return data;
    }

    override get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/rolls/success-test-message.hbs';
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/physical-resist-test-dialog.hbs';
    }

    /**
     * This test type can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

    static override _getDefaultTestAction(): Partial<MinimalActionType> {
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
     * Resisting against damage on the physical plane includes modified normal and hardened armor values.
     */
    applyArmorPoolModifier() {
        ModifiableValue.remove(this.data.pool, 'SR5.Armor.label');
        ModifiableValue.remove(this.data.pool, 'SR5.HardenedArmor');

        if (!this.data.action.armor || !this.actor) return;

        // Always display at least one armor entry in the breakdown for transparency.
        // Include Hardened Armor if active, since its auto-hits apply independently.
        // Include Standard Armor if active, or as a zero-value fallback to confirm 
        // to the player that armor was checked.
        const armor = this.actor.getArmor(this.data.incomingDamage);
        const addHardenedArmor = armor.hardened.base !== 0 || armor.hardened.changes.length !== 0;
        const addArmor = armor.rating.base !== 0 || armor.rating.changes.length !== 0 || !addHardenedArmor;

        if (addArmor) {
            ModifiableValue.addUniqueBase(this.data.pool, 'SR5.Armor.label', armor.rating.value);
            TestCreator.addCodeTermTrace(this.data, { ...armor.rating, label: 'SR5.Armor.label' });
        }

        if (addHardenedArmor) {
            ModifiableValue.addUniqueBase(this.data.pool, 'SR5.HardenedArmor', armor.hardened.value);
            TestCreator.addCodeTermTrace(this.data, { ...armor.hardened, label: 'SR5.HardenedArmor' });
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
            test: () => !!this.actor && CombatRules.isBlockedByHardenedArmor(this.data.incomingDamage, 0, 0, this.actor),
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

        if (this.actor) {
            const hits = new ModifiableValue(this.hits);
            const hardenedHits = CombatRules.hardenedAutoHits(this.actor, this.data.modifiedDamage);

            if (hardenedHits > 0) {
                hits.addUnique('SR5.HardenedArmor', hardenedHits);
            }
            hits.calcTotal();
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
        const data = ResistTestDataFlow._getResistTestData(opposedData, 'SR5.Tests.PhysicalResistTest', previousMessageId);
        const action = await ResistTestDataFlow._getResistActionData(this, opposedData, 'PhysicalResistTest');
        return this._prepareActionTestData(action, document, data) as MatrixResistTestData;
    }

    /**
     * Execute actions triggered by a tests chat message.
     *
     * This can be used to trigger resist tests.
     */
    static override async executeMessageAction(againstData: PhysicalDefenseTestData, messageId: string, options: TestOptions) {
        // Roll resist tests with the currently selected token actor(s).
        const documents = Helpers.getSelectedActorsOrCharacter();
        await ResistTestDataFlow.executeMessageAction(this, againstData, messageId, documents, options);
    }
}
