import { Helpers } from '../helpers';
import { SR5 } from '../config';
import { SR5Actor } from '../actor/SR5Actor';
import { SR5Item } from '../item/SR5Item';
import { MetatypeTaxonomy, MetatypeTaxonomyEntry } from '../types/item/Metatype';
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

        for (const createdItem of createdItems) {
            const uuid = createdItem.uuid;
            if (!uuid) continue;
            const category = createdItem.flags?.shadowrun5e?.grantedCategory
                ?? (createdItem.isType('weapon') ? 'weapon' : createdItem.isType('quality', 'critter_power') ? 'quality' : 'item');
            if (category === 'quality') localQualities.push(uuid);
            else if (category === 'weapon') localWeapons.push(uuid);
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

        // 3. Try 'SR5.Content.Metatypes'
        const contentTranslation = Helpers.localizeName(name, 'SR5.Content.Metatypes');
        if (contentTranslation !== name) {
            return contentTranslation;
        }

        return name;
    }

    /**
     * Extract normalized { name, label } taxonomy entries from a metatype item.
     */
    static extractTaxonomy(item: SR5Item<'metatype'>): MetatypeTaxonomy {
        const sys = item.system;
        const flagTax = item.flags?.shadowrun5e?.taxonomy;
        const sysTax = sys?.taxonomy;

        const getExplicitLabel = (entry: Partial<MetatypeTaxonomyEntry> | undefined, targetName: string): string => {
            if (!entry || !targetName) return '';
            const entryName = String(entry.name ?? '').trim().toLowerCase();
            if (entryName && entryName !== targetName) return '';
            return String(entry.label ?? '').trim();
        };

        const metaName = (sys?.metatype || sysTax?.metatype?.name || flagTax?.metatype?.name || 'human').trim().toLowerCase();
        const baseMap = (CONFIG.SR5?.metatypes ?? SR5.metatypes) as Record<string, string>;
        const baseKey = baseMap[metaName];
        const baseLocalized = baseKey && typeof game !== 'undefined' && game.i18n?.has(baseKey)
            ? game.i18n.localize(baseKey)
            : '';
        const metaLabel = getExplicitLabel(flagTax?.metatype, metaName)
            || getExplicitLabel(sysTax?.metatype, metaName)
            || baseLocalized
            || Helpers.capitalizeFirstLetter(metaName);

        const subName = (sys?.subtype || sysTax?.subtype?.name || flagTax?.subtype?.name || 'metahuman').trim().toLowerCase();
        const subLabel = getExplicitLabel(flagTax?.subtype, subName)
            || getExplicitLabel(sysTax?.subtype, subName)
            || Helpers.capitalizeFirstLetter(subName);

        const subsubName = (sys?.subsubtype || sysTax?.subsubtype?.name || flagTax?.subsubtype?.name || '').trim().toLowerCase();
        const explicitSubsubLabel = getExplicitLabel(flagTax?.subsubtype, subsubName)
            || getExplicitLabel(sysTax?.subsubtype, subsubName);
        const itemNameFallback = item.name && item.name.toLowerCase() !== metaName
            ? (item.name.includes(':') ? item.name.split(':').pop()!.trim() : item.name.trim())
            : '';
        const subsubLabel = subsubName
            ? (explicitSubsubLabel || itemNameFallback || Helpers.capitalizeFirstLetter(subsubName))
            : '';

        return {
            metatype: { name: metaName, label: metaLabel },
            subtype: { name: subName, label: subLabel },
            subsubtype: { name: subsubName, label: subsubLabel },
        };
    }

    /**
     * Collect all distinct { name, label } choices for metatype, subtype, and subsubtype
     * from CONFIG.SR5.metatypes (base 5) plus all world and compendium metatype items.
     */
    static async collectTaxonomyChoices(currentSubtype?: string, extraItems: SR5Item<'metatype'>[] = []): Promise<{
        metatypeChoices: MetatypeTaxonomyEntry[];
        subtypeChoices: MetatypeTaxonomyEntry[];
        subsubtypeChoices: MetatypeTaxonomyEntry[];
    }> {
        const metatypeMap = new Map<string, MetatypeTaxonomyEntry>();
        const subtypeMap = new Map<string, MetatypeTaxonomyEntry>();
        const subsubtypeBySubMap = new Map<string, Map<string, MetatypeTaxonomyEntry>>();
        const allSubsubtypeMap = new Map<string, MetatypeTaxonomyEntry>();

        // 1. Seed base metatypes from CONFIG.SR5.metatypes
        const rawBaseMetatypes = (CONFIG.SR5?.metatypes ?? SR5.metatypes) as Record<string, string>;
        for (const [key, i18nKey] of Object.entries(rawBaseMetatypes)) {
            const name = key.trim().toLowerCase();
            const label = typeof game !== 'undefined' && game.i18n?.has(i18nKey)
                ? game.i18n.localize(i18nKey)
                : Helpers.capitalizeFirstLetter(name);
            metatypeMap.set(name, { name, label });
        }

        // 2. Gather metatype documents from extraItems, world items, and metatype compendiums
        const docs: SR5Item<'metatype'>[] = [...extraItems];
        if (typeof game !== 'undefined') {
            if (game.items) {
                for (const item of game.items.values()) {
                    if (item instanceof SR5Item && item.isType('metatype')) {
                        docs.push(item);
                    }
                }
            }
            const packIds = ['shadowrun5e.sr5e-metatypes', 'sr5e-metatypes', 'world.sr5metatype', 'sr5metatype'];
            const visitedPacks = new Set<string>();
            for (const packId of packIds) {
                const pack = game.packs?.get(packId);
                if (!pack || visitedPacks.has(pack.collection)) continue;
                visitedPacks.add(pack.collection);
                try {
                    const packDocs = await pack.getDocuments();
                    for (const doc of packDocs) {
                        if (doc instanceof SR5Item && doc.isType('metatype')) {
                            docs.push(doc);
                        }
                    }
                } catch {
                    // ignore inaccessible packs
                }
            }
        }

        const preferLabel = (existing: MetatypeTaxonomyEntry | undefined, candidate: MetatypeTaxonomyEntry): MetatypeTaxonomyEntry => {
            if (!existing) return candidate;
            const defaultLabel = Helpers.capitalizeFirstLetter(candidate.name);
            if (existing.label === defaultLabel && candidate.label && candidate.label !== defaultLabel) {
                return candidate;
            }
            return existing;
        };

        for (const doc of docs) {
            const tax = this.extractTaxonomy(doc);
            if (tax.metatype.name) {
                metatypeMap.set(tax.metatype.name, preferLabel(metatypeMap.get(tax.metatype.name), tax.metatype));
            }
            if (tax.subtype.name) {
                subtypeMap.set(tax.subtype.name, preferLabel(subtypeMap.get(tax.subtype.name), tax.subtype));
            }
            if (tax.subsubtype.name) {
                allSubsubtypeMap.set(tax.subsubtype.name, preferLabel(allSubsubtypeMap.get(tax.subsubtype.name), tax.subsubtype));
                const subKey = tax.subtype.name || 'metahuman';
                let bucket = subsubtypeBySubMap.get(subKey);
                if (!bucket) {
                    bucket = new Map<string, MetatypeTaxonomyEntry>();
                    subsubtypeBySubMap.set(subKey, bucket);
                }
                bucket.set(tax.subsubtype.name, preferLabel(bucket.get(tax.subsubtype.name), tax.subsubtype));
            }
        }

        const sortEntries = (entries: Iterable<MetatypeTaxonomyEntry>) =>
            Array.from(entries).sort((a, b) => a.label.localeCompare(b.label));

        const normalizedCurrentSub = (currentSubtype || '').trim().toLowerCase();
        const filteredSubsubBucket = normalizedCurrentSub ? subsubtypeBySubMap.get(normalizedCurrentSub) : undefined;
        const subsubtypeSource = (filteredSubsubBucket && filteredSubsubBucket.size > 0)
            ? filteredSubsubBucket.values()
            : allSubsubtypeMap.values();

        return {
            metatypeChoices: sortEntries(metatypeMap.values()),
            subtypeChoices: sortEntries(subtypeMap.values()),
            subsubtypeChoices: sortEntries(subsubtypeSource),
        };
    }

    /**
     * Resolve a user-submitted string from an input + datalist against known { name, label } choices.
     * - If the string matches an existing choice by `label` or `name` (case-insensitively), returns that choice's `{ name, label }`.
     * - If the string is a new custom entry, returns `{ name: trimmed.toLowerCase(), label: trimmed }`.
     */
    static resolveTaxonomyInput(input: string | null | undefined, choices: MetatypeTaxonomyEntry[] = []): MetatypeTaxonomyEntry {
        const trimmed = String(input ?? '').trim();
        if (!trimmed) return { name: '', label: '' };

        const lower = trimmed.toLowerCase();
        const match = choices.find(c => c.label.toLowerCase() === lower || c.name.toLowerCase() === lower);
        if (match) {
            return { name: match.name, label: match.label };
        }
        return { name: lower, label: trimmed };
    }

    /**
     * Shared helper to format a metatype taxonomy field ('subtype' or 'subsubtype') for display.
     */
    static #localizeTaxonomyField(key: 'subtype' | 'subsubtype', itemOrValue?: SR5Item<'metatype'> | string | null): string {
        if (!itemOrValue) return '';
        if (typeof itemOrValue !== 'string') {
            return this.extractTaxonomy(itemOrValue)[key].label;
        }
        const trimmed = itemOrValue.trim();
        if (!trimmed) return '';
        const lower = trimmed.toLowerCase();
        if (typeof game !== 'undefined' && game.items) {
            for (const item of game.items.values()) {
                if (item instanceof SR5Item && item.isType('metatype')) {
                    const entry = this.extractTaxonomy(item)[key];
                    if (entry.name === lower && entry.label) {
                        return entry.label;
                    }
                }
            }
        }
        return Helpers.capitalizeFirstLetter(trimmed);
    }

    /**
     * Format the metatype subtype (category) for display.
     */
    static localizeSubtype(itemOrSubtype?: SR5Item<'metatype'> | string | null): string {
        return this.#localizeTaxonomyField('subtype', itemOrSubtype);
    }

    /**
     * Format the metatype subsubtype (strain, species, form) for display.
     */
    static localizeSubsubtype(itemOrSubsubtype?: SR5Item<'metatype'> | string | null): string {
        return this.#localizeTaxonomyField('subsubtype', itemOrSubsubtype);
    }
}
