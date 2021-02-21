/**
 *  Maps the chummer attribute name to our sr5-foundry attribute name
 *  @param attName name of the chummer attribute
 */
export function parseAttName (attName) {
    if (attName.toLowerCase() === 'bod') {
        return 'body';
    }
    if (attName.toLowerCase() === 'agi') {
        return 'agility';
    }
    if (attName.toLowerCase() === 'rea') {
        return 'reaction';
    }
    if (attName.toLowerCase() === 'str') {
        return 'strength';
    }
    if (attName.toLowerCase() === 'cha') {
        return 'charisma';
    }
    if (attName.toLowerCase() === 'int') {
        return 'intuition';
    }
    if (attName.toLowerCase() === 'log') {
        return 'logic';
    }
    if (attName.toLowerCase() === 'wil') {
        return 'willpower';
    }
    if (attName.toLowerCase() === 'edg') {
        return 'edge';
    }
    if (attName.toLowerCase() === 'mag') {
        return 'magic';
    }
    if (attName.toLowerCase() === 'res') {
        return 'resonance';
    }
};