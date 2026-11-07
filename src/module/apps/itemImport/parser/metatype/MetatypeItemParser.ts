import { Parser } from '../Parser';
import { Metatype as MetatypeSchemaType } from '../../schema/MetatypeSchema';
import { CompendiumKey, Constants } from '../../importer/Constants';
import { ImportHelper as IH } from '../../helper/ImportHelper';
import { SR5 } from '@/module/config';
import { MetatypeItemFlag } from '../../helper/MetatypeItemResolver';
import { NaturalWeaponHelper } from '../../helper/NaturalWeaponHelper';

export class MetatypeItemParser extends Parser<'metatype'> {
    protected readonly parseType = 'metatype';

    private parseRange(minText?: { _TEXT?: string | number }, maxText?: { _TEXT?: string | number }, augText?: { _TEXT?: string | number }) {
        const minStr = String(minText?._TEXT ?? '');
        const maxStr = String(maxText?._TEXT ?? '');
        const augStr = String(augText?._TEXT ?? '');

        // If force-based, default min to 1
        const min = minStr.includes('F') ? 1 : (Number(minStr) || 1);
        const max = maxStr.includes('F') ? 6 : (Number(maxStr) || 6);
        const aug_max = augStr.includes('F') ? 10 : (Number(augStr) || (max + 4));
        return { min, max, aug_max };
    }

    protected override getSystem(jsonData: MetatypeSchemaType) {
        const system = this.getBaseSystem();

        const rawName = (jsonData.name?._TEXT || '').toLowerCase();
        const baseMetatypes = Object.keys(CONFIG.SR5?.metatypes ?? SR5.metatypes);
        const matchedMetatype = baseMetatypes.find(r => rawName.includes(r)) || 'human';

        const rawCat = (jsonData.category?._TEXT || '').toLowerCase();
        let subtype: keyof typeof SR5.metaSubtypes = 'metahuman';
        let subsubtype = '';

        if (rawCat.includes('infected') || rawName.includes('infected')) {
            subtype = 'infected';
            const matchedInfected = Object.keys(SR5.infectedTypes).find(s => rawName.includes(s));
            if (matchedInfected) subsubtype = matchedInfected;
        } else if (rawCat.includes('metasapient')) {
            subtype = 'metasapient';
            const matchedSapient = Object.keys(SR5.metasapientTypes).find(s => rawName.includes(s));
            if (matchedSapient) subsubtype = matchedSapient;
        } else if (rawCat.includes('shapeshifter') || rawName.includes('shapeshifter')) {
            subtype = 'shapeshifter';
            const matchedShifter = Object.keys(SR5.shapeshifterTypes).find(s => rawName.includes(s));
            if (matchedShifter) subsubtype = matchedShifter;
        } else if (rawCat.includes('sprites') || rawCat.includes('sprite')) {
            subtype = 'sprite';
        } else if (rawCat.includes('spirit') || (jsonData.bodmin?._TEXT && String(jsonData.bodmin._TEXT).includes('F'))) {
            subtype = 'spirit';
        } else if (rawCat.includes('critter') || rawCat.includes('animals') || rawCat.includes('paranormal') || rawCat.includes('mundane') || rawCat.includes('draconic')) {
            subtype = 'critter';
        }

        const infectedBaseMetatypes: Record<string, keyof typeof SR5.metatypes> = {
            banshee: 'elf',
            goblin: 'dwarf',
            gnawer: 'dwarf',
            wendigo: 'ork',
            grendel: 'ork',
            dzoonooqua: 'troll',
            fomoraig: 'troll',
            mutaqua: 'troll',
            bandersnatch: 'troll',
            nosferatu: 'human',
            vampire: 'human',
            loupgarou: 'human',
            harvester: 'human',
            sukuyan: 'human',
            ghoul: 'human',
        };

        if (subtype === 'infected' && subsubtype && infectedBaseMetatypes[subsubtype]) {
            system.metatype = infectedBaseMetatypes[subsubtype];
        } else {
            system.metatype = matchedMetatype;
        }

        system.subtype = subtype;
        system.subsubtype = subsubtype;
        system.karma = Number(jsonData.karma?._TEXT) || 0;

        system.attributes = {
            body: this.parseRange(jsonData.bodmin, jsonData.bodmax, jsonData.bodaug),
            agility: this.parseRange(jsonData.agimin, jsonData.agimax, jsonData.agiaug),
            reaction: this.parseRange(jsonData.reamin, jsonData.reamax, jsonData.reaaug),
            strength: this.parseRange(jsonData.strmin, jsonData.strmax, jsonData.straug),
            willpower: this.parseRange(jsonData.wilmin, jsonData.wilmax, jsonData.wilaug),
            logic: this.parseRange(jsonData.logmin, jsonData.logmax, jsonData.logaug),
            intuition: this.parseRange(jsonData.intmin, jsonData.intmax, jsonData.intaug),
            charisma: this.parseRange(jsonData.chamin, jsonData.chamax, jsonData.chaaug),
            edge: this.parseRange(jsonData.edgmin, jsonData.edgmax, jsonData.edgaug),
        };

        if (jsonData.magmin) {
            system.attributes.magic = this.parseRange(jsonData.magmin, jsonData.magmax, jsonData.magaug);
        }
        if (jsonData.resmin) {
            system.attributes.resonance = this.parseRange(jsonData.resmin, jsonData.resmax, jsonData.resaug);
        }

        // Populate qualities, powers, weapons
        const qualitiesList = [
            ...IH.getArray(jsonData.qualities?.positive?.quality),
            ...IH.getArray(jsonData.qualities?.negative?.quality),
        ];

        const powersList = [
            ...IH.getArray(jsonData.powers?.power),
            ...IH.getArray(jsonData.optionalpowers?.optionalpower),
            ...IH.getArray(jsonData.bonus?.optionalpowers?.optionalpower),
        ];

        const resolvedQualities: string[] = [];
        const resolvedWeapons: string[] = [];

        for (const q of qualitiesList) {
            const name = q._TEXT;
            if (!name) continue;
            const targetId = IH.nameToId['Quality']?.[name];
            if (targetId) {
                const uuid = `Compendium.world.${Constants.MAP_COMPENDIUM_CONFIG.Trait.pack}.Item.${targetId}`;
                if (!resolvedQualities.includes(uuid)) resolvedQualities.push(uuid);
            }
        }

        for (const p of powersList) {
            const baseName = p._TEXT;
            if (!baseName) continue;
            const select = p.$?.select;
            const fullName = select ? `${baseName} (${select})` : baseName;

            // Natural weapons belong in weapons, not qualities
            if (NaturalWeaponHelper.isNaturalWeapon(p)) {
                let weaponName = baseName;
                const nameMatch = /^([^:(]+?)[:(]/.exec(select || '');
                if (nameMatch && !/^DV\b/i.test(nameMatch[1].trim())) {
                    weaponName = nameMatch[1].trim();
                }
                const targetId = IH.nameToId['Weapon']?.[weaponName] || IH.nameToId['Weapon']?.[fullName];
                if (targetId) {
                    const uuid = `Compendium.world.${Constants.MAP_COMPENDIUM_CONFIG.Weapon.pack}.Item.${targetId}`;
                    if (!resolvedWeapons.includes(uuid)) resolvedWeapons.push(uuid);
                }
                continue;
            }

            const targetId = IH.nameToId['Critter_Power']?.[baseName]
                || IH.nameToId['Critter_Power']?.[fullName]
                || IH.nameToId['Quality']?.[baseName];

            if (targetId) {
                const uuid = `Compendium.world.${Constants.MAP_COMPENDIUM_CONFIG.Trait.pack}.Item.${targetId}`;
                if (!resolvedQualities.includes(uuid)) resolvedQualities.push(uuid);
            }
        }

        if (jsonData.addweapon?._TEXT) {
            const weaponName = jsonData.addweapon._TEXT;
            const targetId = IH.nameToId['Weapon']?.[weaponName];
            if (targetId) {
                const uuid = `Compendium.world.${Constants.MAP_COMPENDIUM_CONFIG.Weapon.pack}.Item.${targetId}`;
                if (!resolvedWeapons.includes(uuid)) resolvedWeapons.push(uuid);
            }
        }

        system.qualities = resolvedQualities;
        system.weapons = resolvedWeapons;
        system.items = [];

        system.description.value = '';

        return system;
    }

    public override async Parse(jsonData: MetatypeSchemaType, compendiumKey: CompendiumKey): Promise<Item.CreateData> {
        const entity = await super.Parse(jsonData, compendiumKey) as Item.CreateData;

        // Build flags.shadowrun5e.metaTypesItems for Chummer power tracking
        const metaTypesItems: MetatypeItemFlag[] = [];

        const qualitiesList = [
            ...IH.getArray(jsonData.qualities?.positive?.quality),
            ...IH.getArray(jsonData.qualities?.negative?.quality),
        ];

        for (const q of qualitiesList) {
            const name = q._TEXT;
            if (!name) continue;
            const select = q.$?.select;
            const targetId = IH.nameToId['Quality']?.[name];
            const foundryUuid = targetId ? `Compendium.world.${Constants.MAP_COMPENDIUM_CONFIG.Trait.pack}.Item.${targetId}` : undefined;
            metaTypesItems.push({
                name: select ? `${name} (${select})` : name,
                power: name,
                select,
                foundryUuid,
                category: 'quality',
            });
        }

        const powersList = [
            ...IH.getArray(jsonData.powers?.power).map(p => ({ ...p, isOptional: false })),
            ...IH.getArray(jsonData.optionalpowers?.optionalpower).map(p => ({ ...p, isOptional: true })),
            ...IH.getArray(jsonData.bonus?.optionalpowers?.optionalpower).map(p => ({ ...p, isOptional: true })),
        ];

        for (const p of powersList) {
            const name = p._TEXT;
            if (!name) continue;
            const select = p.$?.select;

            if (NaturalWeaponHelper.isNaturalWeapon(p)) {
                const parsedWeapons = NaturalWeaponHelper.parseNaturalWeapons([p], { actorName: jsonData.name?._TEXT });
                for (const w of parsedWeapons) {
                    let weaponUuid: string | undefined;
                    const existingTargetId = IH.nameToId['Weapon']?.[w.name];
                    if (existingTargetId) {
                        weaponUuid = `Compendium.world.${Constants.MAP_COMPENDIUM_CONFIG.Weapon.pack}.Item.${existingTargetId}`;
                    } else if (typeof game !== 'undefined') {
                        try {
                            const ensuredUuid = await NaturalWeaponHelper.ensureNaturalWeaponInCompendium(w);
                            if (ensuredUuid) weaponUuid = ensuredUuid;
                        } catch {
                            // Fallback if compendium access fails
                        }
                    }

                    const sys = entity.system as Item.SystemOfType<'metatype'> | undefined;
                    if (weaponUuid && sys?.weapons && !sys.weapons.includes(weaponUuid)) {
                        sys.weapons.push(weaponUuid);
                    }

                    metaTypesItems.push({
                        name: w.name,
                        power: name,
                        select,
                        foundryUuid: weaponUuid,
                        category: 'weapon',
                    });
                }
                continue;
            }

            const targetId = IH.nameToId['Critter_Power']?.[name] || IH.nameToId['Quality']?.[name];
            const foundryUuid = targetId ? `Compendium.world.${Constants.MAP_COMPENDIUM_CONFIG.Trait.pack}.Item.${targetId}` : undefined;
            metaTypesItems.push({
                name: select ? `${name} (${select})` : name,
                power: name,
                select,
                foundryUuid,
                category: p.isOptional ? 'optional_power' : 'power',
            });
        }

        if (jsonData.addweapon?._TEXT) {
            const weaponName = jsonData.addweapon._TEXT;
            const targetId = IH.nameToId['Weapon']?.[weaponName];
            const foundryUuid = targetId ? `Compendium.world.${Constants.MAP_COMPENDIUM_CONFIG.Weapon.pack}.Item.${targetId}` : undefined;
            metaTypesItems.push({
                name: weaponName,
                foundryUuid,
                category: 'weapon',
            });
        }

        if (metaTypesItems.length > 0) {
            entity.flags = {
                ...(entity.flags || {}),
                shadowrun5e: {
                    ...(entity.flags?.shadowrun5e || {}),
                    metaTypesItems,
                },
            };
        }

        if (!entity.img) {
            const sys = entity.system as Item.SystemOfType<'metatype'> | undefined;
            if (sys?.subtype === 'infected') {
                entity.img = 'systems/shadowrun5e/dist/icons/importer/critter/infected.svg';
            } else if (sys?.subtype === 'critter') {
                entity.img = 'systems/shadowrun5e/dist/icons/importer/critter/mundane-critters.svg';
            } else if (sys?.subtype === 'spirit') {
                entity.img = 'systems/shadowrun5e/dist/icons/importer/critter/spirits.svg';
            } else if (sys?.subtype === 'sprite') {
                entity.img = 'systems/shadowrun5e/dist/icons/importer/critter/sprites.svg';
            } else if (sys?.subtype === 'metasapient') {
                entity.img = 'systems/shadowrun5e/dist/icons/importer/critter/protosapients.svg';
            } else if (sys?.subtype === 'shapeshifter') {
                entity.img = 'systems/shadowrun5e/dist/icons/importer/critter/paranormal-critters.svg';
            } else {
                entity.img = 'systems/shadowrun5e/dist/icons/importer/contact.svg';
            }
        }

        return entity;
    }

    protected override async getFolder(jsonData: MetatypeSchemaType, compendiumKey: CompendiumKey): Promise<Folder> {
        const rootFolder = game.i18n.localize('TYPES.Item.metatype');
        const folderName = jsonData.category?._TEXT || 'Metahuman';
        return IH.getFolder(compendiumKey, rootFolder, folderName);
    }
}

export const RaceParser = MetatypeItemParser;
