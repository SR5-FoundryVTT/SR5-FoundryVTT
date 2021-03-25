import {ShadowrunRoll, ShadowrunRoller} from '../rolls/ShadowrunRoller';
import {SR5Actor} from "./SR5Actor";
import {SoakRules} from "./SoakRules";
import { Helpers } from '../helpers';
import SoakRollOptions = Shadowrun.SoakRollOptions;
import ModList = Shadowrun.ModList;
import {createRollChatMessage} from "../chat";
import DamageData = Shadowrun.DamageData;
import DamageElement = Shadowrun.DamageElement;
import DamageType = Shadowrun.DamageType;
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
    async runSoakTest(actor: SR5Actor, soakRollOptions: SoakRollOptions, partsProps: ModList<number> = []): Promise<ShadowrunRoll|undefined> {
        const initialDamageData = soakRollOptions.damage ? soakRollOptions.damage : DefaultValues.damageData();
        const previewSoakDefenseParts = new PartsList<number>(duplicate(partsProps));
        SoakRules.applyAllSoakParts(previewSoakDefenseParts, actor, initialDamageData);

        // Ask the user for the damage data / update the incoming damage data 
        const damageDataOrUndef = await this.promptDamageData(soakRollOptions, previewSoakDefenseParts); 
        if (!damageDataOrUndef) {
            return;
        } 

        const damageData = damageDataOrUndef;
        const finalSoakDefenseParts = new PartsList<number>(duplicate(partsProps));
        SoakRules.applyAllSoakParts(finalSoakDefenseParts, actor, damageData); 

        // Query user for roll options and do the actual soak test.
        const title = game.i18n.localize('SR5.SoakTest');
        const roll = await ShadowrunRoller.advancedRoll({
            event: soakRollOptions?.event,
            extended: false,
            actor,
            parts: finalSoakDefenseParts.list,
            title,
            wounds: false,
            hideRollMessage: true
        });

        if (!roll) return;

        // Modify damage and reduce damage by net hits and show result
        const incoming = duplicate(damageData);
        let modified = SoakRules.modifyDamageType(incoming, actor);
        modified = SoakRules.reduceDamage(actor, modified, roll.hits).modified;
        const incAndModDamage = {incoming, modified};

        await createRollChatMessage({title, roll, actor, damage: incAndModDamage});

        return roll;
    }

    private async promptDamageData(soakRollOptions: SoakRollOptions, soakDefenseParts: PartsList<number>) 
        : Promise<DamageData | undefined> {

        // Ask user for incoming damage, ap and element
        const damageDataDialog = await ShadowrunActorDialogs.createSoakDialog(soakRollOptions, soakDefenseParts);
        const userData = await damageDataDialog.select();
        if (damageDataDialog.canceled) return;

        // Update damage with the user input
        const initialDamageData: DamageData = soakRollOptions?.damage
                ? soakRollOptions.damage
                : DefaultValues.damageData();
        
        return this.updateDamageWithUserData(initialDamageData, userData.incomingDamage, userData.damageType, userData.ap, userData.element);
    }


    private updateDamageWithUserData(initialDamageData: DamageData, incomingDamage : number, damageType : DamageType, ap: number, element: string) {
        const damageData: DamageData = duplicate(initialDamageData);

        // Update damage data, diff changes instead of simply replacing
        const totalDamage = Helpers.calcTotal(damageData);
        if (totalDamage !== incomingDamage) {
            const diff = incomingDamage - totalDamage;
            damageData.mod = PartsList.AddUniquePart(damageData.mod, 'SR5.UserInput', diff);
            damageData.value = Helpers.calcTotal(damageData);
        }

        if (initialDamageData.type.base !== damageType) {
            damageData.type.base = damageType;
            damageData.type.value = damageType;
        }

        // Update ap, diff changes instead of simply replacing
        const totalAp = Helpers.calcTotal(damageData.ap);
        if (totalAp !== ap) {
            const diff = ap - totalAp;
            damageData.ap.mod = PartsList.AddUniquePart(damageData.ap.mod, 'SR5.UserInput', diff);
            damageData.ap.value = Helpers.calcTotal(damageData.ap);
        }

        if (element) {
            damageData.element.value = element as DamageElement;
        }

        return damageData;
    }
}