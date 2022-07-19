import {SR5Actor} from "../SR5Actor";
import {Helpers} from '../../helpers';
import {PartsList} from "../../parts/PartsList";
import {DefaultValues} from "../../data/DataDefaults";
import {ShadowrunActorDialogs} from '../../apps/dialogs/ShadowrunActorDialogs';
import {SR5Item} from '../../item/SR5Item';
import SoakRollOptions = Shadowrun.SoakRollOptions;
import ModList = Shadowrun.ModList;
import DamageData = Shadowrun.DamageData;
import DamageElement = Shadowrun.DamageElement;
import DamageType = Shadowrun.DamageType;

export class SoakFlow {

    /**
     * Runs the soak flow with user interaction
     * @param actor The actor doing the soaking
     * @param soakRollOptions Information about the incoming damage (if it is already known)
     * @param partsProps Optional modifiers for the soak test
     */
    async runSoakTest(actor: SR5Actor, soakRollOptions: SoakRollOptions, partsProps: ModList<number> = []): Promise<void> {
        // const initialDamageData = soakRollOptions.damage ? soakRollOptions.damage : DefaultValues.damageData();
        // const previewSoakDefenseParts = new PartsList<number>(duplicate(partsProps) as ModList<number>);
        // SoakRules.applyAllSoakParts(previewSoakDefenseParts, actor, initialDamageData);
        //
        // // Ask the user for the damage data / update the incoming damage data
        // const damageDataOrUndef = await this.promptDamageData(soakRollOptions, previewSoakDefenseParts);
        // if (!damageDataOrUndef) {
        //     return;
        // }
        //
        // const damageData = damageDataOrUndef;
        // const finalSoakDefenseParts = new PartsList<number>(duplicate(partsProps) as ModList<number>);
        // SoakRules.applyAllSoakParts(finalSoakDefenseParts, actor, damageData);

        // Query user for roll options and do the actual soak test.
        // const title = game.i18n.localize('SR5.SoakTest');
        // const roll = await ShadowrunRoller.advancedRoll({
        //     event: soakRollOptions?.event,
        //     extended: false,
        //     actor,
        //     parts: finalSoakDefenseParts.list,
        //     title,
        //     wounds: false,
        //     hideRollMessage: true
        // });

        // if (!roll) return;

        // Modify damage and reduce damage by net hits and show result
        // const incoming = duplicate(damageData) as DamageData;
        // let modified = SoakRules.modifyDamageType(incoming, actor);
        // modified = SoakRules.reduceDamage(actor, modified, roll.hits).modified;
        // const incAndModDamage = {incoming, modified};
        //
        // const options = {title, roll, actor, damage: incAndModDamage};
        // if (this.knocksDown(modified, actor)) {
        //     options["knockedDown"] = true;
        // }
        // await createRollChatMessage(options);
        //
        // return roll;
    }


    knocksDown(damage: DamageData, actor:SR5Actor) {
        // TODO: SR5 195 Called Shot Knock Down (Melee Only), requires attacker STR and actually announcing that called shot.
        const gelRoundsEffect = this.isDamageFromGelRounds(damage) ? -2 : 0;  // SR5 434
        const impactDispersionEffect = this.isDamageFromImpactDispersion(damage) ? -2 : 0  // FA 52
        const limit = actor.getLimit('physical');
        const effectiveLimit = limit.value + gelRoundsEffect + impactDispersionEffect
        // SR5 194
        const knockedDown = damage.value > effectiveLimit || damage.value >= 10;

        console.log(`Shadowrun5e | Determined target ${actor.id} knocked down status as: ${knockedDown}`, damage, actor);

        return knockedDown;
    }

    isDamageFromGelRounds(damage: DamageData) {
        if (damage.source && damage.source.actorId && damage.source.itemId) {
            const attacker = game.actors?.find(actor => actor.id == damage.source?.actorId);
            if (attacker) {
                const item = attacker.items.find(item => item.id == damage.source?.itemId) as SR5Item;
                if (item) {
                    return item.items
                        .filter(mod => mod.getTechnologyData()?.equipped)
                        .filter(tech => tech.name == game.i18n.localize("SR5.AmmoGelRounds")).length > 0;
                }
            }
        }
        return false;
    }

    isDamageFromImpactDispersion(damage: DamageData) {
        // TODO: FA 52. Ammo currently cannot have mods, so not sure how to implement Alter Ballistics idiomatically.
        return false;
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
        const damageData = duplicate(initialDamageData) as DamageData;

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