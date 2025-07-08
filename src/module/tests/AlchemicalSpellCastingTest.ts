import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {SpellcastingRules} from "../rules/SpellcastingRules";
import { AlchemicalSpellCastingRules } from "../rules/AlchemicalSpellCastingRules";
import {PartsList} from "../parts/PartsList";
import {DataDefaults} from "../data/DataDefaults";
import {DrainRules} from "../rules/DrainRules";
import DamageData = Shadowrun.DamageData;
import MinimalActionData = Shadowrun.MinimalActionData;
import ModifierTypes = Shadowrun.ModifierTypes;
import AlchemyTrigger = Shadowrun.AlchemyTrigger;

export interface AlchemicalSpellCastingTestData extends SuccessTestData {
    drain: number
    drainDamage: DamageData
    force: number
    trigger: AlchemyTrigger
    name: string
}

/**
 * Alchemical Spellcasting tests as described on SR5#306 in the spellcasting chapter.
 *
 */
export class AlchemicalSpellCastingTest extends SuccessTest<AlchemicalSpellCastingTestData> {

    override _prepareData(data, options): any {
        data = super._prepareData(data, options);

        data.force = data.force || 0;
        data.drain = data.drain || 0;
        data.drainDamage = data.drainDamage || DataDefaults.damageData();
        data.name = data.name || '';
        data.trigger = data.trigger || '';

        return data;
    }

    override get _dialogTemplate()  {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/alchemical-spellcasting-test-dialog.html';
    }

    override get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/rolls/alchemical-spellcasting-test-message.html';
    }

    /**
     * This test type can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

    static override _getDefaultTestAction(): Partial<MinimalActionData> {
        return {
            skill: 'alchemy',
            attribute: 'magic'
        };
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
        return ['global', 'wounds', 'background_count'];
    }

    override async prepareDocumentData() {
        this.prepareInitialForceValue();

        await super.prepareDocumentData();
    }

    /**
     * Set a force value based on the items history or viable suggestions.
     */
    prepareInitialForceValue() {
        if (!this.item) return;

        const lastUsedForce = this.item.getLastSpellForce();
        const suggestedForce = AlchemicalSpellCastingRules.calculateMinimalForce(this.item.getDrain);
        this.data.force = lastUsedForce.value || suggestedForce;
    }

    override prepareBaseValues() {
        super.prepareBaseValues();
        this.prepareLimitValue();
    }

    prepareLimitValue() {
        const force = Number(this.data.force);
        this.data.limit.mod = PartsList.AddUniquePart(
            this.data.limit.mod,
            'SR5.Force',
            AlchemicalSpellCastingRules.calculateLimit(force));
    }

    override calculateBaseValues() {
        super.calculateBaseValues();
        this.calculateDrainValue();
    }

    /**
     * Precalculate drain for user display.
     */
    calculateDrainValue() {
        const force = Number(this.data.force);
        const drain = Number(this.item?.getDrain);
        this.data.drain = AlchemicalSpellCastingRules.calculatePreparationDrain(force, drain, this.data.trigger);
    }

    /**
     * Derive the actual drain damage from spellcasting values.
     */
    calcDrainDamage() {
        if (!this.actor) return DataDefaults.damageData();

        const force = Number(this.data.force);
        const drain = Number(this.data.drain);
        const magic = this.actor.getAttribute('magic').value;
        this.data.drainDamage = DrainRules.calcDrainDamage(drain, force, magic, this.hits.value);
    }

    override async processResults() {
        this.calcDrainDamage();
        await super.processResults();
    }

    /**
     * Allow the currently used force value of this spell item to be reused next time.
     */
    override async saveUserSelectionAfterDialog() {
        if (!this.item) return;

        await this.item.setLastSpellForce({value: this.data.force, reckless: false});
    }
}