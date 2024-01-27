import {DefenseTest, DefenseTestData} from "./DefenseTest";
import {SpellCastingTest, SpellCastingTestData} from "./SpellCastingTest";
import {SR5Item} from "../item/SR5Item";
import {SR5Actor} from "../actor/SR5Actor";
import {DataDefaults} from "../data/DataDefaults";
import {CombatSpellRules} from "../rules/CombatSpellRules";
import {TestCreator} from "./TestCreator";
import MinimalActionData = Shadowrun.MinimalActionData;
import ModifierTypes = Shadowrun.ModifierTypes;

export interface CombatSpellDefenseTestData extends DefenseTestData {
    against: SpellCastingTestData
}

export class CombatSpellDefenseTest extends DefenseTest<CombatSpellDefenseTestData> {
    override against: SpellCastingTest

    /**
     * A combat spell defense test changes it's behaviour based on the spell it's defending against.
     *
     * @param item A spell item.
     * @param actor The actor to defend with.
     */
    static override async _getDocumentTestAction(item: SR5Item, actor: SR5Actor): Promise<MinimalActionData> {
        const action = DataDefaults.minimalActionData(await super._getDocumentTestAction(item, actor));

        const spellData = item.asSpell
        if (!spellData) return action;

        const itemAction = CombatSpellRules.defenseTestAction(spellData.system.type, spellData.system.combat.type);
        return TestCreator._mergeMinimalActionDataInOrder(action, itemAction);
    }

    override prepareBaseValues() {
        super.prepareBaseValues();
        this.calculateCombatSpellDamage();
    }

    override get testModifiers(): ModifierTypes[] {
        const spell = this.item?.asSpell;
        if (!spell) return ['global'];

        if (spell.system.type === 'mana' && spell.system.combat.type === 'direct') {
            return ['global'];
        }
        if (spell.system.type === 'physical' && spell.system.combat.type === 'direct') {
            return ['global'];
        }
        if (spell.system.combat.type === 'indirect') {
            return ['global', 'defense', 'multi_defense', 'wounds'];
        }

        return ['global'];
    }

    /**
     * A combat spells damage depends on
     */
    calculateCombatSpellDamage() {
        const spell = this.item?.asSpell;
        if (!spell) return;

        this.data.incomingDamage = CombatSpellRules.calculateBaseDamage(spell.system.combat.type, this.data.incomingDamage, this.data.against.force);
    }

    override async processResults() {
        await super.processResults();

        await this.applyActorEffectsForDefense();
    }


    /**
     * A success on a defense test is a MISS on the initial attack.
     */
    override async processSuccess() {
        this.data.modifiedDamage = CombatSpellRules.modifyDamageAfterMiss(this.data.incomingDamage);

        await super.processSuccess();
    }

    /**
     * A failure on a defense test is a HIT on the initial attack.
     */
    override async processFailure() {
        const spell = this.item?.asSpell;
        if (!spell) return;
        if (!this.actor) return;

        this.data.modifiedDamage = CombatSpellRules.modifyDamageAfterHit(this.actor, spell.system.type, spell.system.combat.type,
            this.data.incomingDamage, this.against.hits.value, this.hits.value);

        await super.processFailure();
    }

    /**
     * Combat Spell Defense allows a resist test for the defending actor.
     */
    override async afterFailure() {
        const spell = this.item?.asSpell;
        if (!spell) return;

        // Only allow a defense test for in
        if (CombatSpellRules.allowDamageResist(spell.system.combat.type)) {
            const test = await TestCreator.fromOpposedTestResistTest(this, this.data.options);
            if (!test) return;
            await test.execute();
        }
    }

    /**
     * Increase the actors multi defense modifier for indirect combat spells.
     */
    async applyActorEffectsForDefense() {
        if (!this.actor) return;

        const spell = this.item?.asSpell;
        if (!spell) return;
        if (spell.system.category !== 'combat' || spell.system.combat.type === 'direct') return;

        this.actor.calculateNextDefenseMultiModifier();
    }
}