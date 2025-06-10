import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {SpellCastingTestData} from "./SpellCastingTest";
import {DrainRules} from "../rules/DrainRules";
import {Helpers} from "../helpers";
import ModifierTypes = Shadowrun.ModifierTypes;
import { Translation } from '../utils/strings';
import { DataDefaults } from "../data/DataDefaults";
import { DamageType, MinimalActionType } from "../types/item/Action";
import { DeepPartial } from "fvtt-types/utils";
import { SR5Item } from "../item/SR5Item";
import { SR5Actor } from "../actor/SR5Actor";

export interface DrainTestData extends SuccessTestData {
    incomingDrain: DamageType
    modifiedDrain: DamageType

    against: SpellCastingTestData
}


/**
 * Implement a Drain Test as is defined in SR5#282 'Step 6 - Resist Drain'
 * 
 * Drain defines it's incoming drain and modifies it to it's modified drain,
 * both of which the user can apply.
 */
export class DrainTest extends SuccessTest<DrainTestData> {

    override _prepareData(data, options): any {
        data = super._prepareData(data, options);

        // Is this test part of a followup test chain? spell => drain
        if (data.against) {
            data.incomingDrain = foundry.utils.duplicate(data.against.drainDamage);
            data.modifiedDrain = foundry.utils.duplicate(data.incomingDrain);
        // This test is part of either a standalone test or created with its own data (i.e. edge reroll).
        } else {
            data.incomingDrain = data.incomingDrain ?? DataDefaults.createData('damage');
            data.modifiedDrain = foundry.utils.duplicate(data.incomingDrain);
        }

        return data;
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/drain-test-dialog.html';
    }

    override get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/rolls/drain-test-message.html';
    }

    static override _getDefaultTestAction(): DeepPartial<MinimalActionType> {
        return {
            'attribute2': 'willpower'
        };
    }

    /**
     * This test type can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['drain'];
    }

    override get testModifiers(): ModifierTypes[] {
        return ['global', 'drain']
    }

    static override _getDocumentTestAction(item: SR5Item, actor: SR5Actor): DeepPartial<MinimalActionType> {
        const documentAction = super._getDocumentTestAction(item, actor);

        if (!actor.isAwakened) {
            console.error(`Shadowrun 5e | A ${this.name} expected an awakened actor but got this`, actor);
            return documentAction;
        }

        // Get magic school attribute.
        const attribute = actor.system.magic!.attribute;
        foundry.utils.mergeObject(documentAction, {attribute});

        // Return the school attribute based on actor configuration.
        return documentAction;
    }

    /**
     * Re-calculate incomingDrain in case of user input
     */
    override calculateBaseValues() {
        super.calculateBaseValues();

        Helpers.calcValue(this.data.incomingDrain);

        // Copy to get all values changed by user (override) but also remove all.
        this.data.modifiedDrain = foundry.utils.duplicate(this.data.incomingDrain) as DamageType;
        this.data.modifiedDrain.base = Helpers.calcTotal(this.data.incomingDrain, {min: 0});
        //@ts-expect-error fvtt-types doesn't know about non-required field.
        this.data.modifiedDrain.override = undefined;
    }

    /**
     * A drain test is successful whenever it has more hits than drain damage
     */
    override get success(): boolean {
        return this.data.modifiedDrain.value <= 0;
    }

    override get successLabel(): Translation {
        return 'SR5.TestResults.ResistedAllDamage';
    }

    override get failureLabel(): Translation {
        return 'SR5.TestResults.ResistedSomeDamage'
    }

    override async processResults() {
        // Don't use incomingDrain as it might have a user value override applied.
        this.data.modifiedDrain = DrainRules.modifyDrainDamage(this.data.modifiedDrain, this.hits.value);

        await super.processResults();
    }
}
