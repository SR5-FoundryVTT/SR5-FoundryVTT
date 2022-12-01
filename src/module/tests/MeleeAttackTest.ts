import { EnvironmentalModifier } from './../rules/modifiers/EnvironmentalModifier';
import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {DefaultValues} from "../data/DataDefaults";
import { SR5Actor } from "../actor/SR5Actor";
import ModifierTypes = Shadowrun.ModifierTypes;
import EnvironmentalModifiersSourceData = Shadowrun.EnvironmentalModifiersSourceData;

export interface MeleeAttackData extends SuccessTestData {
    reach: number
}

export class MeleeAttackTest extends SuccessTest {
    data: MeleeAttackData;

    _prepareData(data, options): any {
        data = super._prepareData(data, options);

        data.damage = data.damage || DefaultValues.damageData();

        return data;
    }

    /**
     * This test type can't be extended.
     */
    get canBeExtended() {
        return false;
    }

     get testModifiers(): ModifierTypes[] {
        return ['global', 'wounds', 'environmental'];
    }

     get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/melee-attack-test-dialog.html';
    }

    get showSuccessLabel(): boolean {
        return this.success;
    }

    async prepareDocumentData() {
        if (!this.item || !this.item.isMeleeWeapon()) return;

        this.data.reach = this.item.getReach();

        await super.prepareDocumentData();
    }

    /**
     * Remove unneeded environmental modifier categories for melee tests.
     * 
     * See SR5#187 'Environmental Modifiers'
     * 
     * @param actor 
     * @param type 
     */
     async prepareActorModifier(actor: SR5Actor, type: ModifierTypes): Promise<{ name: string; value: number; }> {
        if (type !== 'environmental' && !this.item?.isMeleeWeapon()) return await super.prepareActorModifier(actor, type);

        // Only light and visibility apply.
        const modifiers = actor.getSituationModifiers();
        modifiers.environmental.apply({applicable: ['light', 'visibility']});

        const name = this._getModifierTypeLabel(type);
        const value = modifiers.environmental.total;

        return {name, value};
    }
}