import {ShadowrunRoll, ShadowrunRoller} from '../rolls/ShadowrunRoller';
import {SR5Actor} from "./SR5Actor";
import {SoakRules} from "./SoakRules";
import { Helpers } from '../helpers';
import SoakRollOptions = Shadowrun.SoakRollOptions;
import ModList = Shadowrun.ModList;
import {createRollChatMessage} from "../chat";
import DamageData = Shadowrun.DamageData;
import DamageElement = Shadowrun.DamageElement;
import {PartsList} from "../parts/PartsList";
import {DefaultValues} from "../dataTemplates";
import { ShadowrunActorDialogs } from '../apps/dialogs/ShadowrunActorDialogs';

export class SoakFlow {

    /**
     * Runs the soak flow with user interaction
     * @param actor The actor doing the soaking
     * @param soakRollOptions Information about the incoming damage (if it is already known)
     * @param partsProps Optional modifiers for the soak test
     */
    async run(actor: SR5Actor, soakRollOptions: SoakRollOptions, partsProps: ModList<number> = []): Promise<ShadowrunRoll|undefined> {
        // Figure out soak mods and damage
        const soakDefenseParts = new PartsList<number>(partsProps);
        SoakRules.applyDamageIndependentSoakParts(soakDefenseParts, actor);

        const damageDataOrUndef = await this.promptDamageData(soakRollOptions, soakDefenseParts); 
        if (damageDataOrUndef === undefined) {
            return;
        } 

        const damageData = damageDataOrUndef;
        const armor = actor.getArmor();
        SoakRules.applyArmorPenetration(soakDefenseParts, armor, damageData);
        SoakRules.applyElementalArmor(soakDefenseParts, armor, damageData.element.value);
        
        // Query user for roll options and do the actual soak test.
        const title = game.i18n.localize('SR5.SoakTest');
        const roll = await ShadowrunRoller.advancedRoll({
            event: soakRollOptions?.event,
            extended: false,
            actor,
            parts: soakDefenseParts.list,
            title,
            wounds: false,
            hideRollMessage: true
        });

        if (!roll) return;

        // Reduce damage by damage resist and show result
        const modifiedDamage = SoakRules.reduceDamage(damageData, roll.hits);
        await createRollChatMessage({title, roll, actor, damage: modifiedDamage});

        return roll;
    }

    
    async promptDamageData(soakRollOptions: SoakRollOptions, soakDefenseParts: PartsList<number>) 
        : Promise<DamageData | undefined> {

        // Ask user for incoming damage, ap and element
        const damageDataDialog = await ShadowrunActorDialogs.createSoakDialog(soakRollOptions, soakDefenseParts);
        const userData = await damageDataDialog.select();
        if (damageDataDialog.canceled) return;

        // Update damage with the user input
        const initialDamageData: DamageData = soakRollOptions?.damage
                ? soakRollOptions.damage
                : DefaultValues.damageData();
        
        return this.updateDamageData(initialDamageData, userData.incomingDamage, userData.ap, userData.element);
    }


    updateDamageData(initialDamageData: DamageData, incomingDamage : number, ap: number, element: string) {
        const damageData: DamageData = duplicate(initialDamageData);

        // Update the damage element
        if (element) {
            damageData.element.value = element as DamageElement;
        }

        // Update damage data, diff changes instead of simply replacing
        const totalDamage = Helpers.calcTotal(damageData);
        if (totalDamage !== incomingDamage) {
            const diff = incomingDamage - totalDamage;
            damageData.mod = PartsList.AddUniquePart(damageData.mod, 'SR5.UserInput', diff);
            damageData.value = Helpers.calcTotal(damageData);
        }

        // Update ap, diff changes instead of simply replacing
        const totalAp = Helpers.calcTotal(damageData.ap);
        if (totalAp !== ap) {
            const diff = ap - totalAp;
            damageData.ap.mod = PartsList.AddUniquePart(damageData.ap.mod, 'SR5.UserInput', diff);
            damageData.ap.value = Helpers.calcTotal(damageData.ap);
        }

        return damageData;
    }
}