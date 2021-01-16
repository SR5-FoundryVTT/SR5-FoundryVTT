import SR5ActorType = Shadowrun.SR5ActorType;
import { CharacterPrep } from './CharacterPrep';
import { SpiritPrep } from './SpiritPrep';
import { SpritePrep } from './SpritePrep';
import { VehiclePrep } from './VehiclePrep';
import { CritterPrep } from './CritterPrep';

export class ActorPrepFactory {
    static Create(data: SR5ActorType) {
        if (data.type === 'character') {
            return new CharacterPrep(data);
        } else if (data.type === 'spirit') {
            return new SpiritPrep(data);
        } else if (data.type === 'sprite') {
            return new SpritePrep(data);
        } else if (data.type === 'vehicle') {
            return new VehiclePrep(data);
        } else if (data.type === 'critter') {
              return new CritterPrep(data);
        }
    }
}
