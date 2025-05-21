import * as Common from "./actor/CommonModel";

import * as Action from "./item/ActionModel";
import * as Device from "./item/DeviceModel";
import * as Weapon from "./item/WeaponModel";

import * as ItemArmor from "./item/ArmorModel";

import * as TemplateArmor from "./template/ArmorModel";
import * as TemplateAttribute from "./template/AttributesModel";
import * as TemplateBase from "./template/BaseModel";
import * as TemplateCondition from "./template/ConditionModel";
import * as TemplateConditionMonitor from "./template/ConditionMonitorsModel";
import * as TemplateDescription from "./template/DescriptionModel";
import * as TemplateImportFlags from "./template/ImportFlagsModel";
import * as TemplateLimits from "./template/LimitsModel";
import * as TemplateMovement from "./template/MovementModel";
import * as TemplateSkills from "./template/SkillsModel";
import * as TemplateTechnology from "./template/TechnologyModel";
import * as TemplateWeapon from "./template/WeaponModel";

export const ShadowrunModel = {
    ...Common,

    ...Action,
    ...Device,
    ...Weapon,

    ...ItemArmor,

    ...TemplateArmor,
    ...TemplateAttribute,
    ...TemplateBase,
    ...TemplateCondition,
    ...TemplateConditionMonitor,
    ...TemplateDescription,
    ...TemplateImportFlags,
    ...TemplateLimits,
    ...TemplateMovement,
    ...TemplateSkills,
    ...TemplateTechnology,
    ...TemplateWeapon,
} as const;
