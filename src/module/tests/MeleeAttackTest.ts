import { EnvironmentalModifier } from './../rules/modifiers/EnvironmentalModifier';
import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {DataDefaults} from "../data/DataDefaults";
import { SR5Actor } from "../actor/SR5Actor";
import ModifierTypes = Shadowrun.ModifierTypes;
import EnvironmentalModifiersSourceData = Shadowrun.EnvironmentalModifiersSourceData;

export interface MeleeAttackData extends SuccessTestData {
    reach: number
}

export class MeleeAttackTest extends SuccessTest {
    override data: MeleeAttackData;

    override _prepareData(data, options): any {
        data = super._prepareData(data, options);

        data.damage = data.damage || DataDefaults.damageData();

        return data;
    }

    /**
     * This test type can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

     override get testModifiers(): ModifierTypes[] {
        return ['global', 'wounds', 'environmental'];
    }

     override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/melee-attack-test-dialog.html';
    }

    override get showSuccessLabel(): boolean {
        return this.success;
    }

    override async prepareDocumentData() {
        if (!this.item || !this.item.isMeleeWeapon) return;

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
    override prepareActorModifier(actor: SR5Actor, type: ModifierTypes): { name: string; value: number; } {
        if (type !== 'environmental') return super.prepareActorModifier(actor, type);

        // Only light and visibility apply.
        const modifiers = actor.getSituationModifiers();
        modifiers.environmental.apply({applicable: ['light', 'visibility']});

        const name = this._getModifierTypeLabel(type);
        const value = modifiers.environmental.total;

        return {name, value};
    }
}