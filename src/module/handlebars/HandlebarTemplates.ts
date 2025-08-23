export const preloadHandlebarsTemplates = async () => {
    const templatePaths = [
        // actor tabs
        'systems/shadowrun5e/dist/templates/actor/tabs/ActionsTab.hbs',
        'systems/shadowrun5e/dist/templates/actor/tabs/BioTab.hbs',
        'systems/shadowrun5e/dist/templates/actor/tabs/MagicTab.hbs',
        'systems/shadowrun5e/dist/templates/actor/tabs/MatrixTab.hbs',
        'systems/shadowrun5e/dist/templates/actor/tabs/MiscTab.hbs',
        'systems/shadowrun5e/dist/templates/actor/tabs/SkillsTab.hbs',
        'systems/shadowrun5e/dist/templates/actor/tabs/SocialTab.hbs',
        'systems/shadowrun5e/dist/templates/actor/tabs/SpellsTab.hbs',
        'systems/shadowrun5e/dist/templates/actor/tabs/EffectsTab.hbs',
        'systems/shadowrun5e/dist/templates/actor/tabs/CritterPowersTab.hbs',
        'systems/shadowrun5e/dist/templates/actor/tabs/InventoryTab.hbs',
        'systems/shadowrun5e/dist/templates/actor/tabs/DescriptionTab.hbs',
        'systems/shadowrun5e/dist/templates/actor/tabs/NetworkTab.hbs',

        'systems/shadowrun5e/dist/templates/actor/tabs/spirit/SpiritSkillsTab.hbs',

        'systems/shadowrun5e/dist/templates/actor/tabs/matrix/SpriteSkillsTab.hbs',
        'systems/shadowrun5e/dist/templates/actor/tabs/matrix/SpritePowersTab.hbs',
        'systems/shadowrun5e/dist/templates/actor/tabs/matrix/ProgramListTab.hbs',
        'systems/shadowrun5e/dist/templates/actor/tabs/matrix/MarksTab.hbs',
        'systems/shadowrun5e/dist/templates/actor/tabs/matrix/TargetsTab.hbs',

        'systems/shadowrun5e/dist/templates/actor/tabs/vehicle/VehicleSkillsTab.hbs',
        'systems/shadowrun5e/dist/templates/actor/tabs/vehicle/VehicleMatrixTab.hbs',

        'systems/shadowrun5e/dist/templates/actor/tabs/ic/ICActorTab.hbs',
        'systems/shadowrun5e/dist/templates/actor/tabs/ic/ICMiscTab.hbs',

        // item tabs
        'systems/shadowrun5e/dist/templates/item/tabs/GridNetworkTab.hbs',
        'systems/shadowrun5e/dist/templates/item/tabs/GridDescriptionTab.hbs',
        'systems/shadowrun5e/dist/templates/item/tabs/DescriptionTab.hbs',
        'systems/shadowrun5e/dist/templates/item/tabs/ActionTab.hbs',
        'systems/shadowrun5e/dist/templates/item/tabs/MiscellaneousTab.hbs',
        'systems/shadowrun5e/dist/templates/item/tabs/NetworksTab.hbs',

        // uncategorized lists
        'systems/shadowrun5e/dist/templates/actor/parts/ConditionMonitor.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/Initiative.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/ToggleImportFlags.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/import_flag_button.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/Movement.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/ProfileImage.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/NameInput.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/ActionList.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/ContactList.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/SinAndLifestyleList.hbs',

        // magic
        'systems/shadowrun5e/dist/templates/actor/parts/magic/AdeptPowerList.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/magic/MetamagicList.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/magic/RitualList.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/magic/SpellList.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/magic/SummoningList.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/magic/SpiritOptions.hbs',

        // matrix
        'systems/shadowrun5e/dist/templates/actor/parts/matrix/ProgramList.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/matrix/EchoList.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/matrix/ComplexFormList.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/matrix/CompilationList.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/matrix/MatrixAttribute.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/matrix/SpritePowerList.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/matrix/DeviceRating.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/matrix/Marks.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/matrix/Targets.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/matrix/MatrixActionList.hbs',

        // attributes
        'systems/shadowrun5e/dist/templates/actor/parts/attributes/Attribute.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/attributes/FakeAttribute.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/attributes/AttributeList.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/attributes/SpecialAttributeList.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/attributes/Limits.hbs',

        // skills
        'systems/shadowrun5e/dist/templates/actor/parts/skills/ActiveSkillList.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/skills/LanguageAndKnowledgeSkillList.hbs',

        // vehicle
        'systems/shadowrun5e/dist/templates/actor/parts/vehicle/VehicleStatsList.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/vehicle/VehicleSecondStatsList.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/vehicle/VehicleMovement.hbs',

        // IC
        'systems/shadowrun5e/dist/templates/actor/parts/ic/ICStats.hbs',
        'systems/shadowrun5e/dist/templates/actor/parts/ic/ICConfiguration.hbs',

        // limited actor
        'systems/shadowrun5e/dist/templates/actor-limited/character.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/spirit.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/sprite.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/vehicle.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/critter.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/parts/Header.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/parts/MiscCharacter.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/parts/MiscSpirit.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/parts/MiscSprite.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/parts/MiscIc.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/parts/MiscVehicle.hbs',
        'systems/shadowrun5e/dist/templates/actor-limited/parts/MiscCritter.hbs',


        // item parts
        'systems/shadowrun5e/dist/templates/item/parts/description.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/technology.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/header.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/weapon-ammo-list.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/weapon-mods-list.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/action.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/modifier.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/network.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/damage.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/opposed.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/spell.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/complex_form.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/weapon.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/armor.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/matrix.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/sin.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/contact.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/lifestyle.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/ammo.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/modification.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/program.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/critter_power.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/sprite_power.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/summoning.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/compilation.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/ritual.hbs',
        'systems/shadowrun5e/dist/templates/item/parts/misc_matrix.hbs',

        'systems/shadowrun5e/dist/templates/rolls/parts/parts-list.hbs',
        'systems/shadowrun5e/dist/templates/rolls/parts/Damage.hbs',

        // to wrap the bodies of tabs
        'systems/shadowrun5e/dist/templates/common/TabWrapper.hbs',
        'systems/shadowrun5e/dist/templates/common/ValueInput.hbs',

        // Useful wrapper and implemented components
        'systems/shadowrun5e/dist/templates/common/ValueMaxAttribute.hbs',
        'systems/shadowrun5e/dist/templates/common/Attribute.hbs',
        'systems/shadowrun5e/dist/templates/common/ValueModifiers.hbs',

        // useful select template for the common pattern
        'systems/shadowrun5e/dist/templates/common/Select.hbs',

        // to create the condition monitors and edge counter
        'systems/shadowrun5e/dist/templates/common/HorizontalCellInput.hbs',

        // looks like a ListHeader
        'systems/shadowrun5e/dist/templates/common/HeaderBlock.hbs',

        'systems/shadowrun5e/dist/templates/common/NameLineBlock.hbs',

        // list components
        'systems/shadowrun5e/dist/templates/common/List/ListItem.hbs',
        'systems/shadowrun5e/dist/templates/common/List/ListEntityItem.hbs',
        'systems/shadowrun5e/dist/templates/common/List/ListHeader.hbs',

        // dialogs
        'systems/shadowrun5e/dist/templates/apps/dialogs/damage-application.hbs',
        'systems/shadowrun5e/dist/templates/apps/dialogs/parts/success-test-common.hbs',
        'systems/shadowrun5e/dist/templates/apps/dialogs/parts/success-test-documents.hbs',
        'systems/shadowrun5e/dist/templates/apps/dialogs/parts/attack-range-dialog-fragment.hbs',

        // Test chat messages and their parts
        'systems/shadowrun5e/dist/templates/rolls/success-test-message.hbs',
        'systems/shadowrun5e/dist/templates/rolls/parts/rolled-dice.hbs',

        // Modifier management parts
        'systems/shadowrun5e/dist/templates/apps/partials/modifiers-physical.hbs',

        // Application - Matrix Network Hacking
        'systems/shadowrun5e/dist/templates/apps/matrix-network-hacking/tabs/networks.hbs',
    ];

    return foundry.applications.handlebars.loadTemplates(templatePaths);
};
