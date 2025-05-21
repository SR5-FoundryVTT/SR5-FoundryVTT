import { SR5Actor } from "./module/actor/SR5Actor";
import { SR5Item } from "./module/item/SR5Item";
import { ShadowrunModel as SM } from "./module/types/ShadowrunModel";
import { Action } from "./module/types/item/ActionModel";
import { Armor } from "./module/types/item/ArmorModel";
import { AdeptPower } from "./module/types/item/AdeptPowerModel";
import { Bioware } from "./module/types/item/BiowareModel";
import { ComplexForm } from "./module/types/item/ComplexFormModel";
import { Contact } from "./module/types/item/ContactModel";
import { CritterPower } from "./module/types/item/CritterPowerModel";
import { Cyberware } from "./module/types/item/CyberwareModel";
import { Device } from "./module/types/item/DeviceModel";
import { Echo } from "./module/types/item/EchoModel";
import { Equipment } from "./module/types/item/EquipmentModel";
import { Host } from "./module/types/item/HostModel";
import { Lifestyle } from "./module/types/item/LifeStyleModel";
import { Metamagic } from "./module/types/item/MetamagicModel";
import { Modification } from "./module/types/item/ModificationModel";
import { Program } from "./module/types/item/ProgramModel";
import { Quality } from "./module/types/item/QualityModel";
import { Sin } from "./module/types/item/SinModel";
import { Spell } from "./module/types/item/SpellModel";
import { SpritePower } from "./module/types/item/SpritePowerModel";
import { Weapon } from "./module/types/item/WeaponModel";

Hooks.once("init", () => {
    console.log("Initializing Shadowrun 5e System");

    CONFIG.Item.dataModels["Action"] = Action;
    CONFIG.Item.dataModels["Armor"] = Armor;
    CONFIG.Item.dataModels["AdeptPower"] = AdeptPower;
    CONFIG.Item.dataModels["Bioware"] = Bioware;
    CONFIG.Item.dataModels["ComplexForm"] = ComplexForm;
    CONFIG.Item.dataModels["Contact"] = Contact;
    CONFIG.Item.dataModels["CritterPower"] = CritterPower;
    CONFIG.Item.dataModels["Cyberware"] = Cyberware;
    CONFIG.Item.dataModels["Device"] = Device;
    CONFIG.Item.dataModels["Echo"] = Echo;
    CONFIG.Item.dataModels["Equipment"] = Equipment;
    CONFIG.Item.dataModels["Host"] = Host;
    CONFIG.Item.dataModels["Lifestyle"] = Lifestyle;
    CONFIG.Item.dataModels["Metamagic"] = Metamagic;
    CONFIG.Item.dataModels["Modification"] = Modification;
    CONFIG.Item.dataModels["Program"] = Program;
    CONFIG.Item.dataModels["Quality"] = Quality;
    CONFIG.Item.dataModels["Sin"] = Sin;
    CONFIG.Item.dataModels["Spell"] = Spell;
    CONFIG.Item.dataModels["SpritePower"] = SpritePower;
    CONFIG.Item.dataModels["Weapon"] = Weapon;

    game.shadowrun5e = {
        canvas: {},
    };

    CONFIG.Item.documentClass = SR5Item;
});

Hooks.once("setup", () => {});

Hooks.once("ready", () => {
    console.log("Shadowrun 5e System is ready");
});
