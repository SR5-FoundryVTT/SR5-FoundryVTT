import { Helpers } from '../helpers';
import { SR5Actor } from '../actor/SR5Actor';
import { SR5Item } from '../item/SR5Item';
import { MetatypeItemResolver, MetatypeItemFlag } from '../apps/itemImport/helper/MetatypeItemResolver';
import { NaturalWeaponHelper } from '../apps/itemImport/helper/NaturalWeaponHelper';
import { Constants, CompendiumKey } from '../apps/itemImport/importer/Constants';

const { fromUuid } = foundry.utils;

export class MetatypeFlow {
    /**
     * Apply the metatype item to the actor.
     * Cleans up prior metatype items and their linked items, embeds the new metatype item,
     * resolves granted UUIDs, adds granted items to the actor, updates the embedded metatype item
     * with local links, and updates actor metatype.
     */
    static async applyMetatypeToActor(
        actor: SR5Actor,
        metatypeItemSource: SR5Item<'metatype'> | Item.CreateData<'metatype'>
    ): Promise<SR5Item<'metatype'> | null> {
        if (!actor.isType('character', 'spirit', 'sprite')) return null;

        const isDoc = metatypeItemSource instanceof foundry.abstract.Document;
        const sourceData = (isDoc
            ? metatypeItemSource.toObject()
            : foundry.utils.deepClone(metatypeItemSource)) as Item.CreateData<'metatype'>;

        const sourceUuid = isDoc
            ? metatypeItemSource.uuid
            : (typeof sourceData._id === 'string' ? sourceData._id : '');

        // 1. Clean up existing metatype items and their granted items
        const existingMetatypes = actor.items.filter(i => i.isType('metatype'));
        for (const existing of existingMetatypes) {
            await this.cleanupMetatypeGrantedItems(actor, existing);
            await existing.delete();
        }

        // 2. Prepare and create new embedded metatype item
        delete sourceData._id;
        if (!sourceData.img) {
            const system = sourceData.system as Item.SystemOfType<'metatype'> | undefined;
            const subtype = system?.subtype;
            if (subtype === 'infected') sourceData.img = 'systems/shadowrun5e/dist/icons/importer/critter/infected.svg';
            else if (subtype === 'critter') sourceData.img = 'systems/shadowrun5e/dist/icons/importer/critter/mundane-critters.svg';
            else if (subtype === 'spirit') sourceData.img = 'systems/shadowrun5e/dist/icons/importer/critter/spirits.svg';
            else if (subtype === 'sprite') sourceData.img = 'systems/shadowrun5e/dist/icons/importer/critter/sprites.svg';
            else if (subtype === 'metasapient') sourceData.img = 'systems/shadowrun5e/dist/icons/importer/critter/protosapients.svg';
            else if (subtype === 'shapeshifter') sourceData.img = 'systems/shadowrun5e/dist/icons/importer/critter/paranormal-critters.svg';
            else sourceData.img = 'systems/shadowrun5e/dist/icons/importer/contact.svg';
        }

        const [newMetatypeItem] = await actor.createEmbeddedDocuments('Item', [sourceData]);
        if (!newMetatypeItem || !newMetatypeItem.isType('metatype')) return null;

        // 3. Resolve and create granted items from UUIDs
        await this.grantAndLinkMetatypeItems(actor, newMetatypeItem);

        // 4. Synchronize actor metatype, metatypeUuid, and add new metatype attribute values
        const updateData: Record<string, unknown> = {
            'system.metatype': newMetatypeItem.name,
            'system.metatypeUuid': sourceUuid || newMetatypeItem.uuid,
        };

        const ranges = newMetatypeItem.system.getActiveAttributeRanges();
        const isCritter = (actor.isType('character') && Boolean(actor.system.is_critter)) || actor.isType('spirit', 'sprite');

        for (const [attr, range] of Object.entries(ranges)) {
            if (range.min != null && attr in actor.system.attributes) {
                const attrKey = attr as keyof typeof actor.system.attributes;
                const attribute = actor.system.attributes[attrKey];
                if (attribute && typeof attribute === 'object' && 'base' in attribute) {
                    const currentBase = attribute.base ?? 0;
                    if (isCritter) {
                        updateData[`system.attributes.${attr}.base`] = range.min;
                    } else {
                        updateData[`system.attributes.${attr}.base`] = currentBase + range.min;
                    }
                }
            }
        }

        // Special attributes for critters or if specified in metatype
        if (ranges.magic?.min != null && ranges.magic.min > 0) {
            updateData['system.special'] = 'magic';
            if (isCritter) {
                updateData['system.attributes.magic.base'] = ranges.magic.min;
            }
        }
        if (ranges.resonance?.min != null && ranges.resonance.min > 0) {
            updateData['system.special'] = 'resonance';
            if (isCritter) {
                updateData['system.attributes.resonance.base'] = ranges.resonance.min;
            }
        }

        // 5. Handle Infected, Dual Natured & Natural Magician initialization
        const isInfected = newMetatypeItem.system.subtype === 'infected';
        const metaItems = (newMetatypeItem.flags?.shadowrun5e?.metaTypesItems || []) as MetatypeItemFlag[];
        const subsubtype = (newMetatypeItem.system.subsubtype || '').toLowerCase();
        const itemName = (newMetatypeItem.name || '').toLowerCase();

        const grantsDualNatured = isInfected || metaItems.some(i =>
            i.name?.toLowerCase().includes('dual natured') ||
            i.power?.toLowerCase().includes('dual natured')
        ) || (newMetatypeItem.system.qualities || []).some(q => q.toLowerCase().includes('dual natured'));

        const isNaturalMagician =
            subsubtype === 'nosferatu' ||
            subsubtype === 'wendigo' ||
            itemName.includes('nosferatu') ||
            itemName.includes('wendigo') ||
            metaItems.some(i =>
                i.name?.toLowerCase().includes('natural magician') ||
                i.power?.toLowerCase().includes('natural magician')
            );

        if (grantsDualNatured) {
            updateData['system.special'] = 'magic';
            const currentMagicBase = (updateData['system.attributes.magic.base'] as number | undefined)
                ?? (actor.system.attributes.magic?.base ?? 0);
            if (currentMagicBase <= 0) {
                updateData['system.attributes.magic.base'] = 1;
            }
        }

        if (isNaturalMagician) {
            updateData['system.special'] = 'magic';
            updateData['system.magic.type'] = 'magician';
            const essenceVal = Number(actor.system.attributes.essence?.value ?? actor.system.attributes.essence?.base ?? 6);
            const initialMagic = Math.floor(Math.min(6, Math.max(1, essenceVal)));
            const currentMagicBase = (updateData['system.attributes.magic.base'] as number | undefined)
                ?? (actor.system.attributes.magic?.base ?? 0);
            updateData['system.attributes.magic.base'] = Math.max(currentMagicBase, initialMagic);
        }

        await actor.update(updateData);

        return newMetatypeItem;
    }

    /**
     * Resolve granted items from the metatype item's UUIDs, create them on the actor,
     * and update the actor's embedded metatype item with the local actor item UUIDs.
     */
    static async grantAndLinkMetatypeItems(actor: SR5Actor, metatypeItem: SR5Item<'metatype'>) {
        const qualitiesToResolve = [...(metatypeItem.system.qualities || [])];
        const weaponsToResolve = [...(metatypeItem.system.weapons || [])];
        const itemsToResolve = [...(metatypeItem.system.items || [])];

        const metaFlags = (metatypeItem.flags?.shadowrun5e?.metaTypesItems || []) as MetatypeItemFlag[];
        for (const metaFlag of metaFlags) {
            if (metaFlag.foundryUuid) {
                if (metaFlag.category === 'weapon') {
                    if (!weaponsToResolve.includes(metaFlag.foundryUuid)) weaponsToResolve.push(metaFlag.foundryUuid);
                } else if (metaFlag.category === 'item') {
                    if (!itemsToResolve.includes(metaFlag.foundryUuid)) itemsToResolve.push(metaFlag.foundryUuid);
                } else {
                    if (!qualitiesToResolve.includes(metaFlag.foundryUuid)) qualitiesToResolve.push(metaFlag.foundryUuid);
                }
            }
        }

        const resolveItemData = async (uuid: string, category: 'quality' | 'weapon' | 'item') => {
            if (!uuid) return null;
            try {
                let doc: SR5Item | null = null;
                const found = await fromUuid(uuid);
                if (found instanceof SR5Item) {
                    doc = found;
                }

                // If direct UUID resolution fails, fallback to direct compendium pack loading
                if (!doc && uuid.startsWith('Compendium.')) {
                    const parts = uuid.slice(11).split('.');
                    const packId = `${parts[0]}.${parts[1]}`;
                    const targetId = parts[parts.length - 1];
                    const pack = game.packs.get(packId);
                    if (pack && targetId) {
                        const packDoc = await pack.getDocument(targetId);
                        if (packDoc instanceof SR5Item) {
                            doc = packDoc;
                        }
                    }
                }

                const flags = metatypeItem.flags?.shadowrun5e?.metaTypesItems;
                const metaFlag = Array.isArray(flags)
                    ? flags.find(f => f.foundryUuid === uuid || f.chummerId === uuid)
                    : undefined;

                // If still not found, check metadata flags or compendium search
                if (!doc && metaFlag) {
                    await MetatypeItemResolver.ensureItemImported(metaFlag);
                    if (metaFlag.foundryUuid) {
                        const imported = await fromUuid(metaFlag.foundryUuid);
                        if (imported instanceof SR5Item) {
                            doc = imported;
                        }
                    }

                    if (!doc && (metaFlag.name || metaFlag.power)) {
                        const compKey: CompendiumKey = (category === 'weapon' ? 'Weapon' : category === 'item' ? 'Gear' : 'Quality');
                        const compConfig = Constants.MAP_COMPENDIUM_KEY[compKey];
                        const pack = game.packs.get(`world.${compConfig.pack}`);
                        if (pack) {
                            await pack.getIndex();
                            const searchNames = [
                                metaFlag.name?.toLowerCase(),
                                metaFlag.power?.toLowerCase(),
                                metaFlag.name?.split('(')[0].trim().toLowerCase(),
                                metaFlag.name?.split(':')[0].trim().toLowerCase(),
                            ].filter(Boolean);

                            const entry = pack.index.find(e => {
                                const eName = e.name?.toLowerCase();
                                return Boolean(eName && searchNames.includes(eName));
                            });

                            if (entry?._id) {
                                const entryDoc = await pack.getDocument(entry._id);
                                if (entryDoc instanceof SR5Item) {
                                    doc = entryDoc;
                                }
                            }
                        }
                    }
                }

                if (doc instanceof SR5Item) {
                    const data = doc.toObject() as Item.CreateData;
                    delete data._id;
                    if (metaFlag?.name) {
                        data.name = metaFlag.name;
                    }
                    data._stats = {
                        ...(data._stats || {}),
                        compendiumSource: uuid,
                    };
                    data.flags = {
                        ...(data.flags || {}),
                        core: {
                            ...(data.flags?.core || {}),
                            sourceId: uuid,
                        },
                        shadowrun5e: {
                            ...(data.flags?.shadowrun5e || {}),
                            grantedByMetatype: metatypeItem.id ?? undefined,
                            grantedCategory: category,
                        },
                    };
                    return { data, category, sourceUuid: uuid };
                }

                if (!doc && category === 'weapon' && metaFlag?.select) {
                    const parsed = NaturalWeaponHelper.parseNaturalWeapons([{
                        _TEXT: metaFlag.power || metaFlag.name || 'Natural Weapon',
                        $: { select: metaFlag.select },
                    }]);
                    if (parsed.length > 0) {
                        const data = parsed[0] as Item.CreateData;
                        delete data._id;
                        if (metaFlag.name) {
                            data.name = metaFlag.name;
                        }
                        data._stats = {
                            ...(data._stats || {}),
                            compendiumSource: uuid,
                        };
                        data.flags = {
                            ...(data.flags || {}),
                            core: {
                                ...(data.flags?.core || {}),
                                sourceId: uuid,
                            },
                            shadowrun5e: {
                                ...(data.flags?.shadowrun5e || {}),
                                grantedByMetatype: metatypeItem.id ?? undefined,
                                grantedCategory: category,
                            },
                        };
                        return { data, category, sourceUuid: uuid };
                    }
                }
            } catch (err) {
                console.warn(`SR5 | Could not resolve granted item UUID: ${uuid}`, err);
            }
            return null;
        };

        const resolved = [
            ...(await Promise.all(qualitiesToResolve.map(u => resolveItemData(u, 'quality')))),
            ...(await Promise.all(weaponsToResolve.map(u => resolveItemData(u, 'weapon')))),
            ...(await Promise.all(itemsToResolve.map(u => resolveItemData(u, 'item')))),
        ].filter(Boolean) as { data: Item.CreateData; category: string; sourceUuid: string }[];

        if (resolved.length === 0) return;

        const createdItems = await actor.createEmbeddedDocuments(
            'Item',
            resolved.map(r => r.data)
        ) as SR5Item[];

        // Update the links in the actor's metatype item to point to the local items on the actor
        const localQualities: string[] = [];
        const localWeapons: string[] = [];
        const localItems: string[] = [];

        for (let i = 0; i < createdItems.length; i++) {
            const createdItem = createdItems[i];
            const meta = resolved[i];
            const uuid = createdItem.uuid;
            if (!uuid) continue;
            if (meta.category === 'quality') localQualities.push(uuid);
            else if (meta.category === 'weapon') localWeapons.push(uuid);
            else localItems.push(uuid);
        }

        await metatypeItem.update({
            system: {
                qualities: localQualities,
                weapons: localWeapons,
                items: localItems,
            }
        });
    }

    /**
     * Clean up items on the actor matching any linked UUIDs or granted flags from this metatype item.
     */
    static async cleanupMetatypeGrantedItems(actor: SR5Actor, metatypeItem: SR5Item<'metatype'>) {
        const allTrackedUuids = new Set<string>([
            ...(metatypeItem.system.qualities || []),
            ...(metatypeItem.system.weapons || []),
            ...(metatypeItem.system.items || []),
        ]);

        const idsToDelete: string[] = [];
        for (const item of actor.items) {
            if (item.id === metatypeItem.id) continue;

            const isDirectUuidMatch = allTrackedUuids.has(item.uuid);
            const sourceId = item._stats?.compendiumSource || item.flags?.core?.sourceId;
            const isSourceMatch = !!sourceId && allTrackedUuids.has(sourceId);
            const isFlagMatch = item.flags?.shadowrun5e?.grantedByMetatype === metatypeItem.id;

            if (isDirectUuidMatch || isSourceMatch || isFlagMatch) {
                idsToDelete.push(item.id);
            }
        }

        if (idsToDelete.length > 0) {
            await actor.deleteEmbeddedDocuments('Item', idsToDelete);
        }
    }

    /**
     * Handle updates to a metatype item: synchronizes metatype name if name changed.
     */
    static async onMetatypeUpdated(actor: SR5Actor, metatypeItem: SR5Item<'metatype'>, changed: Record<string, unknown>) {
        if (!actor.isType('character', 'spirit', 'sprite')) return;
        if (typeof changed.name === 'string' && changed.name !== actor.system.metatype) {
            await actor.update({ system: { metatype: changed.name } });
        }
    }

    /**
     * Handle deletion of a metatype item: cleans up its granted items and clears actor metatype link.
     */
    static async onMetatypeDeleted(actor: SR5Actor, metatypeItem: SR5Item<'metatype'>) {
        if (!actor.isType('character', 'spirit', 'sprite')) return;

        await this.cleanupMetatypeGrantedItems(actor, metatypeItem);

        const updateData: Record<string, unknown> = {};

        const currentUuid = actor.system.metatypeUuid;
        if (currentUuid === metatypeItem.uuid || actor.system.metatype === metatypeItem.name) {
            updateData['system.metatypeUuid'] = null;
            updateData['system.metatype'] = '';
        }

        const ranges = metatypeItem.system.getActiveAttributeRanges();
        const isCritter = (actor.isType('character') && Boolean(actor.system.is_critter)) || actor.isType('spirit', 'sprite');

        for (const [attr, range] of Object.entries(ranges)) {
            if (range.min != null && attr in actor.system.attributes) {
                const attrKey = attr as keyof typeof actor.system.attributes;
                const attribute = actor.system.attributes[attrKey];
                if (attribute && typeof attribute === 'object' && 'base' in attribute) {
                    const currentBase = attribute.base ?? 0;
                    if (!isCritter) {
                        updateData[`system.attributes.${attr}.base`] = Math.max(0, currentBase - range.min);
                    }
                }
            }
        }

        if (metatypeItem.system.subtype === 'infected') {
            if (actor.system.magic?.type === 'magician') {
                updateData['system.magic.type'] = '';
            }
        }

        if (Object.keys(updateData).length > 0) {
            await actor.update(updateData);
        }
    }

    /**
     * Localizes a metatype item or name into the user's active language if a translation exists.
     * Supports Document (SR5Item<'metatype'>), string name (e.g. "Dwarf", "dwarf"),
     * or fallback value.
     *
     * @param nameOrItem The metatype Document, name, or key.
     * @returns The translated string if available, or the original name.
     */
    static localizeMetatype(nameOrItem: string | SR5Item<'metatype'> | null | undefined): string {
        if (!nameOrItem) return '';
        const name = typeof nameOrItem === 'string' ? nameOrItem : nameOrItem.name;
        if (!name) return '';

        const baseType = typeof nameOrItem !== 'string' && nameOrItem.system?.metatype
            ? nameOrItem.system.metatype.toLowerCase()
            : name.toLowerCase();

        // 1. Check CONFIG.SR5.metatypes (e.g. dwarf -> 'SR5.Character.Types.Dwarf')
        const metatypeKey = (CONFIG.SR5?.metatypes as Record<string, string> | undefined)?.[baseType];
        if (metatypeKey && game.i18n.has(metatypeKey)) {
            if (name.toLowerCase() === baseType) {
                return game.i18n.localize(metatypeKey);
            }
        }

        // 2. Try 'SR5.Character.Types' via Helpers.localizeName (e.g. "Dwarf" -> SR5.Character.Types.Dwarf)
        const characterTypeTranslation = Helpers.localizeName(name, 'SR5.Character.Types');
        if (characterTypeTranslation !== name) {
            return characterTypeTranslation;
        }

        // 3. Try 'SR5.InfectedTypes' (e.g. "Vampire" -> "Vampir", "Nosferatu" -> "Nosferatu")
        const infectedTypeTranslation = Helpers.localizeName(name, 'SR5.InfectedTypes');
        if (infectedTypeTranslation !== name) {
            return infectedTypeTranslation;
        }

        // 4. Try 'SR5.MetasapientTypes' (e.g. "Sasquatch" -> "Sasquatch", "Centaur" -> "Zentaur")
        const metasapientTranslation = Helpers.localizeName(name, 'SR5.MetasapientTypes');
        if (metasapientTranslation !== name) {
            return metasapientTranslation;
        }

        // 5. Try 'SR5.ShapeshifterTypes'
        const shapeshifterTranslation = Helpers.localizeName(name, 'SR5.ShapeshifterTypes');
        if (shapeshifterTranslation !== name) {
            return shapeshifterTranslation;
        }

        // 6. Try 'SR5.Content.Metatypes'
        const contentTranslation = Helpers.localizeName(name, 'SR5.Content.Metatypes');
        if (contentTranslation !== name) {
            return contentTranslation;
        }

        return name;
    }

    /**
     * Localize the metatype subtype (category) into the active language.
     */
    static localizeSubtype(itemOrSubtype?: SR5Item<'metatype'> | string | null): string {
        if (!itemOrSubtype) return '';
        const subtype = typeof itemOrSubtype === 'string'
            ? itemOrSubtype
            : (itemOrSubtype.system?.subtype || '');
        if (!subtype) return '';
        const key = `SR5.MetaSubtypes.${subtype}`;
        if (game.i18n.has(key)) {
            return game.i18n.localize(key);
        }
        return subtype.charAt(0).toUpperCase() + subtype.slice(1);
    }

    /**
     * Localize the metatype subsubtype (strain, species, form) into the active language.
     */
    static localizeSubsubtype(itemOrSubsubtype?: SR5Item<'metatype'> | string | null): string {
        if (!itemOrSubsubtype) return '';
        const subsubtype = typeof itemOrSubsubtype === 'string'
            ? itemOrSubsubtype
            : (itemOrSubsubtype.system?.subsubtype || '');
        if (!subsubtype) return '';

        // 1. Try SR5.InfectedTypes
        const infectedTranslation = Helpers.localizeName(subsubtype, 'SR5.InfectedTypes');
        if (infectedTranslation !== subsubtype) return infectedTranslation;

        // 2. Try SR5.MetasapientTypes
        const metasapientTranslation = Helpers.localizeName(subsubtype, 'SR5.MetasapientTypes');
        if (metasapientTranslation !== subsubtype) return metasapientTranslation;

        // 3. Try SR5.ShapeshifterTypes
        const shifterTranslation = Helpers.localizeName(subsubtype, 'SR5.ShapeshifterTypes');
        if (shifterTranslation !== subsubtype) return shifterTranslation;

        return subsubtype.charAt(0).toUpperCase() + subsubtype.slice(1);
    }
}
