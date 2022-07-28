import {shadowrunRulesModifiers} from "./sr5.Modifiers.spec";
import {shadowrunSR5Item} from "./sr5.SR5Item.spec";
import {shadowrunMatrix} from "./sr5.Matrix.spec";
import {shadowrunSR5Actor} from "./sr5.SR5Actor.spec";
import {shadowrunSR5ActorDataPrep} from "./sr5.ActorDataPrep.spec";
import {shadowrunSR5ActiveEffect} from "./sr5.ActiveEffect.spec";
import {shadowrunNetworkDevices} from "./sr5.NetworkDevices.spec";
import {shadowrunTesting} from "./sr5.Testing.spec";
import {shadowrunInventoryFlow} from "./sr5.Inventory.spec";


/**
 * Register FoundryVTT Quench test batches...
 *
 * https://github.com/Ethaks/FVTT-Quench
 */
export const quenchRegister = (quench) => {
    if (!quench) return;

    console.warn('Shadowrun 5e | Be aware that FoundryVTT will tank in update performance when a lot of documents are in collections. This is the case if you have all Chummer items imported and might cause tests to cross the 2000ms quench timeout threshold. Clear those collections in a test world. :)');

    quench.registerBatch("shadowrun5e.rules.matrix", shadowrunMatrix, {displayName: "SHADOWRUN5e: Matrix Test"});
    quench.registerBatch("shadowrun5e.rules.modifiers", shadowrunRulesModifiers, {displayName: "SHADOWRUN5e: Modifiers Test"});
    quench.registerBatch("shadowrun5e.entities.items", shadowrunSR5Item, {displayName: "SHADOWRUN5e: SR5Item Test"});
    quench.registerBatch("shadowrun5e.entities.actors", shadowrunSR5Actor, {displayName: "SHADOWRUN5e: SR5Actor Test"});
    quench.registerBatch("shadowrun5e.entities.effects", shadowrunSR5ActiveEffect, {displayName: "SHADOWRUN5e: SR5ActiveEffect Test"});
    quench.registerBatch("shadowrun5e.data_prep.actor", shadowrunSR5ActorDataPrep, {displayName: "SHADOWRUN5e: SR5ActorDataPreparation Test"});
    quench.registerBatch("shadowrun5e.flow.networkDevices", shadowrunNetworkDevices, {displayName: "SHADOWRUN5e: Matrix Network Devices Test"});
    quench.registerBatch("shadowrun5e.flow.inventory", shadowrunInventoryFlow, {displayName: "SHADOWRUN5e: InventoryFlow Test"});
    quench.registerBatch("shadowrun5e.flow.tests", shadowrunTesting, {displayName: "SHADOWRUN5e: SuccessTest Test"});
};
