import {DefenseTest, DefenseTestData} from "./DefenseTest";
import {SpellCastingTest, SpellCastingTestData} from "./SpellCastingTest";
import {SR5Item} from "../item/SR5Item";
import {SR5Actor} from "../actor/SR5Actor";
import {DataDefaults} from "../data/DataDefaults";
import {CombatSpellRules} from "../rules/CombatSpellRules";
import {TestCreator} from "./TestCreator";
import ModifierTypes = Shadowrun.ModifierTypes;
import { ActionRollType, MinimalActionType } from "../types/item/Action";
import { DeepPartial } from "fvtt-types/utils";
import { Translation } from "../utils/strings";
import type { FlowStep } from "../types/flows/FlowStep";

export interface CombatSpellDefenseTestData extends DefenseTestData {
    against: SpellCastingTestData
}

export class CombatSpellDefenseTest extends DefenseTest<CombatSpellDefenseTestData> {
    declare against: SpellCastingTest;

    override get successLabel(): Translation {
        return 'SR5.TestResults.SpellResisted';
    }

    /**
     * A combat spell defense test changes it's behaviour based on the spell it's defending against.
     *
     * @param item A spell item.
     * @param actor The actor to defend with.
     */
    static override _getDocumentTestAction(item: SR5Item, actor: SR5Actor): DeepPartial<MinimalActionType> {
        const action = DataDefaults.createData('minimal_action', super._getDocumentTestAction(item, actor));

        const spell = item.asType('spell', 'preparation')?.system;
        if (!spell) return action;

        const itemAction = CombatSpellRules.defenseTestAction(spell.type, spell.combat.type);
        return TestCreator._mergeMinimalActionDataInOrder(action as ActionRollType, itemAction);
    }

    override prepareBaseValues() {
        super.prepareBaseValues();
        this.calculateCombatSpellDamage();
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        const spell = this.item?.asType('spell', 'preparation')?.system;
        if (!spell) return [];

        // Defending against a indirect physical spell, is a physical defense test.
        if (spell.type === 'physical' && spell.combat.type === 'indirect') {
            return ['defense'];
        }

        return [];
    }

    override get testModifiers(): ModifierTypes[] {
        const spell = this.item?.asType('spell', 'preparation')?.system;
        if (!spell) return ['global'];

        if (spell.type === 'mana' && spell.combat.type === 'direct') {
            return ['global'];
        }
        if (spell.type === 'physical' && spell.combat.type === 'direct') {
            return ['global'];
        }
        if (spell.combat.type === 'indirect') {
            return ['global', 'defense', 'multi_defense', 'wounds'];
        }

        return ['global'];
    }

    /**
     * A combat spells damage depends on
     */
    calculateCombatSpellDamage() {
        const spell = this.item?.asType('spell', 'preparation')?.system;
        if (!spell) return;

        this.data.incomingDamage = CombatSpellRules.calculateBaseDamage(spell.combat.type, this.data.incomingDamage, this.data.against.force);
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
        const spell = this.item?.asType('spell', 'preparation')?.system;
        if (!spell) return;
        if (!this.actor) return;

        this.data.modifiedDamage = CombatSpellRules.modifyDamageAfterHit(this.actor, spell.type, spell.combat.type,
            this.data.incomingDamage, this.against.hits.value, this.hits.value);

        await super.processFailure();
    }

    /**
     * Only indirect combat spells allow resisting their damage.
     */
    override flowAllowsStep(step: FlowStep): boolean {
        if (step.kind !== 'test') return true;

        const spell = this.item?.asType('spell', 'preparation')?.system;
        if (!spell) return false;
        return CombatSpellRules.allowDamageResist(spell.combat.type);
    }

    /**
     * Increase the actors multi defense modifier for indirect combat spells.
     */
    // oxlint-disable-next-line typescript/require-await -- Awaited by the test flow and overridden by sibling tests.
    async applyActorEffectsForDefense() {
        if (!this.actor) return;

        const spell = this.item?.asType('spell', 'preparation')?.system;

        if (spell?.category !== 'combat' || spell.combat.type === 'direct')
            return;

        void this.actor.calculateNextDefenseMultiModifier();
    }
}
