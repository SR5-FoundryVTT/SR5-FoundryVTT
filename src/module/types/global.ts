import { Quench } from "@ethaks/fvtt-quench";
import { SR5Item } from "../item/SR5Item";
import { SR5Actor } from "../actor/SR5Actor";
import { SR5ChatMessage } from "../chatMessage/SR5ChatMessage";
import { SR5Combat } from "../combat/SR5Combat";
import { SR5ActiveEffect } from "../effect/SR5ActiveEffect";
import { SR5Roll } from "../rolls/SR5Roll";
import { SR5Token } from "../token/SR5Token";

import { Translation } from '../utils/strings';

import { Character } from "./actor/Character";
import { Critter } from "./actor/Critter";
import { IC } from "./actor/IC";
import { Spirit } from "./actor/Spirit";
import { Sprite } from "./actor/Sprite";
import { Vehicle } from "./actor/Vehicle";

import { ActiveEffectDM } from "./effect/ActiveEffect";
import { Action } from './item/Action';
import { AdeptPower } from './item/AdeptPower';
import { Ammo } from './item/Ammo';
import { Armor } from './item/Armor';
import { Bioware } from './item/Bioware';
import { CallInAction } from './item/CallInAction';
import { ComplexForm } from './item/ComplexForm';
import { Contact } from './item/Contact';
import { CritterPower } from './item/CritterPower';
import { Cyberware } from './item/Cyberware';
import { Device } from './item/Device';
import { Echo } from './item/Echo';
import { Equipment } from './item/Equipment';
import { Grid } from "./item/Grid";
import { Host } from './item/Host';
import { Lifestyle } from './item/Lifestyle';
import { Metamagic } from './item/Metamagic';
import { Modification } from './item/Modification';
import { Program } from './item/Program';
import { Quality } from './item/Quality';
import { Ritual } from "./item/Ritual";
import { Sin } from './item/Sin';
import { Spell } from './item/Spell';
import { SpritePower } from './item/SpritePower';
import { Weapon } from './item/Weapon';
import { ComplexFormLevelType, FireModeType, FireRangeType, SpellForceType } from "./flags/ItemFlags";

import { RoutingLib } from "../integrations/routingLibIntegration";
import SR5CompendiaSettings from "../settings/SR5CompendiaSettings";
import AstralPerceptionDetectionMode from "../vision/astralPerception/astralPerceptionDetectionMode";
import AugmentedRealityVisionDetectionMode from "../vision/augmentedReality/arDetectionMode";
import LowlightVisionDetectionMode from "../vision/lowlightVision/lowlightDetectionMode";
import ThermographicVisionDetectionMode from "../vision/thermographicVision/thermographicDetectionMode";

declare module "fvtt-types/configuration" {
    interface DocumentClassConfig {
        ActiveEffect: typeof SR5ActiveEffect;
        Actor: typeof SR5Actor<Actor.ConfiguredSubType>;
        ChatMessage: typeof SR5ChatMessage;
        Combat: typeof SR5Combat<Combat.SubType>;
        Item: typeof SR5Item<Item.ConfiguredSubType>;
        Roll: typeof SR5Roll;
        Sheet: typeof FormApplication;
    }

    interface ConfiguredCombat<SubType extends Combat.SubType> {
        document: SR5Combat<SubType>;
    }

    interface ObjectClassConfig {
        token: typeof SR5Token;
    }

    interface AssumeHookRan {
        ready: true;
    }

    interface SystemNameConfig {
        name: "shadowrun5e";
    }

    namespace CONFIG.Canvas {
        interface DetectionModes {
            astralPerception: AstralPerceptionDetectionMode;
            thermographic: ThermographicVisionDetectionMode;
            lowlight: LowlightVisionDetectionMode;
            augmentedReality: AugmentedRealityVisionDetectionMode;
        }

        interface VisionModes {
            astralPerception: foundry.canvas.perception.VisionMode;
        }
    }

    interface ReadyGame {
        shadowrun5e: {
            inputDelay: number;
            [key: string]: any;
        };
        action_manager?: any;
    }

    interface DataModelConfig {
        ActiveEffect: {
            base: typeof ActiveEffectDM;
        };
        Actor: {
            character: typeof Character;
            critter: typeof Critter;
            ic: typeof IC;
            spirit: typeof Spirit;
            sprite: typeof Sprite;
            vehicle: typeof Vehicle;
        };
        Combat: {
            base: typeof SR5Combat;
        };
        Item: {
            action: typeof Action;
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
            grid: typeof Grid;
            host: typeof Host;
            lifestyle: typeof Lifestyle;
            metamagic: typeof Metamagic;
            modification: typeof Modification;
            program: typeof Program;
            quality: typeof Quality;
            ritual: typeof Ritual;
            sin: typeof Sin;
            spell: typeof Spell;
            sprite_power: typeof SpritePower;
            weapon: typeof Weapon;
        }
    }

    interface FlagConfig {
        Actor: {
            shadowrun5e: {
                turnsSinceLastAttack?: number;
                overwatchScore?: number;
            }
        };
        ChatMessage: {
            shadowrun5e: {
                TestData?: any;
                MatrixNetworkMarkInvite: {actorUuid: string, targetUuid: string};
            }
        };
        Combat: {
            shadowrun5e: {
                combatInitiativePass?: number;
            };
        };
        Combatant: {
            shadowrun5e: {
                turnsSinceLastAttack?: number;
            };
        };
        Item: {
            shadowrun5e: {
                lastFireMode?: FireModeType;
                lastSpellForce?: SpellForceType;
                lastComplexFormLevel?: ComplexFormLevelType;
                lastFireRange?: FireRangeType;
                embeddedItems: Item.Source[];
            };
        };
        Macro: {
            shadowrun5e: {
                itemMacro?: boolean;
            }
        };
        Token: {
            shadowrun5e: {
                TokenUseRoutingLib?: boolean;
            };
        }
        User: {
            shadowrun5e: {
                showApplication?: boolean;
                changelogShownForVersion?: string;
                lastRollPromptValue?: number;
            }
        };
        Scene: {
            shadowrun5e: {
                modifier?: Shadowrun.SituationModifiersSourceData;
            }
        };
    }

    namespace Hooks {
        interface HookConfig {
            sr5_beforePrepareTestDataWithAction: any;
            sr5_afterPrepareTestDataWithAction: any;
            sr5_afterDamageAppliedToActor: any;
            deleteActor: any;
            sr5_testPrepareBaseValues: any;
            sr5_testProcessResults: any;
            sr5_afterTestComplete: any;
            sr5_processTagifyElements: any;
            "routinglib.ready": () => void;
            SR5_CastItemAction: (arg0: SR5Item) => void;
            SR5_PreActorItemRoll: (arg0: SR5Actor, arg1: SR5Item) => void;
            getSceneControlButtons: (arg0: any) => void;
            getCombatTrackerEntryContext: (arg0: any, arg1: any) => void;
            renderCompendiumDirectory: (arg0: foundry.appv1.api.Application, arg1: HTMLElement) => void;
            renderTokenHUD: (arg0: foundry.applications.hud.TokenHUD, arg1: JQuery, arg2: any) => void;
            updateItem: (args0: SR5Item, args1: SR5Item['system'], arg2: string) => void;
            deleteItem: (args0: SR5Item, args1: SR5Item['system'], arg2: string) => void;
            getChatMessageContextOptions: (args0: any, args1: any) => void;
            quenchReady: (args0: Quench) => void;
            renderChatMessage: (args0: SR5ChatMessage, args1: any, arg2: any) => void;
        }
    }

    namespace ActiveEffect {
        interface ChangeData {
            effect: SR5ActiveEffect;
        }
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
        "shadowrun5e.TokenRulerColorWalking": foundry.data.fields.ColorField<{ initial: '00FF00' }>;
        "shadowrun5e.TokenRulerColorRunning": foundry.data.fields.ColorField<{ initial: '0000FF' }>;
        "shadowrun5e.TokenRulerColorSprinting": foundry.data.fields.ColorField<{ initial: 'FF0000' }>;
        "shadowrun5e.TokenRulerOpacity": foundry.data.fields.NumberField<{ nullable: false, initial: 0.5, min: 0, max: 1, step: 0.01 }>;
        "shadowrun5e.CompendiaSettingsMenu": typeof SR5CompendiaSettings;
        "shadowrun5e.GeneralActionsPack": string;
        "shadowrun5e.MatrixActionsPack": string;
        "shadowrun5e.ICActionsPack": string;
        "shadowrun5e.CompendiumBrowserBlacklist": string[];
    }
}

declare global {
    // eslint-disable-next-line no-var
    var routinglib: RoutingLib | null;

    // Use declaration merging to add strong typing to Foundry's game.i18n localize and format functions,
    // sourcing valid translation strings from this system's english translations file
    interface Localization {
        localize(stringId: Translation): string;

        format(stringId: Translation, data?: Record<string, unknown>): string;
    }

    interface UI {
        pdfpager?: {
            openPDFByCode: (pdfcode: string, options?: { page?: number; uuid?: string }) => void;
        }
    }
}
