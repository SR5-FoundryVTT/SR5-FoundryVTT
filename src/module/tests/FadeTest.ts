import { SuccessTest, SuccessTestData } from "./SuccessTest";
import { ComplexFormTest, ComplexFormTestData } from "./ComplexFormTest";
import { Helpers } from "../helpers";
import { FadeRules } from "../rules/FadeRules";
import ModifierTypes = Shadowrun.ModifierTypes;
import { Translation } from '../utils/strings';
import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import { DataDefaults } from "../data/DataDefaults";
import { DamageType, MinimalActionType } from "../types/item/Action";
import { DeepPartial } from "fvtt-types/utils";

export interface FadeTestData extends SuccessTestData {
    incomingFade: DamageType
    modifiedFade: DamageType

    against: ComplexFormTestData
}

export class FadeTest extends SuccessTest<FadeTestData> {
    declare against: ComplexFormTest;

    override _prepareData(data, options): any {
        data = super._prepareData(data, options);

        // Is this test part of a followup test chain? complex form => fade
        if (data.against) {
            data.incomingFade = foundry.utils.duplicate(data.against.fadeDamage);
            data.modifiedFade = foundry.utils.duplicate(data.incomingFade);
        // This test is part of either a standalone test or created with its own data (i.e. edge reroll).
        } else {
            data.incomingFade = data.incomingFade ?? DataDefaults.createData('damage');
            data.modifiedFade = foundry.utils.duplicate(data.incomingFade);
        }

        return data;
    }

    override get _dialogTemplate() {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/fade-test-dialog.html';
    }

    override get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/rolls/fade-test-message.html';
    }

    static override _getDefaultTestAction(): DeepPartial<MinimalActionType> {
        return { attribute2: 'resonance' };
    }
    
    static override _getDocumentTestAction(item: SR5Item, actor: SR5Actor<'character'>) {
        const documentAction = super._getDocumentTestAction(item, actor);

        if (!actor.isType('character') || !actor.isEmerged()) {
            console.error(`Shadowrun 5e | A ${this.name} expected an emerged actor but got this`, actor);
            return documentAction;
        }

        // Get technomancer fade attribute
        const attribute = actor.system.technomancer.attribute;
        foundry.utils.mergeObject(documentAction, {attribute});

        return documentAction;
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['fade'];
    }

    override get testModifiers(): ModifierTypes[] {
        return ['global', 'fade']
    }

    override get canBeExtended() {
        return false;
    }

    /**
     * A drain test is successful whenever it has more hits than drain damage
     */
    override get success(): boolean {
        return this.data.modifiedFade.value <= 0;
    }

    override get successLabel(): Translation {
        return 'SR5.TestResults.ResistedAllDamage';
    }

    override get failureLabel(): Translation {
        return 'SR5.TestResults.ResistedSomeDamage'
    }

    /**
     * Re-calculate incomingFade in case of user input
     */
    override calculateBaseValues() {
        super.calculateBaseValues();

        // Avoid using a user defined value override.
        this.data.modifiedFade.base = Helpers.calcTotal(this.data.incomingFade, { min: 0 });
    }

    override async processResults() {
        // Don't use incomingDrain as it might have a user value override applied.
        this.data.modifiedFade = FadeRules.modifyFadeDamage(this.data.modifiedFade, this.hits.value);

        await super.processResults();
    }
}