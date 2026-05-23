import { OneOrMany } from "../schema/Types";
import { ActionsSchema, Action } from "../schema/ActionsSchema";
import { ArmorSchema, Armor, Mod as ArmorMod } from "../schema/ArmorSchema";
import { Bioware, BiowareSchema } from "../schema/BiowareSchema";
import { Power as CritterPower, CritterpowersSchema } from "../schema/CritterpowersSchema";
import { Cyberware, CyberwareSchema } from "../schema/CyberwareSchema";
import { Complexform, ComplexformsSchema } from "../schema/ComplexformsSchema";
import { Echo, EchoesSchema } from "../schema/EchoesSchema";
import { Gear, GearSchema } from "../schema/GearSchema";
import { Metatype, MetatypeSchema } from "../schema/MetatypeSchema";
import { Power, Enhancement, PowersSchema } from "../schema/PowersSchema";
import { Quality, QualitiesSchema } from "../schema/QualitiesSchema";
import { Skill, SkillsSchema } from "../schema/SkillsSchema";
import { Spell, SpellsSchema } from "../schema/SpellsSchema";
import { Vehicle, Mod as VehicleMod, Weaponmount, VehiclesSchema } from "../schema/VehiclesSchema";
import { Accessory, Weapon, WeaponsSchema } from "../schema/WeaponsSchema";

export type SkillGroup = {
    id: { _TEXT: string; };
    name: { _TEXT: string; };
    translate?: OneOrMany<{ _TEXT: string; }>;
    page?: undefined;
    source?: undefined;
};

export type Schemas =
    ActionsSchema | ArmorSchema | BiowareSchema | CritterpowersSchema | CyberwareSchema | ComplexformsSchema | EchoesSchema |
    GearSchema | MetatypeSchema | PowersSchema | QualitiesSchema | SkillsSchema | SpellsSchema | VehiclesSchema | WeaponsSchema;

export type ParseData =
    Action | Armor | ArmorMod | Bioware | CritterPower | Cyberware | Complexform | Echo | Gear | Metatype |
    Power | Enhancement | Quality | Skill | SkillGroup | Spell | Vehicle | VehicleMod | Weaponmount | Weapon | Accessory;
