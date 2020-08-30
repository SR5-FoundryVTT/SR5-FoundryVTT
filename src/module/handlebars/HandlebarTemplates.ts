export const preloadHandlebarsTemplates = async () => {
    const templatePaths = [
        'systems/shadowrun5e/dist/templates/actor/parts/actor-equipment.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-spellbook.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-skills.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-matrix.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-actions.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-config.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-bio.html',
        'systems/shadowrun5e/dist/templates/actor/parts/actor-social.html',

        'systems/shadowrun5e/dist/templates/actor/parts/matrix/matrix-attribute.html',
        'systems/shadowrun5e/dist/templates/actor/parts/skills/ActorAttribute.html',

        'systems/shadowrun5e/dist/templates/item/parts/description.html',
        'systems/shadowrun5e/dist/templates/item/parts/technology.html',
        'systems/shadowrun5e/dist/templates/item/parts/header.html',
        'systems/shadowrun5e/dist/templates/item/parts/weapon-ammo-list.html',
        'systems/shadowrun5e/dist/templates/item/parts/weapon-mods-list.html',
        'systems/shadowrun5e/dist/templates/item/parts/action.html',
        'systems/shadowrun5e/dist/templates/item/parts/damage.html',
        'systems/shadowrun5e/dist/templates/item/parts/opposed.html',
        'systems/shadowrun5e/dist/templates/item/parts/spell.html',
        'systems/shadowrun5e/dist/templates/item/parts/complex_form.html',
        'systems/shadowrun5e/dist/templates/item/parts/weapon.html',
        'systems/shadowrun5e/dist/templates/item/parts/armor.html',
        'systems/shadowrun5e/dist/templates/item/parts/matrix.html',
        'systems/shadowrun5e/dist/templates/item/parts/sin.html',
        'systems/shadowrun5e/dist/templates/item/parts/contact.html',
        'systems/shadowrun5e/dist/templates/item/parts/lifestyle.html',
        'systems/shadowrun5e/dist/templates/item/parts/ammo.html',
        'systems/shadowrun5e/dist/templates/item/parts/modification.html',
        'systems/shadowrun5e/dist/templates/item/parts/program.html',
        'systems/shadowrun5e/dist/templates/rolls/parts/parts-list.html',

        'systems/shadowrun5e/dist/templates/common/ValueInput.html',
        'systems/shadowrun5e/dist/templates/common/ConditionMonitor.html',
        'systems/shadowrun5e/dist/templates/common/ValueMaxAttribute.html',
        'systems/shadowrun5e/dist/templates/common/UsesAttribute.html',
        'systems/shadowrun5e/dist/templates/common/Attribute.html',
        'systems/shadowrun5e/dist/templates/common/HorizontalCellInput.html',
        'systems/shadowrun5e/dist/templates/common/HeaderBlock.html',

        'systems/shadowrun5e/dist/templates/common/List/ListItem.html',
        'systems/shadowrun5e/dist/templates/common/List/ListHeader.html',
    ];

    return loadTemplates(templatePaths);
};

