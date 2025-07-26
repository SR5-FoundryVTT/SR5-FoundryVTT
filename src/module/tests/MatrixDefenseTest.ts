import { PartsList } from '../parts/PartsList';
import { CombatRules } from '../rules/CombatRules';
import { DefenseTest, DefenseTestData } from './DefenseTest';
import { Translation } from '../utils/strings';
import { MatrixRules } from '../rules/MatrixRules';
import { MatrixTest, MatrixTestData, OpposeMatrixTestData } from './MatrixTest';
import { SR5Item } from '../item/SR5Item';
import { SR5Actor } from '../actor/SR5Actor';
import { MatrixTestDataFlow } from './flows/MatrixTestDataFlow';
import { TestOptions } from './SuccessTest';
import { MatrixResistTest } from './MatrixResistTest';
import { TestCreator } from './TestCreator';
import MinimalActionData = Shadowrun.MinimalActionData;
import ModifierTypes = Shadowrun.ModifierTypes;

export type MatrixDefenseTestData = OpposeMatrixTestData & DefenseTestData;

export type MatrixDefenseNoDamageCondition = {
    test: () => boolean,
    label: Translation,
}

export class MatrixDefenseTest<T extends MatrixDefenseTestData = MatrixDefenseTestData> extends DefenseTest<T> {
    override against: MatrixTest;
    resist: MatrixResistTest;
    // The target icon to place a mark on.
    icon: Shadowrun.NetworkDevice;
    // The target icon, if it's representing a device.
    device: SR5Item;
    // The target icon, if it's representing a persona.
    persona: SR5Actor;

    override _prepareData(data, options?): any {
        data = super._prepareData(data, options);
        data = MatrixTestDataFlow._prepareOpposedData(data);

        data.activeDefense = '';
        data.activeDefenses = {};

        return data;
    }

    override get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/chat/matrix-defense-test-message.hbs';
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/matrix-defense-test-dialog.hbs';
    }

    static override _getDefaultTestAction(): Partial<MinimalActionData> {
        return {
            'attribute': 'intuition',
            'attribute2': 'firewall'
        };
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        // TODO not adding matrix here as I think that adds noise as a modifier, which we do not want in a defense test
        return ['defense_matrix']
    }

    override get testModifiers(): ModifierTypes[] {
        return ['global', 'wounds', 'defense_matrix'];
    }

    override async prepareDocumentData() {
        this.prepareActiveDefense();
        await super.prepareDocumentData();
    }

    /**
     * Depending on the weapon used for attack different active defenses are available.
     */
    prepareActiveDefense() {
        if (!this.actor) return;

        const actor = this.actor;
        const weapon = this.against.item;
        if (weapon === undefined) return;

        this.data.activeDefenses = MatrixRules.availableActiveDefenses(weapon, actor);

        // Filter available active defenses by available ini score.
        this._filterActiveDefenses();
    }

    override calculateBaseValues() {
        super.calculateBaseValues();
        this.applyIniModFromActiveDefense();
    }

    override applyPoolModifiers() {
        this.applyPoolActiveDefenseModifier();
        super.applyPoolModifiers();
    }

    applyPoolActiveDefenseModifier() {
        const defense = this.data.activeDefenses[this.data.activeDefense] || {label: 'SR5.MatrixDefense', value: 0, init: 0};

        // Apply zero modifier also, to sync pool.mod and modifiers.mod
        PartsList.AddUniquePart(this.data.modifiers.mod, 'SR5.MatrixDefense', defense.value);
    }

    override get success() {
        return CombatRules.attackMisses(this.against.hits.value, this.hits.value);
    }

    override get failure() {
        return CombatRules.attackHits(this.against.hits.value, this.hits.value);
    }

    override async processSuccess() {
        this.data.modifiedDamage = CombatRules.modifyDamageAfterMiss(this.data.incomingDamage);

        await super.processSuccess();
    }

    override async processFailure() {
        this.data.modifiedDamage =
            MatrixRules.modifyDamageAfterHit(this.against.hits.value, this.hits.value, this.data.incomingDamage);

        await super.processFailure();
    }

    override async afterFailure() {
        await super.afterFailure();

        const test = await TestCreator.fromOpposedTestResistTest(this, this.data.options);
        if (!test) return;
        await test.execute();
    }

    override async populateDocuments() {
        await super.populateDocuments();
        await MatrixTestDataFlow.populateOpposedDocuments(this);
    }

    static override async executeMessageAction(againstData: MatrixTestData, messageId: string, options: TestOptions): Promise<void> {
        await MatrixTestDataFlow.executeMessageAction(this, againstData, messageId, options);
    }
}
