import {DefenseTest, DefenseTestData} from "./DefenseTest";
import {SpellCastingTest, SpellCastingTestData} from "./SpellCastingTest";
import {SR5Item} from "../item/SR5Item";
import {SR5Actor} from "../actor/SR5Actor";
import {DefaultValues} from "../data/DataDefaults";
import {CombatSpellRules} from "../rules/CombatSpellRules";
import {TestCreator} from "./TestCreator";
import MinimalActionData = Shadowrun.MinimalActionData;
import ModifierTypes = Shadowrun.ModifierTypes;

export interface CombatSpellDefenseTestData extends DefenseTestData {
    against: SpellCastingTestData
}

export class CombatSpellDefenseTest extends DefenseTest {
    data: CombatSpellDefenseTestData
    against: SpellCastingTest

    /**
     * A combat spell defense test changes it's behaviour based on the spell it's defending against.
     *
     * @param item A spell item.
     * @param actor The actor to defend with.
     */
    static async _getDocumentTestAction(item: SR5Item, actor: SR5Actor): Promise<MinimalActionData> {
        const action = DefaultValues.minimalActionData(await super._getDocumentTestAction(item, actor));

        const spellData = item.asSpell();
        if (!spellData) return action;

        const itemAction = CombatSpellRules.defenseTestAction(spellData.system.type, spellData.system.combat.type);
        return TestCreator._mergeMinimalActionDataInOrder(action, itemAction);
    }

    prepareBaseValues() {
        super.prepareBaseValues();
        this.calculateCombatSpellDamage();
    }

    get testModifiers(): ModifierTypes[] {
        const spellData = this.item?.asSpell();
        if (!spellData) return ['global'];

        if (spellData.system.type === 'mana' && spellData.system.combat.type === 'direct') {
            return ['global'];
        }
        if (spellData.system.type === 'physical' && spellData.system.combat.type === 'direct') {
            return ['global'];
        }
        if (spellData.system.combat.type === 'indirect') {
            return ['global', 'defense', 'wounds'];
        }

        return ['global'];
    }

    /**
     * A combat spells damage depends on
     */
    calculateCombatSpellDamage() {
        const spellData = this.item?.asSpell();
        if (!spellData) return;

        this.data.incomingDamage = CombatSpellRules.calculateBaseDamage(spellData.system.combat.type, this.data.incomingDamage, this.data.against.force);
    }


    /**
     * A success on a defense test is a MISS on the initial attack.
     */
    async processSuccess() {
        this.data.modifiedDamage = CombatSpellRules.modifyDamageAfterMiss(this.data.incomingDamage);

        await super.processSuccess();
    }

    /**
     * A failure on a defense test is a HIT on the initial attack.
     */
    async processFailure() {
        const spellData = this.item?.asSpell();
        if (!spellData) return;
        if (!this.actor) return;

        this.data.modifiedDamage = CombatSpellRules.modifyDamageAfterHit(this.actor, spellData.system.type, spellData.system.combat.type,
            this.data.incomingDamage, this.against.hits.value, this.hits.value);

        await super.processFailure();
    }

    /**
     * Combat Spell Defense allows a resist test for the defending actor.
     */
    async afterFailure() {
        const spellData = this.item?.asSpell();
        if (!spellData) return;

        // Only allow a defense test for in
        if (CombatSpellRules.allowDamageResist(spellData.system.combat.type)) {
            const test = await TestCreator.fromOpposedTestResistTest(this, this.data.options);
            if (!test) return;
            await test.execute();
        }

    }
}