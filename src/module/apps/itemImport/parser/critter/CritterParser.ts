import { ImportHelper } from '../../helper/ImportHelper';
import { ActorParserBase } from '../item/ActorParserBase';
import { getArray } from '../../../importer/actorImport/itemImporter/importHelper/BaseParserFunctions.js';
import { DataDefaults } from '../../../../data/DataDefaults';
import CharacterActorData = Shadowrun.CharacterActorData;
import { SR5 } from '../../../../config';

export class CritterParser extends ActorParserBase<CharacterActorData> {
    private getQualities(jsonData: object, jsonTranslation?: object | undefined): any {
        console.log(jsonData);
        const qualityData = ImportHelper.ObjectValue(jsonData, 'qualities') as {
            positive: { quality: any[] };
            negative: { quality: any[] };
        };

        if (!qualityData) return [];

        return [...qualityData.positive.quality, ...qualityData.negative.quality]
            .map((item: { _TEXT: any; name: { _TEXT: any } }) => {
                const itemName = item._TEXT ?? item.name?._TEXT;
                const translatedName = ImportHelper.MapNameToTranslation(jsonTranslation, itemName);
                const foundItem = game.items?.getName(translatedName);

                if (!foundItem) {
                    console.log(
                        `Power ${itemName} not found for critter ${ImportHelper.StringValue(jsonData, 'name')}.`,
                    );
                    return null; // No need to return a whole object for an error case
                }

                return foundItem.toObject();
            })
            .filter(Boolean);
    }

    private getPowers(jsonData: object, jsonTranslation?: object | undefined): any {
        const powerData = (ImportHelper.ObjectValue(jsonData, 'powers') as { power: any[] })?.power;

        if (!powerData) return [];

        return getArray(powerData)
            .map((item: { _TEXT: any; name: { _TEXT: any } }) => {
                const itemName = item._TEXT ?? item.name?._TEXT;
                const translatedName = ImportHelper.MapNameToTranslation(jsonTranslation, itemName);
                const foundItem = game.items?.getName(translatedName);

                if (!foundItem) {
                    console.log(
                        `Power ${itemName} not found for critter ${ImportHelper.StringValue(jsonData, 'name')}.`,
                    );
                    return null;
                }

                return foundItem.toObject();
            })
            .filter(Boolean);
    }

    override Parse(
        jsonData: object,
        actor: CharacterActorData,
        jsonTranslation?: object | undefined,
    ): CharacterActorData {
        actor.name = ImportHelper.StringValue(jsonData, 'name');
        actor.system.description.source = `${ImportHelper.StringValue(jsonData, 'source')} ${ImportHelper.StringValue(
            jsonData,
            'page',
        )}`;

        const attributeKeys = {
            body: 'bodmin',
            agility: 'agimin',
            reaction: 'reamin',
            strength: 'strmin',
            charisma: 'chamin',
            intuition: 'intmin',
            logic: 'logmin',
            willpower: 'wilmin',
            edge: 'edgmin',
            magic: 'magmin',
            resonance: 'resmin',
        };

        for (const [key, jsonKey] of Object.entries(attributeKeys)) {
            actor.system.attributes[key].base = +ImportHelper.StringValue(jsonData, jsonKey, '0');
        }

        // @ts-expect-error
        actor.system.karma.value = +ImportHelper.StringValue(jsonData, 'karma', '0');

        ['run', 'walk'].forEach((key) => {
            const [value, mult, base] = ImportHelper.StringValue(jsonData, key)
                .split('/')
                .map((v) => +v || 0);
            actor.system.movement[key] = { value, mult, base };
        });
        actor.system.movement.sprint = +ImportHelper.StringValue(jsonData, 'sprint').split('/')[0];

        //@ts-expect-error
        actor.items = [...this.getPowers(jsonData, jsonTranslation), ...this.getQualities(jsonData, jsonTranslation)];

        actor.system.is_npc = true;
        actor.system.is_critter = true;

        if (jsonTranslation) {
            const origName = ImportHelper.StringValue(jsonData, 'name');
            actor.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
            actor.system.description.source = `${ImportHelper.StringValue(
                jsonData,
                'source',
            )} ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
        }

        return actor;
    }
}
