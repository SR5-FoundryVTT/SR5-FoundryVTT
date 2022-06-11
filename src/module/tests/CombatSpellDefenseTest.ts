import {DefenseTest} from "./DefenseTest";
import {SpellCastingTest} from "./SpellCastingTest";
import {SR5Item} from "../item/SR5Item";
import {SR5Actor} from "../actor/SR5Actor";
import MinimalActionData = Shadowrun.MinimalActionData;
import {DefaultValues} from "../data/DataDefaults";
import {CombatSpellRules} from "../rules/CombatSpellRules";



export class CombatSpellDefenseTest extends DefenseTest {
    against: SpellCastingTest

    static async _getDocumentTestAction(item: SR5Item, actor: SR5Actor): Promise<MinimalActionData> {
        const action = await super._getDocumentTestAction(item, actor);

        const spellData = item.asSpellData();
        if (!spellData) return action;


        const itemAction = DefaultValues.minimalActionData();
        // TODO: Add some kind of rule related section.?
        if (spellData.data.type === 'mana' && spellData.data.combat.type === 'direct') {
            itemAction.attribute = 'willpower';
        }
        if (spellData.data.type === 'physical' && spellData.data.combat.type === 'direct') {
            itemAction.attribute = 'body';
        }
        if (spellData.data.combat.type === 'indirect') {
            itemAction.attribute = 'reaction';
            itemAction.attribute2 = 'intuition';
        }

        return foundry.utils.mergeObject(action, itemAction);
    }

    get testModifiers() {
        const spellData = this.item?.asSpellData();
        if (!spellData) return ['global'];

        if (spellData.data.type === 'mana' && spellData.data.combat.type === 'direct') {
            return ['global'];
        }
        if (spellData.data.type === 'physical' && spellData.data.combat.type === 'direct') {
            return ['global'];
        }
        if (spellData.data.combat.type === 'indirect') {
            return ['global', 'defense', 'wounds'];
        }

        return ['global'];
    }

    /**
     * A success on a defense test is a MISS on the initial attack.
     */
    async processSuccess() {
        await super.processSuccess();

        this.data.modifiedDamage = CombatSpellRules.modifyDamageAfterMiss(this.data.modifiedDamage);
    }

    /**
     * A failure on a defense test is a HIT on the initial attack.
     */
    async processFailure() {
        await super.processFailure();

        const spellData = this.item?.asSpellData();
        if (!spellData) return;

        if (spellData.data.type === 'mana' && spellData.data.combat.type === 'direct') {
            this.data.modifiedDamage = CombatSpellRules.modifyDirectDamageAfterHit(
                this.data.modifiedDamage,
                this.against.hits.value,
                this.hits.value);
        }
        if (spellData.data.type === 'physical' && spellData.data.combat.type === 'direct') {
            this.data.modifiedDamage = CombatSpellRules.modifyDirectDamageAfterHit(
                this.data.modifiedDamage,
                this.against.hits.value,
                this.hits.value);
        }
        if (spellData.data.combat.type === 'indirect') {
            this.data.modifiedDamage = CombatSpellRules.modifyIndirectDamageAfterHit(
                this.data.modifiedDamage,
                this.against.hits.value,
                this.hits.value);
        }
    }
}