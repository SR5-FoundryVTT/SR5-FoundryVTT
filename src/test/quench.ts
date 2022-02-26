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
    console.warn('Shadowrun 5e | Be aware that FoundryVTT will tank in update performance when a lot of documents are in collections. This is the case if you have all Chummer items imported and might cause tests to cross the 2000ms quench timeout threshold. Clear those collections in a test world. :)');

    quench.registerBatch("shadowrun5e.rules.matrix", shadowrunMatrix);
    quench.registerBatch("shadowrun5e.rules.modifiers", shadowrunRulesModifiers);
    quench.registerBatch("shadowrun5e.entities.items", shadowrunSR5Item);
    quench.registerBatch("shadowrun5e.entities.actors", shadowrunSR5Actor);
    quench.registerBatch("shadowrun5e.entities.effects", shadowrunSR5ActiveEffect);
    quench.registerBatch("shadowrun5e.data_prep.actor", shadowrunSR5ActorDataPrep);
    quench.registerBatch("shadowrun5e.flow.networkDevices", shadowrunNetworkDevices);
    quench.registerBatch("shadowrun5e.flow.inventory", shadowrunInventoryFlow);
    quench.registerBatch("shadowrun5e.flow.tests", shadowrunTesting);
};
