import ShadowrunItemData = Shadowrun.ShadowrunItemData;
import ShadowrunActorData = Shadowrun.ShadowrunActorData;
import { SR5Item } from "../item/SR5Item";
import { SR5Actor } from "../actor/SR5Actor";
import { SR5Combat } from "../combat/SR5Combat";
import { SR5ActiveEffect } from "../effect/SR5ActiveEffect";
import { SR5Roll } from "../rolls/SR5Roll";
import { Translation } from '../utils/strings';

import { Character } from "./actor/CharacterModel";
import { Critter } from "./actor/CritterModel";
import { IC } from "./actor/ICModel";
import { Spirit } from "./actor/SpiritModel";
import { Sprite } from "./actor/SpriteModel";
import { Vehicle } from "./actor/VehicleModel";

import { Action } from './item/ActionModel';
import { AdeptPower } from './item/AdeptPowerModel';
import { Ammo } from './item/AmmoModel';
import { Armor } from './item/ArmorModel';
import { Bioware } from './item/BiowareModel';
import { CallInAction } from './item/CallInActionModel';
import { ComplexForm } from './item/ComplexFormModel';
import { Contact } from './item/ContactModel';
import { CritterPower } from './item/CritterPowerModel';
import { Cyberware } from './item/CyberwareModel';
import { Device } from './item/DeviceModel';
import { Echo } from './item/EchoModel';
import { Equipment } from './item/EquipmentModel';
import { Host } from './item/HostModel';
import { Lifestyle } from './item/LifeStyleModel';
import { Metamagic } from './item/MetamagicModel';
import { Modification } from './item/ModificationModel';
import { Program } from './item/ProgramModel';
import { Quality } from './item/QualityModel';
import { Sin } from './item/SinModel';
import { Spell } from './item/SpellModel';
import { SpritePower } from './item/SpritePowerModel';
import { Weapon } from './item/WeaponModel';

declare global {
    // Configuration of foundry-vtt-types
    interface LenientGlobalVariableTypes {
        game: never; // disable game ready checks
        canvas: never; // disable canvas ready checks
        socket: never; // disable socket ready checks
    }

    interface DocumentClassConfig {
        ActiveEffect: typeof SR5ActiveEffect;
    }

    interface AssumeHookRan {
        ready: never;
    }

    interface System {
        id: "shadowrun5e";
    }

    interface ReadyGame {
        shadowrun5e: Record<string, unknown>;
        action_manager?: any;
    }

    interface CONFIG {}

    // Configuration of shadowrun5e system
    interface SourceConfig {
        Item: ShadowrunItemData;
        Actor: ShadowrunActorData;
    }

    interface DataConfig {
        Item: ShadowrunItemData;
        Actor: ShadowrunActorData;
    }

    interface DataModelConfig {
        Actor: {
            character: typeof Character;
            critter: typeof Critter;
            ic: typeof IC;
            spirit: typeof Spirit;
            sprite: typeof Sprite;
            vehicle: typeof Vehicle;
        };
        Item: {
            action: typof Action;
            adept_power: typeof AdeptPower;
            ammo: typeof Ammo;
            armor: typeof Armor;
            bioware: typeof Bioware;
            call_in_action: typeof CallInAction;
            complex_form:  typeof ComplexForm;
            contact: typeof Contact;
            critter_power: typeof CritterPower;
            cyberware: typeof Cyberware;
            device: typeof Device;
            echo: typeof Echo;
            equipment: typeof Equipment;
            host: typeof Host;
            lifestyle: typeof Lifestyle;
            metamagic: typeof Metamagic;
            modification: typeof Modification;
            program: typeof Program;
            quality: typeof Quality;
            sin: typeof Sin;
            spell: typeof Spell;
            sprite_power: typeof SpritePower;
            weapon: typeof Weapon;
        }
    }

    interface FlagConfig {
        ActiveEffect: {
            shadowrun5e: {
                applyTo?: Shadowrun.EffectApplyTo;
                appliedByTest?: boolean;
                onlyForEquipped?: boolean;
                onlyForWireless?: boolean;
                onlyForItemTest?: boolean;
                selection_tests?: string;
                selection_categories?: string;
                selection_skills?: string;
                selection_attributes?: string;
                selection_limits?: string;
            };
        };
        Actor: {
            shadowrun5e: {
                turnsSinceLastAttack?: number;
                overwatchScore?: number;
            }
        };
        ChatMessage: {
            shadowrun5e: {
                TestData?: any;
            }
        };
        Combatant: {
            shadowrun5e: {
                combatInitiativePass?: number;
                turnsSinceLastAttack?: number;
            };
        };
        Item: {
            shadowrun5e: {
                lastFireMode?: Shadowrun.FireModeData;
                lastSpellForce?: Shadowrun.SpellForceData;
                lastComplexFormLevel?: Shadowrun.ComplexFormLevelData;
                lastFireRange?: Shadowrun.FireRangeData;
                embeddedItems?: any[];
            };
        };
        User: {
            shadowrun5e: {
                showApplication?: boolean;
                changelogShownForVersion?: string;
            }
        };
    }

    interface DocumentClassConfig {
        Item: typeof SR5Item;
        Actor: typeof SR5Actor;
        ActiveEffect: typeof SR5ActiveEffect;
        Combat: typeof SR5Combat;
        Roll: typeof SR5Roll;
    }

    // Declaration Merging
    interface DocumentClassConfig {
        sheet: FormApplication;
    }

    // Inject model basic structure into foundry-vtt-types
    interface Game {
        model: {
            Item: any;
            Actor: any;
            Card: any;
            Cards: any;
            JournalEntryPage: any;
        };
    }

    type RecursivePartial<T> = {
        [P in keyof T]?: RecursivePartial<T[P]>;
    };


    /**
     * Retrieve an Entity or Embedded Entity by its Universally Unique Identifier (uuid).
     * @param uuid - The uuid of the Entity or Embedded Entity to retrieve
     */
    declare function fromUuidSync(uuid: string): foundry.abstract.Document<any, any> | null;

    // Use declaration merging to add strong typing to Foundry's game.i18n localize and format functions,
    // sourcing valid translation strings from this system's english translations file
    declare class Localization {
        localize(stringId: Translation): string;

        format(stringId: Translation, data?: Record<string, unknown>): string;
    }

    interface SettingConfig {
        "shadowrun5e.applyLimits": boolean;
        "shadowrun5e.diagonalMovement": string;
        "shadowrun5e.GlobalDataStorage": Record<string, unknown>;
        "shadowrun5e.showGlitchAnimation": boolean;
        "shadowrun5e.systemMigrationVersion": string;
        "shadowrun5e.showTokenNameInsteadOfActor": boolean;
        "shadowrun5e.onlyAllowRollOnDefaultableSkills": boolean;
        "shadowrun5e.showSkillsWithDetails": boolean;
        "shadowrun5e.onlyAutoRollNPCInCombat": boolean;
        "shadowrun5e.tokenHealthBars": boolean;
        "shadowrun5e.HideGMOnlyChatContent": boolean;
        "shadowrun5e.MustConsumeRessourcesOnTest": boolean;
        "shadowrun5e.UseDamageCondition": boolean;
        "shadowrun5e.AutomateMultiDefenseModifier": boolean;
        "shadowrun5e.AutomateProgressiveRecoil": boolean;
        "shadowrun5e.ManualRollOnSuccessTest": boolean;
        "shadowrun5e.DefaultOpposedTestActorSelection": boolean;
        "shadowrun5e.MarkImports": string;
        "shadowrun5e.ImportIconFolder": string;
        "shadowrun5e.UseImportIconOverrides": boolean;
    }
}
