import { shadowrunRolling } from './sr5.SR5Roll.spec';
import { shadowrunSR5RangedWeaponRules } from './sr5.RangedWeapon.spec';
import { shadowrunAttackTesting } from './sr5.AttackTests.spec';
import { shadowrunRulesModifiers } from "./sr5.Modifiers.spec";
import { shadowrunSR5Item } from "./sr5.SR5Item.spec";
import { shadowrunMatrix } from "./sr5.Matrix.spec";
import { shadowrunSR5Actor } from "./sr5.SR5Actor.spec";
import { shadowrunSR5CharacterDataPrep } from "./sr5.CharacterDataPrep.spec";
import { shadowrunSR5CritterDataPrep } from "./sr5.CritterDataPrep.spec";
import { shadowrunSR5SpiritDataPrep } from "./sr5.SpiritDataPrep.spec";
import { shadowrunSR5SpriteDataPrep } from "./sr5.SpriteDataPrep.spec";
import { shadowrunSR5ICDataPrep } from "./sr5.ICDataPrep.spec";
import { shadowrunSR5VehicleDataPrep } from "./sr5.VehicleDataPrep.spec";
import { shadowrunSR5ActiveEffect } from "./sr5.ActiveEffect.spec";
import { shadowrunNetworkDevices } from "./sr5.NetworkDevices.spec";
import { shadowrunTesting } from "./sr5.Testing.spec";
import { shadowrunInventoryFlow } from "./sr5.Inventory.spec";
import { weaponParserBaseTesting } from "./sr5.WeaponParser.spec";
import { characterImporterTesting } from "./actorImport/characterImporter/sr5.CharacterImporter.spec";
import { characterInfoUpdaterTesting } from "./actorImport/characterImporter/sr5.CharacterInfoUpdater.spec";
import { weaponParserTesting } from "./actorImport/itemImporter/weaponImport/sr5.WeaponImport.spec";
import { mountedWeaponParserTesting } from "./actorImport/itemImporter/vehicleImport/sr5.VehicleImporterMountedWeapon.spec";
import { shadowrunSR5ItemDataPrep } from "./sr5.ItemDataPrep.spec";
import { vehicleImporterTesting } from "./actorImport/itemImporter/vehicleImport/sr5.VehicleImporter.spec";

import { Quench } from "@ethaks/fvtt-quench";


/**
 * Register FoundryVTT Quench test batches...
 *
 * @params quench Quench unittest registry
 * https://github.com/Ethaks/FVTT-Quench
 */
export const quenchRegister = (quench: Quench) => {
    if (!quench) return;

    console.info('Shadowrun 5e | Registering quench unittests');
    console.warn('Shadowrun 5e | Be aware that FoundryVTT will tank in update performance when a lot of documents are in collections. This is the case if you have all Chummer items imported and might cause tests to cross the 2000ms quench timeout threshold. Clear those collections in a test world. :)');

    quench.registerBatch("shadowrun5e.rules.matrix", shadowrunMatrix, { displayName: "SHADOWRUN5e: Matrix Rules Test" });
    quench.registerBatch("shadowrun5e.rules.modifiers", shadowrunRulesModifiers, { displayName: "SHADOWRUN5e: Modifiers Rules Test" });
    quench.registerBatch("shadowrun5e.rules.ranged_weapon", shadowrunSR5RangedWeaponRules, { displayName: "SHADOWRUN5e: Ranged Weapon Rules Test" });

    quench.registerBatch("shadowrun5e.characterImporter", characterImporterTesting, { displayName: "SHADOWRUN5e: Chummer Character Importer" });
    quench.registerBatch("shadowrun5e.characterInfoUpdater", characterInfoUpdaterTesting, { displayName: "SHADOWRUN5e: Chummer Character Info Updater" });
    quench.registerBatch("shadowrun5e.characterImporterWeapons", weaponParserTesting, { displayName: "SHADOWRUN5e: Chummer Character Weapon Importer" });
    quench.registerBatch("shadowrun5e.characterImporterVehicles", vehicleImporterTesting, { displayName: "SHADOWRUN5e: Chummer Character Vehicle Importer" });
    quench.registerBatch("shadowrun5e.characterImporterVehicleMountedWeapons", mountedWeaponParserTesting, { displayName: "SHADOWRUN5e: Chummer Character Vehicle Mounted Weapon Importer" });

    quench.registerBatch("shadowrun5e.entities.items", shadowrunSR5Item, { displayName: "SHADOWRUN5e: SR5Item Test" });
    quench.registerBatch("shadowrun5e.entities.actors", shadowrunSR5Actor, { displayName: "SHADOWRUN5e: SR5Actor Test" });
    quench.registerBatch("shadowrun5e.entities.effects", shadowrunSR5ActiveEffect, { displayName: "SHADOWRUN5e: SR5ActiveEffect Test" });

    quench.registerBatch("shadowrun5e.data_prep.character", shadowrunSR5CharacterDataPrep, { displayName: "SHADOWRUN5e: SR5CharacterDataPreparation Test" });
    quench.registerBatch("shadowrun5e.data_prep.critter", shadowrunSR5CritterDataPrep, { displayName: "SHADOWRUN5e: SR5CritterDataPreparation Test" });
    quench.registerBatch("shadowrun5e.data_prep.sprite", shadowrunSR5SpriteDataPrep, { displayName: "SHADOWRUN5e: SR5CSpriteDataPreparation Test" });
    quench.registerBatch("shadowrun5e.data_prep.spirit", shadowrunSR5SpiritDataPrep, { displayName: "SHADOWRUN5e: SR5SpiritDataPreparation Test" });
    quench.registerBatch("shadowrun5e.data_prep.ic", shadowrunSR5ICDataPrep, { displayName: "SHADOWRUN5e: SR5ICDataPreparation Test" });
    quench.registerBatch("shadowrun5e.data_prep.vehicle", shadowrunSR5VehicleDataPrep, { displayName: "SHADOWRUN5e: SR5VehicleDataPreparation Test" });

    quench.registerBatch("shadowrun5e.data_prep.item", shadowrunSR5ItemDataPrep, { displayName: "SHADOWRUN5e: SR5ItemDataPreparation Test" });

    quench.registerBatch("shadowrun5e.flow.networkDevices", shadowrunNetworkDevices, { displayName: "SHADOWRUN5e: Matrix Network Devices Test" });
    quench.registerBatch("shadowrun5e.flow.inventory", shadowrunInventoryFlow, { displayName: "SHADOWRUN5e: InventoryFlow Test" });
    quench.registerBatch("shadowrun5e.flow.tests", shadowrunTesting, { displayName: "SHADOWRUN5e: SuccessTest Test" });
    quench.registerBatch("shadowrun5e.flow.tests_attack", shadowrunAttackTesting, { displayName: "SHADOWRUN5e: Attack Test" });
    quench.registerBatch("shadowrun5e.flow.sr5roll", shadowrunRolling, { displayName: "SHADOWRUN5e: SR5Roll" });

    quench.registerBatch("shadowrun5e.parser.weapon", weaponParserBaseTesting, { displayName: "SHADOWRUN5e: Data Importer Weapon Parsing" });

};
