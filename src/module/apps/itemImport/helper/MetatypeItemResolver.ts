import { Parser } from 'xml2js';
import { ImportHelper as IH } from './ImportHelper';
import { QualityParser } from '../parser/quality/QualityParser';
import { CritterPowerParser } from '../parser/powers/CritterPowerParser';
import { SystemType } from '../parser/Parser';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';
import { SR5Item } from '../../../item/SR5Item';
import { BulkImporter } from '../apps/BulkImporter';
import { QualitiesSchema, Quality } from '../schema/QualitiesSchema';
import { CritterpowersSchema, Power } from '../schema/CritterpowersSchema';
import { Constants, CompendiumKey } from '../importer/Constants';
import { NaturalWeaponHelper } from './NaturalWeaponHelper';

const { fromUuid } = foundry.utils;

export interface MetatypeItemFlag {
    foundryUuid?: string;
    chummerId?: string;
    name: string;
    category?: string;
    id?: string;
    type?: string;
    power?: string;
    select?: string;
}

/**
 * Helper to resolve and automatically import linked metatype items into standard import compendiums.
 *
 * - **Triggered on World Load & Bulk Import**: In `hooks.ts` during the `ready` hook (only for GMs),
 *   and in `BulkImporter.ts` after parsing importers, it calls `MetatypeItemResolver.syncMetatypeCompendiumLinkedItems()`.
 * - **Scans Metatype Compendium**: It inspects the metatype items in `packs/sr5e-metatypes` and extracts
 *   the items listed in `flags.shadowrun5e.metaTypesItems`.
 * - **Checks Target Compendium**: It checks whether each item already exists in the standard
 *   empty import compendium (`world.sr5trait`). If already present, it skips it.
 * - **Imports Missing Linked Items via Chummer**: If missing, it resolves the Chummer quality
 *   or critter power definition, runs it through `QualityParser` or `CritterPowerParser`, assigns
 *   the exact `_id` specified in the flag, and creates the document in `world.sr5trait` with `{ keepId: true }`.
 */
export class MetatypeItemResolver {
    private static fullQualitiesXml: string | null = null;
    private static parsedQualitiesMap: Map<string, Quality> | null = null;
    private static fullCritterPowersXml: string | null = null;
    private static parsedCritterPowersMap: Map<string, Power> | null = null;

    public static async syncMetatypeCompendiumLinkedItems(): Promise<void> {
        const metatypePack = game.packs.get('shadowrun5e.sr5e-metatypes')
            || game.packs.get('sr5e-metatypes');
        if (!metatypePack) return;

        const metatypeDocs = await metatypePack.getDocuments();
        const itemsToResolve: MetatypeItemFlag[] = [];

        for (const doc of metatypeDocs) {
            if (!(doc instanceof SR5Item)) continue;
            const items = doc.flags?.shadowrun5e?.metaTypesItems;
            if (!items || !Array.isArray(items)) continue;

            for (const item of items) {
                if (!item.foundryUuid && !item.id && !item.chummerId) continue;
                itemsToResolve.push(item as MetatypeItemFlag);
            }
        }

        if (itemsToResolve.length === 0) return;

        const uniqueItems = Array.from(new Map(itemsToResolve.map(i => [i.foundryUuid || i.id || i.chummerId, i])).values());

        for (const item of uniqueItems) {
            await this.ensureItemImported(item);
        }
    }

    public static async ensureItemImported(item: MetatypeItemFlag): Promise<void> {
        const targetId = item.foundryUuid ? item.foundryUuid.split('.').pop() : (item.id || (item.chummerId ? IH.guidToId(item.chummerId) : undefined));
        if (!targetId) return;

        if (item.foundryUuid) {
            try {
                const existing = await fromUuid(item.foundryUuid);
                if (existing) return;
            } catch {
                // ignore
            }
        }

        if (item.category === 'weapon' || item.category === 'natural_weapon' || NaturalWeaponHelper.isNaturalWeapon({ _TEXT: item.power, $: { select: item.select } })) {
            if (item.select) {
                const [weaponData] = NaturalWeaponHelper.parseNaturalWeapons([{
                    _TEXT: item.power || 'Natural Weapon',
                    $: { select: item.select }
                }]);
                if (weaponData) {
                    await NaturalWeaponHelper.ensureNaturalWeaponInCompendium(weaponData, targetId);
                    return;
                }
            }
        }

        const isPowerCategory = item.category === 'power'
            || item.category === 'optional_power'
            || item.category === 'natural_weapon'
            || item.type === 'critter_power';

        let powerData: Power | null = null;
        let qualityData: Quality | null = null;

        if (isPowerCategory) {
            powerData = await this.getCritterPowerData(item.chummerId, item.power || item.name);
            if (!powerData && item.category !== 'weapon' && item.category !== 'item') {
                qualityData = await this.getQualityData(item.chummerId, item.name);
            }
        } else {
            qualityData = await this.getQualityData(item.chummerId, item.name);
            if (!qualityData && item.category !== 'weapon' && item.category !== 'item') {
                powerData = await this.getCritterPowerData(item.chummerId, item.power || item.name);
            }
        }

        if (powerData) {
            const compKey: CompendiumKey = 'Critter_Power';
            const compConfig = Constants.MAP_COMPENDIUM_KEY[compKey];
            const compendium = await IH.GetCompendium(compKey);
            if (compendium.index.has(targetId)) return;

            const parser = new CritterPowerParser();
            const parsedItem = await parser.Parse(powerData, compKey) as Item.CreateData;
            const createData: Item.CreateData = {
                ...parsedItem,
                _id: targetId,
            };
            if (item.name) {
                createData.name = item.name;
            }
            if (item.category === 'optional_power' && createData.system) {
                const system = createData.system as SystemType<'critter_power'>;
                system.optional = 'disabled_option';
            }
            UpdateActionFlow.injectActionTestsIntoChangeData(createData.type, createData, createData);
            IH.setItem('Critter_Power', powerData.name._TEXT, targetId);

            await IH.createDocumentInCompendium(compKey, createData);
            console.log(`SR5 | Ingested metatype power "${item.name}" into compendium "world.${compConfig.pack}" with ID "${targetId}"`);
            return;
        }

        if (qualityData) {
            const compKey: CompendiumKey = (item.category === 'weapon' ? 'Weapon' : item.category === 'item' ? 'Gear' : 'Quality');
            const compConfig = Constants.MAP_COMPENDIUM_KEY[compKey];
            const compendium = await IH.GetCompendium(compKey);
            if (compendium.index.has(targetId)) return;

            const parser = new QualityParser();
            const parsedItem = await parser.Parse(qualityData, 'Quality') as Item.CreateData;
            const createData: Item.CreateData = {
                ...parsedItem,
                _id: targetId,
            };
            if (item.name) {
                createData.name = item.name;
            }
            UpdateActionFlow.injectActionTestsIntoChangeData(createData.type, createData, createData);
            IH.setItem('Quality', qualityData.name._TEXT, targetId);

            await IH.createDocumentInCompendium(compKey, createData);
            console.log(`SR5 | Ingested metatype trait "${item.name}" into compendium "world.${compConfig.pack}" with ID "${targetId}"`);
            return;
        }

        console.warn(`SR5 | Could not find Chummer data for racial item "${item.name}" (${item.chummerId})`);
    }

    private static async parseXml<T>(xmlString: string): Promise<T> {
        const parser = new Parser({
            trim: true,
            attrkey: "$",
            charkey: "_TEXT",
            emptyTag: () => null,
            explicitRoot: false,
            explicitArray: false,
            explicitCharkey: true,
        });
        return parser.parseStringPromise(xmlString);
    }

    private static async getQualityData(chummerId?: string, name?: string): Promise<Quality | null> {
        try {
            if (!this.parsedQualitiesMap) {
                if (!this.fullQualitiesXml) {
                    this.fullQualitiesXml = await BulkImporter.fetchGitHubFile('Chummer/data/qualities.xml') || null;
                }

                if (this.fullQualitiesXml) {
                    const parsed = await this.parseXml<QualitiesSchema>(this.fullQualitiesXml);
                    const rawQualities = parsed?.qualities?.quality;
                    const list: Quality[] = Array.isArray(rawQualities) ? rawQualities : (rawQualities ? [rawQualities] : []);
                    this.parsedQualitiesMap = new Map();
                    for (const q of list) {
                        if (q.id?._TEXT) {
                            this.parsedQualitiesMap.set(q.id._TEXT, q);
                        }
                        if (q.name?._TEXT) {
                            this.parsedQualitiesMap.set(q.name._TEXT.toLowerCase(), q);
                        }
                    }
                }
            }

            if (this.parsedQualitiesMap) {
                if (chummerId && this.parsedQualitiesMap.has(chummerId)) {
                    return this.parsedQualitiesMap.get(chummerId)!;
                }
                if (name) {
                    const lowerName = name.toLowerCase();
                    if (this.parsedQualitiesMap.has(lowerName)) {
                        return this.parsedQualitiesMap.get(lowerName)!;
                    }
                    const baseName = lowerName.split('(')[0].trim();
                    if (baseName && this.parsedQualitiesMap.has(baseName)) {
                        return this.parsedQualitiesMap.get(baseName)!;
                    }
                }
            }
        } catch (err) {
            console.warn(`SR5 | Failed fetching or parsing qualities.xml from GitHub:`, err);
        }

        return null;
    }

    private static async getCritterPowerData(chummerId?: string, name?: string): Promise<Power | null> {
        try {
            if (!this.parsedCritterPowersMap) {
                if (!this.fullCritterPowersXml) {
                    this.fullCritterPowersXml = await BulkImporter.fetchGitHubFile('Chummer/data/critterpowers.xml') || null;
                }

                if (this.fullCritterPowersXml) {
                    const parsed = await this.parseXml<CritterpowersSchema>(this.fullCritterPowersXml);
                    if (parsed?.categories?.category) {
                        const rawCategories = parsed.categories.category;
                        const categories = Array.isArray(rawCategories) ? rawCategories : [rawCategories];
                        IH.setTranslatedCategory('critterpowers', categories);
                    }
                    const rawPowers = parsed?.powers?.power;
                    const list: Power[] = Array.isArray(rawPowers) ? rawPowers : (rawPowers ? [rawPowers] : []);
                    this.parsedCritterPowersMap = new Map();
                    for (const p of list) {
                        if (p.id?._TEXT) {
                            this.parsedCritterPowersMap.set(p.id._TEXT, p);
                        }
                        if (p.name?._TEXT) {
                            this.parsedCritterPowersMap.set(p.name._TEXT.toLowerCase(), p);
                        }
                    }
                }
            }

            if (this.parsedCritterPowersMap) {
                if (chummerId && this.parsedCritterPowersMap.has(chummerId)) {
                    return this.parsedCritterPowersMap.get(chummerId)!;
                }
                if (name) {
                    const lowerName = name.toLowerCase();
                    if (this.parsedCritterPowersMap.has(lowerName)) {
                        return this.parsedCritterPowersMap.get(lowerName)!;
                    }
                    // Try without parenthetical parameters, e.g. "Allergy (Sunlight, Severe)" -> "allergy"
                    const baseName = lowerName.split('(')[0].trim();
                    if (baseName && this.parsedCritterPowersMap.has(baseName)) {
                        return this.parsedCritterPowersMap.get(baseName)!;
                    }
                    // Try without colon parameters, e.g. "Infected Bite: DV..." -> "infected bite"
                    const colonName = lowerName.split(':')[0].trim();
                    if (colonName && this.parsedCritterPowersMap.has(colonName)) {
                        return this.parsedCritterPowersMap.get(colonName)!;
                    }
                }
            }
        } catch (err) {
            console.warn(`SR5 | Failed fetching or parsing critterpowers.xml from GitHub:`, err);
        }

        return null;
    }
}
