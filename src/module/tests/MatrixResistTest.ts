import { DataDefaults } from "../data/DataDefaults";
import { Helpers } from "../helpers";
import { DamageType, MinimalActionType } from "../types/item/Action";
import { Translation } from "../utils/strings";
import { SuccessTest, SuccessTestData } from "./SuccessTest";


export interface MatrixResistTestData extends SuccessTestData {
    following: any
    incomingDamage: DamageType
    modifiedDamage: DamageType
}

/**
 * Handle Matrix Damage Resist as defined on SR5#228.
 * 
 * These test flows exist:
 * - Brute Force/Hack on The Fly: Both will trigger this test using their Opposed variant.
 */
export class MatrixResistTest extends SuccessTest<MatrixResistTestData> {
    override _prepareData(data: MatrixResistTestData, options: any): any {
        data = super._prepareData(data, options);

        // Is this test part of a followup test chain? defense => resist
        if (data.following) {
            data.incomingDamage = foundry.utils.duplicate(data.following.damage || DataDefaults.createData('damage', {type: {base: 'matrix', value: 'matrix'}}));
            data.modifiedDamage = foundry.utils.duplicate(data.incomingDamage) as DamageType;
        // This test is part of either a standalone resist or created with its own data (i.e. edge reroll).
        } else {
            data.incomingDamage = data.incomingDamage ?? DataDefaults.createData('damage');
            data.modifiedDamage = foundry.utils.duplicate(data.incomingDamage) as DamageType;
        }

        return data;
    }

    override get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/rolls/defense-test-message.html';
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/matrix-resist-test-dialog.html';
    }

    override get successLabel(): Translation {
        return 'SR5.TestResults.ResistedAllDamage';
    }
    override get failureLabel(): Translation {
        return 'SR5.TestResults.ResistedSomeDamage';
    }

    static override _getDefaultTestAction(): Partial<MinimalActionType> {
        return {
            'attribute': 'rating',
            'attribute2': 'firewall'
        }
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['resist', 'resist_matrix']
    }

    override async processResults() {
        await super.processResults();

        const {modified} = Helpers.reduceDamageByHits(this.data.incomingDamage, this.hits.value, 'SR5.SoakTest');
        this.data.modifiedDamage = modified;
    }
}
