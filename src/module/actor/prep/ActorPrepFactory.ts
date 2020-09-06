import SR5ActorType = Shadowrun.SR5ActorType;
import { CharacterPrep } from './CharacterPrep';
import { SpiritPrep } from './SpiritPrep';
import { SpritePrep } from './SpritePrep';

export class ActorPrepFactory {
    static Create(data: SR5ActorType) {
        if (data.type === 'character') {
            return new CharacterPrep(data);
        } else if (data.type === 'spirit') {
            return new SpiritPrep(data);
        } else if (data.type === 'sprite') {
            return new SpritePrep(data);
        }
    }
}
