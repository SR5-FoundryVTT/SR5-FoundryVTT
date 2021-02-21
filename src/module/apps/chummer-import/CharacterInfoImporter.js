import {parseAttName} from "./CommonParsers"

export class CharacterInfoImporter {

    import(updateData, chummerEntry) {

        const update = updateData.data;
        try {
            if (chummerEntry.playername) {
                update.player_name = chummerEntry.playername;
            }
            if (chummerEntry.alias) {
                update.name = chummerEntry.alias;
                updateData.name = chummerEntry.alias;
            }
            if (chummerEntry.metatype) {
                update.metatype = chummerEntry.metatype;
            }
            if (chummerEntry.sex) {
                update.sex = chummerEntry.sex;
            }
            if (chummerEntry.age) {
                update.age = chummerEntry.age;
            }
            if (chummerEntry.height) {
                update.height = chummerEntry.height;
            }
            if (chummerEntry.weight) {
                update.weight = chummerEntry.weight;
            }
            if (chummerEntry.calculatedstreetcred) {
                update.street_cred = chummerEntry.calculatedstreetcred;
            }
            if (chummerEntry.calculatednotoriety) {
                update.notoriety = chummerEntry.calculatednotoriety;
            }
            if (chummerEntry.calculatedpublicawareness) {
                update.public_awareness = chummerEntry.calculatedpublicawareness;
            }
            if (chummerEntry.karma) {
                update.karma.value = chummerEntry.karma;
            }
            if (chummerEntry.totalkarma) {
                update.karma.max = chummerEntry.totalkarma;
            }
            if (chummerEntry.technomancer && chummerEntry.technomancer.toLowerCase() === 'true') {
                update.special = 'resonance';
            }
            if (
                (chummerEntry.magician && chummerEntry.magician.toLowerCase() === 'true') ||
                (chummerEntry.adept && chummerEntry.adept.toLowerCase() === 'true')
            ) {
                update.special = 'magic';
                let attr = [];
                if (
                    chummerEntry.tradition &&
                    chummerEntry.tradition.drainattribute &&
                    chummerEntry.tradition.drainattribute.attr
                ) {
                    attr = chummerEntry.tradition.drainattribute.attr;
                } else if (chummerEntry.tradition && chummerEntry.tradition.drainattributes) {
                    attr = chummerEntry.tradition.drainattributes
                        .split('+')
                        .map((item) => item.trim());
                }
                attr.forEach((att) => {
                    const attName = parseAttName(att);
                    if (attName !== 'willpower') update.magic.attribute = att;
                });
            }
            if (chummerEntry.totaless) {
                update.attributes.essence.value = chummerEntry.totaless;
            }
            if (chummerEntry.nuyen) {
                update.nuyen = parseInt(chummerEntry.nuyen.replace(',', ''));
            }
        } catch (e) {
            console.error(`Error while parsing character information ${e}`);
        }
    }
}

