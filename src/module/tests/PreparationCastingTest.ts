import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {SpellcastingRules} from "../rules/SpellcastingRules";
import {PartsList} from "../parts/PartsList";
import {DataDefaults} from "../data/DataDefaults";
import {DrainRules} from "../rules/DrainRules";
import { TestDocuments } from "./SuccessTest";
import { TestOptions } from "./SuccessTest";
import { Helpers } from "../helpers";
import DamageData = Shadowrun.DamageData;
import MinimalActionData = Shadowrun.MinimalActionData;
import ModifierTypes = Shadowrun.ModifierTypes;


export interface PreparationCastingTestData extends SuccessTestData {
    force: number
    potency: number
}

/**
 * Spellcasting tests as described on SR5#305 in the spellcasting chapter.
 *
 */
export class PreparationCastingTest extends SuccessTest<PreparationCastingTestData> {

    constructor(data, documents: TestDocuments, options?: TestOptions) {
      super(data, documents, options);
      //This is the janky way I am removing the push the limit section
      //This is very bad, trying to just get this functional right now
      this.pushTheLimit = false;
    }

    override _prepareData(data, options): any {
        data = super._prepareData(data, options);

        data.force = this.item?.system.force || 0;
        data.potency = this.item?.system.potency || 0;

        return data;
    }

    override get _dialogTemplate()  {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/preparation-casting-test-dialog.html';
    }

    override get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/rolls/success-test-message.html';
    }

    /**
     * This test type can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

    /**
     * Spellcasting test category directly depends on the spell cast.
     */
    override get testCategories(): Shadowrun.ActionCategories[] {
        const spell = this.item?.asSpell;
        if (!spell) return [];

        switch (spell.system.category) {
            case 'combat': return ['spell_combat'];
            case 'detection': return ['spell_detection'];
            case 'health': return ['spell_healing'];
            case 'illusion': return ['spell_illusion'];
            case 'manipulation': return ['spell_manipulation'];
            case 'ritual': return ['spell_ritual'];
        }

        return []

    }

    override get testModifiers(): ModifierTypes[] {
        return ['background_count'];
    }

    override async prepareDocumentData() {
        await super.prepareDocumentData();
    }

    override prepareBaseValues() {
        super.prepareBaseValues();
        this.prepareLimitValue();
        this.prepareDicePool();
    }

    prepareLimitValue() {
        const force = Number(this.data.force);
        this.data.limit.mod = PartsList.AddUniquePart(
            this.data.limit.mod,
            'SR5.Force',
            SpellcastingRules.calculateLimit(force));
    }

    prepareDicePool() {
        this.data.pool.mod = PartsList.AddUniquePart(this.data.pool.mod, 'Potency', this.data.potency);
        this.data.pool.mod = PartsList.AddUniquePart(this.data.pool.mod, 'Force', this.data.force);
        // this.data.pool.value = Helpers.calcTotal(this.data.pool, { min: this.data.potency + this.data.force, max: this.data.potency + this.data.force });
    }

    override calculateBaseValues() {
        super.calculateBaseValues();
    }

    override async afterTestComplete() {
      const iid = this.item?.id
      if(iid) await this.actor?.deleteEmbeddedDocuments('Item', [iid]);
      await super.afterTestComplete();
    }
}